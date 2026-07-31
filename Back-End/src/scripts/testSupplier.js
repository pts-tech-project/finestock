require('dotenv').config();

const sequelize = require('../config/database');
const { Company } = require('../models');
const supplierService = require('../services/supplier.service');

async function testSupplier() {
  try {
    await sequelize.authenticate();

    const companyName = process.argv[2] || 'Sakura Restaurant';
    const supplierCode = process.argv[3] || 'SUP-001';

    const company = await Company.findOne({
      where: {
        name: companyName,
      },
    });

    if (!company) {
      throw new Error(`Company not found: ${companyName}`);
    }

    console.log(`Using company: ${company.name}`);

    const created = await supplierService.createSupplierForCompany(
      company.id,
      {
        supplierCode,
        name: 'Fresh Foods Ltd',
        contact: 'John Smith',
        email: 'accounts@freshfoods.test',
        phone: '020 1234 5678',
        address: '10 Market Street, London',
        vatNumber: 'GB123456789',
        paymentTerms: 'Net 30',
        openingBalance: 0,
        status: 'Active',
      },
    );

    console.log('Supplier created');
    console.log({
      supplierId: created.supplier.id,
      supplierCode: created.companySupplier.supplierCode,
      supplierName: created.supplier.name,
    });

    const list = await supplierService.listSuppliersForCompany(
      company.id,
      {
        search: 'Fresh',
        status: 'Active',
        page: 1,
        pageSize: 10,
      },
    );

    console.log(`Suppliers found: ${list.pagination.totalItems}`);

    const supplier = await supplierService.getSupplierForCompany(
      company.id,
      created.supplier.id,
    );

    console.log('Supplier viewed');
    console.log({
      supplierCode: supplier.supplierCode,
      name: supplier.supplier.name,
      email: supplier.supplier.email,
      paymentTerms: supplier.paymentTerms,
      status: supplier.status,
    });
  } catch (error) {
    console.error('Supplier test failed:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testSupplier();