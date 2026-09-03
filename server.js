// ============================================================================
// ASOSIY SERVER FAYLI (Server.js)
// ============================================================================
// Ushbu fayl Express serverini sozlaydi, ma'lumotlar bazasiga ulanadi,
// xavfsizlik va kuki middleware'larini ishga tushiradi.

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// 1. Express ilovasini yaratamiz
const app = express();

// 2. MongoDB bazasiga ulanamiz
connectDB();

// 3. O'rta dasturlar (Middleware)
// JSON formatidagi so'rovlar tanasini (request body) o'qish uchun:
app.use(express.json());

// So'rovlar bilan kelgan HttpOnly Cookie'larni o'qish uchun:
app.use(cookieParser());

// 4. Frontend statik fayllarini ('public' papkasi) taqdim etish:
app.use(express.static(path.join(__dirname, 'public')));

// 5. Autentifikatsiya API yo'nalishlarini ulash:
app.use('/api/auth', authRoutes);

// Barcha boshqa yo'nalishlar uchun frontend bosh sahifasini beramiz (SPA fallback):
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. Serverni ishga tushirish
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server muvaffaqiyatli ishga tushdi: http://localhost:${PORT}`);
    console.log(`🛡️  Xavfsizlik: HttpOnly Cookie + Access/Refresh Token faol!`);
});

// Xatoliklarni ushlash
process.on('unhandledRejection', (err) => {
    console.error(`Kutilmagan xatolik: ${err.message}`);
    server.close(() => process.exit(1));
});
