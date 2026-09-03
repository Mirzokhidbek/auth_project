// ============================================================================
// NARX SOLISHTIRISH ROUTELARI (Comparison Routes)
// ============================================================================
// Barcha yo'nalishlar 'protect' middleware'i orqali xavfsiz HttpOnly kuki bilan
// himoyalangan. Tizimga kirmaganlar bu API'dan foydalana olmaydi.

const express = require('express');
const router = express.Router();

const {
    compareProduct,
    getHistory,
    deleteHistoryItem
} = require('../controllers/comparisonController');

const { protect } = require('../middleware/authMiddleware');

// 1. Mahsulot narxlarini AI orqali solishtirish (Protected)
router.post('/', protect, compareProduct);

// 2. Qidiruv tarixini olish (Protected)
router.get('/history', protect, getHistory);

// 3. Tarixdan elementni o'chirish (Protected)
router.delete('/history/:id', protect, deleteHistoryItem);

module.exports = router;
