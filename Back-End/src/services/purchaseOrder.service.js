const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Company, Item, PurchaseOrder, PurchaseOrderLine } = require('../models');

const EDITABLE_FIELDS = ['supplierId', 'supplierName', 'orderDate', 'expectedDeliveryDate', 'notes'];

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function round2(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
function requiredText(value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw httpError(400, `${label} is required`);
  return text;
}
function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw httpError(400, `${label} must be greater than zero`);
  return number;
}
function nonNegativeNumber(value, label, max) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number) || number < 0 || (max !== undefined && number > max)) {
    throw httpError(400, `${label} must be between 0 and ${max ?? 'a valid amount'}`);
  }
  return number;
}

async function ensureCompany(companyId, transaction) {
  const company = await Company.findByPk(companyId, { transaction });
  if (!company) throw httpError(404, 'Restaurant not found');
}

async function buildLines(companyId, inputs, transaction) {
  if (!Array.isArray(inputs) || inputs.length === 0) throw httpError(400, 'At least one purchase order line is required');
  const itemIds = inputs.map((line) => line.itemId);
  if (new Set(itemIds).size !== itemIds.length) throw httpError(400, 'The same item cannot be added more than once');
  const items = await Item.findAll({ where: { id: { [Op.in]: itemIds }, companyId, status: 'Active' }, transaction });
  if (items.length !== itemIds.length) throw httpError(400, 'One or more selected items are invalid or inactive');
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return inputs.map((input) => {
    const item = itemMap.get(input.itemId);
    const orderedQuantity = positiveNumber(input.orderedQuantity, `Quantity for ${item.name}`);
    const unitPrice = nonNegativeNumber(input.unitPrice, `Unit price for ${item.name}`);
    const vatRate = nonNegativeNumber(input.vatRate, `VAT rate for ${item.name}`, 100);
    const lineSubtotal = round2(orderedQuantity * unitPrice);
    const vatAmount = round2(lineSubtotal * vatRate / 100);
    const lineTotal = round2(lineSubtotal + vatAmount);
    return {
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.name,
      unit: item.unit,
      orderedQuantity,
      receivedQuantity: 0,
      balanceQuantity: orderedQuantity,
      unitPrice,
      vatRate,
      lineSubtotal,
      vatAmount,
      lineTotal,
      receivedAmount: 0,
      balanceAmount: lineTotal,
    };
  });
}

function totals(lines) {
  const subtotal = round2(lines.reduce((sum, line) => sum + Number(line.lineSubtotal), 0));
  const vatAmount = round2(lines.reduce((sum, line) => sum + Number(line.vatAmount), 0));
  const totalAmount = round2(subtotal + vatAmount);
  return { subtotal, vatAmount, totalAmount, balanceAmount: totalAmount, receivedAmount: 0 };
}

async function nextPoNumber(companyId, transaction) {
  const year = new Date().getFullYear();
  const count = await PurchaseOrder.count({
    where: { companyId, poNumber: { [Op.like]: `PO-${year}-%` } }, transaction,
  });
  return `PO-${year}-${String(count + 1).padStart(5, '0')}`;
}

const includeLines = [{ model: PurchaseOrderLine, as: 'lines' }];

async function create(companyId, input) {
  return sequelize.transaction(async (transaction) => {
    await ensureCompany(companyId, transaction);
    const lines = await buildLines(companyId, input.lines, transaction);
    const order = await PurchaseOrder.create({
      companyId,
      supplierId: input.supplierId || null,
      supplierName: requiredText(input.supplierName, 'Supplier'),
      poNumber: await nextPoNumber(companyId, transaction),
      orderDate: input.orderDate || new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: input.expectedDeliveryDate || null,
      notes: String(input.notes ?? '').trim() || null,
      ...totals(lines),
    }, { transaction });
    await PurchaseOrderLine.bulkCreate(lines.map((line) => ({ ...line, purchaseOrderId: order.id })), { transaction });
    return PurchaseOrder.findByPk(order.id, { include: includeLines, transaction });
  });
}

