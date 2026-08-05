const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { Company, Expense } = require('../models');
function error(status, message) { const value = new Error(message); value.status = status; return value; }
function money(value, label, allowZero = false) { const number = Number(value); if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) throw error(400, `${label} is invalid`); return Math.round((number + Number.EPSILON) * 100) / 100; }
function payload(input) { const netAmount = money(input.netAmount, 'Net amount'); const vatAmount = money(input.vatAmount ?? 0, 'VAT amount', true); const description = String(input.description ?? '').trim(); if (!description) throw error(400, 'Description is required'); return { expenseDate: input.expenseDate || new Date().toISOString().slice(0, 10), category: input.category, description, netAmount, vatAmount, grossAmount: Math.round((netAmount + vatAmount) * 100) / 100, paymentMethod: input.paymentMethod || 'Bank Transfer' }; }
async function nextNumber(companyId, transaction) { const year = new Date().getFullYear(); const count = await Expense.count({ where: { companyId, expenseNumber: { [Op.like]: `EXP-${year}-%` } }, transaction }); return `EXP-${year}-${String(count + 1).padStart(5, '0')}`; }
async function create(companyId, input) { return sequelize.transaction(async (transaction) => { if (!await Company.findByPk(companyId, { transaction })) throw error(404, 'Restaurant not found'); return Expense.create({ companyId, expenseNumber: await nextNumber(companyId, transaction), ...payload(input) }, { transaction }); }); }
async function list(companyId, query = {}) { const page = Math.max(1, parseInt(query.page, 10) || 1); const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 10)); const where = { companyId }; if (query.status && query.status !== 'All') where.status = query.status; if (query.category && query.category !== 'All') where.category = query.category; if (query.search?.trim()) where.description = { [Op.like]: `%${query.search.trim()}%` }; const { count, rows } = await Expense.findAndCountAll({ where, order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize }); return { rows, pagination: { page, pageSize, total: count, totalPages: Math.max(1, Math.ceil(count / pageSize)) } }; }
async function get(companyId, id, options = {}) { const row = await Expense.findOne({ where: { id, companyId }, ...options }); if (!row) throw error(404, 'Expense not found'); return row; }
async function update(companyId, id, input) { return sequelize.transaction(async (transaction) => { const row = await get(companyId, id, { transaction, lock: transaction.LOCK.UPDATE }); if (row.status !== 'DRAFT') throw error(409, 'Approved expenses cannot be edited'); await row.update(payload(input), { transaction }); return row; }); }
async function approve(companyId, id, approvedBy) { return sequelize.transaction(async (transaction) => { const row = await get(companyId, id, { transaction, lock: transaction.LOCK.UPDATE }); if (row.status !== 'DRAFT') throw error(409, 'Expense is already approved'); await row.update({ status: 'APPROVED', approvedAt: new Date(), approvedBy }, { transaction }); return row; }); }
async function summary(companyId, query = {}) {
  const now = new Date();
  const month = Math.min(12, Math.max(1, Number(query.month) || now.getMonth() + 1));
  const year = Math.max(2000, Number(query.year) || now.getFullYear());
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  const rows = await Expense.findAll({
    attributes: ['category', [sequelize.fn('SUM', sequelize.col('grossAmount')), 'amount']],
    where: { companyId, status: 'APPROVED', expenseDate: { [Op.between]: [from, to] } },
    group: ['category'], order: [['category', 'ASC']], raw: true,
  });
  return { year, month, total: Math.round(rows.reduce((sum, row) => sum + Number(row.amount), 0) * 100) / 100, categories: rows.map((row) => ({ category: row.category, amount: Number(row.amount) })) };
}
module.exports = { create, list, get, update, approve, summary };
