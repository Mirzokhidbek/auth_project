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
                code: 'UNAUTHORIZED',
                message: 'Unauthorized. Please sign in.'
            });
        }

        // 2. Birinchi navbatda Access Tokenni tekshirib ko'ramiz
        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
                req.user = decoded;
                return next();
            } catch (err) {
                if (err.name !== 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        code: 'INVALID_TOKEN',
                        message: 'Invalid or malformed authentication token'
                    });
                }
            }
        }

        // 3. Agar Access Token muddati tugagan bo'lsa, Refresh Tokenni tekshiramiz
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                code: 'SESSION_EXPIRED',
                message: 'Session expired. Please sign in again.'
            });
        }

        let decodedRefresh;
        try {
            decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (refreshErr) {
            return res.status(401).json({
                success: false,
                code: 'REFRESH_TOKEN_EXPIRED',
                message: 'Session expired. Please sign in again.'
            });
        }

        const user = await User.findById(decodedRefresh.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                code: 'SESSION_REVOKED',
                message: 'Session has been revoked. Please sign in again.'
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
