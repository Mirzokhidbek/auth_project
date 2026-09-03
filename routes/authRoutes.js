// ============================================================================
// AUTENTIFIKATSIYA YO'NALISHLARI (Auth Routes)
// ============================================================================
// API marshrutlarini belgilovchi fayl.

const express = require('express');
const router = express.Router();

const {
    signUp,
    signIn,
    signOut,
    getMe
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// 1. Ommaviy yo'nalishlar (Public Routes)
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);

// 2. Himoyalangan yo'nalishlar (Protected Routes)
// 'protect' middleware'i orqali faqat yaroqli HttpOnly kukisiga ega foydalanuvchilar o'tadi
router.get('/me', protect, getMe);

module.exports = router;
