const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/register', authenticate, authorize('Owner', 'Manager'), authController.register);
router.get('/me', authenticate, authController.me);
router.put('/me', authenticate, authController.updateMe);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
