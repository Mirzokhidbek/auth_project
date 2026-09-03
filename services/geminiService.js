// ============================================================================
// GEMINI 3.6 FLASH NARX SOLISHTIRISH SERVISI (Gemini Service)
// ============================================================================
// Ushbu servis Google Gemini 3.6 Flash modeli orqali foydalanuvchi so'rovini
// tahlil qiladi va O'zbekiston hamda xalqaro do'konlardagi eng yaxshi narxlar,
// xususiyatlar va tavsiyalarni strukturalangan JSON ko'rinishida olib beradi.

/**
 * Mahsulot narxlarini solishtirish uchun Gemini modeliga murojaat qilish
 * @param {string} userQuery - Foydalanuvchi kiritgan matn (masalan: "Menga MacBook M4 kerak")
 * @returns {Promise<Object>} - Strukturalangan narxlar va tavsiyalar ob'ekti
 */
const comparePricesWithGemini = async (userQuery) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY sozlanmagan! Iltimos, .env faylini tekshiring.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    // Gemini uchun maxsus tuzilgan professional prompt (Prompt Engineering)
    const prompt = `
Siz "NeuroFox AI" professional narx tahlilchisi va bozor ekspertisiz.
Foydalanuvchi quyidagi so'rovni kiritdi: "${userQuery}".

VAZIFANGIZ:
1. Ushbu mahsulot bo'yicha O'zbekistondagi eng mashhur ishonchli do'konlar (masalan: MacBro, Uzum Market, MediaPark, Texnomart, Idea) va Xalqaro (Amazon, Apple Store) dagi hozirgi realistik narxlarni solishtiring.
2. Eng arzon variantni (Best Deal) aniqlang.
3. Asosiy texnik xususiyatlarini (specs) solishtiring.
4. Foydalanuvchiga kim uchun qaysi konfiguratsiya ma'qul ekanligi haqida professional va samimiy tavsiya bering.

QAT'IY TALAB: Javobni FAQAT va FAQAT toza JSON formatida bering (hech qanday kirish so'zlarsiz yoki qo'shimcha matnlarsiz). JSON strukturasi aynan quyidagicha bo'lsin:

{
  "productName": "Mahsulotning aniq nomi (masalan: Apple MacBook Pro 14 (M4 Chip, 2024))",
  "category": "Kategoriya (masalan: Noutbuklar / Smartfonlar)",
  "overview": "Ushbu mahsulot haqida 1-2 jumlalik professional xulosa",
  "bestDeal": {
    "storeName": "Eng arzon do'kon nomi",
    "priceUSD": "$1,540",
    "priceUZS": "19,800,000 so'm",
    "savings": "Boshqa do'konlarga nisbatan tejaladigan summa (masalan: 1,200,000 so'm tejamkor)",
    "url": "https://macbro.uz"
  },
  "stores": [
    {
      "name": "Do'kon nomi (masalan: MacBro)",
      "priceUSD": "$1,540",
      "priceUZS": "19,800,000 so'm",
      "badge": "Eng arzon variant",
      "isBest": true,
      "rating": 4.9,
      "delivery": "1-2 kun ichida bepul yetkazish",
      "warranty": "1 yil rasmiy kafolat",
      "url": "https://macbro.uz"
    },
    {
      "name": "Uzum Market",
      "priceUSD": "$1,590",
      "priceUZS": "20,500,000 so'm",
      "badge": "1 kunda yetkazish",
      "isBest": false,
      "rating": 4.8,
      "delivery": "Ertagayoq topshirish punktida",
      "warranty": "1 yil kafolat",
      "url": "https://uzum.uz"
    },
    {
      "name": "MediaPark",
      "priceUSD": "$1,620",
      "priceUZS": "20,900,000 so'm",
      "badge": "Muddatli to'lov (Rassrochka)",
      "isBest": false,
      "rating": 4.7,
      "delivery": "Shaharga qarab 1-3 kun",
      "warranty": "1 yil servis kafolati",
      "url": "https://mediapark.uz"
    },
    {
      "name": "Texnomart",
      "priceUSD": "$1,640",
      "priceUZS": "21,100,000 so'm",
      "badge": "Bonus ballar bilan",
      "isBest": false,
      "rating": 4.7,
      "delivery": "Bepul kuryer xizmati",
      "warranty": "1 yil kafolat",
      "url": "https://texnomart.uz"
    }
  ],
  "specsComparison": [
    {"feature": "Protsessor (Chip)", "value": "Apple M4 (10 yadroli CPU, 10 yadroli GPU)"},
    {"feature": "Tezkor xotira (RAM)", "value": "16GB Unified Memory (32GB gacha)"},
    {"feature": "Doimiy xotira (SSD)", "value": "512GB / 1TB tezkor PCIe SSD"},
    {"feature": "Ekran", "value": "14.2 dyuym Liquid Retina XDR, 120Hz ProMotion"},
    {"feature": "Batareya", "value": "24 soatgacha avtonom ishlash (rekord)"}
  ],
  "recommendation": {
    "verdict": "M4 chipi dasturchilar, dizaynerlar va montajchilar uchun eng yaxshi energiya tejamkorlik va tezlikni beradi.",
    "whoShouldBuy": "Dasturchilar, 4K video montajchilar, ofisda quvvatlagichsiz uzoq ishlashni xohlovchilar.",
    "whoShouldWait": "Agar sizda M3 Pro yoki M3 Max bo'lsa, darhol almashtirish shart emas."
  }
}
`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        attempts++;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2, // Aniq va factual natijalar uchun past harorat
                        responseMimeType: 'application/json', // Gemini'ga to'g'ridan-to'g'ri JSON qaytarishni majburlash
                        maxOutputTokens: 8192 // Thinking va to'liq JSON sig'ishi uchun
                    }
                })
            });

            if (response.ok) {
                break; // Muvaffaqiyatli bo'lsa sikldan chiqamiz
            }

            // Agar 503 (vaqtinchalik yuklama) yoki 429 bo'lsa, 1.5 soniya kutib qayta urinamiz
            if ((response.status === 503 || response.status === 429) && attempts < maxAttempts) {
                console.log(`Gemini 3.6 Flash vaqtinchalik band (${response.status}). ${attempts}-urinish kutish...`);
                await new Promise(r => setTimeout(r, 1500 * attempts));
                continue;
            }

            const errorText = await response.text();
            throw new Error(`Gemini API xatoligi (${response.status}): ${errorText}`);
        } catch (fetchErr) {
            if (attempts >= maxAttempts) throw fetchErr;
            await new Promise(r => setTimeout(r, 1500 * attempts));
        }
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
        throw new Error('Gemini modelidan bo\'sh javob keldi.');
    }

    // JSON formatini tozalash (agar ```json ... ``` bilan o'ralgan bo'lsa)
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
        const parsedData = JSON.parse(cleanedText);
        return parsedData;
    } catch (parseError) {
        console.error('Gemini JSON parse xatoligi. Xom matn:', rawText);
        throw new Error('AI javobini JSON formatida o\'qib bo\'lmadi');
    }
};

module.exports = { comparePricesWithGemini };
