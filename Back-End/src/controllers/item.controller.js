const itemService = require('../services/item.service');

function serialize(item) {
  const value = item.get ? item.get({ plain: true }) : item;
  return {
    ...value,
    sellingPrice: value.sellingPrice === null ? null : Number(value.sellingPrice),
    costPerUnit: value.costPerUnit === null ? null : Number(value.costPerUnit),
    reorderLevel: value.reorderLevel === null ? null : Number(value.reorderLevel),
    vatRate: value.vatRate === null ? null : Number(value.vatRate),
  };
}

async function create(req, res, next) {
  try {
    const item = await itemService.createItemForCompany(req.params.companyId, req.body);
    return res.status(201).json({ success: true, message: 'Item created', data: serialize(item) });
  } catch (error) { return next(error); }
}

async function list(req, res, next) {
  try {
    const result = await itemService.listItemsForCompany(req.params.companyId, req.query);
    return res.json({ success: true, data: result.items.map(serialize), pagination: result.pagination });
  } catch (error) { return next(error); }
}

async function get(req, res, next) {
  try {
    const item = await itemService.getItemForCompany(req.params.companyId, req.params.itemId);
    return res.json({ success: true, data: serialize(item) });
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    const item = await itemService.updateItemForCompany(req.params.companyId, req.params.itemId, req.body);
    return res.json({ success: true, message: 'Item updated', data: serialize(item) });
  } catch (error) { return next(error); }
}

async function updateStatus(req, res, next) {
  try {
    const item = await itemService.updateItemStatusForCompany(req.params.companyId, req.params.itemId, req.body.status);
    return res.json({ success: true, message: 'Item status updated', data: serialize(item) });
  } catch (error) { return next(error); }
}

module.exports = { create, list, get, update, updateStatus };
