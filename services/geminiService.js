// ============================================================================
// AI NARX SOLISHTIRISH SERVISI (AI Price Engine Service)
// ============================================================================
// Ushbu servis ilg'or AI modeli orqali foydalanuvchi so'rovini
// tahlil qiladi va Koreya do'konlaridagi eng yaxshi narxlar,
// xususiyatlar va tavsiyalarni strukturalangan JSON ko'rinishida olib beradi.

/**
 * Mahsulot narxlarini solishtirish uchun AI modeliga murojaat qilish
 * @param {string} userQuery - Foydalanuvchi kiritgan matn
 * @param {string} lang - Tanlangan til ('en' yoki 'ko')
 * @returns {Promise<Object>} - Strukturalangan narxlar va tavsiyalar ob'ekti
 */
const comparePrices = async (userQuery, lang = 'en') => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured! Please check your .env file.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const isKorean = lang === 'ko';

    // Tilga moslashtirilgan professional prompt (English or Korean)
    const prompt = isKorean ? `
당신은 "Pricely AI" 전문 가격 분석가이자 시장 전문가입니다.
사용자 검색어: "${userQuery}".

임무:
1. 해당 제품에 대해 오직 대한민국(한국) 내 대표 쇼핑몰(쿠팡, 네이버 쇼핑, 11번가, G마켓, 롯데하이마트, 애플 코리아 공식몰 등)의 실시간 최저가 및 시장 가격만 엄격하게 비교하세요. 타 국가 상점은 제외합니다.
2. 한국 시장 기준 가장 저렴한 최고의 딜(Best Deal)을 식별하고 원화(KRW / ₩) 기준 절약 금액을 계산하세요.
3. 주요 상세 스펙(프로세서, RAM, SSD, 디스플레이, 배터리 등)을 체계적으로 정리하세요.
4. 한국 소비자 환경(배송, A/S 보증, 결제 혜택)에 맞춘 전문적인 추천 의견을 제공하세요.

언어 규칙: 모든 텍스트(제품명, 카테고리, 요약, 절약 문구, 배송, 보증, 스펙, 전문가 평가, 당근마켓 팁 등)는 100% 자연스러운 한국어로만 작성해야 합니다.

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
  "karrotMarket": {
    "averageUsedPriceKRW": "₩1,750,000 ~ ₩1,850,000",
    "averageUsedPriceUSD": "$1,250 ~ $1,320",
    "condition": "S-급 / 미개봉 단순개봉 (Like New / Unopened)",
    "savingsVsNew": "새 제품(쿠팡) 대비 약 ₩300,000 ~ ₩400,000 절약",
    "karrotTip": "당근 직거래 시 배터리 사이클 수, 보증 기간(애플케어+ 잔여 여부) 및 외관 스크래치 확인 필수",
    "url": "https://www.daangn.com"
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
      "name": "🥕 당근마켓 (중고/미개봉 시세)",
      "priceUSD": "$1,280",
      "priceUZS": "₩1,790,000",
      "badge": "중고 직거래 최저 시세",
      "isBest": false,
      "rating": 4.8,
      "delivery": "동네 이웃 대면 직거래 (수수료 0원)",
      "warranty": "개인 간 거래 (현장 검수 권장)",
      "url": "https://www.daangn.com"
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
You are "Pricely AI", an expert hardware market analyst specializing in the South Korean electronics and retail market.
User query: "${userQuery}".

YOUR TASK:
1. Search and compare current realistic market prices for this product STRICTLY across South Korea's leading retailers and e-commerce platforms (Coupang, Naver Shopping, 11Street, Gmarket, Lotte Hi-Mart, Apple Korea Store, Samsung Store). Do NOT include non-Korean local stores.
2. Identify the absolute Best Deal in South Korea and calculate the exact savings in Korean Won (KRW / ₩).
3. Compare key technical specifications (Processor, RAM, Storage, Display, Battery).
4. Provide a professional buyer's recommendation tailored for consumers in South Korea.

CRITICAL LANGUAGE REQUIREMENT:
The user has selected the ENGLISH interface. Therefore:
1. ALL textual answers and values (productName, category, overview, savings, store badges, delivery text, warranty description, specs feature names, specs values, buyer recommendation verdict, whoShouldBuy, whoShouldWait, and Karrot condition/tip) MUST BE 100% IN FLUENT ENGLISH!
2. Do NOT write sentences in Korean. All explanations, tips, features, and verdicts must be in English.
3. Write store names in English (e.g., 'Coupang', 'Naver Shopping', '11Street', 'Lotte Hi-Mart', 'Karrot Market (Danggeun)', 'Apple Korea Official Store').
4. Prices should be displayed in Korean Won (₩) and USD ($).

STRICT REQUIREMENT: Respond ONLY with valid JSON. Do not include any markdown or text outside of the JSON object:
{
  "productName": "Exact official product name (e.g., Apple MacBook Pro 14 (M4 Chip, 2024))",
  "category": "Category (e.g., Laptops / Korean Electronics Market)",
  "overview": "1-2 sentence executive summary of the product",
  "bestDeal": {
    "storeName": "Coupang Rocket Delivery",
    "priceUSD": "$1,540",
    "priceUZS": "₩2,150,000",
    "savings": "Save approx. ₩180,000 compared to average retail",
    "url": "https://coupang.com"
  },
  "karrotMarket": {
    "averageUsedPriceKRW": "₩1,750,000 ~ ₩1,850,000",
    "averageUsedPriceUSD": "$1,250 ~ $1,320",
    "condition": "S-Grade / Unopened Packaging",
    "savingsVsNew": "Save approx. ₩350,000 vs. Brand New retail",
    "karrotTip": "Inspect battery health cycle count and verify original receipt or AppleCare+ warranty during in-person meetup",
    "url": "https://www.daangn.com"
  },
  "stores": [
    {
      "name": "Coupang (쿠팡)",
      "priceUSD": "$1,540",
      "priceUZS": "₩2,150,000",
      "badge": "Lowest Price Guaranteed",
      "isBest": true,
      "rating": 4.9,
      "delivery": "Tomorrow dawn delivery (Rocket Delivery)",
      "warranty": "Official Apple Korea 1-Year Warranty",
      "url": "https://coupang.com"
    },
    {
      "name": "🥕 Karrot Market (당근마켓 Used Market)",
      "priceUSD": "$1,280",
      "priceUZS": "₩1,790,000",
      "badge": "Used Market Benchmark",
      "isBest": false,
      "rating": 4.8,
      "delivery": "Hyperlocal in-person meetup (0% fee)",
      "warranty": "Direct buyer inspection",
      "url": "https://www.daangn.com"
    },
    {
      "name": "Naver Shopping (네이버 쇼핑)",
      "priceUSD": "$1,580",
      "priceUZS": "₩2,210,000",
      "badge": "Up to 5% Naver Pay Points",
      "isBest": false,
      "rating": 4.8,
      "delivery": "Free 1-2 day nationwide shipping",
      "warranty": "1-Year Genuine Warranty",
      "url": "https://shopping.naver.com"
    },
    {
      "name": "11Street (11번가)",
      "priceUSD": "$1,610",
      "priceUZS": "₩2,250,000",
      "badge": "Card Instant Discount",
      "isBest": false,
      "rating": 4.7,
      "delivery": "Fast post office courier 1-2 days",
      "warranty": "Official Authorized Distributor",
      "url": "https://11st.co.kr"
    },
    {
      "name": "Apple Korea Official Store (애플 코리아)",
      "priceUSD": "$1,690",
      "priceUZS": "₩2,390,000",
      "badge": "Free Engraving & Standard Delivery",
      "isBest": false,
      "rating": 5.0,
      "delivery": "Free standard delivery",
      "warranty": "Eligible for AppleCare+",
      "url": "https://apple.com/kr"
    }
  ],
  "specsComparison": [
    {"feature": "Processor (Chip)", "value": "Apple M4 (10-core CPU, 10-core GPU)"},
    {"feature": "Memory (RAM)", "value": "16GB Unified Memory (configurable up to 32GB)"},
    {"feature": "Storage (SSD)", "value": "512GB / 1TB Ultra-fast NVMe SSD"},
    {"feature": "Display", "value": "14.2-inch Liquid Retina XDR, 120Hz ProMotion"},
    {"feature": "Battery Life", "value": "Up to 24 hours all-day battery life"}
  ],
  "recommendation": {
    "verdict": "The M4 chip delivers industry-leading power efficiency and standard 16GB RAM, making it the highest value choice for developers and creators in South Korea.",
    "whoShouldBuy": "Software developers, creators, students, and professionals needing 24-hour battery without carrying chargers.",
    "whoShouldWait": "Current users of high-end M3 Pro or M3 Max chips who already have sufficient power."
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
                break;
            }

            if ((response.status === 503 || response.status === 429) && attempts < maxAttempts) {
                console.log(`AI Engine busy (${response.status}). Attempt ${attempts} waiting...`);
                await new Promise(r => setTimeout(r, 2000 * attempts));
                continue;
            }

            const errorText = await response.text();
            if (response.status === 429) {
                throw new Error('AI request rate limit reached. Please wait a moment and retry.');
            }
            throw new Error(`AI API error (${response.status}): ${errorText}`);
        } catch (fetchErr) {
            if (attempts >= maxAttempts) throw fetchErr;
            await new Promise(r => setTimeout(r, 2000 * attempts));
        }
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('AI model returned an empty response.');
    }

    const rawText = data.candidates[0].content.parts[0].text;

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
        console.error('AI JSON parse error. Raw text:', rawText);
        throw new Error('Could not parse AI response into JSON format');
    }
};

module.exports = { comparePrices };
