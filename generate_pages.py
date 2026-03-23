#!/usr/bin/env python3
"""Generate token SEO pages and sitemap from crypto-logos-data.json."""

import json
import os
from html import escape
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "crypto-logos-data.json")
TOKENS_DIR = os.path.join(BASE_DIR, "tokens")
SITEMAP_FILE = os.path.join(BASE_DIR, "sitemap.xml")
BASE_URL = "https://www.cryptologos.xyz"

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e_name} ({e_symbol}) Logo SVG - Free Download | CryptoLogos</title>
<meta name="description" content="Download the official {e_name} ({e_symbol}) logo in SVG format. Free vector crypto icon for designers and developers. Copy SVG code for Figma.">
<meta name="keywords" content="{e_name} logo, {e_symbol} logo, {e_name} SVG, {e_symbol} icon, crypto logo download">
<meta property="og:title" content="{e_name} ({e_symbol}) Logo SVG - Free Download">
<meta property="og:description" content="Download {e_name} ({e_symbol}) logo in SVG. Free for designers and developers.">
<meta property="og:type" content="website">
<meta property="og:image" content="{base_url}/{e_path}">
<link rel="canonical" href="{base_url}/tokens/{e_id}.html">
<link rel="stylesheet" href="../css/styles.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"ImageObject","name":"{e_name} ({e_symbol}) Logo","description":"Official {e_name} cryptocurrency logo in SVG format","contentUrl":"{base_url}/{e_path}","encodingFormat":"image/svg+xml"}}
</script>
</head>
<body>
<div class="titlebar"><div class="titlebar-left"><a href="../" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit"><div class="app-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/></svg></div><span class="app-title">CryptoLogos</span></a></div><div class="titlebar-right"><a href="../" class="action-btn">Browse All Icons</a></div></div>
<div style="max-width:600px;margin:40px auto;padding:20px">
<div style="text-align:center;margin-bottom:32px">
<div style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:20px;display:inline-flex;padding:32px;margin-bottom:20px"><img src="../{e_path}" alt="{e_name} ({e_symbol}) logo" width="96" height="96" style="object-fit:contain"></div>
<h1 style="font-size:28px;margin-bottom:4px">{e_name}</h1>
<p style="color:var(--text-muted);font-family:var(--font-mono)">{e_symbol} &middot; {e_category}</p>
</div>
<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:24px">
<a href="../{e_path}" download="{e_id}.svg" class="action-btn primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Download SVG</a>
<button class="action-btn" onclick="copySvg()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg> Copy SVG Code</button>
</div>
<div class="svg-code-container"><div class="svg-code-header"><span>SVG Code</span><button class="svg-code-copy-btn" onclick="copySvg()">Copy</button></div><pre class="svg-code-pre" id="svg-code">Loading...</pre></div>
<div style="margin-top:16px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:6px;padding:12px 16px"><h2 style="font-size:14px;margin-bottom:8px">API</h2><code style="font-family:var(--font-mono);font-size:12px;color:var(--accent)">&lt;img src="{base_url}/{e_path}" alt="{e_name}" width="32"&gt;</code></div>
<div style="margin-top:24px;text-align:center"><a href="../" style="color:var(--accent)">Browse all 2,800+ crypto icons</a></div>
</div>
<script>
fetch("../{raw_path}").then(r=>r.text()).then(c=>{{document.getElementById("svg-code").textContent=c}});
async function copySvg(){{const r=await fetch("../{raw_path}");const t=await r.text();await navigator.clipboard.writeText(t);const b=document.querySelector(".svg-code-copy-btn");b.textContent="Copied!";b.classList.add("copied");setTimeout(()=>{{b.textContent="Copy";b.classList.remove("copied")}},2000)}}
</script>
</body>
</html>'''

def main():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        tokens = json.load(f)

    os.makedirs(TOKENS_DIR, exist_ok=True)

    count = 0
    sitemap_urls = []

    # Add homepage
    sitemap_urls.append(BASE_URL + "/")

    for token in tokens:
        tid = token.get("id", "")
        name = token.get("name", "")
        symbol = token.get("symbol", "")
        path = token.get("path", "")
        category = token.get("category", "")

        if not tid:
            continue

        e_id = escape(tid)
        e_name = escape(name)
        e_symbol = escape(symbol)
        e_path = escape(path)
        e_category = escape(category)

        html = TEMPLATE.format(
            e_id=e_id,
            e_name=e_name,
            e_symbol=e_symbol,
            e_path=e_path,
            e_category=e_category,
            raw_path=path,  # for JS fetch (not in HTML attributes)
            base_url=BASE_URL,
        )

        out_path = os.path.join(TOKENS_DIR, f"{tid}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)

        sitemap_urls.append(f"{BASE_URL}/tokens/{escape(tid)}.html")
        count += 1

    # Generate sitemap.xml
    today = datetime.now().strftime("%Y-%m-%d")
    sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for url in sitemap_urls:
        sitemap_lines.append(f"  <url><loc>{url}</loc><lastmod>{today}</lastmod></url>")
    sitemap_lines.append("</urlset>")

    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(sitemap_lines) + "\n")

    print(f"Generated {count} token pages in {TOKENS_DIR}/")
    print(f"Generated sitemap.xml with {len(sitemap_urls)} URLs")

if __name__ == "__main__":
    main()
