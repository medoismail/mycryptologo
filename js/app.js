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
        counts(); apply();
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
            const png = isPng ? '<span class="card__badge badge--png" style="opacity:1;top:auto;bottom:5px;right:5px">PNG</span>' : '';

            el.innerHTML = `<div class="card__img"><img src="${t.path}" alt="${t.name}" loading="lazy" onerror="this.style.opacity='0.12'"></div><span class="card__name" title="${t.name}">${t.name}</span><span class="card__sym">${t.symbol}</span>${badge}${png}`;
            el.addEventListener('click', () => openPanel(t));
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

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
