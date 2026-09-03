// ============================================================================
// NARX SOLISHTIRISH TARIXI MODELI (ComparisonHistory - Mongoose)
// ============================================================================
// Foydalanuvchilar qidirgan mahsulotlar va AI tahlil natijalarini
// MongoDB bazasida saqlash uchun mo'ljallangan sxema.

const mongoose = require('mongoose');

const comparisonHistorySchema = new mongoose.Schema({
    // Ushbu qidiruv qaysi foydalanuvchiga tegishli (Foreign key)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Foydalanuvchi yozgan asl so'rov (masalan: "Menga MacBook M4 kerak")
    query: {
        type: String,
        required: [true, 'Qidiruv so\'rovi kiritilishi shart'],
        trim: true
    },
    // AI tomonidan aniqlangan aniq tovar nomi
    productName: {
        type: String,
        required: true
    },
    // Eng arzon narx
    bestPrice: {
        storeName: String,
        priceUSD: String,
        priceUZS: String
    },
    // Gemini 3.6 Flash tomonidan taqdim etilgan to'liq tahlil ma'lumoti
    data: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});

const ComparisonHistory = mongoose.model('ComparisonHistory', comparisonHistorySchema);

module.exports = ComparisonHistory;
