// ========================================
// Footer Bookmark Functions
// ========================================

function loadFooterBookmarks(app) {
    const saved = localStorage.getItem('footerBookmarks');
    if (saved) {
        app.footerBookmarks = JSON.parse(saved);
    } else {
        app.footerBookmarks = [
            { id: generateId(), title: 'Google', url: 'https://www.google.com', icon: '' },
            { id: generateId(), title: 'YouTube', url: 'https://www.youtube.com', icon: '' },
            { id: generateId(), title: 'Gmail', url: 'https://mail.google.com', icon: '' },
            { id: generateId(), title: 'Netflix', url: 'https://www.netflix.com', icon: '' }
        ];
        saveFooterBookmarks(app);
    }
}

function saveFooterBookmarks(app) {
    localStorage.setItem('footerBookmarks', JSON.stringify(app.footerBookmarks));
    
    // Sync to GitHub if configured
    if (app.githubSync && app.githubSync.isConfigured()) {
        app.githubSync.pushData();
    }
}

function renderFooterBookmarks(app) {
    const container = document.getElementById('footerBookmarks');
    if (!container) return;
    
    container.innerHTML = app.footerBookmarks.map(bookmark => `
        <div class="footer-bookmark-item" data-bookmark-id="${bookmark.id}" title="${bookmark.title}">
            <img src="${getFaviconUrl(bookmark.url)}" 
                 alt="${bookmark.title}"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><text y=%2218%22 font-size=%2220%22>🔖</text></svg>'">
            <button class="footer-bookmark-delete" data-delete-id="${bookmark.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // 클릭 이벤트
    container.querySelectorAll('.footer-bookmark-item').forEach(item => {
        const id = item.dataset.bookmarkId;
        const deleteBtn = item.querySelector('.footer-bookmark-delete');
        
        item.addEventListener('click', (e) => {
            if (e.target.closest('.footer-bookmark-delete')) return;
            const bookmark = app.footerBookmarks.find(b => b.id === id);
            if (bookmark) {
                window.open(bookmark.url, '_blank');
            }
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFooterBookmark(app, id);
        });
    });
}

function openFooterBookmarkModal(app) {
    document.getElementById('footerBookmarkModalTitle').textContent = 
        app.currentEditingFooterBookmark ? '푸터 북마크 수정' : '푸터 북마크 추가';
    
    if (app.currentEditingFooterBookmark) {
        const bookmark = app.footerBookmarks.find(b => b.id === app.currentEditingFooterBookmark);
        if (bookmark) {
            document.getElementById('footerBookmarkTitle').value = bookmark.title;
            document.getElementById('footerBookmarkUrl').value = bookmark.url;
        }
    } else {
        document.getElementById('footerBookmarkTitle').value = '';
        document.getElementById('footerBookmarkUrl').value = '';
    }
    
    document.getElementById('footerBookmarkModal').classList.add('active');
    document.getElementById('footerBookmarkTitle').focus();
}

function closeFooterBookmarkModal(app) {
    document.getElementById('footerBookmarkModal').classList.remove('active');
    app.currentEditingFooterBookmark = null;
}

function saveFooterBookmark(app) {
    const title = document.getElementById('footerBookmarkTitle').value.trim();
    const url = document.getElementById('footerBookmarkUrl').value.trim();
    
    if (!title || !url) {
        alert('제목과 URL을 모두 입력해주세요.');
        return;
    }
    
    if (app.currentEditingFooterBookmark) {
        const bookmark = app.footerBookmarks.find(b => b.id === app.currentEditingFooterBookmark);
        if (bookmark) {
            bookmark.title = title;
            bookmark.url = url;
        }
    } else {
        app.footerBookmarks.push({
            id: generateId(),
            title: title,
            url: url,
            icon: ''
        });
    }
    
    saveFooterBookmarks(app);
    renderFooterBookmarks(app);
    closeFooterBookmarkModal(app);
}

function deleteFooterBookmark(app, id) {
    if (confirm('이 북마크를 삭제하시겠습니까?')) {
        app.footerBookmarks = app.footerBookmarks.filter(b => b.id !== id);
        saveFooterBookmarks(app);
        renderFooterBookmarks(app);
    }
}

function openFooterSettingsModal(app) {
    document.getElementById('footerWidgetSize').value = (app.settings.footerWidgetSize || 1) * 100;
    document.getElementById('footerWidgetSizeValue').textContent = Math.round((app.settings.footerWidgetSize || 1) * 100);
    
    const sizeInput = document.getElementById('footerWidgetSize');
    const sizeValue = document.getElementById('footerWidgetSizeValue');
    
    // Remove old listeners
    const newSizeInput = sizeInput.cloneNode(true);
    sizeInput.parentNode.replaceChild(newSizeInput, sizeInput);
    
    newSizeInput.addEventListener('input', (e) => {
        sizeValue.textContent = e.target.value;
    });
    
    document.getElementById('footerSettingsModal').classList.add('active');
}

function closeFooterSettingsModal(app) {
    document.getElementById('footerSettingsModal').classList.remove('active');
}

function saveFooterSettings(app) {
    app.settings.footerWidgetSize = parseInt(document.getElementById('footerWidgetSize').value) / 100;
    app.saveSettings();
    applyWidgetSizes(app);
    closeFooterSettingsModal(app);
}

function applyWidgetSizes(app) {
    document.documentElement.style.setProperty('--weather-widget-scale', app.settings.weatherWidgetSize || 1);
    document.documentElement.style.setProperty('--clock-widget-scale', app.settings.clockWidgetSize || 1);
    document.documentElement.style.setProperty('--currency-widget-scale', app.settings.currencyWidgetSize || 1);
    document.documentElement.style.setProperty('--stock-widget-scale', app.settings.stockWidgetSize || 1);
    document.documentElement.style.setProperty('--search-widget-scale', app.settings.searchWidgetSize || 1);
    document.documentElement.style.setProperty('--footer-widget-scale', app.settings.footerWidgetSize || 1);
}
