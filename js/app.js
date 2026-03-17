// ========================================
// App State Management (Modular Version)
// ========================================
class BookmarkApp {
    constructor() {
        this.categories = [];
        this.currentEditingCategory = null;
        this.currentEditingBookmark = null;
        this.currentCategoryId = null;
        this.currentEditingFooterBookmark = null;
        this.deleteCallback = null;
        this.clockDetailInterval = null;
        this.currentWeather = null;
        
        this.settings = {
            bgImage: '',
            bgPreset: '',
            categoryFontSize: 10,
            bookmarkFontSize: 12,
            pageTitle: 'Bryan\'s Start Page',
            pageTitleIcon: 'fa-bookmark',
            // Widget Visibility
            showWeatherWidget: true,
            showClockWidget: true,
            showCurrencyWidget: true,
            showStockWidget: true,
            showSearchWidget: true,
            showFooterWidget: true,
            // Widget Sizes
            weatherWidgetSize: 1,
            clockWidgetSize: 1,
            searchWidgetSize: 1,
            footerWidgetSize: 1,
            currencyWidgetSize: 1,
            stockWidgetSize: 1,
            // Weather (서핑지수 API)
            surfingApiKey: '', // 공공데이터 포털 API 키
            surfingBeachNum: '102', // 해수욕장 번호 (102: 울산, 103: 부산, 201: 강릉)
            // 표시할 정보 선택
            showTemp: true,           // 기온
            showWaterTemp: true,      // 수온
            showWave: true,           // 파도 높이
            showWaveDir: false,       // 파도 방향
            showWavePeriod: false,    // 파도 주기
            showWind: true,           // 풍속
            showWindDir: false,       // 바람 방향
            showWaveCond: true,       // 파도 상태
            // Clock
            clockFormat: 24,
            clockShowSeconds: false,
            clockDateFormat: 'ko',
            clockTimezone: 'Asia/Seoul',
            // Search
            defaultSearchEngine: 'google',
            searchEngines: {
                google: { url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
                youtube: { url: 'https://www.youtube.com/results?search_query=', icon: 'https://www.youtube.com/favicon.ico' },
                naver: { url: 'https://search.naver.com/search.naver?query=', icon: 'https://www.naver.com/favicon.ico' }
            },
            // Stock
            stockKOSPI: true,
            stockKOSDAQ: false,
            stockSP500: false,
            stockNASDAQ: false,
            stockSymbols: [],
            // Currency
            currencyUSD: true,
            currencyEUR: false,
            currencyJPY: true,
            currencyCNY: false
        };
        
        this.footerBookmarks = [];
        
        // Initialize GitHub Sync
        this.githubSync = new GitHubSync(this);
    }

    async init() {
        // Try to load from cloud first, fallback to localStorage
        if (this.githubSync.isConfigured()) {
            const syncSuccess = await this.githubSync.initialSync();
            
            if (!syncSuccess) {
                console.log('📂 Sync failed, loading from localStorage...');
                this.loadData();
                this.loadSettings();
                loadFooterBookmarks(this);
            } else {
                console.log('✅ Sync success, data loaded from cloud');
            }
        } else {
            // No GitHub sync configured, load from localStorage
            this.loadData();
            this.loadSettings();
            loadFooterBookmarks(this);
        }
        
        this.setupEventListeners();
        this.render();
        this.initTheme();
        this.applyBackgroundSettings();
        this.applyFontSizes();
        this.applyPageTitle();
        applyWidgetSizes(this);
        applyWidgetVisibility(this);
        
        // Initialize widgets using external modules
        console.log('🔄 위젯 초기화 시작...');
        initWeatherWidget(this);
        initClockWidget(this);
        initCurrencyWidget(this);
        initStockWidget(this);
        initSearchWidget(this);
        renderFooterBookmarks(this);
        console.log('✅ 위젯 초기화 완료');
        
        // Setup modal close events
        setupModalCloseEvents(this);
        
        // Restore widget order and enable drag-drop
        restoreWidgetOrder(this);
        initDragDrop(this);
        
        // Start auto-sync if configured
        if (this.githubSync.isConfigured()) {
            this.githubSync.startAutoSync(5); // Auto-sync every 5 minutes
        }
    }

    loadData() {
        const savedData = localStorage.getItem('bookmarkData');
        if (savedData) {
            this.categories = JSON.parse(savedData);
            
            // Set initial timestamp if not exists
            if (!localStorage.getItem('lastSyncTime')) {
                localStorage.setItem('lastSyncTime', new Date().toISOString());
            }
        } else {
            this.loadSampleData();
        }
    }

    saveData() {
        this.saveToLocalStorage();
        
        // Sync to GitHub if configured
        if (this.githubSync && this.githubSync.isConfigured()) {
            this.githubSync.pushData();
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('bookmarkData', JSON.stringify(this.categories));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            const saved = JSON.parse(savedSettings);
            this.settings = { ...this.settings, ...saved };
            console.log('⚙️ Settings 로드 완료:', {
                searchEngines: Object.keys(this.settings.searchEngines || {}).length,
                stockSymbols: this.settings.stockSymbols?.length || 0,
                surfingApiKey: this.settings.surfingApiKey ? '✅' : '❌'
            });
        } else {
            console.log('⚙️ Settings 없음 - 기본값 사용');
        }
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
        console.log('💾 Settings 저장:', {
            searchEngines: Object.keys(this.settings.searchEngines || {}).length,
            stockSymbols: this.settings.stockSymbols?.length || 0,
            surfingApiKey: this.settings.surfingApiKey ? '✅' : '❌'
        });
        
        // Sync to GitHub if configured
        if (this.githubSync && this.githubSync.isConfigured()) {
            this.githubSync.pushData();
        }
    }

    loadSampleData() {
        this.categories = [
            {
                id: generateId(),
                name: '업무',
                icon: 'fa-briefcase',
                color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                bgColor: '',
                collapsed: false,
                bookmarks: [
                    { id: generateId(), title: 'Google', url: 'https://www.google.com', description: '검색 엔진', icon: '' },
                    { id: generateId(), title: 'Gmail', url: 'https://mail.google.com', description: '이메일', icon: '' },
                    { id: generateId(), title: 'Google Drive', url: 'https://drive.google.com', description: '클라우드 저장소', icon: '' }
                ]
            },
            {
                id: generateId(),
                name: '개인',
                icon: 'fa-heart',
                color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                bgColor: '',
                collapsed: false,
                bookmarks: [
                    { id: generateId(), title: 'YouTube', url: 'https://www.youtube.com', description: '동영상 플랫폼', icon: '' },
                    { id: generateId(), title: 'GitHub', url: 'https://www.github.com', description: '코드 저장소', icon: '' }
                ]
            }
        ];
        this.saveData();
    }

    generateId() {
        return generateId();
    }

    getFaviconUrl(url) {
        return getFaviconUrl(url);
    }

    // Theme
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const theme = document.documentElement.getAttribute('data-theme');
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    applyPageTitle() {
        document.title = this.settings.pageTitle || 'Bryan\'s Start Page';
        const logoIcon = document.querySelector('.logo i');
        const logoH1 = document.querySelector('.logo h1');
        if (logoIcon) logoIcon.className = `fas ${this.settings.pageTitleIcon || 'fa-bookmark'}`;
        if (logoH1) logoH1.textContent = this.settings.pageTitle || 'Bryan\'s Start Page';
    }

    applyBackgroundSettings() {
        if (this.settings.bgImage) {
            document.body.style.backgroundImage = `url("${this.settings.bgImage}")`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else if (this.settings.bgPreset) {
            document.body.style.backgroundImage = this.settings.bgPreset;
            document.body.style.backgroundSize = 'cover';
        } else if (this.settings.bgCustomColor) {
            document.body.style.backgroundImage = 'none';
            document.body.style.background = this.settings.bgCustomColor;
        } else {
            document.body.style.backgroundImage = 'none';
            document.body.style.background = '';
        }
    }

    applyFontSizes() {
        const categoryFontSize = this.settings.categoryFontSize || 10;
        const bookmarkFontSize = this.settings.bookmarkFontSize || 12;
        
        document.documentElement.style.setProperty('--category-title-size', `${categoryFontSize}px`);
        document.documentElement.style.setProperty('--category-icon-size', `${Math.round(categoryFontSize * 1.3)}px`);
        document.documentElement.style.setProperty('--category-icon-font', `${Math.max(Math.round(categoryFontSize * 0.9), 8)}px`);
        document.documentElement.style.setProperty('--bookmark-title-size', `${bookmarkFontSize}px`);
        document.documentElement.style.setProperty('--bookmark-icon-size', `${Math.round(bookmarkFontSize * 1.5)}px`);
        document.documentElement.style.setProperty('--bookmark-icon-img', `${Math.round(bookmarkFontSize * 1.2)}px`);
        
        // 북마크 폰트 크기에 따라 컬럼 수 조절
        if (bookmarkFontSize <= 11) {
            document.documentElement.style.setProperty('--bookmark-columns', '5');
        } else if (bookmarkFontSize >= 16) {
            document.documentElement.style.setProperty('--bookmark-columns', '3');
        } else {
            document.documentElement.style.setProperty('--bookmark-columns', '4');
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Settings button
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.openSettingsModal());
        
        // Category modal
        document.getElementById('closeCategoryModal')?.addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategoryBtn')?.addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('saveCategoryBtn')?.addEventListener('click', () => this.saveCategory());
        
        // Bookmark modal
        document.getElementById('closeBookmarkModal')?.addEventListener('click', () => this.closeBookmarkModal());
        document.getElementById('cancelBookmarkBtn')?.addEventListener('click', () => this.closeBookmarkModal());
        document.getElementById('saveBookmarkBtn')?.addEventListener('click', () => this.saveBookmark());
        
        // Delete modal
        document.getElementById('closeDeleteModal')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => this.confirmDelete());
        
        // Settings modal
        document.getElementById('closeSettingsModal')?.addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('cancelSettingsBtn')?.addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettingsData());
        
        // Widget settings buttons
        document.getElementById('weatherSettingsBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openWeatherSettingsModal();
        });
        document.getElementById('clockSettingsBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openClockSettingsModal();
        });
        document.getElementById('searchSettingsBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSearchSettingsModal();
        });
        document.getElementById('currencySettingsBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCurrencySettingsModal();
        });

        // Widget settings modals - Weather
        document.getElementById('closeWeatherSettingsModal')?.addEventListener('click', () => this.closeWeatherSettingsModal());
        document.getElementById('cancelWeatherSettingsBtn')?.addEventListener('click', () => this.closeWeatherSettingsModal());
        document.getElementById('saveWeatherSettingsBtn')?.addEventListener('click', () => this.saveWeatherSettings());

        // Widget settings modals - Clock
        document.getElementById('closeClockSettingsModal')?.addEventListener('click', () => this.closeClockSettingsModal());
        document.getElementById('cancelClockSettingsBtn')?.addEventListener('click', () => this.closeClockSettingsModal());
        document.getElementById('saveClockSettingsBtn')?.addEventListener('click', () => this.saveClockSettings());

        // Widget settings modals - Search
        document.getElementById('closeSearchSettingsModal')?.addEventListener('click', () => this.closeSearchSettingsModal());
        document.getElementById('cancelSearchSettingsBtn')?.addEventListener('click', () => this.closeSearchSettingsModal());
        document.getElementById('saveSearchSettingsBtn')?.addEventListener('click', () => this.saveSearchSettings());
        document.getElementById('addSearchEngineBtn')?.addEventListener('click', () => this.addSearchEngine());

        // Widget settings modals - Currency
        document.getElementById('closeCurrencySettingsModal')?.addEventListener('click', () => this.closeCurrencySettingsModal());
        document.getElementById('cancelCurrencySettingsBtn')?.addEventListener('click', () => this.closeCurrencySettingsModal());
        document.getElementById('saveCurrencySettingsBtn')?.addEventListener('click', () => this.saveCurrencySettings());

        // Widget settings modals - Stock
        document.getElementById('closeStockSettingsModal')?.addEventListener('click', () => this.closeStockSettingsModal());
        document.getElementById('cancelStockSettingsBtn')?.addEventListener('click', () => this.closeStockSettingsModal());
        document.getElementById('saveStockSettingsBtn')?.addEventListener('click', () => this.saveStockSettings());
        document.getElementById('addStockSymbolBtn')?.addEventListener('click', () => this.addStockSymbol());

        // Backup & Restore
        document.getElementById('backupBtn')?.addEventListener('click', () => this.backupData());
        document.getElementById('restoreBtn')?.addEventListener('click', () => {
            document.getElementById('restoreFileInput').click();
        });
        document.getElementById('restoreFileInput')?.addEventListener('change', (e) => this.restoreData(e));
        
        // GitHub Sync
        document.getElementById('connectGithubBtn')?.addEventListener('click', () => this.connectGitHub());
        document.getElementById('disconnectGithubBtn')?.addEventListener('click', () => this.disconnectGitHub());
        document.getElementById('syncNowBtn')?.addEventListener('click', () => this.syncNow());
        document.getElementById('pullDataBtn')?.addEventListener('click', () => this.pullFromCloud());

        // Close modals on outside click (prevent closing when text dragging)
        document.querySelectorAll('.modal').forEach(modal => {
            let mouseDownOnBackdrop = false;
            
            modal.addEventListener('mousedown', (e) => {
                // Check if mousedown is directly on modal backdrop
                mouseDownOnBackdrop = (e.target === modal);
            });
            
            modal.addEventListener('mouseup', (e) => {
                // Only close if mousedown AND mouseup both happened on backdrop
                if (e.target === modal && mouseDownOnBackdrop) {
                    modal.classList.remove('active');
                }
                mouseDownOnBackdrop = false;
            });
        });

        // Enter key handlers
        document.getElementById('categoryName')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveCategory();
        });

        // Color palette selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                document.getElementById('categoryColorValue').value = e.currentTarget.dataset.color;
            });
        });

        // Icon picker selection
        document.querySelectorAll('.icon-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                document.getElementById('categoryIcon').value = e.currentTarget.dataset.icon;
            });
        });

        // Category background color picker
        document.getElementById('categoryBgPicker')?.addEventListener('input', (e) => {
            document.getElementById('categoryBgColor').value = e.target.value;
        });

        document.getElementById('categoryBgColor')?.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.startsWith('#') && value.length === 7) {
                document.getElementById('categoryBgPicker').value = value;
            }
        });

        // Background color picker
        document.getElementById('bgColorPicker')?.addEventListener('input', (e) => {
            document.getElementById('bgCustomColor').value = e.target.value;
        });

        document.getElementById('bgCustomColor')?.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.startsWith('#') && value.length === 7) {
                document.getElementById('bgColorPicker').value = value;
            }
        });

        // Background preset selection
        document.querySelectorAll('.bg-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                document.getElementById('bgImageUrl').value = '';
                document.getElementById('bgCustomColor').value = '';
            });
        });

        // Font size sliders
        const categorySlider = document.getElementById('categoryFontSize');
        const categoryInput = document.getElementById('categoryFontSizeInput');
        const categoryValue = document.getElementById('categoryFontSizeValue');
        
        if (categorySlider && categoryInput && categoryValue) {
            categorySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                categoryInput.value = value;
                categoryValue.textContent = value;
            });
            
            categoryInput.addEventListener('input', (e) => {
                const value = Math.max(6, Math.min(20, parseInt(e.target.value) || 10));
                categorySlider.value = value;
                categoryValue.textContent = value;
                e.target.value = value;
            });
        }

        const bookmarkSlider = document.getElementById('bookmarkFontSize');
        const bookmarkInput = document.getElementById('bookmarkFontSizeInput');
        const bookmarkValue = document.getElementById('bookmarkFontSizeValue');
        
        if (bookmarkSlider && bookmarkInput && bookmarkValue) {
            bookmarkSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                bookmarkInput.value = value;
                bookmarkValue.textContent = value;
            });
            
            bookmarkInput.addEventListener('input', (e) => {
                const value = Math.max(8, Math.min(20, parseInt(e.target.value) || 12));
                bookmarkSlider.value = value;
                bookmarkValue.textContent = value;
                e.target.value = value;
            });
        }

        document.getElementById('bookmarkUrl')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveBookmark();
        });
        
        // Search input
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    render() {
        const wrapper = document.getElementById('categoriesWrapper');
        if (!wrapper) return;
        
        wrapper.innerHTML = '';

        this.categories.forEach((category, categoryIndex) => {
            wrapper.appendChild(this.createCategoryCard(category, categoryIndex));
        });

        // Add category card
        const addCard = document.createElement('div');
        addCard.className = 'add-category-card';
        addCard.innerHTML = `
            <i class="fas fa-plus"></i>
            <span>카테고리 추가</span>
        `;
        addCard.addEventListener('click', () => this.openCategoryModal());
        wrapper.appendChild(addCard);

        this.setupDragAndDrop();
    }

    createCategoryCard(category, categoryIndex) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('draggable', 'true');
        card.dataset.categoryId = category.id;
        
        if (category.bgColor) {
            card.style.backgroundColor = category.bgColor;
        }
        
        const iconStyle = category.color ? `style="background: ${category.color}"` : '';
        
        card.innerHTML = `
            <div class="category-header">
                <div class="category-title">
                    <div class="category-icon" ${iconStyle}>
                        <i class="fas ${category.icon || 'fa-folder'}"></i>
                    </div>
                    <h2>${category.name}</h2>
                </div>
                <div class="category-actions">
                    <button class="icon-btn collapse-btn ${category.collapsed ? 'collapsed' : ''}" onclick="app.toggleCategory('${category.id}')">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <button class="icon-btn" onclick="app.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn" onclick="app.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="bookmarks-grid ${category.collapsed ? 'collapsed' : ''}" id="bookmarks-${category.id}">
                ${category.bookmarks.map((bookmark, bookmarkIndex) => this.createBookmarkHTML(bookmark, category.id, bookmarkIndex)).join('')}
                <div class="add-bookmark-btn" onclick="app.openBookmarkModal('${category.id}')">
                    <i class="fas fa-plus"></i>
                    <span>북마크 추가</span>
                </div>
            </div>
        `;
        
        return card;
    }

    createBookmarkHTML(bookmark, categoryId, bookmarkIndex) {
        const faviconUrl = this.getFaviconUrl(bookmark.url);
        
        return `
            <div class="bookmark-card" draggable="true" data-bookmark-id="${bookmark.id}" data-category-id="${categoryId}">
                <div class="bookmark-content" onclick="app.openBookmark('${bookmark.url.replace(/'/g, "\\'")}')">
                    <div class="bookmark-favicon">
                        <img src="${faviconUrl}" alt="${bookmark.title}" 
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><text y=%2218%22 font-size=%2220%22>🔖</text></svg>'">
                    </div>
                    <div class="bookmark-info">
                        <div class="bookmark-title">${bookmark.title}</div>
                        ${bookmark.description ? `<div class="bookmark-description">${bookmark.description}</div>` : ''}
                    </div>
                </div>
                <div class="bookmark-actions">
                    <button class="icon-btn-small" onclick="event.stopPropagation(); app.editBookmark('${categoryId}', '${bookmark.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn-small" onclick="event.stopPropagation(); app.deleteBookmark('${categoryId}', '${bookmark.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Category management methods continue in backup file...
    // Due to file size, copying rest of methods from app.backup.js lines 419-1360
    
    toggleCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            category.collapsed = !category.collapsed;
            this.saveData();
            this.render();
        }
    }

    openCategoryModal(categoryId = null) {
        document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));

        if (categoryId) {
            this.currentEditingCategory = categoryId;
            const category = this.categories.find(c => c.id === categoryId);
            
            if (category) {
                document.getElementById('categoryModalTitle').textContent = '카테고리 수정';
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryIcon').value = category.icon || 'fa-folder';
                
                const iconOption = document.querySelector(`.icon-option[data-icon="${category.icon}"]`);
                if (iconOption) iconOption.classList.add('selected');
                
                document.getElementById('categoryColorValue').value = category.color || '';
                const colorOption = document.querySelector(`.color-option[data-color="${category.color}"]`);
                if (colorOption) {
                    colorOption.classList.add('selected');
                } else {
                    const defaultColor = document.querySelector('.color-option[data-color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"]');
                    if (defaultColor) defaultColor.classList.add('selected');
                }
                
                document.getElementById('categoryBgColor').value = category.bgColor || '';
                if (category.bgColor && category.bgColor.startsWith('#')) {
                    document.getElementById('categoryBgPicker').value = category.bgColor;
                }
            }
        } else {
            this.currentEditingCategory = null;
            document.getElementById('categoryModalTitle').textContent = '카테고리 추가';
            document.getElementById('categoryName').value = '';
            document.getElementById('categoryIcon').value = 'fa-folder';
            document.getElementById('categoryColorValue').value = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            document.getElementById('categoryBgColor').value = '';
            
            const defaultIcon = document.querySelector('.icon-option[data-icon="fa-folder"]');
            if (defaultIcon) defaultIcon.classList.add('selected');
            
            const defaultColor = document.querySelector('.color-option[data-color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"]');
            if (defaultColor) defaultColor.classList.add('selected');
        }

        document.getElementById('categoryModal').classList.add('active');
        document.getElementById('categoryName').focus();
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
        this.currentEditingCategory = null;
    }

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        
        if (!name) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }

        const icon = document.getElementById('categoryIcon').value || 'fa-folder';
        const color = document.getElementById('categoryColorValue').value || '';
        const bgColor = document.getElementById('categoryBgColor').value || '';

        if (this.currentEditingCategory) {
            const category = this.categories.find(c => c.id === this.currentEditingCategory);
            if (category) {
                category.name = name;
                category.icon = icon;
                category.color = color;
                category.bgColor = bgColor;
            }
        } else {
            this.categories.push({
                id: this.generateId(),
                name: name,
                icon: icon,
                color: color,
                bgColor: bgColor,
                collapsed: false,
                bookmarks: []
            });
        }

        this.saveData();
        this.render();
        this.closeCategoryModal();
    }

    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    deleteCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        this.openDeleteModal(
            `"${category.name}" 카테고리와 모든 북마크를 삭제하시겠습니까?`,
            () => {
                this.categories = this.categories.filter(c => c.id !== categoryId);
                this.saveData();
                this.render();
            }
        );
    }

    openBookmarkModal(categoryId, bookmarkId = null) {
        this.currentCategoryId = categoryId;

        if (bookmarkId) {
            const category = this.categories.find(c => c.id === categoryId);
            const bookmark = category.bookmarks.find(b => b.id === bookmarkId);
            
            if (bookmark) {
                document.getElementById('bookmarkModalTitle').textContent = '북마크 수정';
                document.getElementById('bookmarkTitle').value = bookmark.title;
                document.getElementById('bookmarkUrl').value = bookmark.url;
                document.getElementById('bookmarkDescription').value = bookmark.description || '';
                this.currentEditingBookmark = bookmarkId;
            }
        } else {
            document.getElementById('bookmarkModalTitle').textContent = '북마크 추가';
            document.getElementById('bookmarkTitle').value = '';
            document.getElementById('bookmarkUrl').value = '';
            document.getElementById('bookmarkDescription').value = '';
            this.currentEditingBookmark = null;
        }

        document.getElementById('bookmarkModal').classList.add('active');
        document.getElementById('bookmarkTitle').focus();
    }

    closeBookmarkModal() {
        document.getElementById('bookmarkModal').classList.remove('active');
        this.currentEditingBookmark = null;
        this.currentCategoryId = null;
    }

    saveBookmark() {
        const title = document.getElementById('bookmarkTitle').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        const description = document.getElementById('bookmarkDescription').value.trim();

        if (!title || !url) {
            alert('제목과 URL을 모두 입력해주세요.');
            return;
        }

        const category = this.categories.find(c => c.id === this.currentCategoryId);
        if (!category) return;

        if (this.currentEditingBookmark) {
            const bookmark = category.bookmarks.find(b => b.id === this.currentEditingBookmark);
            if (bookmark) {
                bookmark.title = title;
                bookmark.url = url;
                bookmark.description = description;
            }
        } else {
            category.bookmarks.push({
                id: this.generateId(),
                title: title,
                url: url,
                description: description,
                icon: ''
            });
        }

        this.saveData();
        this.render();
        this.closeBookmarkModal();
    }

    editBookmark(categoryId, bookmarkId) {
        this.openBookmarkModal(categoryId, bookmarkId);
    }
    
    openBookmark(url) {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    deleteBookmark(categoryId, bookmarkId) {
        const category = this.categories.find(c => c.id === categoryId);
        const bookmark = category.bookmarks.find(b => b.id === bookmarkId);
        
        this.openDeleteModal(
            `"${bookmark.title}" 북마크를 삭제하시겠습니까?`,
            () => {
                category.bookmarks = category.bookmarks.filter(b => b.id !== bookmarkId);
                this.saveData();
                this.render();
            }
        );
    }

    openDeleteModal(message, callback) {
        document.getElementById('deleteMessage').textContent = message;
        this.deleteCallback = callback;
        document.getElementById('deleteModal').classList.add('active');
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.deleteCallback = null;
    }

    confirmDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
            this.deleteCallback = null;
        }
        this.closeDeleteModal();
    }

    openSettingsModal() {
        // Widget visibility
        document.getElementById('showWeatherWidget').checked = this.settings.showWeatherWidget !== false;
        document.getElementById('showClockWidget').checked = this.settings.showClockWidget !== false;
        document.getElementById('showCurrencyWidget').checked = this.settings.showCurrencyWidget !== false;
        document.getElementById('showStockWidget').checked = this.settings.showStockWidget !== false;
        document.getElementById('showSearchWidget').checked = this.settings.showSearchWidget !== false;
        document.getElementById('showFooterWidget').checked = this.settings.showFooterWidget !== false;
        
        // Page title
        document.getElementById('pageTitle').value = this.settings.pageTitle;
        document.getElementById('pageTitleIcon').value = this.settings.pageTitleIcon;
        
        // Font sizes
        document.getElementById('categoryFontSize').value = this.settings.categoryFontSize;
        document.getElementById('categoryFontSizeInput').value = this.settings.categoryFontSize;
        document.getElementById('categoryFontSizeValue').textContent = this.settings.categoryFontSize;
        
        document.getElementById('bookmarkFontSize').value = this.settings.bookmarkFontSize;
        document.getElementById('bookmarkFontSizeInput').value = this.settings.bookmarkFontSize;
        document.getElementById('bookmarkFontSizeValue').textContent = this.settings.bookmarkFontSize;
        
        // Background
        document.getElementById('bgImageUrl').value = this.settings.bgImage || '';
        document.getElementById('bgCustomColor').value = this.settings.bgCustomColor || '';
        
        // Surfing API Key
        const surfingApiKeyInput = document.getElementById('surfingApiKey');
        if (surfingApiKeyInput) {
            surfingApiKeyInput.value = this.settings.surfingApiKey || '';
        }
        
        const surfingObsCodeInput = document.getElementById('surfingObsCode');
        if (surfingObsCodeInput) {
            surfingObsCodeInput.value = this.settings.surfingObsCode || 'TW_0062';
        }
        
        if (this.settings.bgCustomColor && this.settings.bgCustomColor.startsWith('#')) {
            document.getElementById('bgColorPicker').value = this.settings.bgCustomColor;
        }
        
        // Background preset
        document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('selected'));
        if (this.settings.bgPreset) {
            const preset = document.querySelector(`.bg-preset[data-bg="${this.settings.bgPreset}"]`);
            if (preset) preset.classList.add('selected');
        } else {
            const nonePreset = document.querySelector('.bg-preset[data-bg=""]');
            if (nonePreset) nonePreset.classList.add('selected');
        }
        
        // GitHub Sync Status
        this.updateGitHubSyncUI();
        
        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettingsData() {
        // Widget visibility
        this.settings.showWeatherWidget = document.getElementById('showWeatherWidget').checked;
        this.settings.showClockWidget = document.getElementById('showClockWidget').checked;
        this.settings.showCurrencyWidget = document.getElementById('showCurrencyWidget').checked;
        this.settings.showStockWidget = document.getElementById('showStockWidget').checked;
        this.settings.showSearchWidget = document.getElementById('showSearchWidget').checked;
        this.settings.showFooterWidget = document.getElementById('showFooterWidget').checked;
        
        // Background
        this.settings.bgImage = document.getElementById('bgImageUrl').value.trim();
        this.settings.bgCustomColor = document.getElementById('bgCustomColor').value.trim();
        
        // Surfing API Key
        const surfingApiKeyInput = document.getElementById('surfingApiKey');
        if (surfingApiKeyInput) {
            this.settings.surfingApiKey = surfingApiKeyInput.value.trim();
        }
        
        const surfingObsCodeInput = document.getElementById('surfingObsCode');
        if (surfingObsCodeInput) {
            this.settings.surfingObsCode = surfingObsCodeInput.value.trim() || 'TW_0062';
        }
        
        const selectedPreset = document.querySelector('.bg-preset.selected');
        this.settings.bgPreset = selectedPreset ? selectedPreset.dataset.bg : '';
        
        // Page title
        this.settings.pageTitle = document.getElementById('pageTitle').value.trim();
        this.settings.pageTitleIcon = document.getElementById('pageTitleIcon').value.trim();
        
        // Font sizes
        this.settings.categoryFontSize = parseInt(document.getElementById('categoryFontSizeInput').value);
        this.settings.bookmarkFontSize = parseInt(document.getElementById('bookmarkFontSizeInput').value);
        
        this.saveSettings();
        this.applyBackgroundSettings();
        this.applyFontSizes();
        this.applyPageTitle();
        applyWidgetVisibility(this);
        this.closeSettingsModal();
    }

    handleSearch(query) {
        query = query.toLowerCase().trim();
        
        if (!query) {
            this.render();
            return;
        }
        
        const wrapper = document.getElementById('categoriesWrapper');
        wrapper.innerHTML = '';
        
        this.categories.forEach(category => {
            const matchingBookmarks = category.bookmarks.filter(bookmark => 
                bookmark.title.toLowerCase().includes(query) ||
                bookmark.description.toLowerCase().includes(query) ||
                bookmark.url.toLowerCase().includes(query)
            );
            
            if (matchingBookmarks.length > 0) {
                const card = document.createElement('div');
                card.className = 'category-card';
                const iconStyle = category.color ? `style="background: ${category.color}"` : '';
                
                card.innerHTML = `
                    <div class="category-header">
                        <div class="category-title">
                            <div class="category-icon" ${iconStyle}>
                                <i class="fas ${category.icon || 'fa-folder'}"></i>
                            </div>
                            <h2>${category.name}</h2>
                        </div>
                    </div>
                    <div class="bookmarks-grid">
                        ${matchingBookmarks.map(bookmark => this.createBookmarkHTML(bookmark, category.id)).join('')}
                    </div>
                `;
                
                wrapper.appendChild(card);
            }
        });
    }

    setupDragAndDrop() {
        // Category drag and drop (Column 레이아웃용)
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                // 카테고리 헤더나 버튼을 드래그하는 경우만 카테고리 이동
                if (e.target.classList.contains('category-card')) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('categoryId', card.dataset.categoryId);
                    card.classList.add('dragging');
                }
            });
            
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                document.querySelectorAll('.drag-over-category').forEach(el => {
                    el.classList.remove('drag-over-category');
                });
                document.querySelectorAll('.drag-over-grid').forEach(el => {
                    el.classList.remove('drag-over-grid');
                });
            });
            
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // 북마크를 드래그 중인지 확인
                const bookmarkId = e.dataTransfer.types.includes('bookmarkid') || 
                                  e.dataTransfer.types.includes('text/bookmarkid');
                
                if (bookmarkId) {
                    // 북마크를 드래그 중이면 카테고리에 드롭 가능 표시
                    card.classList.add('drag-over-category');
                    
                    // bookmarks-grid 영역에 드롭 가능 표시
                    const bookmarksGrid = card.querySelector('.bookmarks-grid');
                    if (bookmarksGrid && !bookmarksGrid.classList.contains('collapsed')) {
                        bookmarksGrid.classList.add('drag-over-grid');
                    }
                }
            });
            
            card.addEventListener('dragleave', (e) => {
                // 카테고리를 완전히 벗어났을 때만 클래스 제거
                if (!card.contains(e.relatedTarget)) {
                    card.classList.remove('drag-over-category');
                    const bookmarksGrid = card.querySelector('.bookmarks-grid');
                    if (bookmarksGrid) {
                        bookmarksGrid.classList.remove('drag-over-grid');
                    }
                }
            });
            
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over-category');
                
                const bookmarksGrid = card.querySelector('.bookmarks-grid');
                if (bookmarksGrid) {
                    bookmarksGrid.classList.remove('drag-over-grid');
                }
                
                const bookmarkId = e.dataTransfer.getData('bookmarkId');
                const sourceCategoryId = e.dataTransfer.getData('sourceCategoryId');
                const targetCategoryId = card.dataset.categoryId;
                
                if (bookmarkId) {
                    // 북마크를 카테고리로 드롭
                    console.log('🎯 카테고리 카드로 북마크 드롭:', {
                        bookmarkId,
                        from: sourceCategoryId,
                        to: targetCategoryId
                    });
                    this.moveBookmarkToCategory(bookmarkId, sourceCategoryId, targetCategoryId);
                } else {
                    // 카테고리끼리 드롭
                    const draggedId = e.dataTransfer.getData('categoryId');
                    
                    if (draggedId && draggedId !== targetCategoryId) {
                        const draggedIndex = this.categories.findIndex(c => c.id === draggedId);
                        const targetIndex = this.categories.findIndex(c => c.id === targetCategoryId);
                        
                        const [removed] = this.categories.splice(draggedIndex, 1);
                        this.categories.splice(targetIndex, 0, removed);
                        
                        this.saveData();
                        this.render();
                    }
                }
            });
        });
        
        // Bookmark drag and drop
        const bookmarkCards = document.querySelectorAll('.bookmark-card');
        
        bookmarkCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.stopPropagation();
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('bookmarkId', card.dataset.bookmarkId);
                e.dataTransfer.setData('sourceCategoryId', card.dataset.categoryId);
                e.dataTransfer.setData('text/bookmarkId', card.dataset.bookmarkId); // 타입 확인용
                card.classList.add('dragging');
                
                console.log('🎯 북마크 드래그 시작:', {
                    bookmarkId: card.dataset.bookmarkId,
                    categoryId: card.dataset.categoryId
                });
            });
            
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                document.querySelectorAll('.drag-over-category').forEach(el => {
                    el.classList.remove('drag-over-category');
                });
                document.querySelectorAll('.drag-over-grid').forEach(el => {
                    el.classList.remove('drag-over-grid');
                });
            });
            
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
            });
            
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const bookmarkId = e.dataTransfer.getData('bookmarkId');
                const sourceCategoryId = e.dataTransfer.getData('sourceCategoryId');
                const targetCategoryId = card.dataset.categoryId;
                const targetBookmarkId = card.dataset.bookmarkId;
                
                if (bookmarkId === targetBookmarkId) return;
                
                if (sourceCategoryId === targetCategoryId) {
                    // 같은 카테고리 내에서 순서 변경
                    const category = this.categories.find(c => c.id === sourceCategoryId);
                    const draggedIndex = category.bookmarks.findIndex(b => b.id === bookmarkId);
                    const targetIndex = category.bookmarks.findIndex(b => b.id === targetBookmarkId);
                    
                    const [removed] = category.bookmarks.splice(draggedIndex, 1);
                    category.bookmarks.splice(targetIndex, 0, removed);
                    
                    console.log('📝 같은 카테고리 내 순서 변경');
                } else {
                    // 다른 카테고리로 이동
                    console.log('🔄 다른 카테고리로 이동 시작:', {
                        bookmarkId,
                        from: sourceCategoryId,
                        to: targetCategoryId
                    });
                    
                    const sourceCategory = this.categories.find(c => c.id === sourceCategoryId);
                    const targetCategory = this.categories.find(c => c.id === targetCategoryId);
                    
                    if (!sourceCategory || !targetCategory) {
                        console.error('❌ 카테고리를 찾을 수 없음:', {
                            sourceCategory: !!sourceCategory,
                            targetCategory: !!targetCategory
                        });
                        return;
                    }
                    
                    const bookmarkIndex = sourceCategory.bookmarks.findIndex(b => b.id === bookmarkId);
                    if (bookmarkIndex === -1) {
                        console.error('❌ 북마크를 찾을 수 없음:', bookmarkId);
                        return;
                    }
                    
                    const [bookmark] = sourceCategory.bookmarks.splice(bookmarkIndex, 1);
                    
                    const targetIndex = targetCategory.bookmarks.findIndex(b => b.id === targetBookmarkId);
                    targetCategory.bookmarks.splice(targetIndex, 0, bookmark);
                    
                    console.log('✅ 다른 카테고리로 이동 완료:', {
                        bookmark: bookmark.title,
                        from: sourceCategory.name,
                        to: targetCategory.name
                    });
                }
                
                this.saveData();
                this.render();
            });
        });
        
        // bookmarks-grid 영역에도 드롭 리스너 추가 (빈 공간에 드롭 가능하게)
        const bookmarksGrids = document.querySelectorAll('.bookmarks-grid');
        
        bookmarksGrids.forEach(grid => {
            grid.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // 북마크를 드래그 중인지 확인
                const bookmarkId = e.dataTransfer.types.includes('bookmarkid') || 
                                  e.dataTransfer.types.includes('text/bookmarkid');
                
                if (bookmarkId && !grid.classList.contains('collapsed')) {
                    grid.classList.add('drag-over-grid');
                }
            });
            
            grid.addEventListener('dragleave', (e) => {
                if (!grid.contains(e.relatedTarget)) {
                    grid.classList.remove('drag-over-grid');
                }
            });
            
            grid.addEventListener('drop', (e) => {
                // 빈 공간에 드롭했을 때 (북마크 카드가 아닌 경우)
                if (e.target.classList.contains('bookmarks-grid') || 
                    e.target.classList.contains('add-bookmark-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    grid.classList.remove('drag-over-grid');
                    
                    const bookmarkId = e.dataTransfer.getData('bookmarkId');
                    const sourceCategoryId = e.dataTransfer.getData('sourceCategoryId');
                    
                    // 현재 grid의 카테고리 ID 찾기
                    const targetCategoryCard = grid.closest('.category-card');
                    if (!targetCategoryCard) return;
                    
                    const targetCategoryId = targetCategoryCard.dataset.categoryId;
                    
                    if (bookmarkId && sourceCategoryId !== targetCategoryId) {
                        console.log('🎯 빈 공간에 북마크 드롭:', {
                            bookmarkId,
                            from: sourceCategoryId,
                            to: targetCategoryId
                        });
                        this.moveBookmarkToCategory(bookmarkId, sourceCategoryId, targetCategoryId);
                    }
                }
            });
        });
    }
    
    // 북마크를 카테고리로 이동하는 헬퍼 함수
    moveBookmarkToCategory(bookmarkId, sourceCategoryId, targetCategoryId) {
        if (sourceCategoryId === targetCategoryId) return;
        
        const sourceCategory = this.categories.find(c => c.id === sourceCategoryId);
        const targetCategory = this.categories.find(c => c.id === targetCategoryId);
        
        if (!sourceCategory || !targetCategory) return;
        
        const bookmarkIndex = sourceCategory.bookmarks.findIndex(b => b.id === bookmarkId);
        if (bookmarkIndex === -1) return;
        
        const [bookmark] = sourceCategory.bookmarks.splice(bookmarkIndex, 1);
        targetCategory.bookmarks.push(bookmark);
        
        console.log('✅ 북마크를 카테고리로 이동:', {
            bookmark: bookmark.title,
            from: sourceCategory.name,
            to: targetCategory.name
        });
        
        this.saveData();
        this.render();
    }

    backupData() {
        const backupData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            categories: this.categories,
            settings: this.settings,
            footerBookmarks: this.footerBookmarks
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `bryan-startpage-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('백업 파일이 다운로드되었습니다!');
    }

    restoreData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (confirm('기존 데이터를 모두 덮어쓰시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
                    this.categories = backupData.categories || [];
                    this.settings = { ...this.settings, ...backupData.settings };
                    this.footerBookmarks = backupData.footerBookmarks || [];
                    
                    this.saveData();
                    this.saveSettings();
                    saveFooterBookmarks(this);
                    
                    alert('백업이 복원되었습니다! 페이지를 새로고침합니다.');
                    location.reload();
                }
            } catch (error) {
                alert('백업 파일을 읽는 중 오류가 발생했습니다.\n\n올바른 백업 파일인지 확인해주세요.');
                console.error('Restore error:', error);
            }
        };
        reader.readAsText(file);
        
        event.target.value = '';
    }

    // Widget Settings Methods
    openWeatherSettingsModal() {
        // 🏄 서핑 API 설정
        document.getElementById('surfingApiKey').value = this.settings.surfingApiKey || '';
        document.getElementById('surfingBeachNum').value = this.settings.surfingBeachNum || '102';
        
        // 표시 정보 체크박스 설정
        document.getElementById('showTemp').checked = this.settings.showTemp !== false;
        document.getElementById('showWaterTemp').checked = this.settings.showWaterTemp !== false;
        document.getElementById('showWave').checked = this.settings.showWave !== false;
        document.getElementById('showWaveDir').checked = this.settings.showWaveDir || false;
        document.getElementById('showWavePeriod').checked = this.settings.showWavePeriod || false;
        document.getElementById('showWind').checked = this.settings.showWind !== false;
        document.getElementById('showWindDir').checked = this.settings.showWindDir || false;
        document.getElementById('showWaveCond').checked = this.settings.showWaveCond !== false;
        
        // 위젯 크기
        document.getElementById('weatherWidgetSize').value = (this.settings.weatherWidgetSize || 1) * 100;
        document.getElementById('weatherWidgetSizeValue').textContent = Math.round((this.settings.weatherWidgetSize || 1) * 100);
        
        const sizeInput = document.getElementById('weatherWidgetSize');
        const sizeValue = document.getElementById('weatherWidgetSizeValue');
        const newInput = sizeInput.cloneNode(true);
        sizeInput.parentNode.replaceChild(newInput, sizeInput);
        newInput.addEventListener('input', (e) => sizeValue.textContent = e.target.value);
        
        document.getElementById('weatherSettingsModal').classList.add('active');
    }

    closeWeatherSettingsModal() {
        document.getElementById('weatherSettingsModal').classList.remove('active');
    }

    saveWeatherSettings() {
        // 🏄 서핑 API 설정 저장
        this.settings.surfingApiKey = document.getElementById('surfingApiKey').value.trim();
        this.settings.surfingBeachNum = document.getElementById('surfingBeachNum').value;
        
        // 표시 정보 체크박스 저장
        this.settings.showTemp = document.getElementById('showTemp').checked;
        this.settings.showWaterTemp = document.getElementById('showWaterTemp').checked;
        this.settings.showWave = document.getElementById('showWave').checked;
        this.settings.showWaveDir = document.getElementById('showWaveDir').checked;
        this.settings.showWavePeriod = document.getElementById('showWavePeriod').checked;
        this.settings.showWind = document.getElementById('showWind').checked;
        this.settings.showWindDir = document.getElementById('showWindDir').checked;
        this.settings.showWaveCond = document.getElementById('showWaveCond').checked;
        
        // 위젯 크기
        this.settings.weatherWidgetSize = parseInt(document.getElementById('weatherWidgetSize').value) / 100;
        
        console.log('💾 날씨 설정 저장:', {
            apiKey: this.settings.surfingApiKey ? '✅ 설정됨' : '❌ 없음',
            beach: this.settings.surfingBeachNum,
            display: {
                temp: this.settings.showTemp,
                waterTemp: this.settings.showWaterTemp,
                wave: this.settings.showWave,
                waveDir: this.settings.showWaveDir,
                wavePeriod: this.settings.showWavePeriod,
                wind: this.settings.showWind,
                windDir: this.settings.showWindDir,
                waveCond: this.settings.showWaveCond
            }
        });
        
        this.saveSettings();
        applyWidgetSizes(this);
        this.closeWeatherSettingsModal();
        
        // 🔄 위젯 새로고침
        initWeatherWidget(this);
    }

    openClockSettingsModal() {
        document.getElementById('clockTimezone').value = this.settings.clockTimezone || 'Asia/Seoul';
        document.getElementById('clockFormat').value = this.settings.clockFormat || 24;
        document.getElementById('clockShowSeconds').checked = this.settings.clockShowSeconds || false;
        document.getElementById('clockDateFormat').value = this.settings.clockDateFormat || 'ko';
        document.getElementById('clockWidgetSize').value = (this.settings.clockWidgetSize || 1) * 100;
        document.getElementById('clockWidgetSizeValue').textContent = Math.round((this.settings.clockWidgetSize || 1) * 100);
        
        const sizeInput = document.getElementById('clockWidgetSize');
        const sizeValue = document.getElementById('clockWidgetSizeValue');
        const newInput = sizeInput.cloneNode(true);
        sizeInput.parentNode.replaceChild(newInput, sizeInput);
        newInput.addEventListener('input', (e) => sizeValue.textContent = e.target.value);
        
        document.getElementById('clockSettingsModal').classList.add('active');
    }

    closeClockSettingsModal() {
        document.getElementById('clockSettingsModal').classList.remove('active');
    }

    saveClockSettings() {
        this.settings.clockTimezone = document.getElementById('clockTimezone').value;
        this.settings.clockFormat = parseInt(document.getElementById('clockFormat').value);
        this.settings.clockShowSeconds = document.getElementById('clockShowSeconds').checked;
        this.settings.clockDateFormat = document.getElementById('clockDateFormat').value;
        this.settings.clockWidgetSize = parseInt(document.getElementById('clockWidgetSize').value) / 100;
        
        this.saveSettings();
        applyWidgetSizes(this);
        this.closeClockSettingsModal();
        updateClock(this);
    }

    openSearchSettingsModal() {
        const listContainer = document.getElementById('searchEngineList');
        listContainer.innerHTML = '';
        
        Object.entries(this.settings.searchEngines || {}).forEach(([key, engineData]) => {
            const url = engineData.url || engineData;
            const icon = engineData.icon || '';
            
            const item = document.createElement('div');
            item.className = 'search-engine-item';
            item.style.display = 'grid';
            item.style.gridTemplateColumns = '1fr 2fr 2fr auto';
            item.style.gap = '8px';
            item.style.marginBottom = '8px';
            item.style.alignItems = 'center';
            
            item.innerHTML = `
                <input type="text" class="form-input" value="${key}" placeholder="google" data-key="${key}" style="padding: 8px;">
                <input type="text" class="form-input" value="${url}" placeholder="https://www.google.com/search?q=" data-url="${key}" style="padding: 8px;">
                <input type="text" class="form-input" value="${icon}" placeholder="https://www.google.com/favicon.ico" data-icon="${key}" style="padding: 8px;">
                <button class="btn-secondary remove-search-engine" data-remove="${key}" style="padding: 8px 12px;">삭제</button>
            `;
            listContainer.appendChild(item);
            
            item.querySelector('.remove-search-engine').addEventListener('click', () => {
                this.removeSearchEngine(key);
            });
        });
        
        document.getElementById('searchWidgetSize').value = (this.settings.searchWidgetSize || 1) * 100;
        document.getElementById('searchWidgetSizeValue').textContent = Math.round((this.settings.searchWidgetSize || 1) * 100);
        
        const sizeInput = document.getElementById('searchWidgetSize');
        const sizeValue = document.getElementById('searchWidgetSizeValue');
        const newInput = sizeInput.cloneNode(true);
        sizeInput.parentNode.replaceChild(newInput, sizeInput);
        newInput.addEventListener('input', (e) => sizeValue.textContent = e.target.value);
        
        document.getElementById('searchSettingsModal').classList.add('active');
        
        console.log('🔍 검색 설정 모달 열기:', {
            count: Object.keys(this.settings.searchEngines || {}).length,
            engines: Object.keys(this.settings.searchEngines || {}).join(', ')
        });
    }

    closeSearchSettingsModal() {
        document.getElementById('searchSettingsModal').classList.remove('active');
    }

    saveSearchSettings() {
        const newEngines = {};
        document.querySelectorAll('.search-engine-item').forEach(item => {
            const keyInput = item.querySelector('[data-key]');
            const urlInput = item.querySelector('[data-url]');
            const iconInput = item.querySelector('[data-icon]');
            const key = keyInput.value.trim();
            const url = urlInput.value.trim();
            const icon = iconInput.value.trim();
            if (key && url) {
                newEngines[key] = { url, icon };
            }
        });
        
        this.settings.searchEngines = newEngines;
        this.settings.searchWidgetSize = parseInt(document.getElementById('searchWidgetSize').value) / 100;
        
        console.log('🔍 검색 엔진 저장:', {
            count: Object.keys(newEngines).length,
            engines: Object.keys(newEngines).join(', ')
        });
        
        this.saveSettings();
        applyWidgetSizes(this);
        this.closeSearchSettingsModal();
        
        // 검색 위젯 드롭다운 업데이트
        updateSearchEngineDropdown(this);
        
        console.log('✅ 검색 엔진 저장 완료!');
    }

    addSearchEngine() {
        const listContainer = document.getElementById('searchEngineList');
        const newId = 'new_' + Date.now(); // 고유 ID 생성
        
        const item = document.createElement('div');
        item.className = 'search-engine-item';
        item.style.display = 'grid';
        item.style.gridTemplateColumns = '1fr 2fr 2fr auto';
        item.style.gap = '8px';
        item.style.marginBottom = '8px';
        item.style.alignItems = 'center';
        
        item.innerHTML = `
            <input type="text" class="form-input" placeholder="google" data-key="${newId}" style="padding: 8px;">
            <input type="text" class="form-input" placeholder="https://www.google.com/search?q=" data-url="${newId}" style="padding: 8px;">
            <input type="text" class="form-input" placeholder="https://www.google.com/favicon.ico" data-icon="${newId}" style="padding: 8px;">
            <button class="btn-secondary remove-search-engine" style="padding: 8px 12px;">삭제</button>
        `;
        listContainer.appendChild(item);
        
        item.querySelector('.remove-search-engine').addEventListener('click', () => {
            item.remove();
        });
        
        console.log('➕ 검색 엔진 추가 폼 생성:', newId);
    }

    removeSearchEngine(key) {
        console.log('🗑️ 검색 엔진 삭제:', key);
        delete this.settings.searchEngines[key];
        this.saveSettings();
        this.openSearchSettingsModal();
    }

    openCurrencySettingsModal() {
        document.getElementById('currencyUSD').checked = this.settings.currencyUSD !== false;
        document.getElementById('currencyEUR').checked = this.settings.currencyEUR || false;
        document.getElementById('currencyJPY').checked = this.settings.currencyJPY !== false;
        document.getElementById('currencyCNY').checked = this.settings.currencyCNY || false;
        document.getElementById('currencyWidgetSize').value = (this.settings.currencyWidgetSize || 1) * 100;
        document.getElementById('currencyWidgetSizeValue').textContent = Math.round((this.settings.currencyWidgetSize || 1) * 100);
        
        const sizeInput = document.getElementById('currencyWidgetSize');
        const sizeValue = document.getElementById('currencyWidgetSizeValue');
        const newInput = sizeInput.cloneNode(true);
        sizeInput.parentNode.replaceChild(newInput, sizeInput);
        newInput.addEventListener('input', (e) => sizeValue.textContent = e.target.value);
        
        document.getElementById('currencySettingsModal').classList.add('active');
    }

    closeCurrencySettingsModal() {
        document.getElementById('currencySettingsModal').classList.remove('active');
    }

    saveCurrencySettings() {
        this.settings.currencyUSD = document.getElementById('currencyUSD').checked;
        this.settings.currencyEUR = document.getElementById('currencyEUR').checked;
        this.settings.currencyJPY = document.getElementById('currencyJPY').checked;
        this.settings.currencyCNY = document.getElementById('currencyCNY').checked;
        this.settings.currencyWidgetSize = parseInt(document.getElementById('currencyWidgetSize').value) / 100;
        
        this.saveSettings();
        applyWidgetSizes(this);
        this.closeCurrencySettingsModal();
        loadCurrencyData(this);
    }

    openStockSettingsModal() {
        document.getElementById('stockKOSPI').checked = this.settings.stockKOSPI !== false;
        document.getElementById('stockKOSDAQ').checked = this.settings.stockKOSDAQ || false;
        document.getElementById('stockSP500').checked = this.settings.stockSP500 || false;
        document.getElementById('stockNASDAQ').checked = this.settings.stockNASDAQ || false;
        
        const listContainer = document.getElementById('stockSymbolList');
        listContainer.innerHTML = '';
        (this.settings.stockSymbols || []).forEach((symbol) => {
            this.renderStockSymbolItem(listContainer, symbol);
        });
        
        document.getElementById('stockWidgetSize').value = (this.settings.stockWidgetSize || 1) * 100;
        document.getElementById('stockWidgetSizeValue').textContent = Math.round((this.settings.stockWidgetSize || 1) * 100);
        
        const sizeInput = document.getElementById('stockWidgetSize');
        const sizeValue = document.getElementById('stockWidgetSizeValue');
        const newInput = sizeInput.cloneNode(true);
        sizeInput.parentNode.replaceChild(newInput, sizeInput);
        newInput.addEventListener('input', (e) => sizeValue.textContent = e.target.value);
        
        document.getElementById('stockSettingsModal').classList.add('active');
    }

    renderStockSymbolItem(container, symbol) {
        const item = document.createElement('div');
        item.className = 'stock-symbol-item';
        item.innerHTML = `
            <input type="text" value="${symbol.code || ''}" placeholder="종목 코드 (예: 005930)" data-code>
            <input type="text" value="${symbol.name || ''}" placeholder="종목 이름 (예: 삼성전자)" data-name>
            <button class="remove-stock-symbol">삭제</button>
        `;
        container.appendChild(item);
        
        item.querySelector('.remove-stock-symbol').addEventListener('click', () => {
            item.remove();
        });
    }

    addStockSymbol() {
        const listContainer = document.getElementById('stockSymbolList');
        if (listContainer.children.length >= 4) {
            alert('최대 4개 종목만 추가할 수 있습니다.');
            return;
        }
        this.renderStockSymbolItem(listContainer, { code: '', name: '' });
    }

    closeStockSettingsModal() {
        document.getElementById('stockSettingsModal').classList.remove('active');
    }

    saveStockSettings() {
        this.settings.stockKOSPI = document.getElementById('stockKOSPI').checked;
        this.settings.stockKOSDAQ = document.getElementById('stockKOSDAQ').checked;
        this.settings.stockSP500 = document.getElementById('stockSP500').checked;
        this.settings.stockNASDAQ = document.getElementById('stockNASDAQ').checked;
        
        const symbols = [];
        document.querySelectorAll('.stock-symbol-item').forEach(item => {
            const code = item.querySelector('[data-code]').value.trim();
            const name = item.querySelector('[data-name]').value.trim();
            if (code) {
                symbols.push({ code, name });
            }
        });
        this.settings.stockSymbols = symbols;
        
        this.settings.stockWidgetSize = parseInt(document.getElementById('stockWidgetSize').value) / 100;
        
        this.saveSettings();
        applyWidgetSizes(this);
        this.closeStockSettingsModal();
        loadStockData(this);
    }
    
    // ========================================
    // GitHub Sync Methods
    // ========================================
    
    updateGitHubSyncUI() {
        const isConnected = this.githubSync && this.githubSync.isConfigured();
        const notConnectedDiv = document.getElementById('githubNotConnected');
        const connectedDiv = document.getElementById('githubConnected');
        
        if (!notConnectedDiv || !connectedDiv) return;
        
        if (isConnected) {
            notConnectedDiv.style.display = 'none';
            connectedDiv.style.display = 'block';
            
            const gistId = this.githubSync.getGistId();
            const gistIdDisplay = document.getElementById('gistIdDisplay');
            if (gistIdDisplay && gistId) {
                gistIdDisplay.textContent = gistId.substring(0, 8) + '...';
                gistIdDisplay.title = gistId;
            }
        } else {
            notConnectedDiv.style.display = 'block';
            connectedDiv.style.display = 'none';
            const tokenInput = document.getElementById('githubToken');
            if (tokenInput) tokenInput.value = '';
        }
    }
    
    async connectGitHub() {
        const tokenInput = document.getElementById('githubToken');
        const token = tokenInput.value.trim();
        
        if (!token) {
            alert('GitHub Personal Access Token을 입력해주세요.');
            return;
        }
        
        if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
            alert('올바른 GitHub Token 형식이 아닙니다.\nToken은 ghp_ 또는 github_pat_로 시작해야 합니다.');
            return;
        }
        
        // Save token
        this.githubSync.setToken(token);
        
        // Verify token
        const isValid = await this.githubSync.verifyToken();
        
        if (!isValid) {
            alert('유효하지 않은 Token입니다.\n권한을 확인해주세요. (필요 권한: gist)');
            this.githubSync.setToken('');
            return;
        }
        
        // Try to find existing Gist first
        const existingGistId = await this.githubSync.findStartpageGist();
        
        if (existingGistId) {
            // Found existing Gist - ask user what to do
            const useExisting = confirm(
                '기존 Startpage Gist를 발견했습니다!\n\n' +
                '✅ 확인: 기존 데이터를 불러옵니다 (권장)\n' +
                '❌ 취소: 새로운 Gist를 생성합니다\n\n' +
                '기존 데이터를 불러오시겠습니까?'
            );
            
            if (useExisting) {
                this.githubSync.setGistId(existingGistId);
                await this.githubSync.pullData();
                alert('✅ 기존 데이터를 성공적으로 불러왔습니다!');
            } else {
                // Create new Gist
                await this.githubSync.migrateFromLocalStorage();
                alert('✅ 새로운 Gist를 생성했습니다!');
            }
        } else {
            // No existing Gist - create new one
            await this.githubSync.migrateFromLocalStorage();
            alert('✅ GitHub 연결 완료!\n새 Gist를 생성했습니다.');
        }
        
        // Update UI
        this.updateGitHubSyncUI();
        
        // Start auto-sync
        this.githubSync.startAutoSync(5);
    }
    
    async disconnectGitHub() {
        const confirm = window.confirm(
            'GitHub 연결을 해제하시겠습니까?\n\n' +
            '로컬 데이터는 유지되지만, 자동 동기화가 중단됩니다.\n' +
            '다시 연결하려면 같은 Token을 사용하세요.'
        );
        
        if (!confirm) return;
        
        this.githubSync.disconnect();
        this.updateGitHubSyncUI();
        
        alert('GitHub 연결이 해제되었습니다.');
    }
    
    async syncNow() {
        if (!this.githubSync || !this.githubSync.isConfigured()) {
            alert('GitHub가 연결되지 않았습니다.');
            return;
        }
        
        await this.githubSync.pushData();
    }
    
    async pullFromCloud() {
        if (!this.githubSync || !this.githubSync.isConfigured()) {
            alert('GitHub가 연결되지 않았습니다.');
            return;
        }
        
        const confirm = window.confirm(
            '클라우드 데이터로 덮어쓰시겠습니까?\n\n' +
            '현재 로컬 변경사항이 있다면 클라우드 데이터로 대체됩니다.\n' +
            '먼저 백업을 권장합니다.'
        );
        
        if (!confirm) return;
        
        // Force overwrite with cloud data
        await this.githubSync.pullData(true);
    }
}

// ========================================
// Initialize App
// ========================================
let app;
document.addEventListener('DOMContentLoaded', async () => {
    app = new BookmarkApp();
    await app.init();
});
