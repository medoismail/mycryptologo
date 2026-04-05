/* CryptoLogos v3 — Slide panel interaction */
(function () {
    'use strict';

    let data = [], filtered = [], cat = 'all', sort = 'name-asc', query = '', page = 1, svgCode = '';
    const PER = 80;
    const BASE = location.origin + location.pathname.replace(/\/[^/]*$/, '');

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    const grid = $('#grid'), search = $('#searchInput'), sortSel = document.getElementById('sortSelect');
    const moreWrap = $('#loadMoreWrap'), moreBtn = $('#loadMoreBtn'), moreInfo = $('#loadMoreInfo');
    const empty = $('#emptyState'), countEl = $('#resultCount'), themeBtn = $('#themeToggle'), apiBtn = $('#apiBtn');
    const toast = $('#toast'), toastMsg = $('#toastMsg');

    /* Panel */
    const panel = $('#panel'), panelClose = $('#panelClose');
    const pImg = $('#panelImg'), pName = $('#panelName'), pSym = $('#panelSymbol'), pCat = $('#panelCat');
    const pCopy = $('#copySvgBtn'), pDl = $('#downloadBtn'), pUrl = $('#copyUrlBtn');
    const pCode = $('#codeBlock'), pPre = $('#codePre'), pCodeCopy = $('#codeCopyBtn');
    const pPath = $('#panelPath'), pApi = $('#panelApiUrl');

    /* API modal */
    const aOverlay = $('#apiOverlay'), aClose = $('#apiClose');

    let activeToken = null;

    async function init() {
        theme(); events();
        try { data = await (await fetch('data/crypto-logos-data.json')).json(); }
        catch (e) { console.error(e); data = []; }
        counts(); apply(); initBasket();
    }

    /* Theme */
    function theme() {
        if (localStorage.getItem('cl-theme') === 'light') document.documentElement.setAttribute('data-theme', 'light');
        syncIcon();
        themeBtn.addEventListener('click', () => {
            const l = document.documentElement.getAttribute('data-theme') === 'light';
            l ? document.documentElement.removeAttribute('data-theme') : document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('cl-theme', l ? 'dark' : 'light');
            syncIcon();
        });
    }
    function syncIcon() {
        const l = document.documentElement.getAttribute('data-theme') === 'light';
        themeBtn.querySelector('.icon--sun').style.display = l ? 'none' : '';
        themeBtn.querySelector('.icon--moon').style.display = l ? '' : 'none';
    }

    /* Events */
    function events() {
        let db;
        search.addEventListener('input', () => { clearTimeout(db); db = setTimeout(() => { query = search.value.trim().toLowerCase(); page = 1; apply(); }, 200); });

        $$('.filter').forEach(btn => btn.addEventListener('click', () => {
            $$('.filter').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            cat = btn.dataset.cat; search.value = ''; query = ''; page = 1; apply();
        }));

        moreBtn.addEventListener('click', () => { page++; render(false); });

        /* Panel close */
        panelClose.addEventListener('click', closePanel);

        /* Panel buttons */
        pCopy.addEventListener('click', async () => { if (!svgCode) return; await clip(svgCode, 'SVG copied!'); flash(pCopy); });
        pCodeCopy.addEventListener('click', async () => { if (!svgCode) return; await clip(svgCode, 'SVG copied!'); flash(pCodeCopy); });
        pUrl.addEventListener('click', async () => { await clip(pDl.href, 'URL copied!'); flash(pUrl); });

        /* API modal */
        apiBtn.addEventListener('click', () => { aOverlay.classList.add('is-open'); $('#apiExampleUrl').textContent = `${BASE}/data/svg/btc.svg`; });
        aClose.addEventListener('click', () => aOverlay.classList.remove('is-open'));
        aOverlay.addEventListener('click', e => { if (e.target === aOverlay) aOverlay.classList.remove('is-open'); });

        /* Click outside panel to close */
        document.addEventListener('click', e => {
            if (document.body.classList.contains('panel-open') && !panel.contains(e.target) && !e.target.closest('.card')) {
                closePanel();
            }
        });

        /* Keyboard */
        document.addEventListener('keydown', e => {
            if (e.key === '/' && document.activeElement !== search) { e.preventDefault(); search.focus(); }
            if (e.key === 'Escape') {
                if (document.body.classList.contains('panel-open')) closePanel();
                else if (aOverlay.classList.contains('is-open')) aOverlay.classList.remove('is-open');
                else if (document.activeElement === search) search.blur();
            }
        });
    }

    /* Counts */
    function counts() {
        const c = { all: data.length, tokens: 0, networks: 0, 'defi-protocol': 0, exchanges: 0, wallets: 0 };
        data.forEach(t => { if (c[t.category] !== undefined) c[t.category]++; });
        anim($('#cAll'), c.all);
        anim($('#totalCount'), data.length);
    }
    function anim(el, to) {
        if (!el) return;
        const dur = 500, start = performance.now();
        const tick = now => {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* Filter + Render */
    function apply() {
        filtered = data;
        if (cat !== 'all') filtered = filtered.filter(t => t.category === cat);
        if (query) filtered = filtered.filter(t => t.name.toLowerCase().includes(query) || t.symbol.toLowerCase().includes(query) || t.id.toLowerCase().includes(query));
        /* Popular tokens always first, then alphabetical */
        const pop = new Set(['btc','eth','sol','usdt','xrp','bnb','usdc','doge','ada','avax','link','dot','uni','ltc','matic']);
        filtered.sort((a, b) => {
            const aP = pop.has(a.id) ? 0 : 1;
            const bP = pop.has(b.id) ? 0 : 1;
            if (aP !== bP) return aP - bP;
            const va = (a.name || a.id).toLowerCase(), vb = (b.name || b.id).toLowerCase();
            return va.localeCompare(vb);
        });
        page = 1; render(true);
    }

    function render(reset) {
        if (reset) grid.innerHTML = '';
        const s = (page - 1) * PER, e = Math.min(s + PER, filtered.length);
        if (!filtered.length) { empty.style.display = 'flex'; moreWrap.style.display = 'none'; countEl.textContent = '0 results'; return; }
        empty.style.display = 'none';

        const slice = filtered.slice(s, e);
        /* Render cards with sequential animation via JS */
        slice.forEach((t, i) => {
            const el = document.createElement('div');
            el.className = 'card';
            el.style.animationDelay = (i * 30) + 'ms';

            let badge = '';
            if (t.category === 'networks') badge = '<span class="card__badge badge--net">Net</span>';
            else if (t.category === 'defi-protocol') badge = '<span class="card__badge badge--defi">DeFi</span>';
            else if (t.category === 'exchanges') badge = '<span class="card__badge badge--dex">DEX</span>';
            else if (t.category === 'wallets') badge = '<span class="card__badge badge--wall">Wallet</span>';
            const isPng = t.path && /\.(png|jpe?g)$/i.test(t.path);
            const png = isPng ? '<span class="card__badge badge--png" style="opacity:1;top:6px;left:6px;right:auto">PNG</span>' : '';

            el.innerHTML = `<div class="card__img"><img src="${t.path}" alt="${t.name}" loading="lazy" onerror="this.style.opacity='0.12'"></div><span class="card__name" title="${t.name}">${t.name}</span><span class="card__sym">${t.symbol}</span>${badge}${png}`;
            el.style.setProperty('--i', String(i));
            setupCardDrag(el, t, () => openPanel(t));
            grid.appendChild(el);
        });

        const shown = Math.min(e, filtered.length);
        countEl.textContent = `${shown} of ${filtered.length.toLocaleString()}`;
        if (e < filtered.length) { moreWrap.style.display = ''; moreInfo.textContent = `${filtered.length - e} more`; }
        else moreWrap.style.display = 'none';
    }

    /* Panel — slide in from left */
    function openPanel(t) {
        /* If clicking the same token again, close */
        if (activeToken && activeToken.id === t.id && document.body.classList.contains('panel-open')) {
            closePanel();
            return;
        }
        activeToken = t;

        pImg.src = t.path;
        pName.textContent = t.name;
        pSym.textContent = t.symbol;
        pCat.textContent = t.category;

        const isSvg = t.path && t.path.endsWith('.svg');
        const ext = t.path ? t.path.split('.').pop().toUpperCase() : 'SVG';
        pDl.href = t.path;
        pDl.download = `${t.id}.${ext.toLowerCase()}`;

        pCopy.style.display = isSvg ? '' : 'none';
        pCode.style.display = isSvg ? '' : 'none';
        /* Download becomes primary when no Copy SVG */
        if (isSvg) { pDl.classList.remove('btn--primary'); }
        else { pDl.classList.add('btn--primary'); }
        pPath.innerHTML = `<code>${t.path}</code>`;
        pApi.textContent = `${BASE}/${t.path}`;

        svgCode = '';
        if (isSvg) {
            pPre.textContent = 'Loading...';
            fetch(t.path).then(r => r.text()).then(c => { svgCode = c; pPre.textContent = c.length > 400 ? c.slice(0, 400) + '...' : c; }).catch(() => pPre.textContent = 'Failed');
        }

        document.body.classList.add('panel-open');
    }

    function closePanel() {
        document.body.classList.remove('panel-open');
        activeToken = null;
    }

    /* Clipboard */
    async function clip(text, msg) {
        try { await navigator.clipboard.writeText(text); } catch {
            const t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
        }
        showToast(msg || 'Copied!');
    }

    function flash(btn) {
        btn.classList.add('is-copied');
        const orig = btn.textContent;
        if (btn.classList.contains('panel__code-copy')) {
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-copied'); }, 1400);
        } else {
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = orig; btn.classList.remove('is-copied'); }, 1400);
        }
    }

    let toastT;
    function showToast(msg) { clearTimeout(toastT); toastMsg.textContent = msg; toast.classList.add('is-visible'); toastT = setTimeout(() => toast.classList.remove('is-visible'), 2400); }

    /* ===== Basket — drag to collect, batch download ===== */
    const basket = [];
    const basketEl = $('#basket');
    const basketDrop = $('#basketDrop');
    const basketBar = $('#basketBar');
    const basketItems = $('#basketItems');
    const basketCount = $('#basketCount');
    const basketDownloadBtn = $('#basketDownload');
    const basketClearBtn = $('#basketClear');
    let dragToken = null;

    function initBasket() {
        /* Download all */
        basketDownloadBtn.addEventListener('click', downloadBasket);

        /* Clear */
        basketClearBtn.addEventListener('click', () => {
            basket.length = 0;
            renderBasket();
            showToast('Basket cleared');
        });
    }

    /* Custom pointer-based drag — feels like picking up a real card */
    let ghost = null, isDragging = false;
    const DRAG_THRESHOLD = 8;

    function setupCardDrag(el, token, onClick) {
        let sx, sy, moved;

        el.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            sx = e.clientX; sy = e.clientY; moved = false;
            dragToken = token;
            el.setPointerCapture(e.pointerId);

            const onMove = e2 => {
                const dx = e2.clientX - sx, dy = e2.clientY - sy;
                if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

                if (!moved) {
                    moved = true;
                    el.classList.add('is-dragging');
                    document.body.classList.add('is-dragging');

                    ghost = el.cloneNode(true);
                    ghost.className = 'card card--ghost';
                    ghost.style.cssText = `position:fixed;z-index:9999;width:${el.offsetWidth}px;pointer-events:none;will-change:transform;`;
                    document.body.appendChild(ghost);
                }

                const tilt = Math.max(-15, Math.min(15, (e2.clientX - sx) * 0.05));
                ghost.style.left = (e2.clientX - el.offsetWidth / 2) + 'px';
                ghost.style.top = (e2.clientY - el.offsetHeight / 2) + 'px';
                ghost.style.transform = `rotate(${tilt}deg) scale(1.06)`;

                /* Over basket? */
                const bRect = basketEl.getBoundingClientRect();
                const over = e2.clientY > bRect.top;
                basketDrop.classList.toggle('is-over', over);
            };

            const onUp = e2 => {
                el.removeEventListener('pointermove', onMove);
                el.removeEventListener('pointerup', onUp);
                el.removeEventListener('lostpointercapture', onUp);

                if (!moved) {
                    /* It was a click, not a drag */
                    onClick();
                } else if (ghost) {
                    const bRect = basketEl.getBoundingClientRect();
                    const over = e2.clientY > bRect.top;

                    if (over && dragToken && !basket.find(b => b.id === dragToken.id)) {
                        /* Fly into basket */
                        ghost.style.transition = 'all 0.3s cubic-bezier(0.22,1,0.36,1)';
                        ghost.style.left = (window.innerWidth / 2) + 'px';
                        ghost.style.top = window.innerHeight + 'px';
                        ghost.style.transform = 'scale(0.2) rotate(0)';
                        ghost.style.opacity = '0';
                        setTimeout(() => { if (ghost) { ghost.remove(); ghost = null; } }, 300);
                        basket.push(dragToken);
                        renderBasket();
                        showToast(`${dragToken.name} collected`);
                    } else {
                        /* Snap back */
                        const r = el.getBoundingClientRect();
                        ghost.style.transition = 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)';
                        ghost.style.left = r.left + 'px';
                        ghost.style.top = r.top + 'px';
                        ghost.style.transform = 'scale(1) rotate(0)';
                        ghost.style.opacity = '0';
                        setTimeout(() => { if (ghost) { ghost.remove(); ghost = null; } }, 400);
                    }
                    basketDrop.classList.remove('is-over');
                }

                el.classList.remove('is-dragging');
                document.body.classList.remove('is-dragging');
                isDragging = false;
                dragToken = null;
            };

            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerup', onUp);
            el.addEventListener('lostpointercapture', onUp);
        });

        el.addEventListener('dragstart', e => e.preventDefault());
    }

    function renderBasket() {
        if (basket.length === 0) {
            document.body.classList.remove('has-basket');
            basketBar.style.display = 'none';
            return;
        }
        document.body.classList.add('has-basket');
        basketBar.style.display = 'flex';

        basketItems.innerHTML = '';
        basket.forEach((t, i) => {
            const item = document.createElement('div');
            item.className = 'basket__item';
            item.style.animationDelay = (i * 40) + 'ms';
            item.title = t.name + ' — click to remove';
            item.innerHTML = `<img src="${t.path}" alt="${t.name}">`;
            item.addEventListener('click', () => {
                basket.splice(i, 1);
                renderBasket();
            });
            basketItems.appendChild(item);
        });

        basketCount.textContent = basket.length + (basket.length === 1 ? ' icon' : ' icons');
        /* Scroll to end to show latest */
        basketItems.scrollLeft = basketItems.scrollWidth;
    }

    async function downloadBasket() {
        if (!basket.length) return;

        showToast('Preparing download...');

        /* If single icon, just download directly */
        if (basket.length === 1) {
            const a = document.createElement('a');
            a.href = basket[0].path;
            a.download = basket[0].id + '.' + basket[0].path.split('.').pop();
            a.click();
            return;
        }

        /* Multiple: fetch all and create zip using JSZip if available, otherwise download individually */
        try {
            /* Try dynamic import of JSZip from CDN */
            const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;
            const zip = new JSZip();

            await Promise.all(basket.map(async t => {
                const res = await fetch(t.path);
                const blob = await res.blob();
                const ext = t.path.split('.').pop();
                zip.file(`${t.id}.${ext}`, blob);
            }));

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cryptologos-${basket.length}-icons.zip`;
            a.click();
            URL.revokeObjectURL(url);
            showToast(`Downloaded ${basket.length} icons as ZIP`);
        } catch {
            /* Fallback: download one by one */
            basket.forEach(t => {
                const a = document.createElement('a');
                a.href = t.path;
                a.download = t.id + '.' + t.path.split('.').pop();
                a.click();
            });
            showToast(`Downloaded ${basket.length} icons`);
        }
    }

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
