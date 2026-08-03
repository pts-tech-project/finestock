const supplierService = require('../services/supplier.service');

function serializeSupplier(companySupplier) {
  const supplier = companySupplier.supplier;

  return {
    id: supplier.id,
    supplierCode: companySupplier.supplierCode,
    name: supplier.name,
    contact: supplier.contact,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    vatNumber: supplier.vatNumber,
    paymentTerms: companySupplier.paymentTerms,
    openingBalance: Number(companySupplier.openingBalance),
    balance: Number(companySupplier.openingBalance),
    status: companySupplier.status,
    createdAt: companySupplier.createdAt,
    updatedAt: companySupplier.updatedAt,
  };
}

async function listSuppliers(req, res, next) {
  try {
    const result =
      await supplierService.listSuppliersForCompany(
        req.params.companyId,
        {
          search: req.query.search,
          status: req.query.status,
          page: req.query.page,
          pageSize: req.query.pageSize,
        },
      );

    return res.json({
      success: true,
      data: result.suppliers.map(serializeSupplier),
      pagination: result.pagination,
    });
  } catch (error) {
    return next(error);
  }
}

async function getSupplier(req, res, next) {
  try {
    const supplier =
      await supplierService.getSupplierForCompany(
        req.params.companyId,
        req.params.supplierId,
      );

    return res.json({
      success: true,
      data: serializeSupplier(supplier),
    });
  } catch (error) {
    return next(error);
  }
}

async function createSupplier(req, res, next) {
  try {
    const result =
      await supplierService.createSupplierForCompany(
        req.params.companyId,
        req.body,
      );

    const supplier =
      await supplierService.getSupplierForCompany(
        req.params.companyId,
        result.supplier.id,
      );

    return res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: serializeSupplier(supplier),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSupplier(req, res, next) {
  try {
    const supplier =
      await supplierService.updateSupplierForCompany(
        req.params.companyId,
        req.params.supplierId,
        req.body,
      );

    return res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: serializeSupplier(supplier),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSupplierStatus(req, res, next) {
  try {
    const supplier =
      await supplierService.updateSupplierForCompany(
        req.params.companyId,
        req.params.supplierId,
        {
          status: req.body.status,
        },
      );

    return res.json({
      success: true,
      message: `Supplier marked as ${supplier.status}`,
      data: serializeSupplier(supplier),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
};