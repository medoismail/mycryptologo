document.addEventListener('DOMContentLoaded', () => {
    const coffeeWidget = document.getElementById('coffee-widget');
    const copyWalletBtn = document.getElementById('copy-wallet');
    const walletInput = document.getElementById('wallet-address');
    let lastScrollPosition = 0;
    let scrollTimeout;

    // Handle scroll behavior
    function handleScroll() {
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            const currentScroll = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Check if we're near the bottom (within 100px of the bottom)
            if (currentScroll + windowHeight > documentHeight - 100) {
                coffeeWidget.style.opacity = '0';
                coffeeWidget.style.pointerEvents = 'none';
            } else {
                coffeeWidget.style.opacity = '1';
                coffeeWidget.style.pointerEvents = 'auto';
            }
            
            lastScrollPosition = currentScroll;
        }, 100);
    }

    // Handle copy functionality
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            try {
                walletInput.select();
                document.execCommand('copy');
                walletInput.blur();
                return true;
            } catch (err) {
                console.error('Fallback copy failed:', err);
                return false;
            }
        }
    }

    copyWalletBtn.addEventListener('click', async () => {
        const success = await copyToClipboard(walletInput.value);
        
        if (success) {
            const originalText = copyWalletBtn.innerHTML;
            copyWalletBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyWalletBtn.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                copyWalletBtn.innerHTML = originalText;
                copyWalletBtn.style.backgroundColor = '';
            }, 2000);
        } else {
            copyWalletBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
            copyWalletBtn.style.backgroundColor = '#f44336';
            
            setTimeout(() => {
                copyWalletBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                copyWalletBtn.style.backgroundColor = '';
            }, 2000);
        }
    });

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
}); 