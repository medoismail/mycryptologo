// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const overlay = document.getElementById('overlay');
const logoModal = document.getElementById('logo-modal');
const modalCloseBtn = document.querySelector('.modal-close');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const formatFilter = document.getElementById('format-filter');
const resolutionFilter = document.getElementById('resolution-filter');
const sortFilter = document.getElementById('sort-filter');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const popularGrid = document.getElementById('popular-grid');
const logosGrid = document.getElementById('logos-grid');
const loadMoreBtn = document.getElementById('load-more-btn');
const faqItems = document.querySelectorAll('.faq-item');
const copyBtn = document.getElementById('copy-btn');
const formatTabs = document.querySelectorAll('.format-tab');
const formatContents = document.querySelectorAll('.format-content');

// Global Variables
let cryptoLogos = [];
let popularCryptos = [];
let filteredLogos = [];
let currentPage = 1;
let logosPerPage = 24;
let currentFormat = 'svg';
let currentResolution = '128x128';
let currentSort = 'name-asc';
let searchQuery = '';
let currentLogoUrl = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initModalHandlers();
    initFormatTabs();
    initFaqToggle();
    loadPopularCryptos();
    loadCryptoLogos();
    initFilters();
});

// Theme Toggle Functionality
function initThemeToggle() {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        updateThemeIcon();
    });
    
    // Set initial icon based on theme
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggleBtn.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
}

// Mobile Menu Functionality
function initMobileMenu() {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        toggleMobileMenuIcon();
    });
}

function toggleMobileMenuIcon() {
    const isActive = mobileNav.classList.contains('active');
    const spans = mobileMenuBtn.querySelectorAll('span');
    
    if (isActive) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Format Tabs Functionality
function initFormatTabs() {
    formatTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            formatTabs.forEach(t => t.classList.remove('active'));
            formatContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const format = tab.getAttribute('data-format');
            document.getElementById(`${format}-content`).classList.add('active');
        });
    });
}

// Modal Functionality
function initModalHandlers() {
    modalCloseBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentLogoUrl)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
}

function openModal(logo) {
    const modalLogoImg = document.getElementById('modal-logo-img');
    const modalLogoName = document.getElementById('modal-logo-name');
    const modalLogoSymbol = document.getElementById('modal-logo-symbol');
    const downloadSvg = document.getElementById('download-svg');
    const download128 = document.getElementById('download-128');
    const download32 = document.getElementById('download-32');
    const download16 = document.getElementById('download-16');
    
    // Set modal content
    modalLogoImg.src = `data/svg/${logo.id}.svg`;
    modalLogoImg.onerror = function() {
        this.src = `data/svg/placeholder.svg`;
    };
    
    // Set standard size for logo preview
    modalLogoImg.style.width = '128px';
    modalLogoImg.style.height = '128px';
    
    modalLogoName.textContent = logo.name || `Cryptocurrency`;
    modalLogoSymbol.textContent = `Symbol: ${logo.symbol || logo.id.toUpperCase()}`;
    
    // Set download buttons with data attributes instead of direct href
    downloadSvg.setAttribute('data-id', logo.id);
    downloadSvg.setAttribute('data-name', logo.name || logo.id);
    
    download128.setAttribute('data-id', logo.id);
    download128.setAttribute('data-name', logo.name || logo.id);
    
    download32.setAttribute('data-id', logo.id);
    download32.setAttribute('data-name', logo.name || logo.id);
    
    download16.setAttribute('data-id', logo.id);
    download16.setAttribute('data-name', logo.name || logo.id);
    
    // Add click event listeners for download buttons
    downloadSvg.onclick = function(e) {
        e.preventDefault();
        downloadLogo(logo.id, 'svg', null, logo.name || logo.id);
    };
    
    download128.onclick = function(e) {
        e.preventDefault();
        downloadLogo(logo.id, 'png', '128x128', logo.name || logo.id);
    };
    
    download32.onclick = function(e) {
        e.preventDefault();
        downloadLogo(logo.id, 'png', '32x32', logo.name || logo.id);
    };
    
    download16.onclick = function(e) {
        e.preventDefault();
        downloadLogo(logo.id, 'png', '16x16', logo.name || logo.id);
    };
    
    // Set current logo URL for copy button
    currentLogoUrl = `${window.location.origin}/data/svg/${logo.id}.svg`;
    
    // Show modal
    logoModal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    logoModal.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// FAQ Toggle Functionality
function initFaqToggle() {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
            const icon = item.querySelector('.faq-toggle i');
            icon.className = item.classList.contains('active') ? 
                'fas fa-minus' : 
                'fas fa-plus';
        });
    });
}

