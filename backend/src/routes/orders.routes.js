const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

const { createOrder,
        getOrders, 
        getOrder,
        updateOrderStatus,
        cancelOrder, 
        getOrderHistory,
        getAllOrdersAdmin
} = require('../controllers/orders.controller');



router.post('/', authMiddleware, createOrder);

router.get('/', authMiddleware, getOrders);
router.get('/all', authMiddleware, adminMiddleware, getAllOrdersAdmin); // 👈 NUEVA RUTA ADMIN

router.get('/:uuid', authMiddleware, getOrder);

router.get('/:id/history',authMiddleware, getOrderHistory);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
router.put('/:id/cancel', authMiddleware, cancelOrder);


module.exports = router;
