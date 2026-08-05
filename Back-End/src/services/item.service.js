const { Op } = require('sequelize');
const { Company, Item } = require('../models');

const ITEM_TYPES = ['INGREDIENT', 'MENU_ITEM'];
const STATUSES = ['Active', 'Inactive'];

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requiredText(value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw httpError(400, `${label} is required`);
  return text;
}

function optionalText(value) {
  if (value === undefined) return undefined;
  const text = String(value ?? '').trim();
  return text || null;
}

function optionalNumber(value, label, { min = 0, max } = {}) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || (max !== undefined && number > max)) {
    throw httpError(400, `${label} must be a valid number${max !== undefined ? ` between ${min} and ${max}` : ''}`);
  }
  return number;
}

async function ensureCompany(companyId) {
  const company = await Company.findByPk(companyId);
  if (!company) throw httpError(404, 'Restaurant not found');
  return company;
}

function buildCreatePayload(companyId, input) {
  const itemType = requiredText(input.itemType, 'Item type').toUpperCase();
  if (!ITEM_TYPES.includes(itemType)) throw httpError(400, 'Item type must be INGREDIENT or MENU_ITEM');

  const status = input.status ?? 'Active';
  if (!STATUSES.includes(status)) throw httpError(400, 'Status must be Active or Inactive');

  const payload = {
    companyId,
    itemCode: requiredText(input.itemCode, 'Item code').toUpperCase(),
    name: requiredText(input.name, 'Item name'),
    itemType,
    category: optionalText(input.category),
    unit: requiredText(input.unit, 'Unit').toUpperCase(),
    description: optionalText(input.description),
    sellingPrice: optionalNumber(input.sellingPrice, 'Selling price'),
    costPerUnit: optionalNumber(input.costPerUnit, 'Cost per unit'),
    reorderLevel: optionalNumber(input.reorderLevel, 'Reorder level'),
    vatRate: optionalNumber(input.vatRate ?? 0, 'VAT rate', { min: 0, max: 100 }),
    status,
  };

  if (itemType === 'MENU_ITEM' && payload.sellingPrice === null) {
    throw httpError(400, 'Selling price is required for a menu item');
  }
  return payload;
}

async function createItemForCompany(companyId, input) {
  await ensureCompany(companyId);
  return Item.create(buildCreatePayload(companyId, input));
}

async function listItemsForCompany(companyId, query = {}) {
  await ensureCompany(companyId);
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 10));
  const where = { companyId };

  if (query.search?.trim()) {
    const search = `%${query.search.trim()}%`;
    where[Op.or] = [{ itemCode: { [Op.like]: search } }, { name: { [Op.like]: search } }, { category: { [Op.like]: search } }];
  }
  if (ITEM_TYPES.includes(query.itemType)) where.itemType = query.itemType;
  if (STATUSES.includes(query.status)) where.status = query.status;

  const { count, rows } = await Item.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return { items: rows, pagination: { page, pageSize, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) } };
}

async function getItemForCompany(companyId, itemId) {
  const item = await Item.findOne({ where: { id: itemId, companyId } });
  if (!item) throw httpError(404, 'Item not found');
  return item;
}

async function updateItemForCompany(companyId, itemId, input) {
  const item = await getItemForCompany(companyId, itemId);
  const merged = { ...item.get({ plain: true }), ...input };
  const payload = buildCreatePayload(companyId, merged);
  delete payload.companyId;
  await item.update(payload);
  return item;
}

async function updateItemStatusForCompany(companyId, itemId, status) {
  if (!STATUSES.includes(status)) throw httpError(400, 'Status must be Active or Inactive');
  const item = await getItemForCompany(companyId, itemId);
  await item.update({ status });
  return item;
}

module.exports = {
  createItemForCompany,
  listItemsForCompany,
  getItemForCompany,
  updateItemForCompany,
  updateItemStatusForCompany,
};