async function list(companyId, query = {}) {
  await ensureCompany(companyId);
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 10));
  const where = { companyId };
  if (query.status && query.status !== 'All') where.status = query.status;
  if (query.search?.trim()) {
    const search = `%${query.search.trim()}%`;
    where[Op.or] = [{ poNumber: { [Op.like]: search } }, { supplierName: { [Op.like]: search } }];
  }
  const { count, rows } = await PurchaseOrder.findAndCountAll({
    where, include: includeLines, distinct: true,
    order: [['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize,
  });
  return { orders: rows, pagination: { page, pageSize, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) } };
}

async function get(companyId, orderId, options = {}) {
  const order = await PurchaseOrder.findOne({ where: { id: orderId, companyId }, include: includeLines, ...options });
  if (!order) throw httpError(404, 'Purchase order not found');
  return order;
}

async function update(companyId, orderId, input) {
  return sequelize.transaction(async (transaction) => {
    const order = await get(companyId, orderId, { transaction, lock: transaction.LOCK.UPDATE });
    if (order.status !== 'DRAFT') throw httpError(409, 'Only draft purchase orders can be edited');
    const lines = await buildLines(companyId, input.lines, transaction);
    const patch = {};
    for (const field of EDITABLE_FIELDS) if (input[field] !== undefined) patch[field] = input[field] || null;
    if (patch.supplierName !== undefined) patch.supplierName = requiredText(patch.supplierName, 'Supplier');
    await order.update({ ...patch, ...totals(lines) }, { transaction });
    await PurchaseOrderLine.destroy({ where: { purchaseOrderId: order.id }, transaction });
    await PurchaseOrderLine.bulkCreate(lines.map((line) => ({ ...line, purchaseOrderId: order.id })), { transaction });
    return PurchaseOrder.findByPk(order.id, { include: includeLines, transaction });
  });
}

async function approve(companyId, orderId, approvedBy = null) {
  return sequelize.transaction(async (transaction) => {
    const order = await PurchaseOrder.findOne({ where: { id: orderId, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw httpError(404, 'Purchase order not found');
    if (order.status !== 'DRAFT') throw httpError(409, 'Only draft purchase orders can be approved');
    await order.update({ status: 'APPROVED', approvedAt: new Date(), approvedBy }, { transaction });
    return get(companyId, orderId, { transaction });
  });
}

async function receive(companyId, orderId, receiptLines) {
  return sequelize.transaction(async (transaction) => {
    const order = await PurchaseOrder.findOne({ where: { id: orderId, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order) throw httpError(404, 'Purchase order not found');
    if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(order.status)) throw httpError(409, 'Only approved purchase orders can receive quantities');
    if (!Array.isArray(receiptLines) || receiptLines.length === 0) throw httpError(400, 'Enter at least one received quantity');
    const lines = await PurchaseOrderLine.findAll({ where: { purchaseOrderId: order.id }, transaction, lock: transaction.LOCK.UPDATE });
    const lineMap = new Map(lines.map((line) => [line.id, line]));

    for (const input of receiptLines) {
      const line = lineMap.get(input.lineId);
      if (!line) throw httpError(400, 'Invalid purchase order line');
      const quantity = positiveNumber(input.quantity, `Received quantity for ${line.itemName}`);
      const ordered = Number(line.orderedQuantity);
      const received = Number(line.receivedQuantity) + quantity;
      if (received > ordered + 0.000001) throw httpError(400, `Received quantity for ${line.itemName} exceeds the balance`);
      const receivedAmount = round2(Number(line.lineTotal) * received / ordered);
      await line.update({
        receivedQuantity: received,
        balanceQuantity: Math.max(0, ordered - received),
        receivedAmount,
        balanceAmount: round2(Number(line.lineTotal) - receivedAmount),
      }, { transaction });
    }

    const refreshed = await PurchaseOrderLine.findAll({ where: { purchaseOrderId: order.id }, transaction });
    const receivedAmount = round2(refreshed.reduce((sum, line) => sum + Number(line.receivedAmount), 0));
    const complete = refreshed.every((line) => Number(line.balanceQuantity) <= 0);
    await order.update({
      receivedAmount,
      balanceAmount: round2(Number(order.totalAmount) - receivedAmount),
      status: complete ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
    }, { transaction });
    return get(companyId, orderId, { transaction });
  });
}

module.exports = { create, list, get, update, approve, receive };
