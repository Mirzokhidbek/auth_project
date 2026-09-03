// ============================================================================
// AUTENTIFIKATSIYA KONTROLLERI (Auth Controller)
// ============================================================================
// Ushbu faylda ro'yxatdan o'tish (Sign Up), tizimga kirish (Sign In),
// chiqish (Logout) va profil ma'lumotlarini olish logikalari joylashgan.

const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    sendAuthCookies,
    clearAuthCookies
} = require('../utils/tokens');

/**
 * @desc    Yangi foydalanuvchini ro'yxatdan o'tkazish (Sign Up)
 * @route   POST /api/auth/signup
 * @access  Public (Hamma uchun ochiq)
 */
const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Maydonlar to'ldirilganini tekshiramiz
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Iltimos, barcha maydonlarni (ism, email, parol) to\'ldiring!'
            });
        }

        // 2. Parol uzunligini tekshiramiz
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!'
            });
        }

        // 3. Ushbu email bilan oldin ro'yxatdan o'tilganmi?
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Bu email manzil bilan allaqachon akkaunt ochilgan!'
            });
        }

        // 4. Yangi foydalanuvchi yaratamiz
        // Eslatma: Parol avtomatik ravishda User modelidagi pre('save') hook orqali Bcrypt bilan hash qilinadi!
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        // 5. Tokenlarni generatsiya qilamiz
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 6. Xavfsizlik: Refresh tokenni foydalanuvchining bazadagi profiliga saqlab qo'yamiz
        user.refreshToken = refreshToken;
        await user.save();

        // 7. Tokenlarni xavfsiz HttpOnly kuki orqali brauzerga jo'natamiz
        sendAuthCookies(res, accessToken, refreshToken);

        // 8. Muvaffaqiyatli javob qaytaramiz (Parol va token JSON tanasida berilmaydi!)
        res.status(201).json({
            success: true,
            message: 'Tabriklaymiz, muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Sign Up xatoligi:', error);
        res.status(500).json({
            success: false,
            message: 'Serverda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
        });
    }
};

/**
 * @desc    Mavjud foydalanuvchi tizimga kirishi (Sign In / Login)
 * @route   POST /api/auth/signin
 * @access  Public
 */
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validatsiya
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email va parolni kiriting!'
            });
        }

        // 2. Foydalanuvchini email orqali qidiramiz
        // Modelda 'password: select: false' bo'lgani sababli, tekshirish uchun +password deb so'raymiz
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email yoki parol noto\'g\'ri!'
            });
        }

        // 3. Bcrypt yordamida kiritilgan ochiq parolni bazadagi hash bilan solishtiramiz
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email yoki parol noto\'g\'ri!'
            });
        }

        // 4. Parol to'g'ri bo'lsa: yangi tokenlar yaratamiz
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 5. Yangi refresh tokenni bazaga yozamiz
        user.refreshToken = refreshToken;
        await user.save();

        // 6. HttpOnly kukilarni o'rnatamiz
        sendAuthCookies(res, accessToken, refreshToken);

        // 7. Xavfsiz javob qaytarish
        res.status(200).json({
            success: true,
            message: 'Tizimga muvaffaqiyatli kirdingiz!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Sign In xatoligi:', error);
        res.status(500).json({
            success: false,
            message: 'Serverda xatolik yuz berdi. Qaytadan urinib ko\'ring.'
        });
    }
};

/**
 * @desc    Tizimdan chiqish (Sign Out / Logout)
 * @route   POST /api/auth/signout
 * @access  Private / Public
 */
const signOut = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        // Agar foydalanuvchida refresh token bo'lsa, uni bazadan o'chirib yuboramiz
        // Bu orqali token qayta ishlatilmasligi kafolatlanadi (Revocation)
        if (refreshToken) {
            await User.findOneAndUpdate(
                { refreshToken },
                { refreshToken: null }
            );
        }

        // Brauzerdagi HttpOnly kukilarni tozalaymiz
        clearAuthCookies(res);

        res.status(200).json({
            success: true,
            message: 'Tizimdan muvaffaqiyatli chiqdingiz. Sessiya xavfsiz yakunlandi.'
        });
    } catch (error) {
        console.error('Sign Out xatoligi:', error);
        // Har qanday holatda ham brauzer kukilarini tozalaymiz
        clearAuthCookies(res);
        res.status(200).json({
            success: true,
            message: 'Tizimdan chiqildi.'
        });
    }
};

/**
 * @desc    Hozirgi tizimga kirgan foydalanuvchi ma'lumotlarini olish (Himoyalangan profil)
 * @route   GET /api/auth/me
 * @access  Private (Faqat tizimga kirganlar uchun)
 */
const getMe = async (req, res) => {
    try {
        // req.user himoya middleware'i tomonidan o'rnatilgan
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Foydalanuvchi topilmadi'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                hasActiveSession: true,
                securityLevel: 'Maksimal (HttpOnly Cookie + Dual Token)'
            }
        });
    } catch (error) {
        console.error('GetMe xatoligi:', error);
        res.status(500).json({
            success: false,
            message: 'Ma\'lumotlarni olishda xatolik'
        });
    }
};

module.exports = {
    signUp,
    signIn,
    signOut,
    getMe
};