// Load Popular Cryptocurrencies
function loadPopularCryptos() {
    // Show loading state
    popularGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading popular cryptocurrencies...</p>
        </div>
    `;
    
    fetch('data/popular_cryptos.json')
        .then(response => response.json())
        .then(data => {
            popularCryptos = data;
            displayPopularCryptos();
        })
        .catch(error => {
            console.error('Error loading popular cryptocurrencies:', error);
            popularGrid.innerHTML = `
                <div class="loading-container">
                    <p>Error loading popular cryptocurrencies. Please try again later.</p>
                </div>
            `;
        });
}

// Display Popular Cryptocurrencies
function displayPopularCryptos() {
    popularGrid.innerHTML = '';
    
    popularCryptos.slice(0, 10).forEach(crypto => {
        const card = document.createElement('div');
        card.className = 'popular-card';
        card.innerHTML = `
            <div class="popular-img">
                <img src="data/svg/${crypto.id}.svg" alt="${crypto.name}" 
                    onerror="this.src='data/coins/dummy/coin_128x128.png'">
            </div>
            <div class="popular-name">${crypto.name}</div>
            <div class="popular-symbol">${crypto.symbol}</div>
        `;
        
        card.addEventListener('click', () => openModal(crypto));
        popularGrid.appendChild(card);
    });
}

// Load Cryptocurrency Logos
function loadCryptoLogos() {
    // Show loading state
    logosGrid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading cryptocurrency logos...</p>
        </div>
    `;
    
    // In a real application, this would be an API call
    // For this demo, we'll use the popular_cryptos.json and add more
    fetch('data/popular_cryptos.json')
        .then(response => response.json())
        .then(data => {
            // Add more random cryptos to the list
            cryptoLogos = [...data];
            
            // Add some additional cryptos
            const additionalCryptos = [
                { id: "bat", name: "Basic Attention Token", symbol: "BAT" },
                { id: "matic", name: "Polygon", symbol: "MATIC" },
                { id: "mkr", name: "Maker", symbol: "MKR" },
                { id: "snx", name: "Synthetix", symbol: "SNX" },
                { id: "comp", name: "Compound", symbol: "COMP" },
                { id: "sushi", name: "SushiSwap", symbol: "SUSHI" },
                { id: "cake", name: "PancakeSwap", symbol: "CAKE" },
                { id: "grt", name: "The Graph", symbol: "GRT" },
                { id: "1inch", name: "1inch", symbol: "1INCH" },
                { id: "enj", name: "Enjin Coin", symbol: "ENJ" },
                { id: "chz", name: "Chiliz", symbol: "CHZ" },
                { id: "hot", name: "Holo", symbol: "HOT" },
                { id: "sand", name: "The Sandbox", symbol: "SAND" },
                { id: "mana", name: "Decentraland", symbol: "MANA" },
                { id: "theta", name: "Theta Network", symbol: "THETA" },
                { id: "axs", name: "Axie Infinity", symbol: "AXS" },
                { id: "ftm", name: "Fantom", symbol: "FTM" },
                { id: "hbar", name: "Hedera", symbol: "HBAR" },
                { id: "neo", name: "NEO", symbol: "NEO" },
                { id: "waves", name: "Waves", symbol: "WAVES" }
            ];
            
            cryptoLogos = [...cryptoLogos, ...additionalCryptos];
            filteredLogos = [...cryptoLogos];
            applyFilters();
        })
        .catch(error => {
            console.error('Error loading cryptocurrency logos:', error);
            // Generate sample data for demonstration
            generateSampleData();
        });
}

// Generate sample data for demonstration
function generateSampleData() {
    const sampleNames = [
        'Bitcoin', 'Ethereum', 'Tether', 'BNB', 'XRP', 'Solana', 
        'Cardano', 'Dogecoin', 'Polygon', 'Polkadot', 'Litecoin',
        'Chainlink', 'Uniswap', 'Avalanche', 'Stellar', 'Monero',
        'Cosmos', 'Tron', 'Algorand', 'VeChain', 'Filecoin',
        'Internet Computer', 'Hedera', 'Cronos', 'Aptos'
    ];
    
    cryptoLogos = [];
    
    // Generate 100 sample logos
    for (let i = 1; i <= 100; i++) {
        const randomNameIndex = Math.floor(Math.random() * sampleNames.length);
        cryptoLogos.push({
            id: i.toString(),
            name: i <= 25 ? sampleNames[i-1] : `Crypto ${i}`,
            symbol: i <= 25 ? sampleNames[i-1].substring(0, 3).toUpperCase() : `C${i}`
        });
    }
    
    filteredLogos = [...cryptoLogos];
    applyFilters();
}

