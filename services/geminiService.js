// ============================================================================
// GEMINI 3.6 FLASH NARX SOLISHTIRISH SERVISI (Gemini Service)
// ============================================================================
// Ushbu servis Google Gemini 3.6 Flash modeli orqali foydalanuvchi so'rovini
// tahlil qiladi va O'zbekiston hamda xalqaro do'konlardagi eng yaxshi narxlar,
// xususiyatlar va tavsiyalarni strukturalangan JSON ko'rinishida olib beradi.

/**
 * Mahsulot narxlarini solishtirish uchun Gemini modeliga murojaat qilish
 * @param {string} userQuery - Foydalanuvchi kiritgan matn
 * @param {string} lang - Tanlangan til ('en' yoki 'ko')
 * @returns {Promise<Object>} - Strukturalangan narxlar va tavsiyalar ob'ekti
 */
const comparePricesWithGemini = async (userQuery, lang = 'en') => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured! Please check your .env file.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const isKorean = lang === 'ko';

    // Tilga moslashtirilgan professional prompt (English or Korean)
    const prompt = isKorean ? `
당신은 "NeuroFox AI" 전문 가격 분석가이자 시장 전문가입니다.
사용자 검색어: "${userQuery}".

임무:
1. 해당 제품에 대한 한국 내 대표 신뢰 쇼핑몰(쿠팡, 네이버 쇼핑, 11번가, 애플 코리아 등) 및 글로벌(아마존, 애플 스토어)의 최신 실시간 시장 가격을 비교하세요.
2. 가장 저렴한 최고의 딜(Best Deal)을 식별하고 절약 금액을 계산하세요.
3. 주요 상세 스펙(프로세서, RAM, SSD, 디스플레이, 배터리 등)을 체계적으로 정리하세요.
4. 어떤 사용자 유형에게 어떤 구성이 적합한지 전문적이고 명확한 추천 의견을 제공하세요.

엄격한 요구사항: 반드시 아래 JSON 형식으로만 응답하세요. 다른 설명이나 마크다운 텍스트 없이 유효한 JSON만 반환해야 합니다:
{
  "productName": "제품 공식 명칭 (예: Apple MacBook Pro 14 (M4 칩, 2024))",
  "category": "카테고리 (예: 노트북 / 스마트 기기)",
  "overview": "이 제품에 대한 1-2문장의 핵심 요약",
  "bestDeal": {
    "storeName": "가장 저렴한 판매처 이름 (예: 쿠팡 로켓배송)",
    "priceUSD": "$1,540",
    "priceUZS": "₩2,150,000",
    "savings": "타 쇼핑몰 대비 약 180,000원 절약",
    "url": "https://coupang.com"
  },
  "stores": [
    {
      "name": "판매처 (예: 쿠팡)",
      "priceUSD": "$1,540",
      "priceUZS": "₩2,150,000",
      "badge": "최저가 보장",
      "isBest": true,
      "rating": 4.9,
      "delivery": "내일(토) 새벽 도착 보장",
      "warranty": "Apple 공인 정품 및 1년 보증",
      "url": "https://coupang.com"
    },
    {
      "name": "네이버 쇼핑",
      "priceUSD": "$1,580",
      "priceUZS": "₩2,210,000",
      "badge": "네이버페이 포인트 최대 5%",
      "isBest": false,
      "rating": 4.8,
      "delivery": "1-2일 이내 무료배송",
      "warranty": "1년 정품 보증",
      "url": "https://shopping.naver.com"
    },
    {
      "name": "11번가",
      "priceUSD": "$1,610",
      "priceUZS": "₩2,250,000",
      "badge": "카드사 즉시 할인",
      "isBest": false,
      "rating": 4.7,
      "delivery": "우체국 택배 1-2일",
      "warranty": "공식 유통사 보증",
      "url": "https://11st.co.kr"
    },
    {
      "name": "애플 코리아 공식 스토어",
      "priceUSD": "$1,690",
      "priceUZS": "₩2,390,000",
      "badge": "공식 각인 & 무료 배송",
      "isBest": false,
      "rating": 5.0,
      "delivery": "무료 표준 배송",
      "warranty": "Apple Care+ 가입 가능",
      "url": "https://apple.com/kr"
    }
  ],
  "specsComparison": [
    {"feature": "프로세서 (칩셋)", "value": "Apple M4 (10코어 CPU, 10코어 GPU)"},
    {"feature": "통합 메모리 (RAM)", "value": "16GB Unified Memory (최대 32GB)"},
    {"feature": "저장 공간 (SSD)", "value": "512GB / 1TB 초고속 NVMe SSD"},
    {"feature": "디스플레이", "value": "14.2인치 Liquid Retina XDR, 120Hz ProMotion"},
    {"feature": "배터리 수명", "value": "최대 24시간 연속 사용 (역대 최장)"}
  ],
  "recommendation": {
    "verdict": "M4 칩셋은 압도적인 전력 대 성능비와 16GB 기본 램 탑재로 개발자 및 크리에이터에게 최고의 가성비를 제공합니다.",
    "whoShouldBuy": "소프트웨어 개발자, 영상 편집자, 충전기 없이 장시간 외부 작업을 원하는 전문가.",
    "whoShouldWait": "기존 M3 Pro 또는 M3 Max 고사양 기기를 보유한 사용자는 교체 불필요."
  }
}
` : `
You are "NeuroFox AI", a professional market analyst and hardware pricing expert.
User query: "${userQuery}".

YOUR TASK:
1. Compare current realistic market prices for this product across reliable stores (MacBro, Uzum Market, MediaPark, Texnomart, Apple Store, Amazon).
2. Identify the absolute Best Deal and calculate how much money the user saves.
3. Compare key technical specifications (Chip/Processor, RAM, Storage, Display, Battery).
4. Provide a professional, personalized recommendation on who should buy vs who should wait.

STRICT REQUIREMENT: Respond ONLY with valid JSON. Do not include any markdown or text outside of the JSON object:
{
  "productName": "Exact official product name (e.g., Apple MacBook Pro 14 (M4 Chip, 2024))",
  "category": "Category (e.g., Laptops / Apple Hardware)",
  "overview": "1-2 sentence executive summary of the product",
  "bestDeal": {
    "storeName": "Store with the lowest price",
    "priceUSD": "$1,540",
    "priceUZS": "19,800,000 UZS",
    "savings": "Save 1,200,000 UZS compared to average market price",
    "url": "https://macbro.uz"
  },
  "stores": [
    {
      "name": "Store name",
      "priceUSD": "$1,540",
      "priceUZS": "19,800,000 UZS",
      "badge": "Best Price Deal",
      "isBest": true,
      "rating": 4.9,
      "delivery": "Express delivery within 2 hours",
      "warranty": "1-Year Official Apple Warranty",
      "url": "https://macbro.uz"
    },
    {
      "name": "Uzum Market",
      "priceUSD": "$1,590",
      "priceUZS": "20,500,000 UZS",
      "badge": "1-Day Delivery",
      "isBest": false,
      "rating": 4.8,
      "delivery": "Next-day pickup point delivery",
      "warranty": "1-Year Warranty",
      "url": "https://uzum.uz"
    },
    {
      "name": "MediaPark",
      "priceUSD": "$1,620",
      "priceUZS": "20,900,000 UZS",
      "badge": "Installment Available",
      "isBest": false,
      "rating": 4.7,
      "delivery": "1-3 days courier shipping",
      "warranty": "1-Year Service Warranty",
      "url": "https://mediapark.uz"
    },
    {
      "name": "Texnomart",
      "priceUSD": "$1,640",
      "priceUZS": "21,100,000 UZS",
      "badge": "Loyalty Cashback",
      "isBest": false,
      "rating": 4.7,
      "delivery": "Free home delivery",
      "warranty": "1-Year Guarantee",
      "url": "https://texnomart.uz"
    }
  ],
  "specsComparison": [
    {"feature": "Processor (Chip)", "value": "Apple M4 (10-core CPU, 10-core GPU)"},
    {"feature": "Memory (RAM)", "value": "16GB Unified Memory (up to 32GB)"},
    {"feature": "Storage (SSD)", "value": "512GB / 1TB High-speed PCIe SSD"},
    {"feature": "Display", "value": "14.2-inch Liquid Retina XDR, 120Hz ProMotion"},
    {"feature": "Battery Life", "value": "Up to 24 hours all-day battery"}
  ],
  "recommendation": {
    "verdict": "The M4 chip sets a new benchmark for efficiency and speed with standard 16GB RAM, making it the supreme choice for creators and developers.",
    "whoShouldBuy": "Software engineers, creative pros, 4K video editors, and travelers demanding extreme battery life.",
    "whoShouldWait": "Owners of M3 Pro or M3 Max who already possess ample GPU performance."
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
