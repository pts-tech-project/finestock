const express = require('express');
const controller = require('../controllers/stock.controller');
const router = express.Router({ mergeParams: true });
router.get('/balances', controller.balances);
router.get('/movements', controller.movements);
module.exports = router;
