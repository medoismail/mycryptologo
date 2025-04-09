// Update the download.js file to enhance download functionality for both SVG and PNG formats

// Function to handle direct downloads with format selection and fallback
function downloadLogo(logoId, format, resolution, logoName) {
  let fileUrl, fileName;
  
  if (format === 'svg') {
    // Check if the SVG file exists, use placeholder if not
    const img = new Image();
    img.onload = function() {
      // SVG exists, proceed with download
      fileUrl = `data/svg/${logoId}.svg`;
      fileName = `${logoName || logoId}_logo.svg`;
      initiateDownload(fileUrl, fileName);
    };
    
    img.onerror = function() {
      // SVG doesn't exist, use placeholder
      console.log(`SVG for ${logoId} not found, using placeholder`);
      fileUrl = `data/svg/placeholder.svg`;
      fileName = `${logoName || logoId}_logo.svg`;
      initiateDownload(fileUrl, fileName);
    };
    
    img.src = `data/svg/${logoId}.svg`;
  } else {
    // For PNG downloads
    fileUrl = `data/coins/${resolution}/${logoId}.png`;
    fileName = `${logoName || logoId}_${resolution}.png`;
    initiateDownload(fileUrl, fileName);
  }
}

// Helper function to initiate the download
function initiateDownload(fileUrl, fileName) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize format tabs in the modal
document.addEventListener('DOMContentLoaded', () => {
  const formatTabs = document.querySelectorAll('.format-tab');
  const formatContents = document.querySelectorAll('.format-content');
  
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
  
  // Set up download buttons in the modal
  const downloadSvg = document.getElementById('download-svg');
  const download128 = document.getElementById('download-128');
  const download32 = document.getElementById('download-32');
  const download16 = document.getElementById('download-16');
  
  if (downloadSvg) {
    downloadSvg.addEventListener('click', function(e) {
      e.preventDefault();
      const logoId = this.getAttribute('data-id');
      const logoName = this.getAttribute('data-name');
      downloadLogo(logoId, 'svg', null, logoName);
    });
  }
  
  if (download128) {
    download128.addEventListener('click', function(e) {
      e.preventDefault();
      const logoId = this.getAttribute('data-id');
      const logoName = this.getAttribute('data-name');
      downloadLogo(logoId, 'png', '128x128', logoName);
    });
  }
  
  if (download32) {
    download32.addEventListener('click', function(e) {
      e.preventDefault();
      const logoId = this.getAttribute('data-id');
      const logoName = this.getAttribute('data-name');
      downloadLogo(logoId, 'png', '32x32', logoName);
    });
  }
  
  if (download16) {
    download16.addEventListener('click', function(e) {
      e.preventDefault();
      const logoId = this.getAttribute('data-id');
      const logoName = this.getAttribute('data-name');
      downloadLogo(logoId, 'png', '16x16', logoName);
    });
  }
});

// Function to update download buttons with logo data
function updateDownloadButtons(logo) {
  const downloadSvg = document.getElementById('download-svg');
  const download128 = document.getElementById('download-128');
  const download32 = document.getElementById('download-32');
  const download16 = document.getElementById('download-16');
  
  const logoId = logo.id;
  const logoName = logo.name || `Crypto_${logoId}`;
  
  // Set data attributes for download buttons
  downloadSvg.setAttribute('data-id', logoId);
  downloadSvg.setAttribute('data-name', logoName);
  
  download128.setAttribute('data-id', logoId);
  download128.setAttribute('data-name', logoName);
  
  download32.setAttribute('data-id', logoId);
  download32.setAttribute('data-name', logoName);
  
  download16.setAttribute('data-id', logoId);
  download16.setAttribute('data-name', logoName);
  
  // Set href attributes (as fallback)
  downloadSvg.href = `data/svg/${logoId}.svg`;
  downloadSvg.download = `${logoName}_logo.svg`;
  
  download128.href = `data/coins/128x128/${logoId}.png`;
  download128.download = `${logoName}_128x128.png`;
  
  download32.href = `data/coins/32x32/${logoId}.png`;
  download32.download = `${logoName}_32x32.png`;
  
  download16.href = `data/coins/16x16/${logoId}.png`;
  download16.download = `${logoName}_16x16.png`;
}
