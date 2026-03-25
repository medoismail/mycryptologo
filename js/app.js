/* ========================================
   CryptoLogos v2 — App Controller
   ======================================== */
(function () {
    'use strict';

    // ─── State ──────────────────────────────
    let allData = [];
    let filtered = [];
    let currentCategory = 'all';
    let currentSort = 'name-asc';
    let searchQuery = '';
    let page = 1;
    const perPage = 80;
    let currentView = 'grid';
    let currentSvgCode = '';

    const POPULAR_IDS = ['btc','eth','sol','xrp','bnb','usdt','doge','ada','avax','link','dot','uni','ltc','matic'];
    const BASE = location.origin + location.pathname.replace(/\/[^/]*$/, '');

    // ─── DOM refs ───────────────────────────
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    const grid = $('#icons-grid');
    const searchInput = $('#search-input');
    const sortSelect = $('#sort-select');
    const sizeSlider = $('#size-slider');
    const loadMoreWrap = $('#load-more-wrap');
    const loadMoreBtn = $('#load-more-btn');
    const loadMoreInfo = $('#load-more-info');
    const emptyState = $('#empty-state');
    const resultCount = $('#result-count');
    const breadcrumb = $('#breadcrumb');
    const themeBtn = $('#theme-toggle');
    const apiBtn = $('#api-btn');

    // Modal
    const modalOverlay = $('#modal-overlay');
    const modalClose = $('#modal-close');
    const modalImg = $('#modal-img');
    const modalName = $('#modal-name');
    const modalSymbol = $('#modal-symbol');
    const modalCategory = $('#modal-category');
    const modalCopySvg = $('#modal-copy-svg');
    const modalDownload = $('#modal-download-svg');
    const modalCopyUrl = $('#modal-copy-url');
    const svgCodePre = $('#svg-code-pre');
    const svgCodeCopyBtn = $('#svg-code-copy-btn');
    const modalPathText = $('#modal-path-text');
    const modalApiUrl = $('#modal-api-url');

    // API modal
    const apiOverlay = $('#api-overlay');
    const apiClose = $('#api-close');

    // Toast
    const toast = $('#toast');
    const toastMsg = $('#toast-msg');

    // ─── Init ───────────────────────────────
    async function init() {
        initTheme();
        initSearch();
        initSidebar();
        initViewToggle();
        initSizeSlider();
        initModal();
        initApiModal();
        initWalletCopy();
        initKeyboard();

        try {
            const res = await fetch('data/crypto-logos-data.json');
            allData = await res.json();
        } catch (e) {
            console.error('Failed to load data:', e);
            allData = [];
        }

        updateCounts();
        renderPopular();
        applyFilters();
        updateApiCounts();
    }

    // ─── Theme ──────────────────────────────
    function initTheme() {
        const saved = localStorage.getItem('cl-theme');
        if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon();

        themeBtn.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('cl-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('cl-theme', 'light');
            }
            updateThemeIcon();
        });
    }

    function updateThemeIcon() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        themeBtn.querySelector('.icon-sun').style.display = isLight ? 'none' : '';
        themeBtn.querySelector('.icon-moon').style.display = isLight ? '' : 'none';
    }

    // ─── Search ─────────────────────────────
    function initSearch() {
        let debounce;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                searchQuery = searchInput.value.trim().toLowerCase();
                page = 1;
                applyFilters();
            }, 200);
        });

        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            page = 1;
            applyFilters();
        });
    }

    // ─── Sidebar ────────────────────────────
    function initSidebar() {
        $$('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                searchInput.value = '';
                searchQuery = '';
                page = 1;
                applyFilters();
                updateBreadcrumb();
            });
        });

        loadMoreBtn.addEventListener('click', () => {
            page++;
            renderPage(false);
        });
    }

    function updateBreadcrumb() {
        const labels = { all: 'All Icons', tokens: 'Tokens', networks: 'Networks', 'defi-protocol': 'DeFi Protocols', exchanges: 'Exchanges', wallets: 'Wallets' };
        breadcrumb.innerHTML = `<span class="breadcrumb-active">${labels[currentCategory] || 'All Icons'}</span>`;
    }

    function updateCounts() {
        const counts = { all: allData.length, tokens: 0, networks: 0, 'defi-protocol': 0, exchanges: 0, wallets: 0 };
        allData.forEach(t => { if (counts[t.category] !== undefined) counts[t.category]++; });
        for (const [k, v] of Object.entries(counts)) {
            const el = $(`#count-${k}`);
            if (el) el.textContent = v.toLocaleString();
        }
        $('#total-count').textContent = allData.length.toLocaleString();
    }

    // ─── Popular ────────────────────────────
    function renderPopular() {
        const list = $('#popular-list');
        list.innerHTML = '';
        POPULAR_IDS.forEach(id => {
            const t = allData.find(d => d.id === id);
            if (!t) return;
            const btn = document.createElement('button');
            btn.className = 'popular-item';
            btn.innerHTML = `<img src="${t.path}" alt="${t.name}" loading="lazy"><span class="pop-name">${t.name}</span><span class="pop-symbol">${t.symbol}</span>`;
            btn.addEventListener('click', () => openModal(t));
            list.appendChild(btn);
        });
    }

    // ─── Filter & Sort ──────────────────────
    function applyFilters() {
        filtered = allData;

        if (currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === currentCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(searchQuery) ||
                t.symbol.toLowerCase().includes(searchQuery) ||
                t.id.toLowerCase().includes(searchQuery)
            );
        }

        sortData();
        page = 1;
        renderPage(true);
    }

    function sortData() {
        const [key, dir] = currentSort.split('-');
        filtered.sort((a, b) => {
            const va = (a[key] || a.id).toLowerCase();
            const vb = (b[key] || b.id).toLowerCase();
            return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        });
    }

    // ─── Render ─────────────────────────────
    function renderPage(reset) {
        if (reset) grid.innerHTML = '';

        const start = (page - 1) * perPage;
        const end = Math.min(start + perPage, filtered.length);
        const slice = filtered.slice(start, end);

        if (filtered.length === 0) {
            emptyState.style.display = 'flex';
            loadMoreWrap.style.display = 'none';
            resultCount.textContent = 'No results';
            return;
        }

        emptyState.style.display = 'none';

        const frag = document.createDocumentFragment();
        slice.forEach(t => {
            const card = document.createElement('div');
            card.className = 'icon-card';

            let badge = '';
            if (t.category === 'networks') badge = '<span class="card-badge badge-network">Net</span>';
            else if (t.category === 'defi-protocol') badge = '<span class="card-badge badge-defi">DeFi</span>';
            else if (t.category === 'exchanges') badge = '<span class="card-badge badge-exchange">DEX</span>';
            else if (t.category === 'wallets') badge = '<span class="card-badge badge-wallet">Wallet</span>';

            const isPng = t.path && (t.path.endsWith('.png') || t.path.endsWith('.jpg') || t.path.endsWith('.jpeg'));
            const formatBadge = isPng ? '<span class="card-badge badge-png" style="opacity:1;top:auto;bottom:5px;right:5px">PNG</span>' : '';

            card.innerHTML = `
                <div class="card-img-wrap">
                    <img src="${t.path}" alt="${t.name}" loading="lazy" onerror="this.style.opacity='0.15'">
                </div>
                <span class="card-name" title="${t.name}">${t.name}</span>
                <span class="card-symbol">${t.symbol}</span>
                ${badge}
                ${formatBadge}
            `;
            card.addEventListener('click', () => openModal(t));
            frag.appendChild(card);
        });
        grid.appendChild(frag);

        // Update info
        const shown = Math.min(end, filtered.length);
        resultCount.textContent = `Showing ${shown.toLocaleString()} of ${filtered.length.toLocaleString()}`;

        if (end < filtered.length) {
            loadMoreWrap.style.display = '';
            loadMoreInfo.textContent = `${filtered.length - end} more`;
        } else {
            loadMoreWrap.style.display = 'none';
        }
    }

    // ─── View Toggle ────────────────────────
    function initViewToggle() {
        $$('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = btn.dataset.view;
                grid.classList.toggle('list-view', currentView === 'list');
            });
        });
    }

    // ─── Size Slider ────────────────────────
    function initSizeSlider() {
        const applySize = () => {
            const v = parseInt(sizeSlider.value);
            grid.style.setProperty('--card-size', v + 'px');
            const imgSize = Math.max(24, Math.round(v * 0.42));
            grid.style.setProperty('--img-size', imgSize + 'px');
        };
        sizeSlider.addEventListener('input', applySize);
        applySize();
    }

    // ─── Modal ──────────────────────────────
    function initModal() {
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });

        // Copy SVG Code (main button)
        modalCopySvg.addEventListener('click', async () => {
            if (!currentSvgCode) return;
            await copyToClipboard(currentSvgCode, 'SVG code copied! Paste in Figma or anywhere.');
            flashCopied(modalCopySvg);
        });

        // Copy SVG Code (code block button)
        svgCodeCopyBtn.addEventListener('click', async () => {
            if (!currentSvgCode) return;
            await copyToClipboard(currentSvgCode, 'SVG code copied!');
            flashCopied(svgCodeCopyBtn);
        });

        // Copy URL
        modalCopyUrl.addEventListener('click', async () => {
            const url = modalDownload.href;
            await copyToClipboard(url, 'URL copied to clipboard!');
            flashCopied(modalCopyUrl);
        });
    }

    function openModal(token) {
        modalImg.src = token.path;
        modalName.textContent = token.name;
        modalSymbol.textContent = token.symbol;
        modalCategory.textContent = token.category;

        const isSvg = token.path && token.path.endsWith('.svg');
        const ext = token.path ? token.path.split('.').pop().toUpperCase() : 'SVG';

        // Download link
        modalDownload.href = token.path;
        modalDownload.download = `${token.id}.${ext.toLowerCase()}`;
        modalDownload.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download ${ext}`;

        // SVG-only buttons: Copy SVG code, SVG code block
        modalCopySvg.style.display = isSvg ? '' : 'none';
        $('#svg-code-container').style.display = isSvg ? '' : 'none';

        // PNG size options
        let pngSizes = $('#modal-png-sizes');
        if (!pngSizes) {
            pngSizes = document.createElement('div');
            pngSizes.id = 'modal-png-sizes';
            pngSizes.className = 'png-sizes';
            modalDownload.parentNode.insertBefore(pngSizes, modalCopyUrl);
        }

        if (!isSvg) {
            const sizes = [16, 32, 64, 128, 256, 512];
            let sizeHtml = '<span class="png-sizes-label">Download PNG:</span>';
            sizes.forEach(s => {
                sizeHtml += `<button class="action-btn size-btn" data-size="${s}" data-src="${token.path}" data-name="${token.id}" title="Download ${s}x${s} PNG"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> ${s}x${s}</button>`;
            });
            pngSizes.innerHTML = sizeHtml;
            pngSizes.style.display = 'flex';
            // Attach click handlers for client-side resize
            pngSizes.querySelectorAll('.size-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const size = parseInt(btn.dataset.size);
                    const src = btn.dataset.src;
                    const name = btn.dataset.name;
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, size, size);
                        canvas.toBlob((blob) => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${name}-${size}x${size}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }, 'image/png');
                    };
                    img.onerror = () => {
                        alert('Could not load image for resizing');
                    };
                    img.src = src;
                });
            });
        } else {
            pngSizes.style.display = 'none';
        }

        // Path
        modalPathText.textContent = token.path;

        // API hint
        modalApiUrl.textContent = `${BASE}/${token.path}`;

        // Fetch and show SVG code (only for SVGs)
        currentSvgCode = '';
        if (isSvg) {
            svgCodePre.textContent = 'Loading SVG code...';
            fetch(token.path)
                .then(r => r.text())
                .then(code => {
                    currentSvgCode = code;
                    svgCodePre.textContent = code.length > 3000 ? code.substring(0, 3000) + '\n... (truncated)' : code;
                })
                .catch(() => {
                    svgCodePre.textContent = 'Could not load SVG code';
                });
        }

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ─── API Modal ──────────────────────────
    function initApiModal() {
        apiBtn.addEventListener('click', () => {
            apiOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            $('#api-example-url').textContent = `${BASE}/data/svg/btc.svg`;
        });

        apiClose.addEventListener('click', () => {
            apiOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        apiOverlay.addEventListener('click', (e) => {
            if (e.target === apiOverlay) {
                apiOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    function updateApiCounts() {
        const root = allData.filter(t => t.category === 'tokens' && t.path.startsWith('data/svg/') && !t.path.includes('/tokens/')).length;
        const branded = allData.filter(t => t.path.includes('/tokens/')).length;
        const nets = allData.filter(t => t.category === 'networks').length;
        const wallets = allData.filter(t => t.category === 'wallets').length;
        const el = (id, v) => { const e = $(id); if (e) e.textContent = v; };
        el('#api-count-tokens', root);
        el('#api-count-branded', branded);
        el('#api-count-networks', nets);
        el('#api-count-wallets', wallets);
    }

    // ─── Wallet Copy ────────────────────────
    function initWalletCopy() {
        const btn = $('#copy-wallet-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            copyToClipboard('0xBeD17aa3E1c99ea86e19e7B38356C54007BB6CDe', 'Wallet address copied!');
        });
    }

    // ─── Keyboard ───────────────────────────
    function initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // "/" to focus search
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
            // Escape to close modals
            if (e.key === 'Escape') {
                if (modalOverlay.classList.contains('active')) closeModal();
                if (apiOverlay.classList.contains('active')) {
                    apiOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (document.activeElement === searchInput) searchInput.blur();
            }
        });
    }

    // ─── Utilities ──────────────────────────
    async function copyToClipboard(text, message) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(message || 'Copied!');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast(message || 'Copied!');
        }
    }

    function flashCopied(btn) {
        btn.classList.add('copied');
        const orig = btn.textContent;
        if (btn.tagName === 'BUTTON' && !btn.classList.contains('svg-code-copy-btn')) {
            const svgHtml = btn.querySelector('svg')?.outerHTML || '';
            btn.innerHTML = svgHtml + ' Copied!';
            setTimeout(() => {
                btn.innerHTML = svgHtml + ' ' + orig.replace('Copied!', '').trim();
                btn.classList.remove('copied');
            }, 1500);
        } else {
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = orig.includes('Copied') ? 'Copy' : orig;
                btn.classList.remove('copied');
            }, 1500);
        }
    }

    let toastTimer;
    function showToast(msg) {
        clearTimeout(toastTimer);
        toastMsg.textContent = msg;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ─── Boot ───────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
