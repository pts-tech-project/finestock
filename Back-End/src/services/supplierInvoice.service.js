const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Company, SupplierInvoice, GoodsReceipt, GoodsReceiptLine, PurchaseOrder, PurchaseOrderLine } = require('../models');

function httpError(status, message) { const error = new Error(message); error.status = status; return error; }
function money(value, label, allowZero = false) {
  const number = Number(value);
  if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) throw httpError(400, `${label} is invalid`);
  return Math.round((number + Number.EPSILON) * 100) / 100;
}
const include = [
  { model: GoodsReceipt, as: 'goodsReceipt', attributes: ['id', 'grnNumber', 'receiptDate', 'totalAmount', 'status'] },
  { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'poNumber', 'supplierId', 'supplierName'] },
];
const matchingLines = {
  model: GoodsReceiptLine,
  as: 'lines',
  attributes: ['quantityReceived', 'unitCost', 'lineAmount'],
  include: [{ model: PurchaseOrderLine, as: 'purchaseOrderLine', attributes: ['vatRate'] }],
};
function expectedAmounts(receipt) {
  const lines = receipt.lines || [];
  const netAmount = round2(lines.reduce((sum, line) => sum + Number(line.lineAmount), 0));
  const vatAmount = round2(lines.reduce((sum, line) => sum + Number(line.quantityReceived) * Number(line.unitCost) * Number(line.purchaseOrderLine?.vatRate || 0) / 100, 0));
  return { netAmount, vatAmount, totalAmount: round2(netAmount + vatAmount) };
}
function round2(value) { return Math.round((Number(value) + Number.EPSILON) * 100) / 100; }

async function eligibleGoodsReceipts(companyId) {
  if (!await Company.findByPk(companyId)) throw httpError(404, 'Restaurant not found');
  const receipts = await GoodsReceipt.findAll({
    where: { companyId, status: 'APPROVED' },
    include: [
      { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'poNumber', 'supplierId', 'supplierName'] },
      { model: SupplierInvoice, as: 'supplierInvoice', attributes: ['id'], required: false },
      matchingLines,
    ],
    order: [['receiptDate', 'ASC']],
  });
  return receipts.filter((receipt) => !receipt.supplierInvoice).map((receipt) => {
    const plain = receipt.get({ plain: true });
    plain.invoiceExpected = expectedAmounts(receipt);
    delete plain.lines;
    return plain;
  });
}

async function buildPayload(companyId, input, transaction, currentId = null) {
  const invoiceNumber = String(input.invoiceNumber ?? '').trim();
  if (!invoiceNumber) throw httpError(400, 'Supplier invoice number is required');
  if (!input.goodsReceiptId) throw httpError(400, 'Select an approved goods receipt');
  const receipt = await GoodsReceipt.findOne({
    where: { id: input.goodsReceiptId, companyId, status: 'APPROVED' },
    include: [{ model: PurchaseOrder, as: 'purchaseOrder' }, matchingLines], transaction,
  });
  if (!receipt) throw httpError(400, 'The selected goods receipt is not approved or does not exist');
  const linked = await SupplierInvoice.findOne({ where: { companyId, goodsReceiptId: receipt.id, ...(currentId ? { id: { [Op.ne]: currentId } } : {}) }, transaction });
  if (linked) throw httpError(409, 'This goods receipt already has a supplier invoice');
  const duplicate = await SupplierInvoice.findOne({
    where: { companyId, supplierName: receipt.purchaseOrder.supplierName, invoiceNumber, ...(currentId ? { id: { [Op.ne]: currentId } } : {}) }, transaction,
  });
  if (duplicate) throw httpError(409, 'This supplier invoice number has already been recorded');
  const netAmount = money(input.netAmount, 'Net amount');
  const vatAmount = money(input.vatAmount ?? 0, 'VAT amount', true);
  const expected = expectedAmounts(receipt);
  if (Math.abs(netAmount - expected.netAmount) > 0.01) {
    throw httpError(400, `Net amount must match the approved GRN value of ${expected.netAmount.toFixed(2)}`);
  }
  if (Math.abs(vatAmount - expected.vatAmount) > 0.01) {
    throw httpError(400, `VAT amount must match the PO/GRN value of ${expected.vatAmount.toFixed(2)}`);
  }
  const totalAmount = round2(netAmount + vatAmount);
  return {
    supplierId: receipt.purchaseOrder.supplierId,
    supplierName: receipt.purchaseOrder.supplierName,
    purchaseOrderId: receipt.purchaseOrder.id,
    goodsReceiptId: receipt.id,
    invoiceNumber,
    invoiceDate: input.invoiceDate || new Date().toISOString().slice(0, 10),
    dueDate: input.dueDate || null,
    notes: String(input.notes ?? '').trim() || null,
    netAmount, vatAmount, totalAmount,
  };
}

async function create(companyId, input, attachment = null) {
  return sequelize.transaction(async (transaction) => {
    if (!await Company.findByPk(companyId, { transaction })) throw httpError(404, 'Restaurant not found');
    const payload = await buildPayload(companyId, input, transaction);
    const row = await SupplierInvoice.create({ companyId, ...payload, ...attachment, paidAmount: 0, balanceAmount: payload.totalAmount }, { transaction });
    return get(companyId, row.id, { transaction });
  });
}
async function list(companyId, query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 10));
  const where = { companyId };
  if (query.status && query.status !== 'All') where.status = query.status;
  if (query.search?.trim()) where[Op.or] = [
    { invoiceNumber: { [Op.like]: `%${query.search.trim()}%` } },
    { supplierName: { [Op.like]: `%${query.search.trim()}%` } },
  ];
  const { count, rows } = await SupplierInvoice.findAndCountAll({ where, include, order: [['invoiceDate', 'DESC'], ['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize });
  return { rows, pagination: { page, pageSize, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) } };
}
async function get(companyId, id, options = {}) {
  const row = await SupplierInvoice.findOne({ where: { id, companyId }, include, ...options });
  if (!row) throw httpError(404, 'Supplier invoice not found');
  return row;
}
async function update(companyId, id, input, attachment = null) {
  return sequelize.transaction(async (transaction) => {
    const row = await SupplierInvoice.findOne({ where: { id, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!row) throw httpError(404, 'Supplier invoice not found');
    if (row.status !== 'DRAFT') throw httpError(409, 'Approved supplier invoices cannot be edited');
    const payload = await buildPayload(companyId, input, transaction, id);
    await row.update({ ...payload, ...(attachment || {}), balanceAmount: Math.round((payload.totalAmount - Number(row.paidAmount)) * 100) / 100 }, { transaction });
    return get(companyId, id, { transaction });
  });
}
async function approve(companyId, id, approvedBy) {
  return sequelize.transaction(async (transaction) => {
    const row = await SupplierInvoice.findOne({ where: { id, companyId }, transaction, lock: transaction.LOCK.UPDATE });
    if (!row) throw httpError(404, 'Supplier invoice not found');
    if (row.status !== 'DRAFT') throw httpError(409, 'Supplier invoice is already approved');
    const balanceAmount = Math.round((Number(row.totalAmount) - Number(row.paidAmount)) * 100) / 100;
    await row.update({ status: balanceAmount === 0 ? 'PAID' : Number(row.paidAmount) > 0 ? 'PARTIALLY_PAID' : 'APPROVED', balanceAmount, approvedAt: new Date(), approvedBy }, { transaction });
    return get(companyId, id, { transaction });
  });
}

module.exports = { eligibleGoodsReceipts, create, list, get, update, approve };
