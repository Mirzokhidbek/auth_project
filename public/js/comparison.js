// ============================================================================
// AI PRICE COMPARISON MODULE (COMPARISON MANAGER)
// ============================================================================
// Handles: AI query execution, multilingual results rendering,
// quick prompt chips, and search history management.

import { t, getLanguage } from './i18n.js';

export class ComparisonManager {
    constructor() {
        this.form = document.getElementById('priceCompareForm');
        this.input = document.getElementById('productQueryInput');
        this.submitBtn = document.getElementById('compareSubmitBtn');
        this.loadingCard = document.getElementById('aiLoadingCard');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.historyChipsContainer = document.getElementById('historyChipsContainer');

        // Results elements
        this.resCategory = document.getElementById('resCategory');
        this.resProductName = document.getElementById('resProductName');
        this.resOverview = document.getElementById('resOverview');
        this.resBestStore = document.getElementById('resBestStore');
        this.resBestSavings = document.getElementById('resBestSavings');
        this.resBestPriceUZS = document.getElementById('resBestPriceUZS');
        this.resBestPriceUSD = document.getElementById('resBestPriceUSD');
        this.resBestStoreLink = document.getElementById('resBestStoreLink');
        this.resStoresGrid = document.getElementById('resStoresGrid');
        this.resSpecsGrid = document.getElementById('resSpecsGrid');
        this.resVerdict = document.getElementById('resVerdict');
        this.resWhoBuy = document.getElementById('resWhoBuy');
        this.resWhoWait = document.getElementById('resWhoWait');

        // Karrot Market elements
        this.resKarrotCard = document.getElementById('resKarrotCard');
        this.resKarrotCondition = document.getElementById('resKarrotCondition');
        this.resKarrotPriceKRW = document.getElementById('resKarrotPriceKRW');
        this.resKarrotPriceUSD = document.getElementById('resKarrotPriceUSD');
        this.resKarrotSavings = document.getElementById('resKarrotSavings');
        this.resKarrotTip = document.getElementById('resKarrotTip');
        this.resKarrotLink = document.getElementById('resKarrotLink');

        this.lastComparisonData = null;

        this.init();
    }

    init() {
        this.bindForm();
        this.bindQuickChips();
        this.bindLanguageChange();
    }

