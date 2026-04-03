const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { placeOrder, getOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', protect, restrictTo('participant'), upload.single('paymentSlip'), placeOrder);
router.get('/', protect, restrictTo('admin'), getOrders);
router.get('/mine', protect, restrictTo('participant'), getMyOrders);
router.patch('/:id/status', protect, restrictTo('admin'), updateOrderStatus);

module.exports = router;