// Filter and Sort Functionality
function initFilters() {
    searchBtn.addEventListener('click', () => {
        searchQuery = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            applyFilters();
        }
    });
    
    formatFilter.addEventListener('change', () => {
        currentFormat = formatFilter.value;
        applyFilters();
    });
    
    resolutionFilter.addEventListener('change', () => {
        currentResolution = resolutionFilter.value;
        applyFilters();
    });
    
    sortFilter.addEventListener('change', () => {
        currentSort = sortFilter.value;
        applyFilters();
    });
    
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        formatFilter.value = 'svg';
        currentFormat = 'svg';
        resolutionFilter.value = '128x128';
        currentResolution = '128x128';
        sortFilter.value = 'name-asc';
        currentSort = 'name-asc';
        currentPage = 1;
        applyFilters();
    });
    
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        displayLogos(false);
    });
}

function applyFilters() {
    // Filter by search query
    if (searchQuery) {
        filteredLogos = cryptoLogos.filter(logo => 
            (logo.name && logo.name.toLowerCase().includes(searchQuery)) || 
            (logo.symbol && logo.symbol.toLowerCase().includes(searchQuery)) ||
            logo.id.toLowerCase().includes(searchQuery)
        );
    } else {
        filteredLogos = [...cryptoLogos];
    }
    
    // Sort logos
    sortLogos();
    
    // Reset to first page and display
    currentPage = 1;
    displayLogos(true);
}

function sortLogos() {
    switch (currentSort) {
        case 'name-asc':
            filteredLogos.sort((a, b) => {
                const nameA = a.name || `Crypto ${a.id}`;
                const nameB = b.name || `Crypto ${b.id}`;
                return nameA.localeCompare(nameB);
            });
            break;
        case 'name-desc':
            filteredLogos.sort((a, b) => {
                const nameA = a.name || `Crypto ${a.id}`;
                const nameB = b.name || `Crypto ${b.id}`;
                return nameB.localeCompare(nameA);
            });
            break;
    }
}

// Display Logos in Grid
function displayLogos(reset) {
    if (reset) {
        logosGrid.innerHTML = '';
    }
    
    const startIndex = (currentPage - 1) * logosPerPage;
    const endIndex = Math.min(startIndex + logosPerPage, filteredLogos.length);
    const currentPageLogos = filteredLogos.slice(startIndex, endIndex);
    
    if (filteredLogos.length === 0) {
        logosGrid.innerHTML = `
            <div class="loading-container">
                <p>No cryptocurrency logos found matching your search.</p>
                <button class="btn secondary-btn" onclick="document.getElementById('clear-filters-btn').click()">
                    Clear Filters
                </button>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    currentPageLogos.forEach(logo => {
        const logoCard = document.createElement('div');
        logoCard.className = 'logo-card';
        
        // Choose image source based on format
        const imgSrc = currentFormat === 'svg' 
            ? `data/svg/${logo.id}.svg` 
            : `data/coins/${currentResolution}/${logo.id}.png`;
        
        logoCard.innerHTML = `
            <div class="logo-img">
                <img src="${imgSrc}" alt="${logo.name || `Crypto ${logo.id}`}" 
                    onerror="this.src='data/coins/dummy/coin_${currentResolution}.png'">
            </div>
            <div class="logo-name">${logo.name || `Crypto ${logo.id}`}</div>
        `;
        
        logoCard.addEventListener('click', () => openModal(logo));
        logosGrid.appendChild(logoCard);
    });
    
    // Show/hide load more button
    if (endIndex < filteredLogos.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Download functionality
function downloadLogo(logoId, format, resolution, logoName) {
    let fileUrl, fileName;
    
    if (format === 'svg') {
        fileUrl = `data/svg/${logoId}.svg`;
        fileName = `${logoName || logoId}_logo.svg`;
    } else {
        fileUrl = `data/coins/${resolution}/${logoId}.png`;
        fileName = `${logoName || logoId}_${resolution}.png`;
    }
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
