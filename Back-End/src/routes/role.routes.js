const express = require('express');
const roleController = require('../controllers/role.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/permissions', authorize('Owner', 'Manager'), roleController.listPermissions);
router.get('/me', roleController.myPermissions);
router.get('/', authorize('Owner', 'Manager'), roleController.listRoles);
router.get('/:role', authorize('Owner', 'Manager'), roleController.getRole);
router.put('/:role', authorize('Owner'), roleController.updateRolePermissions);
router.put('/:role/permissions', authorize('Owner'), roleController.updateRolePermissions);

module.exports = router;
