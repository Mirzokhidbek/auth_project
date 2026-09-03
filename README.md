# 🛡️ ShieldAuth — Ultra-Secure Authentication System

Eng yuqori xavfsizlik standartlari asosida qurilgan **Sign Up / Sign In / Dashboard** autentifikatsiya tizimi.

Ushbu loyihada **localStorage** kabi XSS hujumlariga zaif joylarda token saqlanmaydi. Butun jarayon **HttpOnly; Secure; SameSite=Strict** Cookie va **Dual Token (Access + Refresh)** arxitekturasi asosida ishlaydi.

---

## 🚀 Asosiy Xususiyatlar va Xavfsizlik Arxitekturasi

- 🔐 **Bcrypt (12 Salt Rounds):** Parollar bazaga ochiq holatda tushmaydi, 12 rounds tuz bilan qaytarilmas hash qilinadi.
- 🛡️ **0% XSS Xavfi (No localStorage):** Tokenlar brauzerning JavaScript kodi o'qiy olmaydigan `HttpOnly Cookie` ichida saqlanadi.
- ⚡ **Access Token (15 daqiqa):** Har bir API so'rovini tekshirish uchun qisqa muddatli JWT token.
- 🔄 **Refresh Token (7 kun) & Silent Refresh:** Foydalanuvchi tizimdan chiqib ketmasligi uchun Access tokenni fonda avtomatik yangilab turadi.
- 🛑 **Revocation (Sessiyani bekor qilish):** Refresh token MongoDB bazasida saqlanadi. "Logout" bosilganda bazadagi token o'chirilib, sessiya zudlik bilan yaroqsiz qilinadi.
- 🎨 **Premium Glassmorphism UI:** To'liq moslashuvchan (responsive), qorong'i rejim (Dark Mode), jonli parol kuchi indikatori va foydalanuvchi profili.
- 📝 **Clean Code & Izohlar:** Backend va frontenddagi barcha logikalar tushunarli qilib izohlangan.

---

## 🛠️ Texnologiyalar

- **Backend:** Node.js, Express.js, Mongoose (MongoDB)
- **Xavfsizlik:** `bcryptjs`, `jsonwebtoken`, `cookie-parser`
- **Frontend:** Vanilla HTML5, Modern CSS3 (Glassmorphism & Neon Glow), Vanilla JavaScript

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Loyihani klonlash:
```bash
git clone https://github.com/Mirzokhidbek/auth_project.git
cd auth_project
```

### 2. Kutubxonalarni o'rnatish:
```bash
npm install
```

### 3. `.env` faylini sozlash:
Loyiha ildizida `.env` faylini yarating va quyidagi parametrlarni kiriting:
```env
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/your_db?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_jwt_access_secret_key_123456
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_654321
NODE_ENV=development
```

### 4. Serverni ishga tushirish:
```bash
# Oddiy rejim:
npm start

# Yoki o'zgarishlarni kuzatish rejimi:
npm run dev
```

Brauzeringizda oching: **`http://localhost:3000`**

---

## 📡 API Yo'nalishlari (Endpoints)

| Metod | Yo'nalish | Vazifasi | Ruxsat |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Yangi foydalanuvchi ro'yxatdan o'tishi | Public |
| `POST` | `/api/auth/signin` | Tizimga kirish | Public |
| `POST` | `/api/auth/signout`| Tizimdan chiqish (Logout) | Private / Public |
| `GET`  | `/api/auth/me`     | Himoyalangan profil ma'lumotlarini olish | Protected (HttpOnly Cookie) |
