const { Op } = require('sequelize');
const { Item, StockBalance, StockMovement } = require('../models');

async function balances(req, res, next) {
  try {
    const where = { companyId: req.params.companyId, itemType: 'INGREDIENT' };
    if (req.query.search?.trim()) where[Op.or] = [{ name: { [Op.like]: `%${req.query.search.trim()}%` } }, { itemCode: { [Op.like]: `%${req.query.search.trim()}%` } }];
    const items = await Item.findAll({ where, include: [{ model: StockBalance, as: 'stockBalance', required: false }], order: [['name', 'ASC']] });
    return res.json({ success: true, data: items.map((item) => ({ id: item.id, itemCode: item.itemCode, name: item.name, category: item.category, unit: item.unit, reorderLevel: Number(item.reorderLevel || 0), quantity: Number(item.stockBalance?.quantity || 0), averageCost: Number(item.stockBalance?.averageCost || item.costPerUnit || 0) })) });
  } catch (error) { return next(error); }
}
async function movements(req, res, next) {
  try {
    const rows = await StockMovement.findAll({ where: { companyId: req.params.companyId }, include: [{ model: Item, as: 'item', attributes: ['itemCode', 'name', 'unit'] }], order: [['movementDate', 'DESC']], limit: 200 });
    return res.json({ success: true, data: rows.map((row) => ({ ...row.get({ plain: true }), quantity: Number(row.quantity), unitCost: Number(row.unitCost), totalCost: Number(row.totalCost) })) });
  } catch (error) { return next(error); }
}
module.exports = { balances, movements };
