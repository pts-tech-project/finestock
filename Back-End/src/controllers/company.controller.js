const { Company } = require('../models');

const UPDATABLE_FIELDS = [
  'name',
  'tradingName',
  'addressLine1',
  'addressLine2',
  'city',
  'postcode',
  'country',
  'phone',
  'email',
  'website',
  'vatNumber',
  'companyNumber',
  'currency',
  'financialYear',
  'vatScheme',
  'notes',
];

async function getCompany(req, res, next) {
  try {
    let company = null;

    if (req.user.companyId) {
      company = await Company.findByPk(req.user.companyId);
    }

    if (!company) {
      company = await Company.findOne({ order: [['createdAt', 'ASC']] });
    }

    if (!company) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: company });
  } catch (error) {
    return next(error);
  }
}

async function upsertCompany(req, res, next) {
  try {
    const payload = {};
    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    if (!payload.name || !String(payload.name).trim()) {
      return res.status(400).json({ success: false, message: 'Restaurant name is required' });
    }

    let company = null;
    if (req.user.companyId) {
      company = await Company.findByPk(req.user.companyId);
    }
    if (!company) {
      company = await Company.findOne({ order: [['createdAt', 'ASC']] });
    }

    if (company) {
      await company.update(payload);
    } else {
      company = await Company.create(payload);
      if (!req.user.companyId) {
        req.user.companyId = company.id;
        await req.user.save();
      }
    }

    return res.json({
      success: true,
      message: 'Company profile saved',
      data: company,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCompany,
  upsertCompany,
};
