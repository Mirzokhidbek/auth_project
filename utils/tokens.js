// ============================================================================
// TOKEN VA KUKI (COOKIE) BOSHQARUVI
// ============================================================================
// Ushbu faylda eng xavfsiz JWT strategiyasi amalga oshiriladi:
// 1. Access Token: Qisqa muddatli (15 daqiqa) - amallarni bajarish uchun.
// 2. Refresh Token: Uzoqroq muddatli (7 kun) - access tokenni yangilab turish uchun.
// 3. HttpOnly Cookie: Ikkala token ham brauzerning localStorage'ida EMAS,
//    faqat server o'qiy oladigan HttpOnly Cookie ichida yuboriladi (XSS himoyasi).

const jwt = require('jsonwebtoken');

/**
 * Access Token yaratish (15 daqiqa amal qiladi)
 * Foydalanuvchining asosiy ma'lumotlarini o'z ichiga oladi.
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            name: user.name 
        },
        process.env.JWT_ACCESS_SECRET,
        { 
            expiresIn: '15m' // 15 daqiqa
        }
    );
};

/**
 * Refresh Token yaratish (7 kun amal qiladi)
 * Faqat foydalanuvchi ID sini o'z ichiga oladi.
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { 
            id: user._id 
        },
        process.env.JWT_REFRESH_SECRET,
        { 
            expiresIn: '7d' // 7 kun
        }
    );
};

/**
 * Kuki (Cookie) sozlamalari - XAVFSIZLIKNING ASOSIY QALQONI:
 * 
 * - httpOnly: true -> Brauzerdagi hech qanday JavaScript kodi (masalan, document.cookie)
 *                     bu kukini o'qiy olmaydi! Agar saytingizda XSS zaifligi bo'lsa ham,
 *                     xaker tokenni o'g'irlay olmaydi.
 * 
 * - secure: true (productionda) -> Kuki faqat HTTPS (shifrlangan) protokoli orqali uzatiladi.
 * 
 * - sameSite: 'strict' -> Boshqa soxta saytlardan foydalanuvchi nomidan so'rov yuborish
 *                         (CSRF - Cross-Site Request Forgery) xurujlarini 100% to'sadi.
 */
const getCookieOptions = (isRefreshToken = false) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
        httpOnly: true, // XSS hujumiga qarshi
        secure: isProduction, // Faqat HTTPS orqali (developmentda localhost bo'lgani uchun false bo'lishi mumkin)
        sameSite: 'strict', // CSRF hujumiga qarshi
        path: '/', // Butun sayt doirasida amal qiladi
        // Access token: 15 daqiqa (millisekundda), Refresh token: 7 kun
        maxAge: isRefreshToken ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000
    };
};

/**
 * Ikkala tokenni ham foydalanuvchi brauzeriga xavfsiz HttpOnly cookie qilib joylash
 */
const sendAuthCookies = (res, accessToken, refreshToken) => {
    // 1. Access Token kukisini o'rnatish
    res.cookie('accessToken', accessToken, getCookieOptions(false));
    
    // 2. Refresh Token kukisini o'rnatish
    res.cookie('refreshToken', refreshToken, getCookieOptions(true));
};

/**
 * Tizimdan chiqilganda (Logout) kukilarni tozalash
 */
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    sendAuthCookies,
    clearAuthCookies
};
