const service = require('../services/expense.service');
function serialize(row) { const value = row.get({ plain: true }); return { ...value, netAmount: Number(value.netAmount), vatAmount: Number(value.vatAmount), grossAmount: Number(value.grossAmount) }; }
async function create(req, res, next) { try { return res.status(201).json({ success: true, data: serialize(await service.create(req.params.companyId, req.body)), message: 'Expense saved as draft' }); } catch (e) { return next(e); } }
async function list(req, res, next) { try { const result = await service.list(req.params.companyId, req.query); return res.json({ success: true, data: result.rows.map(serialize), pagination: result.pagination }); } catch (e) { return next(e); } }
async function get(req, res, next) { try { return res.json({ success: true, data: serialize(await service.get(req.params.companyId, req.params.expenseId)) }); } catch (e) { return next(e); } }
async function update(req, res, next) { try { return res.json({ success: true, data: serialize(await service.update(req.params.companyId, req.params.expenseId, req.body)), message: 'Expense updated' }); } catch (e) { return next(e); } }
async function approve(req, res, next) { try { return res.json({ success: true, data: serialize(await service.approve(req.params.companyId, req.params.expenseId, req.user.id)), message: 'Expense approved' }); } catch (e) { return next(e); } }
async function summary(req, res, next) { try { return res.json({ success: true, data: await service.summary(req.params.companyId, req.query) }); } catch (e) { return next(e); } }
module.exports = { create, list, get, update, approve, summary };
