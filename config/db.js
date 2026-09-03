// ============================================================================
// BAZA BILAN ALOQA (MongoDB Connection)
// ============================================================================
// Ushbu fayl serverni MongoDB ma'lumotlar bazasi bilan xavfsiz va barqaror
// bog'lash vazifasini bajaradi.

const mongoose = require('mongoose');

/**
 * MongoDB bazasiga ulanish funksiyasi
 */
const connectDB = async () => {
    try {
        // Mongoose orqali .env faylidagi MONGO_URL manziliga ulanish
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            // Mongoose zamonaviy ulanish sozlamalari
            serverSelectionTimeoutMS: 8000 // Server javobini 8 soniya kutish
        });

        console.log(`✅ MongoDB muvaffaqiyatli ulandi: ${conn.connection.host}`);
    } catch (error) {
        // Agar bazaga ulanishda xatolik yuz bersa, uni konsolga chiqaramiz
        console.error(`❌ MongoDB ulanishida xatolik yuz berdi: ${error.message}`);
        
        // Bazaga ulanmasdan turib autentifikatsiya ishlamaydi, shuning uchun jarayon to'xtatiladi
        process.exit(1);
    }
};

module.exports = connectDB;
