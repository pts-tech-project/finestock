const express = require('express');
const controller = require('../controllers/stock.controller');
const { authenticate, authorizeCompany, authorizePermission } = require('../middleware/auth');
const router = express.Router({ mergeParams: true });
router.use(authenticate, authorizeCompany, authorizePermission('Manage Inventory'));
router.get('/balances', controller.balances);
router.get('/movements', controller.movements);
module.exports = router;
