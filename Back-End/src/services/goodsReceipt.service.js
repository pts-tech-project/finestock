const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Company, Item, PurchaseOrder, PurchaseOrderLine, GoodsReceipt, GoodsReceiptLine, StockBalance, StockMovement } = require('../models');

function httpError(status, message) { const error = new Error(message); error.status = status; return error; }
function round2(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }
function round4(value) { return Math.round((Number(value) + Number.EPSILON) * 10000) / 10000; }
function positive(value, label) { const number = Number(value); if (!Number.isFinite(number) || number <= 0) throw httpError(400, `${label} must be greater than zero`); return number; }
const poInclude = [{ model: PurchaseOrderLine, as: 'lines', include: [{ model: Item, as: 'item' }] }];
const receiptInclude = [
  { model: GoodsReceiptLine, as: 'lines' },
  { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'poNumber', 'supplierName', 'status'] },
];

async function ensureCompany(companyId, transaction) {
  if (!await Company.findByPk(companyId, { transaction })) throw httpError(404, 'Restaurant not found');
}

async function eligiblePurchaseOrders(companyId) {
  await ensureCompany(companyId);
  const orders = await PurchaseOrder.findAll({
    where: { companyId, status: { [Op.in]: ['APPROVED', 'PARTIALLY_RECEIVED'] } },
    include: poInclude, order: [['orderDate', 'ASC']],
  });
  return orders.filter((order) => order.lines.some((line) => Number(line.balanceQuantity) > 0 && line.item?.itemType === 'INGREDIENT'));
}

async function nextNumber(companyId, transaction) {
  const year = new Date().getFullYear();
  const count = await GoodsReceipt.count({ where: { companyId, grnNumber: { [Op.like]: `GRN-${year}-%` } }, transaction });
  return `GRN-${year}-${String(count + 1).padStart(5, '0')}`;
}

async function validateLines(companyId, purchaseOrderId, inputs, transaction) {
  const order = await PurchaseOrder.findOne({ where: { id: purchaseOrderId, companyId }, include: poInclude, transaction });
  if (!order) throw httpError(404, 'Purchase order not found');
  if (!['APPROVED', 'PARTIALLY_RECEIVED'].includes(order.status)) throw httpError(409, 'Only approved purchase orders can be received');
  if (!Array.isArray(inputs) || inputs.length === 0) throw httpError(400, 'Enter at least one receipt line');
  const poLines = new Map(order.lines.map((line) => [line.id, line]));
  if (new Set(inputs.map((line) => line.purchaseOrderLineId)).size !== inputs.length) throw httpError(400, 'A PO line can appear only once');
  const lines = inputs.map((input) => {
    const poLine = poLines.get(input.purchaseOrderLineId);
    if (!poLine) throw httpError(400, 'Invalid purchase order line');
    if (poLine.item?.itemType !== 'INGREDIENT') throw httpError(400, `${poLine.itemName} is not an ingredient and cannot update stock`);
    const quantityReceived = positive(input.quantityReceived, `Quantity for ${poLine.itemName}`);
    if (quantityReceived > Number(poLine.balanceQuantity) + 0.000001) throw httpError(400, `Quantity for ${poLine.itemName} exceeds the PO balance`);
    const unitCost = Number(poLine.unitPrice);
    return {
      purchaseOrderLineId: poLine.id, itemId: poLine.itemId, itemCode: poLine.itemCode,
      itemName: poLine.itemName, unit: poLine.unit, quantityReceived, unitCost,
      lineAmount: round2(quantityReceived * unitCost),
    };
  });
  return { order, lines };
}

async function create(companyId, input) {
  return sequelize.transaction(async (transaction) => {
    await ensureCompany(companyId, transaction);
    const { lines } = await validateLines(companyId, input.purchaseOrderId, input.lines, transaction);
    const receipt = await GoodsReceipt.create({
      companyId, purchaseOrderId: input.purchaseOrderId, grnNumber: await nextNumber(companyId, transaction),
      receiptDate: input.receiptDate || new Date().toISOString().slice(0, 10),
      deliveryNoteNumber: String(input.deliveryNoteNumber ?? '').trim() || null,
      notes: String(input.notes ?? '').trim() || null,
      totalAmount: round2(lines.reduce((sum, line) => sum + line.lineAmount, 0)),
    }, { transaction });
    await GoodsReceiptLine.bulkCreate(lines.map((line) => ({ ...line, goodsReceiptId: receipt.id })), { transaction });
    return GoodsReceipt.findByPk(receipt.id, { include: receiptInclude, transaction });
  });
}

