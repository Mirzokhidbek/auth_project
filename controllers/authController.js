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

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                code: 'FIELDS_REQUIRED',
                message: 'Please fill in all fields (name, email, password)'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                code: 'PASSWORD_TOO_SHORT',
                message: 'Password must be at least 6 characters long'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'An account with this email already exists'
            });
        }

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        sendAuthCookies(res, accessToken, refreshToken);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Sign Up error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Server error occurred. Please try again later.'
        });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                code: 'FIELDS_REQUIRED',
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password'
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        sendAuthCookies(res, accessToken, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Signed in successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Sign In error:', error);
        res.status(500).json({
            success: false,
            code: 'SERVER_ERROR',
            message: 'Server error occurred. Please try again later.'
        });
    }
};

const signOut = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {
            await User.findOneAndUpdate(
                { refreshToken },
                { refreshToken: null }
            );
        }

        clearAuthCookies(res);

        res.status(200).json({
            success: true,
            message: 'Signed out successfully. Session securely terminated.'
        });
    } catch (error) {
        console.error('Sign Out error:', error);
        clearAuthCookies(res);
        res.status(200).json({
            success: true,
            message: 'Signed out'
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
