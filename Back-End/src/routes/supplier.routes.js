const express = require('express');
const supplierController = require('../controllers/supplier.controller');

const router = express.Router({
  mergeParams: true,
});

// Temporary protection until authentication is connected.
// These routes must not be publicly available in production.
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({
      success: false,
      message: 'Supplier API requires authentication before production use',
    });
  }

  return next();
});

router.get('/', supplierController.listSuppliers);
router.post('/', supplierController.createSupplier);

router.get('/:supplierId', supplierController.getSupplier);
router.patch('/:supplierId', supplierController.updateSupplier);
router.patch(
  '/:supplierId/status',
  supplierController.updateSupplierStatus,
);

module.exports = router;