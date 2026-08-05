const express = require('express');
const controller = require('../controllers/purchaseOrder.controller');
const { authenticate, authorizeCompany, authorizePermission } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate, authorizeCompany);

router.get('/', authorizePermission('Create Purchase'), controller.list);
router.post('/', authorizePermission('Create Purchase'), controller.create);
router.get('/:orderId', authorizePermission('Create Purchase'), controller.get);
router.patch('/:orderId', authorizePermission('Create Purchase'), controller.update);
router.post('/:orderId/approve', authorizePermission('Approve Purchase'), controller.approve);

module.exports = router;