async function list(companyId, query = {}) {
  await ensureCompany(companyId);
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 10));
  const where = { companyId };
  if (query.status && query.status !== 'All') where.status = query.status;
  const { count, rows } = await GoodsReceipt.findAndCountAll({ where, include: receiptInclude, distinct: true, order: [['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize });
  return { receipts: rows, pagination: { page, pageSize, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) } };
}

async function get(companyId, receiptId, options = {}) {
  const receipt = await GoodsReceipt.findOne({ where: { id: receiptId, companyId }, include: receiptInclude, ...options });
  if (!receipt) throw httpError(404, 'Goods receipt not found');
  return receipt;
}

async function update(companyId, receiptId, input) {
  return sequelize.transaction(async (transaction) => {
    const receipt = await GoodsReceipt.findOne({ where: { id: receiptId, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!receipt) throw httpError(404, 'Goods receipt not found');
    if (receipt.status !== 'DRAFT') throw httpError(409, 'Approved goods receipts cannot be edited');
    const purchaseOrderId = input.purchaseOrderId || receipt.purchaseOrderId;
    const { lines } = await validateLines(companyId, purchaseOrderId, input.lines, transaction);
    await receipt.update({ purchaseOrderId, receiptDate: input.receiptDate || receipt.receiptDate, deliveryNoteNumber: input.deliveryNoteNumber || null, notes: input.notes || null, totalAmount: round2(lines.reduce((sum, line) => sum + line.lineAmount, 0)) }, { transaction });
    await GoodsReceiptLine.destroy({ where: { goodsReceiptId: receipt.id }, transaction });
    await GoodsReceiptLine.bulkCreate(lines.map((line) => ({ ...line, goodsReceiptId: receipt.id })), { transaction });
    return get(companyId, receipt.id, { transaction });
  });
}

async function approve(companyId, receiptId, approvedBy = null) {
  return sequelize.transaction(async (transaction) => {
    const receipt = await GoodsReceipt.findOne({ where: { id: receiptId, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!receipt) throw httpError(404, 'Goods receipt not found');
    if (receipt.status !== 'DRAFT') throw httpError(409, 'Goods receipt is already approved');
    const order = await PurchaseOrder.findOne({ where: { id: receipt.purchaseOrderId, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!order || !['APPROVED', 'PARTIALLY_RECEIVED'].includes(order.status)) throw httpError(409, 'Purchase order is no longer available for receiving');
    const receiptLines = await GoodsReceiptLine.findAll({ where: { goodsReceiptId: receipt.id }, transaction, lock: transaction.LOCK.UPDATE });
    const poLines = await PurchaseOrderLine.findAll({ where: { purchaseOrderId: order.id }, transaction, lock: transaction.LOCK.UPDATE });
    const poLineMap = new Map(poLines.map((line) => [line.id, line]));

    for (const line of receiptLines) {
      const poLine = poLineMap.get(line.purchaseOrderLineId);
      const quantity = Number(line.quantityReceived);
      if (!poLine || quantity > Number(poLine.balanceQuantity) + 0.000001) throw httpError(409, `PO balance changed for ${line.itemName}; edit the draft receipt`);
      const ordered = Number(poLine.orderedQuantity);
      const received = Number(poLine.receivedQuantity) + quantity;
      const receivedAmount = round2(Number(poLine.lineTotal) * received / ordered);
      await poLine.update({ receivedQuantity: received, balanceQuantity: Math.max(0, ordered - received), receivedAmount, balanceAmount: round2(Number(poLine.lineTotal) - receivedAmount) }, { transaction });

      let stock = await StockBalance.findOne({ where: { companyId, itemId: line.itemId }, transaction, lock: transaction.LOCK.UPDATE });
      if (!stock) stock = await StockBalance.create({ companyId, itemId: line.itemId, quantity: 0, averageCost: 0 }, { transaction });
      const oldQuantity = Number(stock.quantity);
      const newQuantity = oldQuantity + quantity;
      const averageCost = newQuantity > 0 ? round4((oldQuantity * Number(stock.averageCost) + quantity * Number(line.unitCost)) / newQuantity) : 0;
      await stock.update({ quantity: newQuantity, averageCost, lastMovementAt: new Date() }, { transaction });
      await StockMovement.create({ companyId, itemId: line.itemId, movementType: 'PURCHASE_RECEIPT', quantity, unitCost: line.unitCost, totalCost: line.lineAmount, referenceType: 'GOODS_RECEIPT', referenceId: receipt.id, referenceNumber: receipt.grnNumber, movementDate: new Date() }, { transaction });
    }

    const refreshed = await PurchaseOrderLine.findAll({ where: { purchaseOrderId: order.id }, transaction });
    const receivedAmount = round2(refreshed.reduce((sum, line) => sum + Number(line.receivedAmount), 0));
    const complete = refreshed.every((line) => Number(line.balanceQuantity) <= 0);
    await order.update({ receivedAmount, balanceAmount: round2(Number(order.totalAmount) - receivedAmount), status: complete ? 'RECEIVED' : 'PARTIALLY_RECEIVED' }, { transaction });
    await receipt.update({ status: 'APPROVED', approvedAt: new Date(), approvedBy }, { transaction });
    return get(companyId, receipt.id, { transaction });
  });
}

module.exports = { eligiblePurchaseOrders, create, list, get, update, approve };
