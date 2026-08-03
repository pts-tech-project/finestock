const express = require('express');
const controller = require('../controllers/purchaseOrder.controller');

const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({ success: false, message: 'Purchase Order API is unavailable until authentication is enabled' });
  }
  return next();
});

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:orderId', controller.get);
router.patch('/:orderId', controller.update);
router.post('/:orderId/approve', controller.approve);

module.exports = router;
