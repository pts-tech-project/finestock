const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
  Company,
  Supplier,
  CompanySupplier,
} = require('../models');

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function optionalText(value) {
  const cleaned = String(value || '').trim();
  return cleaned || null;
}

async function createSupplierForCompany(companyId, payload) {
  if (!companyId) {
    throw createError('Company ID is required', 400);
  }

  const name = String(payload.name || '').trim();
  const supplierCode = String(payload.supplierCode || '')
    .trim()
    .toUpperCase();

  if (!name) {
    throw createError('Supplier name is required', 400);
  }

  if (!supplierCode) {
    throw createError('Supplier code is required', 400);
  }

  const paymentTerms = String(payload.paymentTerms || 'Net 30').trim();
  if (!paymentTerms) {
    throw createError('Payment terms are required', 400);
  }

  const openingBalance =
    payload.openingBalance === undefined || payload.openingBalance === ''
      ? 0
      : Number(payload.openingBalance);

  if (!Number.isFinite(openingBalance)) {
    throw createError('Opening balance must be a valid number', 400);
  }

  const status = payload.status || 'Active';
  if (!['Active', 'Inactive'].includes(status)) {
    throw createError('Status must be Active or Inactive', 400);
  }

  return sequelize.transaction(async (transaction) => {
    const company = await Company.findByPk(companyId, {
      transaction,
    });

    if (!company) {
      throw createError('Company not found', 404);
    }

    const existingCode = await CompanySupplier.findOne({
      where: {
        companyId,
        supplierCode,
      },
      transaction,
    });

    if (existingCode) {
      throw createError(
        'Supplier code already exists for this company',
        409,
      );
    }

    const supplier = await Supplier.create(
      {
        name,
        contact: optionalText(payload.contact),
        email: optionalText(payload.email)?.toLowerCase() || null,
        phone: optionalText(payload.phone),
        address: optionalText(payload.address),
        vatNumber: optionalText(payload.vatNumber),
      },
      {
        transaction,
      },
    );

    const companySupplier = await CompanySupplier.create(
      {
        companyId,
        supplierId: supplier.id,
        supplierCode,
        paymentTerms,
        openingBalance,
        status,
      },
      {
        transaction,
      },
    );

    return {
      supplier,
      companySupplier,
    };
  });
}

//------------------List and search suppliers for one company.------------------------------------------------------------

async function listSuppliersForCompany(
  companyId,
  {
    search = '',
    status = 'All',
    page = 1,
    pageSize = 10,
  } = {},
) {
  if (!companyId) {
    throw createError('Company ID is required', 400);
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(pageSize) || 10, 1),
    100,
  );
  const offset = (pageNumber - 1) * limit;

  const relationshipWhere = {
    companyId,
  };

  if (status !== 'All') {
    relationshipWhere.status = status;
  }

  const supplierWhere = {};

  if (search.trim()) {
    const searchText = `%${search.trim()}%`;

    supplierWhere[Op.or] = [
      {
        name: {
          [Op.like]: searchText,
        },
      },
      {
        contact: {
          [Op.like]: searchText,
        },
      },
      {
        email: {
          [Op.like]: searchText,
        },
      },
      {
        vatNumber: {
          [Op.like]: searchText,
        },
      },
    ];
  }

  const result = await CompanySupplier.findAndCountAll({
    where: relationshipWhere,
    include: [
      {
        model: Supplier,
        as: 'supplier',
        required: true,
        where: supplierWhere,
      },
    ],
    order: [
      ['createdAt', 'DESC'],
    ],
    limit,
    offset,
  });

  return {
    suppliers: result.rows,
    pagination: {
      page: pageNumber,
      pageSize: limit,
      totalItems: result.count,
      totalPages: Math.max(
        Math.ceil(result.count / limit),
        1,
      ),
    },
  };
}

//-----------------------------------Supplier view----------------------------------------------------------


async function getSupplierForCompany(
  companyId,
  supplierId,
) {
  if (!companyId) {
    throw createError('Company ID is required', 400);
  }

  if (!supplierId) {
    throw createError('Supplier ID is required', 400);
  }

  const companySupplier = await CompanySupplier.findOne({
    where: {
      companyId,
      supplierId,
    },
    include: [
      {
        model: Supplier,
        as: 'supplier',
        required: true,
      },
    ],
  });

  if (!companySupplier) {
    throw createError('Supplier not found', 404);
  }

  return companySupplier;
}

