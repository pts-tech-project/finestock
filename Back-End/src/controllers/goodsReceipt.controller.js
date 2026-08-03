const service = require('../services/goodsReceipt.service');

function serialize(value) {
  const receipt = value.get ? value.get({ plain: true }) : value;
  receipt.totalAmount = Number(receipt.totalAmount);
  receipt.lines = (receipt.lines || []).map((line) => ({ ...line, quantityReceived: Number(line.quantityReceived), unitCost: Number(line.unitCost), lineAmount: Number(line.lineAmount) }));
  return receipt;
}
async function eligible(req, res, next) { try { const data = await service.eligiblePurchaseOrders(req.params.companyId); return res.json({ success: true, data }); } catch (error) { return next(error); } }
async function create(req, res, next) { try { const data = await service.create(req.params.companyId, req.body); return res.status(201).json({ success: true, message: 'Goods receipt saved as draft', data: serialize(data) }); } catch (error) { return next(error); } }
async function list(req, res, next) { try { const result = await service.list(req.params.companyId, req.query); return res.json({ success: true, data: result.receipts.map(serialize), pagination: result.pagination }); } catch (error) { return next(error); } }
async function get(req, res, next) { try { return res.json({ success: true, data: serialize(await service.get(req.params.companyId, req.params.receiptId)) }); } catch (error) { return next(error); } }
async function update(req, res, next) { try { return res.json({ success: true, message: 'Goods receipt updated', data: serialize(await service.update(req.params.companyId, req.params.receiptId, req.body)) }); } catch (error) { return next(error); } }
async function approve(req, res, next) { try { return res.json({ success: true, message: 'Goods receipt approved and stock updated', data: serialize(await service.approve(req.params.companyId, req.params.receiptId, req.user?.id || null)) }); } catch (error) { return next(error); } }
module.exports = { eligible, create, list, get, update, approve };
