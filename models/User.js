// ============================================================================
// FOYDALANUVCHI MODELI (User Model - Mongoose)
// ============================================================================
// Ushbu modelda foydalanuvchi ma'lumotlari sxemasi, parollarni avtomatik
// Bcrypt bilan hash qilish va parolni tekshirish logikasi jamlangan.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ism kiritilishi shart'],
        trim: true,
        maxlength: [50, 'Ism 50 ta belgidan oshmasligi kerak']
    },
    email: {
        type: String,
        required: [true, 'Email kiritilishi shart'],
        unique: true, // Bir xil email bilan ikki marta ro'yxatdan o'tib bo'lmaydi
        lowercase: true, // Katta-kichik harflar bir xil qilib saqlanadi
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Iltimos, to\'g\'ri email manzil kiriting'
        ]
    },
    password: {
        type: String,
        required: [true, 'Parol kiritilishi shart'],
        minlength: [6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'],
        select: false // Xavfsizlik: so'rovlarda parolni avtomatik qaytarmaydi
    },
    // Refresh Token bazada saqlanadi:
    // Bu orqali agar foydalanuvchi "Logout" qilsa yoki akkaunt xavf ostida qolsa,
    // ushbu tokenni bazadan o'chirib, sessiyani majburiy to'xtatish (revocation) mumkin!
    refreshToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true // Qachon yaratilgan va yangilangani (createdAt, updatedAt)
});

// ============================================================================
// XAVFSIZLIK LOGIKASI 1: Parolni bazaga saqlashdan oldin Bcrypt bilan hash qilish
// ============================================================================
// Hech qachon ochiq parolni bazaga yozmaymiz! 
// Foydalanuvchi parolni o'zgartirsa yoki yangi ro'yxatdan o'tsa, 'pre-save' hook ishga tushadi.
userSchema.pre('save', async function(next) {
    // Agar parol maydoni o'zgarmagan bo'lsa (masalan faqat ism o'zgartirilsa),
    // parolni qaytadan hash qilib o'tirmaymiz.
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Salt (tuz) - xakerlar "Rainbow table" hujumi orqali parolni topa olmasligi uchun
        // tasodifiy belgilar qo'shish jarayoni (12 round - zamonaviy tavsiya etilgan standart)
        const salt = await bcrypt.genSalt(12);
        
        // Parolni hash qilamiz
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ============================================================================
// XAVFSIZLIK LOGIKASI 2: Foydalanuvchi kiritgan parolni hash bilan solishtirish
// ============================================================================
userSchema.methods.comparePassword = async function(enteredPassword) {
    // Bcrypt kiritilgan ochiq parolni bazadagi hash bilan solishtiradi
    return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================================================
// XAVFSIZLIK LOGIKASI 3: JSON ko'rinishida maxfiy ma'lumotlarni yashirish
// ============================================================================
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshToken; // Tashqi dunyoga refreshTokenni ochiq ko'rsatmaymiz
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
