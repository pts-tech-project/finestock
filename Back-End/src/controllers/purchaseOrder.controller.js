const service = require('../services/purchaseOrder.service');

function serialize(order) {
  const value = order.get ? order.get({ plain: true }) : order;
  const moneyFields = ['subtotal', 'vatAmount', 'totalAmount', 'receivedAmount', 'balanceAmount'];
  for (const field of moneyFields) value[field] = Number(value[field]);
  value.lines = (value.lines || []).map((line) => ({
    ...line,
    orderedQuantity: Number(line.orderedQuantity),
    receivedQuantity: Number(line.receivedQuantity),
    balanceQuantity: Number(line.balanceQuantity),
    unitPrice: Number(line.unitPrice),
    vatRate: Number(line.vatRate),
    lineSubtotal: Number(line.lineSubtotal),
    vatAmount: Number(line.vatAmount),
    lineTotal: Number(line.lineTotal),
    receivedAmount: Number(line.receivedAmount),
    balanceAmount: Number(line.balanceAmount),
  }));
  return value;
}

async function create(req, res, next) {
  try { const order = await service.create(req.params.companyId, req.body); return res.status(201).json({ success: true, message: 'Purchase order created', data: serialize(order) }); }
  catch (error) { return next(error); }
}
async function list(req, res, next) {
  try { const result = await service.list(req.params.companyId, req.query); return res.json({ success: true, data: result.orders.map(serialize), pagination: result.pagination }); }
  catch (error) { return next(error); }
}
async function get(req, res, next) {
  try { const order = await service.get(req.params.companyId, req.params.orderId); return res.json({ success: true, data: serialize(order) }); }
  catch (error) { return next(error); }
}
async function update(req, res, next) {
  try { const order = await service.update(req.params.companyId, req.params.orderId, req.body); return res.json({ success: true, message: 'Purchase order updated', data: serialize(order) }); }
  catch (error) { return next(error); }
}
async function approve(req, res, next) {
  try { const order = await service.approve(req.params.companyId, req.params.orderId, req.user?.id || null); return res.json({ success: true, message: 'Purchase order approved and locked', data: serialize(order) }); }
  catch (error) { return next(error); }
}
async function receive(req, res, next) {
  try { const order = await service.receive(req.params.companyId, req.params.orderId, req.body.lines); return res.json({ success: true, message: 'Received quantities recorded', data: serialize(order) }); }
  catch (error) { return next(error); }
}

module.exports = { create, list, get, update, approve, receive };