//-----------------------------update------------------------------------------

async function updateSupplierForCompany(
  companyId,
  supplierId,
  payload,
) {
  if (!companyId) {
    throw createError('Company ID is required', 400);
  }

  if (!supplierId) {
    throw createError('Supplier ID is required', 400);
  }

  return sequelize.transaction(async (transaction) => {
    const companySupplier = await CompanySupplier.findOne({
      where: {
        companyId,
        supplierId,
      },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          required: true,
        },
      ],
      transaction,
    });

    if (!companySupplier) {
      throw createError('Supplier not found', 404);
    }

    const supplierUpdates = {};

    if (payload.name !== undefined) {
      const name = String(payload.name).trim();

      if (!name) {
        throw createError('Supplier name cannot be empty', 400);
      }

      supplierUpdates.name = name;
    }

    if (payload.contact !== undefined) {
      supplierUpdates.contact = optionalText(payload.contact);
    }

    if (payload.email !== undefined) {
      supplierUpdates.email =
        optionalText(payload.email)?.toLowerCase() || null;
    }

    if (payload.phone !== undefined) {
      supplierUpdates.phone = optionalText(payload.phone);
    }

    if (payload.address !== undefined) {
      supplierUpdates.address = optionalText(payload.address);
    }

    if (payload.vatNumber !== undefined) {
      supplierUpdates.vatNumber = optionalText(payload.vatNumber);
    }

    const hasSharedUpdates =
      Object.keys(supplierUpdates).length > 0;

    if (hasSharedUpdates) {
      const relationshipCount = await CompanySupplier.count({
        where: {
          supplierId,
        },
        transaction,
      });

      if (relationshipCount > 1) {
        throw createError(
          'Shared supplier details cannot be changed because this supplier belongs to multiple companies',
          409,
        );
      }
    }

    const relationshipUpdates = {};

    if (payload.supplierCode !== undefined) {
      const supplierCode = String(payload.supplierCode)
        .trim()
        .toUpperCase();

      if (!supplierCode) {
        throw createError('Supplier code cannot be empty', 400);
      }

      const duplicateCode = await CompanySupplier.findOne({
        where: {
          companyId,
          supplierCode,
          supplierId: {
            [Op.ne]: supplierId,
          },
        },
        transaction,
      });

      if (duplicateCode) {
        throw createError(
          'Supplier code already exists for this company',
          409,
        );
      }

      relationshipUpdates.supplierCode = supplierCode;
    }

    if (payload.paymentTerms !== undefined) {
      const paymentTerms = String(payload.paymentTerms).trim();

      if (!paymentTerms) {
        throw createError('Payment terms cannot be empty', 400);
      }

      relationshipUpdates.paymentTerms = paymentTerms;
    }

    if (payload.openingBalance !== undefined) {
      const openingBalance = Number(payload.openingBalance);

      if (!Number.isFinite(openingBalance)) {
        throw createError(
          'Opening balance must be a valid number',
          400,
        );
      }

      relationshipUpdates.openingBalance = openingBalance;
    }

    if (payload.status !== undefined) {
      if (!['Active', 'Inactive'].includes(payload.status)) {
        throw createError(
          'Status must be Active or Inactive',
          400,
        );
      }

      relationshipUpdates.status = payload.status;
    }

    if (Object.keys(supplierUpdates).length > 0) {
      await companySupplier.supplier.update(
        supplierUpdates,
        {
          transaction,
        },
      );
    }

    if (Object.keys(relationshipUpdates).length > 0) {
      await companySupplier.update(
        relationshipUpdates,
        {
          transaction,
        },
      );
    }

    return CompanySupplier.findOne({
      where: {
        companyId,
        supplierId,
      },
      include: [
        {
          model: Supplier,
          as: 'supplier',
          required: true,
        },
      ],
      transaction,
    });
  });
}

module.exports = {
  createSupplierForCompany,
  listSuppliersForCompany,
  getSupplierForCompany,
  updateSupplierForCompany,
};
