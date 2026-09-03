// ============================================================================
// NARX SOLISHTIRISH KONTROLLERI (Comparison Controller)
// ============================================================================
// Foydalanuvchi so'rovini qabul qilib, Gemini orqali tahlil qilish va
// natijalarni MongoDB bazasiga saqlash uchun kontroller.

const { comparePricesWithGemini } = require('../services/geminiService');
const ComparisonHistory = require('../models/ComparisonHistory');

/**
 * @desc    Mahsulot narxlarini AI orqali solishtirish
 * @route   POST /api/compare
 * @access  Private (Faqat tizimga kirganlar uchun)
 */
const compareProduct = async (req, res) => {
    try {
        const { query, lang } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a product name or query'
            });
        }

        // 1. Gemini 3.6 Flash orqali narxlar va xususiyatlarni tahlil qilamiz (tanlangan tilda)
        const selectedLang = (lang === 'ko') ? 'ko' : 'en';
        const comparisonData = await comparePricesWithGemini(query.trim(), selectedLang);

        // 2. Qidiruv natijasini foydalanuvchining MongoDB profiliga saqlab qo'yamiz
        let savedHistory = null;
        try {
            savedHistory = await ComparisonHistory.create({
                userId: req.user.id,
                query: query.trim(),
                productName: comparisonData.productName || query.trim(),
                bestPrice: {
                    storeName: comparisonData.bestDeal?.storeName,
                    priceUSD: comparisonData.bestDeal?.priceUSD,
                    priceUZS: comparisonData.bestDeal?.priceUZS
                },
                data: comparisonData
            });
        } catch (dbErr) {
            console.error('Tarixni saqlashda ogohlantirish:', dbErr.message);
        }

        // 3. Foydalanuvchiga to'liq strukturalangan javob qaytaramiz
        res.status(200).json({
            success: true,
            data: comparisonData,
            historyId: savedHistory?._id
        });

    } catch (error) {
        console.error('Narx solishtirish xatoligi:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'AI tahlil jarayonida xatolik yuz berdi'
        });
    }
};

/**
 * @desc    Foydalanuvchining o'tgan qidiruvlari tarixini olish
 * @route   GET /api/compare/history
 * @access  Private
 */
const getHistory = async (req, res) => {
    try {
        const history = await ComparisonHistory.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(12)
            .select('query productName bestPrice createdAt');

        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        console.error('Tarixni olishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'Tarixni yuklashda xatolik yuz berdi'
        });
    }
};

/**
 * @desc    Bitta qidiruv tarixini o'chirish
 * @route   DELETE /api/compare/history/:id
 * @access  Private
 */
const deleteHistoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await ComparisonHistory.findOneAndDelete({ _id: id, userId: req.user.id });

        res.status(200).json({
            success: true,
            message: 'Qidiruv tarixi o\'chirildi'
        });
    } catch (error) {
        console.error('Tarixni o\'chirishda xatolik:', error);
        res.status(500).json({
            success: false,
            message: 'O\'chirishda xatolik'
        });
    }
};

module.exports = {
    compareProduct,
    getHistory,
    deleteHistoryItem
};
