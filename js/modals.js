// ========================================
// Modal Close Events
// ========================================

function setupModalCloseEvents(app) {
    // Clock Modal
    document.getElementById('closeClockModal').addEventListener('click', () => {
        document.getElementById('clockModal').classList.remove('active');
        if (app.clockDetailInterval) {
            clearInterval(app.clockDetailInterval);
            app.clockDetailInterval = null;
        }
    });
    
    // Currency Modal
    document.getElementById('closeCurrencyModal').addEventListener('click', () => {
        document.getElementById('currencyModal').classList.remove('active');
    });
    
    // Stock Modal
    document.getElementById('closeStockModal').addEventListener('click', () => {
        document.getElementById('stockModal').classList.remove('active');
    });
    
    // Weather Modal
    document.getElementById('closeWeatherModal').addEventListener('click', () => {
        document.getElementById('weatherModal').classList.remove('active');
    });
    
    // Footer Bookmark Modal
    document.getElementById('closeFooterBookmarkModal').addEventListener('click', () => {
        closeFooterBookmarkModal(app);
    });
    document.getElementById('cancelFooterBookmarkBtn').addEventListener('click', () => {
        closeFooterBookmarkModal(app);
    });
    document.getElementById('saveFooterBookmarkBtn').addEventListener('click', () => {
        saveFooterBookmark(app);
    });
    
    // Footer Settings Modal
    document.getElementById('closeFooterSettingsModal').addEventListener('click', () => {
        closeFooterSettingsModal(app);
    });
    document.getElementById('cancelFooterSettingsBtn').addEventListener('click', () => {
        closeFooterSettingsModal(app);
    });
    document.getElementById('saveFooterSettingsBtn').addEventListener('click', () => {
        saveFooterSettings(app);
    });
    
    // Footer Add Button
    document.getElementById('footerAddBtn').addEventListener('click', () => {
        app.currentEditingFooterBookmark = null;
        openFooterBookmarkModal(app);
    });
    
    // Footer Settings Button
    document.getElementById('footerSettingsBtn').addEventListener('click', () => {
        openFooterSettingsModal(app);
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'clockModal' && app.clockDetailInterval) {
                    clearInterval(app.clockDetailInterval);
                    app.clockDetailInterval = null;
                }
            }
        });
    });
}

function applyWidgetVisibility(app) {
    const widgets = {
        'weatherWidget': app.settings.showWeatherWidget,
        'clockWidget': app.settings.showClockWidget,
        'currencyWidget': app.settings.showCurrencyWidget,
        'stockWidget': app.settings.showStockWidget,
        'searchWidget': app.settings.showSearchWidget,
        'footerBookmarkBar': app.settings.showFooterWidget
    };
    
    Object.entries(widgets).forEach(([id, show]) => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = show !== false ? 'flex' : 'none';
        }
    });
}
