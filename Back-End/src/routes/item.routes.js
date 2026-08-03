const express = require('express');
const controller = require('../controllers/item.controller');
const { authenticate, authorizeCompany, authorizePermission } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate, authorizeCompany, authorizePermission('Manage Inventory'));

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:itemId', controller.get);
router.patch('/:itemId', controller.update);
router.patch('/:itemId/status', controller.updateStatus);

module.exports = router;
