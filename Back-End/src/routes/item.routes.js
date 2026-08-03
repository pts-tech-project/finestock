const express = require('express');
const controller = require('../controllers/item.controller');

const router = express.Router({ mergeParams: true });

// Authentication and permission middleware will be added when the auth phase starts.
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({ success: false, message: 'Item API is unavailable until authentication is enabled' });
  }
  return next();
});

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:itemId', controller.get);
router.patch('/:itemId', controller.update);
router.patch('/:itemId/status', controller.updateStatus);

module.exports = router;