    bindForm() {
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = this.input?.value.trim();
            this.executeComparison(query);
        });
    }

    bindQuickChips() {
        document.querySelectorAll('.prompt-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const lang = getLanguage();
                const query = chip.getAttribute(`data-query-${lang}`) || 
                              chip.getAttribute('data-query-en') || 
                              chip.getAttribute('data-query');
                if (this.input && query) this.input.value = query;
                if (query) this.executeComparison(query);
            });
        });
    }

    bindLanguageChange() {
        window.addEventListener('languageChanged', (e) => {
            const newLang = e.detail?.lang || getLanguage();

            // Refresh history text in new language
            this.loadHistory();

            // If results are currently visible on the screen, automatically re-compare in the new language!
            const hasActiveResults = this.resultsContainer && this.resultsContainer.style.display !== 'none';
            const currentQuery = this.lastQuery || this.input?.value?.trim();

            if (hasActiveResults && currentQuery) {
                if (newLang === 'en') {
                    if (this.input.value.includes('맥북')) this.input.value = 'MacBook M4';
                    else if (this.input.value.includes('아이폰')) this.input.value = 'iPhone 16 Pro Max';
                    else if (this.input.value.includes('소니')) this.input.value = 'Sony WH-1000XM5';
                    else if (this.input.value.includes('플스') || this.input.value.includes('PS5')) this.input.value = 'PS5 Pro';
                } else if (newLang === 'ko') {
                    if (this.input.value.toLowerCase().includes('macbook')) this.input.value = '맥북 M4';
                    else if (this.input.value.toLowerCase().includes('iphone')) this.input.value = '아이폰 16 프로 맥스';
                    else if (this.input.value.toLowerCase().includes('sony')) this.input.value = '소니 WH-1000XM5';
                    else if (this.input.value.toLowerCase().includes('ps5')) this.input.value = 'PS5 프로';
                }

                const queryToRun = this.input?.value?.trim() || currentQuery;
                this.executeComparison(queryToRun);
            }
        });
    }

    async executeComparison(query) {
        if (!query || query.trim().length === 0) return;

        this.lastQuery = query.trim();

        // UI Loading state
        if (this.resultsContainer) this.resultsContainer.style.display = 'none';
        if (this.loadingCard) {
            this.loadingCard.style.display = 'block';
            this.loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (this.submitBtn) {
            this.submitBtn.disabled = true;
            const btnContent = this.submitBtn.querySelector('.btn-content');
            const btnSpinner = this.submitBtn.querySelector('.btn-spinner');
            if (btnContent) btnContent.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'block';
        }

        const lang = getLanguage(); // 'en' or 'ko'

        try {
            const res = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // HttpOnly Cookie
                body: JSON.stringify({ query: query.trim(), lang })
            });

            const data = await res.json();

            if (res.ok && data.success && data.data) {
                this.lastComparisonData = data.data;
                this.renderResults(data.data);
                this.loadHistory();
            } else {
                alert('Error: ' + (data.message || 'AI comparison error occurred'));
            }
        } catch (err) {
            console.error('Comparison error:', err);
            alert('Connection error with server: ' + err.message);
        } finally {
            if (this.loadingCard) this.loadingCard.style.display = 'none';
            if (this.submitBtn) {
                this.submitBtn.disabled = false;
                const btnContent = this.submitBtn.querySelector('.btn-content');
                const btnSpinner = this.submitBtn.querySelector('.btn-spinner');
                if (btnContent) btnContent.style.display = 'flex';
                if (btnSpinner) btnSpinner.style.display = 'none';
            }
        }
    }

    renderResults(data) {
        if (!data) return;

        // Product Details
        if (this.resCategory) this.resCategory.textContent = data.category || 'Hardware';
        if (this.resProductName) this.resProductName.textContent = data.productName || 'Product';
        if (this.resOverview) this.resOverview.textContent = data.overview || '';

        // Best Deal
        if (data.bestDeal) {
            if (this.resBestStore) this.resBestStore.textContent = data.bestDeal.storeName || 'Store';
            if (this.resBestSavings) this.resBestSavings.textContent = data.bestDeal.savings || t('bestDealBadge');
            if (this.resBestPriceUZS) this.resBestPriceUZS.textContent = data.bestDeal.priceUZS || '';
            if (this.resBestPriceUSD) this.resBestPriceUSD.textContent = data.bestDeal.priceUSD || '';
            if (this.resBestStoreLink) this.resBestStoreLink.href = data.bestDeal.url || '#';
        }

        // Karrot Market (당근마켓) Second-Hand Analysis
        if (data.karrotMarket && this.resKarrotCard) {
            this.resKarrotCard.style.display = 'block';
            if (this.resKarrotCondition) this.resKarrotCondition.textContent = data.karrotMarket.condition || 'S-Grade';
            if (this.resKarrotPriceKRW) this.resKarrotPriceKRW.textContent = data.karrotMarket.averageUsedPriceKRW || '';
            if (this.resKarrotPriceUSD) this.resKarrotPriceUSD.textContent = data.karrotMarket.averageUsedPriceUSD || '';
            if (this.resKarrotSavings) this.resKarrotSavings.textContent = data.karrotMarket.savingsVsNew || '';
            if (this.resKarrotTip) this.resKarrotTip.textContent = data.karrotMarket.karrotTip || '';
            if (this.resKarrotLink) {
                const searchQ = encodeURIComponent(data.productName || 'MacBook');
                this.resKarrotLink.href = `https://www.daangn.com/search/${searchQ}`;
            }
        } else if (this.resKarrotCard) {
            this.resKarrotCard.style.display = 'none';
        }

        // Stores Grid
        if (this.resStoresGrid && data.stores && Array.isArray(data.stores)) {
            if (this.resStoresCount) {
                this.resStoresCount.textContent = `${data.stores.length} ${t('storesCountSuffix')}`;
            }

            this.resStoresGrid.innerHTML = '';
            data.stores.forEach(store => {
                const card = document.createElement('div');
                card.className = `store-card ${store.isBest ? 'highlight-card' : ''}`;
                card.innerHTML = `
                    <div>
                        <div class="store-card-head">
                            <h4 class="store-card-name">${store.name}</h4>
                            <span class="store-badge">${store.badge || 'Verified'}</span>
                        </div>
                        <div class="store-card-price">
                            <div class="card-price-uzs">${store.priceUZS}</div>
                            <div class="card-price-usd">${store.priceUSD}</div>
                        </div>
                        <div class="store-details-list">
                            <div>🚚 ${store.delivery || 'Standard shipping'}</div>
                            <div>🛡️ ${store.warranty || 'Warranty included'}</div>
                            <div>⭐ Rating: ${store.rating || 4.8} / 5</div>
                        </div>
                    </div>
                    <a href="${store.url || '#'}" target="_blank" class="store-link-btn">
                        ${t('btnViewInStore')}
                    </a>
                `;
                this.resStoresGrid.appendChild(card);
            });
        }

        // Specs Matrix
        if (this.resSpecsGrid && data.specsComparison && Array.isArray(data.specsComparison)) {
            this.resSpecsGrid.innerHTML = '';
            data.specsComparison.forEach(spec => {
                const item = document.createElement('div');
                item.className = 'spec-item';
                item.innerHTML = `
                    <div class="spec-feature">${spec.feature}</div>
                    <div class="spec-value">${spec.value}</div>
                `;
                this.resSpecsGrid.appendChild(item);
            });
        }

        // AI Recommendation
        if (data.recommendation) {
            if (this.resVerdict) this.resVerdict.textContent = data.recommendation.verdict || '';
            if (this.resWhoBuy) this.resWhoBuy.textContent = data.recommendation.whoShouldBuy || '';
            if (this.resWhoWait) this.resWhoWait.textContent = data.recommendation.whoShouldWait || '';
        }

        if (this.resultsContainer) {
            this.resultsContainer.style.display = 'flex';
            this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async loadHistory() {
        if (!this.historyChipsContainer) return;

        try {
            const res = await fetch('/api/compare/history', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.success && data.history && data.history.length > 0) {
                this.historyChipsContainer.innerHTML = '';
                data.history.forEach(item => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'history-chip';
                    chip.textContent = `🔍 ${item.query}`;
                    chip.addEventListener('click', () => {
                        if (this.input) this.input.value = item.query;
                        if (item.data) {
                            this.renderResults(item.data);
                        } else {
                            this.executeComparison(item.query);
                        }
                    });
                    this.historyChipsContainer.appendChild(chip);
                });
            } else {
                this.historyChipsContainer.innerHTML = `<span class="empty-history-text">${t('historyEmpty')}</span>`;
            }
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }
}
