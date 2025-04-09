// Search and filtering functionality for popular cryptocurrency projects

// Function to filter logos based on search query, format, and other criteria
function filterLogos() {
  // Get filter values
  const searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
  const formatValue = document.getElementById('format-filter').value;
  const resolutionValue = document.getElementById('resolution-filter').value;
  const sortValue = document.getElementById('sort-filter').value;
  
  // Apply filters to the cryptoLogos array
  let filtered = [...cryptoLogos];
  
  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(logo => 
      (logo.name && logo.name.toLowerCase().includes(searchQuery)) || 
      (logo.symbol && logo.symbol.toLowerCase().includes(searchQuery)) ||
      (logo.id && logo.id.toLowerCase().includes(searchQuery))
    );
  }
  
  // Sort the filtered results
  if (sortValue === 'name-asc') {
    filtered.sort((a, b) => {
      const nameA = a.name || a.id;
      const nameB = b.name || b.id;
      return nameA.localeCompare(nameB);
    });
  } else if (sortValue === 'name-desc') {
    filtered.sort((a, b) => {
      const nameA = a.name || a.id;
      const nameB = b.name || b.id;
      return nameB.localeCompare(nameA);
    });
  }
  
  return {
    filtered,
    format: formatValue,
    resolution: resolutionValue
  };
}

// Function to display logos in the grid
function displayFilteredLogos(page = 1, itemsPerPage = 24) {
  const logosGrid = document.getElementById('logos-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  // Get filtered logos
  const { filtered, format, resolution } = filterLogos();
  
  // Calculate pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const currentPageLogos = filtered.slice(startIndex, endIndex);
  
  // Clear grid if it's the first page
  if (page === 1) {
    logosGrid.innerHTML = '';
  }
  
  // Display "no results" message if no logos match the filters
  if (filtered.length === 0) {
    logosGrid.innerHTML = `
      <div class="loading-container">
        <p>No cryptocurrency logos found matching your search.</p>
        <button class="btn secondary-btn" id="clear-search-btn">Clear Search</button>
      </div>
    `;
    
    // Add event listener to the clear search button
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('clear-filters-btn').click();
      });
    }
    
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  // Add logos to the grid
  currentPageLogos.forEach(logo => {
    const logoCard = document.createElement('div');
    logoCard.className = 'logo-card';
    
    // Choose image source based on format
    const imgSrc = format === 'svg' 
      ? `data/svg/${logo.id}.svg` 
      : `data/coins/${resolution}/${logo.id}.png`;
    
    logoCard.innerHTML = `
      <div class="logo-img">
        <img src="${imgSrc}" alt="${logo.name || logo.id}" 
          onerror="this.src='${format === 'svg' ? 'data/svg/placeholder.svg' : `data/coins/dummy/coin_${resolution}.png`}'">
      </div>
      <div class="logo-name">${logo.name || logo.id}</div>
    `;
    
    // Add click event to open modal
    logoCard.addEventListener('click', () => {
      openLogoModal(logo);
    });
    
    logosGrid.appendChild(logoCard);
  });
  
  // Show/hide load more button
  if (endIndex < filtered.length) {
    loadMoreBtn.style.display = 'block';
    loadMoreBtn.dataset.page = page + 1;
  } else {
    loadMoreBtn.style.display = 'none';
  }
}

// Function to open the logo modal with details
function openLogoModal(logo) {
  const modal = document.getElementById('logo-modal');
  const overlay = document.getElementById('overlay');
  const modalImg = document.getElementById('modal-logo-img');
  const modalName = document.getElementById('modal-logo-name');
  const modalSymbol = document.getElementById('modal-logo-symbol');
  
  // Set modal content
  modalImg.src = `data/svg/${logo.id}.svg`;
  modalImg.onerror = function() {
    this.src = 'data/coins/dummy/coin_128x128.png';
  };
  
  modalName.textContent = logo.name || logo.id;
  modalSymbol.textContent = `Symbol: ${logo.symbol || logo.id.toUpperCase()}`;
  
  // Update download buttons
  updateDownloadButtons(logo);
  
  // Show modal
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Initialize search and filtering functionality
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const formatFilter = document.getElementById('format-filter');
  const resolutionFilter = document.getElementById('resolution-filter');
  const sortFilter = document.getElementById('sort-filter');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  // Search button click event
  searchBtn.addEventListener('click', () => {
    displayFilteredLogos(1);
  });
  
  // Search input enter key event
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      displayFilteredLogos(1);
    }
  });
  
  // Filter change events
  formatFilter.addEventListener('change', () => {
    displayFilteredLogos(1);
  });
  
  resolutionFilter.addEventListener('change', () => {
    displayFilteredLogos(1);
  });
  
  sortFilter.addEventListener('change', () => {
    displayFilteredLogos(1);
  });
  
  // Clear filters button click event
  clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    formatFilter.value = 'svg';
    resolutionFilter.value = '128x128';
    sortFilter.value = 'name-asc';
    displayFilteredLogos(1);
  });
  
  // Load more button click event
  loadMoreBtn.addEventListener('click', () => {
    const nextPage = parseInt(loadMoreBtn.dataset.page || 2);
    displayFilteredLogos(nextPage);
  });
});
