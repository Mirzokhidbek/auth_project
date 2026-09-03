// ============================================================================
// HIMOYA MIDDLEWARE'I (Auth Middleware)
// ============================================================================
// Ushbu middleware yopiq (faqat tizimga kirganlar uchun) sahifalar va API'larni
// himoya qiladi. U so'rovdagi HttpOnly kukilarni tekshiradi.
//
// Qiziqarli va professional tomoni:
// Agar Access Tokenning 15 daqiqalik muddati tugagan bo'lsa,
// bu middleware foydalanuvchini tizimdan haydab yubormaydi,
// balki Refresh Token orqali avtomatik yangi Access Token olib (Silent Refresh),
// jarayonni to'xtovsiz davom ettiradi!

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, getCookieOptions } = require('../utils/tokens');

const protect = async (req, res, next) => {
    try {
        // 1. So'rov kukilaridan tokenlarni qidiramiz
        const { accessToken, refreshToken } = req.cookies;

        // Agar ikkala token ham mavjud bo'lmasa - ruxsat yo'q
        if (!accessToken && !refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Tizimga kirmagansiz. Iltimos, oldin tizimga kiring.'
            });
        }

        // 2. Birinchi navbatda Access Tokenni tekshirib ko'ramiz
        if (accessToken) {
            try {
                // Access tokenni maxfiy kalit bilan tekshirish
                const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
                
                // Foydalanuvchi ma'lumotlarini so'rov ob'ektiga qo'shamiz
                req.user = decoded;
                return next(); // Muvaffaqiyatli, keyingi qadamga o'tamiz
            } catch (err) {
                // Agar xato faqat "Token expired" (muddati tugagan) bo'lsa,
                // Refresh Token bilan yangilashga urinib ko'ramiz.
                // Agar token buzilgan (invalid) bo'lsa, keyingi blokka o'tadi.
                if (err.name !== 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: 'Noto\'g\'ri yoki soxta token!'
                    });
                }
            }
        }

        // 3. Agar Access Token muddati tugagan bo'lsa, Refresh Tokenni tekshiramiz
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Sessiya muddati tugadi. Qayta kiring.'
            });
        }

        // Refresh tokenni tekshiramiz
        let decodedRefresh;
        try {
            decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (refreshErr) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token muddati ham tugagan. Qaytadan login qiling.'
            });
        }

        // 4. XAVFSIZLIKNING YUQORI DARAJASI (Revocation Check):
        // Bazaga borib, ushbu refresh token haqiqatan ham shu foydalanuvchiga tegishlimi
        // yoki admin/foydalanuvchi tomonidan bekor qilinganmi (logout) tekshiramiz.
        const user = await User.findById(decodedRefresh.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Ushbu sessiya bekor qilingan yoki mavjud emas. Qayta kiring.'
            });
        }

        // 5. Silent Refresh: Yangi Access Token yaratamiz va kuki sifatida beramiz
        const newAccessToken = generateAccessToken(user);
        res.cookie('accessToken', newAccessToken, getCookieOptions(false));

        // Foydalanuvchini so'rovga biriktiramiz
        req.user = {
            id: user._id,
            email: user.email,
            name: user.name
        };

        next();
    } catch (error) {
        console.error('Auth Middleware xatoligi:', error);
        res.status(500).json({
            success: false,
            message: 'Autentifikatsiyada ichki server xatosi yuz berdi'
        });
    }
};

module.exports = { protect };
