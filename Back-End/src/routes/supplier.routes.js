const express = require('express');
const supplierController = require('../controllers/supplier.controller');
const { authenticate, authorizeCompany, authorizePermission } = require('../middleware/auth');

const router = express.Router({
  mergeParams: true,
});

router.use(authenticate, authorizeCompany, authorizePermission('Manage Suppliers'));

router.get('/', supplierController.listSuppliers);
router.post('/', supplierController.createSupplier);

router.get('/:supplierId', supplierController.getSupplier);
router.patch('/:supplierId', supplierController.updateSupplier);
router.patch(
  '/:supplierId/status',
  supplierController.updateSupplierStatus,
);

module.exports = router;
