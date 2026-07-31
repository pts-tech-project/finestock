const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define(
  'Supplier',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    contact: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    vatNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'vat_number',
    },
  },
  {
    tableName: 'suppliers',
    underscored: true,
    timestamps: true,
  },
);

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

module.exports = Supplier;