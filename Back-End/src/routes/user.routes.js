const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('Owner', 'Manager'), userController.listUsers);
router.get('/:id', authorize('Owner', 'Manager'), userController.getUser);
router.post('/', authorize('Owner', 'Manager'), userController.createUser);
router.put('/:id', authorize('Owner', 'Manager'), userController.updateUser);
router.patch('/:id/deactivate', authorize('Owner', 'Manager'), userController.deactivateUser);
router.post('/:id/reset-password', authorize('Owner', 'Manager'), userController.resetPassword);

module.exports = router;
