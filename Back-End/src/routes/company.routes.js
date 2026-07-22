const express = require('express');
const companyController = require('../controllers/company.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', companyController.getCompany);
router.put('/', authorize('Owner', 'Manager'), companyController.upsertCompany);

module.exports = router;
