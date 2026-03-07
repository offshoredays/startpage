// ========================================
// App State Management
// ========================================
class BookmarkApp {
    constructor() {
        this.categories = [];
        this.currentEditingCategory = null;
        this.currentEditingBookmark = null;
        this.currentCategoryId = null;
        this.currentEditingFooterBookmark = null;
        this.deleteCallback = null;
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
            // Widget Sizes (0.5 ~ 1.5)
            weatherWidgetSize: 1,
            clockWidgetSize: 1,
            searchWidgetSize: 1,
            footerWidgetSize: 1,
            // Weather Widget
            weatherCity: 'Ulsan',
            weatherApiKey: 'a88bc08194a466a6c8681b5bea96e68b',
            weatherUnit: 'metric',
            // Clock Widget
            clockFormat: 24,
            clockShowSeconds: false,
            clockDateFormat: 'ko',
            clockTimezone: 'Asia/Seoul',
            // Search Widget
            defaultSearchEngine: 'google',
            searchEngines: {
                google: { url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
                youtube: { url: 'https://www.youtube.com/results?search_query=', icon: 'https://www.youtube.com/favicon.ico' },
                naver: { url: 'https://search.naver.com/search.naver?query=', icon: 'https://www.naver.com/favicon.ico' }
            },
            // Stock Widget
            stockSymbols: []
        };
        
        this.footerBookmarks = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.loadSettings();
        this.loadFooterBookmarks();
        this.setupEventListeners();
        this.render();
        this.initTheme();
        this.applyBackgroundSettings();
        this.applyFontSizes();
        this.applyPageTitle();
        this.applyWidgetSizes();
        this.applyWidgetVisibility();
        this.initWeatherWidget();
        this.initClockWidget();
        this.initCurrencyWidget();
        this.initStockWidget();
        this.initSearchWidget();
        this.renderFooterBookmarks();
    }

    // ========================================
    // Data Management
    // ========================================
    loadData() {
        const savedData = localStorage.getItem('bookmarkData');
        if (savedData) {
            this.categories = JSON.parse(savedData);
        } else {
            // 샘플 데이터 로드
            this.loadSampleData();
        }
    }

    saveData() {
        localStorage.setItem('bookmarkData', JSON.stringify(this.categories));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    applyBackgroundSettings() {
        const body = document.body;
        // Reset
        body.style.removeProperty('--bg-image');
        body.style.background = '';
        
        if (this.settings.bgImage) {
            body.style.setProperty('--bg-image', `url(${this.settings.bgImage})`);
        } else if (this.settings.customBg) {
            body.style.background = this.settings.customBg;
        } else if (this.settings.bgPreset) {
            body.style.background = this.settings.bgPreset;
        }
    }

    applyPageTitle() {
        const titleText = this.settings.pageTitle || 'Bryan\'s Start Page';
        const titleIcon = this.settings.pageTitleIcon || 'fa-bookmark';
        
        // Update page title
        document.title = titleText;
        
        // Update header title
        const logoH1 = document.querySelector('.logo h1');
        if (logoH1) {
            logoH1.textContent = titleText;
        }
        
        // Update header icon
        const logoIcon = document.querySelector('.logo i');
        if (logoIcon) {
            logoIcon.className = `fas ${titleIcon}`;
        }
    }

    applyWidgetSizes() {
        const root = document.documentElement;
        root.style.setProperty('--weather-widget-scale', this.settings.weatherWidgetSize || 1);
        root.style.setProperty('--clock-widget-scale', this.settings.clockWidgetSize || 1);
        root.style.setProperty('--search-widget-scale', this.settings.searchWidgetSize || 1);
        root.style.setProperty('--footer-widget-scale', this.settings.footerWidgetSize || 1);
    }

    applyFontSizes() {
        const root = document.documentElement;
        const categoryFontSize = this.settings.categoryFontSize || 10;
        const bookmarkFontSize = this.settings.bookmarkFontSize || 12;
        
        console.log('Applying font sizes:', { categoryFontSize, bookmarkFontSize });
        
        // 카테고리 제목 폰트 크기
        root.style.setProperty('--category-title-size', `${categoryFontSize}px`);
        // 카테고리 아이콘 크기 (폰트 크기와 비슷하게 - 1.3배)
        root.style.setProperty('--category-icon-size', `${Math.round(categoryFontSize * 1.3)}px`);
        // 카테고리 아이콘 폰트 크기 (제목과 거의 동일)
        root.style.setProperty('--category-icon-font', `${Math.round(categoryFontSize * 0.9)}px`);
        
        // 북마크 제목 폰트 크기
        root.style.setProperty('--bookmark-title-size', `${bookmarkFontSize}px`);
        // 북마크 아이콘 크기 (폰트 크기의 1.5배)
        root.style.setProperty('--bookmark-icon-size', `${Math.round(bookmarkFontSize * 1.5)}px`);
        // 북마크 아이콘 이미지 크기
        root.style.setProperty('--bookmark-icon-img', `${Math.round(bookmarkFontSize * 1.2)}px`);
        
        // 북마크 폰트 크기에 따라 가로 갯수 조절
        let bookmarkColumns;
        if (bookmarkFontSize <= 11) {
            bookmarkColumns = 5; // 작은 폰트: 5개
        } else if (bookmarkFontSize <= 15) {
            bookmarkColumns = 4; // 중간 폰트: 4개
        } else {
            bookmarkColumns = 3; // 큰 폰트: 3개
        }
        root.style.setProperty('--bookmark-columns', bookmarkColumns);
        
        console.log('Font sizes applied to :root', {
            categoryTitle: root.style.getPropertyValue('--category-title-size'),
            bookmarkTitle: root.style.getPropertyValue('--bookmark-title-size'),
            bookmarkColumns: bookmarkColumns
        });
    }

    loadSampleData() {
        this.categories = [
            {
                id: this.generateId(),
                name: '업무',
                icon: 'fa-briefcase',
                color: '',
                bgColor: '',
                collapsed: false,
                bookmarks: [
                    {
                        id: this.generateId(),
                        title: 'Google',
                        url: 'https://www.google.com',
                        description: '검색 엔진'
                    },
                    {
                        id: this.generateId(),
                        title: 'Gmail',
                        url: 'https://mail.google.com',
                        description: '이메일'
                    },
                    {
                        id: this.generateId(),
                        title: 'Google Drive',
                        url: 'https://drive.google.com',
                        description: '클라우드 스토리지'
                    }
                ]
            },
            {
                id: this.generateId(),
                name: '개인',
                icon: 'fa-heart',
                color: 'linear-gradient(135deg, #ec4899, #db2777)',
                bgColor: '',
                collapsed: false,
                bookmarks: [
                    {
                        id: this.generateId(),
                        title: 'YouTube',
                        url: 'https://www.youtube.com',
                        description: '동영상 플랫폼'
                    },
                    {
                        id: this.generateId(),
                        title: 'GitHub',
                        url: 'https://github.com',
                        description: '코드 저장소'
                    }
                ]
            },
            {
                id: this.generateId(),
                name: '쇼핑',
                icon: 'fa-shopping-cart',
                color: 'linear-gradient(135deg, #f59e0b, #d97706)',
                bgColor: '',
                collapsed: false,
                bookmarks: [
                    {
                        id: this.generateId(),
                        title: 'Amazon',
                        url: 'https://www.amazon.com',
                        description: '온라인 쇼핑'
                    }
                ]
            }
        ];
        this.saveData();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ========================================
    // Theme Management
    // ========================================
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // ========================================
    // Event Listeners
    // ========================================
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettingsModal());

        // Category modal
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('saveCategoryBtn').addEventListener('click', () => this.saveCategory());

        // Bookmark modal
        document.getElementById('closeBookmarkModal').addEventListener('click', () => this.closeBookmarkModal());
        document.getElementById('cancelBookmarkBtn').addEventListener('click', () => this.closeBookmarkModal());
        document.getElementById('saveBookmarkBtn').addEventListener('click', () => this.saveBookmark());

        // Delete modal
        document.getElementById('closeDeleteModal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Settings modal
        document.getElementById('closeSettingsModal').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettingsModal());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettingsData());

        // Backup & Restore
        document.getElementById('backupBtn').addEventListener('click', () => this.backupData());
        document.getElementById('restoreBtn').addEventListener('click', () => {
            document.getElementById('restoreFileInput').click();
        });
        document.getElementById('restoreFileInput').addEventListener('change', (e) => this.restoreData(e));

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Enter key handlers
        document.getElementById('categoryName').addEventListener('keypress', (e) => {
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
        document.getElementById('categoryBgPicker').addEventListener('input', (e) => {
            document.getElementById('categoryBgColor').value = e.target.value;
        });

        document.getElementById('categoryBgColor').addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.startsWith('#') && value.length === 7) {
                document.getElementById('categoryBgPicker').value = value;
            }
        });

        // Background color picker
        document.getElementById('bgColorPicker').addEventListener('input', (e) => {
            document.getElementById('bgCustomColor').value = e.target.value;
        });

        document.getElementById('bgCustomColor').addEventListener('input', (e) => {
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

        // Widget settings buttons
        document.getElementById('weatherSettingsBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openWeatherSettingsModal();
        });
        document.getElementById('clockSettingsBtn')?.addEventListener('click', () => this.openClockSettingsModal());
        document.getElementById('searchSettingsBtn')?.addEventListener('click', () => this.openSearchSettingsModal());
        document.getElementById('currencySettingsBtn')?.addEventListener('click', () => this.openCurrencySettingsModal());
        document.getElementById('stockSettingsBtn')?.addEventListener('click', () => this.openStockSettingsModal());

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

        // Font size sliders
        const categorySlider = document.getElementById('categoryFontSize');
        const categoryInput = document.getElementById('categoryFontSizeInput');
        const categoryValue = document.getElementById('categoryFontSizeValue');
        
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

        const bookmarkSlider = document.getElementById('bookmarkFontSize');
        const bookmarkInput = document.getElementById('bookmarkFontSizeInput');
        const bookmarkValue = document.getElementById('bookmarkFontSizeValue');
        
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

        document.getElementById('bookmarkUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveBookmark();
        });
    }

    // ========================================
    // Rendering
    // ========================================
    render() {
        const wrapper = document.getElementById('categoriesWrapper');
        wrapper.innerHTML = '';

        this.categories.forEach((category, categoryIndex) => {
            const categoryCard = this.createCategoryCard(category, categoryIndex);
            wrapper.appendChild(categoryCard);
        });

        // Add category 버튼 추가
        const addCategoryCard = document.createElement('div');
        addCategoryCard.className = 'add-category-card';
        addCategoryCard.onclick = () => this.openCategoryModal();
        addCategoryCard.innerHTML = `
            <i class="fas fa-folder-plus"></i>
            <span>새 카테고리 추가</span>
        `;
        wrapper.appendChild(addCategoryCard);

        this.setupDragAndDrop();
    }

    createCategoryCard(category, categoryIndex) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('draggable', 'true');
        card.setAttribute('data-category-id', category.id);
        
        // Apply category background color if exists
        if (category.bgColor) {
            card.style.backgroundColor = category.bgColor;
        }

        const iconStyle = category.color ? `style="background: ${category.color}"` : '';

        card.innerHTML = `
            <div class="category-header">
                <div class="category-title">
                    <div class="category-icon" ${iconStyle}>
                        <i class="fas ${category.icon}"></i>
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
            <div class="bookmarks-grid ${category.collapsed ? 'collapsed' : ''}" id="bookmarks-${category.id}" data-category-id="${category.id}">
                ${category.bookmarks.map((bookmark, bookmarkIndex) => this.createBookmarkHTML(bookmark, category.id, bookmarkIndex)).join('')}
                <div class="add-bookmark-btn" onclick="app.openBookmarkModal('${category.id}')">
                    <i class="fas fa-plus"></i>
                    <span>추가</span>
                </div>
            </div>
        `;

        return card;
    }

    createBookmarkHTML(bookmark, categoryId, bookmarkIndex) {
        const favicon = this.getFaviconUrl(bookmark.url);
        return `
            <div class="bookmark-card" draggable="true" data-bookmark-id="${bookmark.id}" data-category-id="${categoryId}" onclick="app.openBookmark('${bookmark.url}')">
                <div class="bookmark-content">
                    <div class="bookmark-favicon">
                        <img src="${favicon}" alt="${bookmark.title}" onerror="this.src='https://via.placeholder.com/24?text=?'">
                    </div>
                    <div class="bookmark-info">
                        <div class="bookmark-title">${bookmark.title}</div>
                    </div>
                </div>
                <div class="bookmark-actions">
                    <button class="icon-btn" onclick="event.stopPropagation(); app.editBookmark('${categoryId}', '${bookmark.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn" onclick="event.stopPropagation(); app.deleteBookmark('${categoryId}', '${bookmark.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return 'https://via.placeholder.com/24?text=?';
        }
    }

    // ========================================
    // Category Operations
    // ========================================
    openCategoryModal(categoryId = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const nameInput = document.getElementById('categoryName');
        const iconInput = document.getElementById('categoryIcon');
        const colorValue = document.getElementById('categoryColorValue');
        const bgColorInput = document.getElementById('categoryBgColor');
        const bgColorPicker = document.getElementById('categoryBgPicker');

        // Reset selections
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));

        if (categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            title.textContent = '카테고리 수정';
            nameInput.value = category.name;
            iconInput.value = category.icon;
            colorValue.value = category.color || '';
            bgColorInput.value = category.bgColor || '';
            
            // Set background color picker
            if (category.bgColor && category.bgColor.startsWith('#')) {
                bgColorPicker.value = category.bgColor;
            }
            
            // Select current icon
            const iconOption = document.querySelector(`.icon-option[data-icon="${category.icon}"]`);
            if (iconOption) iconOption.classList.add('selected');
            
            // Select current icon color
            if (category.color) {
                const colorOption = document.querySelector(`.color-option[data-color="${CSS.escape(category.color)}"]`);
                if (colorOption) {
                    colorOption.classList.add('selected');
                } else {
                    // 기본 색상 선택
                    document.querySelector('.color-option[data-color="linear-gradient(135deg, #3b82f6, #2563eb)"]').classList.add('selected');
                }
            } else {
                // 빈 문자열이면 기본 블루 선택
                document.querySelector('.color-option[data-color="linear-gradient(135deg, #3b82f6, #2563eb)"]').classList.add('selected');
            }
            
            this.currentEditingCategory = categoryId;
        } else {
            title.textContent = '카테고리 추가';
            nameInput.value = '';
            iconInput.value = 'fa-folder';
            colorValue.value = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            bgColorInput.value = '';
            bgColorPicker.value = '#ffffff';
            // 기본 블루 색상 선택
            document.querySelector('.color-option[data-color="linear-gradient(135deg, #3b82f6, #2563eb)"]').classList.add('selected');
            const defaultIcon = document.querySelector('.icon-option[data-icon="fa-folder"]');
            if (defaultIcon) defaultIcon.classList.add('selected');
            this.currentEditingCategory = null;
        }

        modal.classList.add('active');
        nameInput.focus();
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
        this.currentEditingCategory = null;
    }

    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value.trim() || 'fa-folder';
        const color = document.getElementById('categoryColorValue').value;
        const bgColor = document.getElementById('categoryBgColor').value.trim();

        if (!name) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }

        if (this.currentEditingCategory) {
            // 수정
            const category = this.categories.find(c => c.id === this.currentEditingCategory);
            category.name = name;
            category.icon = icon;
            category.color = color;
            category.bgColor = bgColor;
        } else {
            // 추가
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
            `"${category.name}" 카테고리를 삭제하시겠습니까? 포함된 모든 북마크도 함께 삭제됩니다.`,
            () => {
                this.categories = this.categories.filter(c => c.id !== categoryId);
                this.saveData();
                this.render();
            }
        );
    }

    toggleCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        category.collapsed = !category.collapsed;
        this.saveData();
        this.render();
    }

    // ========================================
    // Bookmark Operations
    // ========================================
    openBookmarkModal(categoryId, bookmarkId = null) {
        const modal = document.getElementById('bookmarkModal');
        const title = document.getElementById('bookmarkModalTitle');
        const titleInput = document.getElementById('bookmarkTitle');
        const urlInput = document.getElementById('bookmarkUrl');
        const descInput = document.getElementById('bookmarkDescription');

        this.currentCategoryId = categoryId;

        if (bookmarkId) {
            const category = this.categories.find(c => c.id === categoryId);
            const bookmark = category.bookmarks.find(b => b.id === bookmarkId);
            title.textContent = '북마크 수정';
            titleInput.value = bookmark.title;
            urlInput.value = bookmark.url;
            descInput.value = bookmark.description || '';
            this.currentEditingBookmark = bookmarkId;
        } else {
            title.textContent = '북마크 추가';
            titleInput.value = '';
            urlInput.value = '';
            descInput.value = '';
            this.currentEditingBookmark = null;
        }

        modal.classList.add('active');
        titleInput.focus();
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
            alert('제목과 URL을 입력해주세요.');
            return;
        }

        // URL 유효성 검사
        try {
            new URL(url);
        } catch {
            alert('올바른 URL을 입력해주세요.');
            return;
        }

        const category = this.categories.find(c => c.id === this.currentCategoryId);

        if (this.currentEditingBookmark) {
            // 수정
            const bookmark = category.bookmarks.find(b => b.id === this.currentEditingBookmark);
            bookmark.title = title;
            bookmark.url = url;
            bookmark.description = description;
        } else {
            // 추가
            category.bookmarks.push({
                id: this.generateId(),
                title: title,
                url: url,
                description: description
            });
        }

        this.saveData();
        this.render();
        this.closeBookmarkModal();
    }

    editBookmark(categoryId, bookmarkId) {
        this.openBookmarkModal(categoryId, bookmarkId);
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

    openBookmark(url) {
        window.open(url, '_blank');
    }

    // ========================================
    // Delete Modal
    // ========================================
    openDeleteModal(message, callback) {
        const modal = document.getElementById('deleteModal');
        const messageEl = document.getElementById('deleteMessage');
        messageEl.textContent = message;
        this.deleteCallback = callback;
        modal.classList.add('active');
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.deleteCallback = null;
    }

    confirmDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
        }
        this.closeDeleteModal();
    }

    // ========================================
    // Settings Operations
    // ========================================
    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const bgImageUrl = document.getElementById('bgImageUrl');
        const bgCustomColor = document.getElementById('bgCustomColor');
        const bgColorPicker = document.getElementById('bgColorPicker');
        
        // Page title settings
        document.getElementById('pageTitle').value = this.settings.pageTitle || 'Bryan\'s Start Page';
        document.getElementById('pageTitleIcon').value = this.settings.pageTitleIcon || 'fa-bookmark';
        
        // Font size settings
        const categoryFontSize = this.settings.categoryFontSize || 10;
        const bookmarkFontSize = this.settings.bookmarkFontSize || 12;
        
        document.getElementById('categoryFontSize').value = categoryFontSize;
        document.getElementById('categoryFontSizeInput').value = categoryFontSize;
        document.getElementById('categoryFontSizeValue').textContent = categoryFontSize;
        
        document.getElementById('bookmarkFontSize').value = bookmarkFontSize;
        document.getElementById('bookmarkFontSizeInput').value = bookmarkFontSize;
        document.getElementById('bookmarkFontSizeValue').textContent = bookmarkFontSize;
        
        bgImageUrl.value = this.settings.bgImage || '';
        bgCustomColor.value = this.settings.customBg || '';
        
        // Set color picker if it's a hex color
        if (this.settings.customBg && this.settings.customBg.startsWith('#')) {
            bgColorPicker.value = this.settings.customBg;
        }
        
        // Select current preset
        document.querySelectorAll('.bg-preset').forEach(p => p.classList.remove('selected'));
        if (this.settings.bgPreset) {
            const preset = document.querySelector(`.bg-preset[data-bg="${this.settings.bgPreset}"]`);
            if (preset) preset.classList.add('selected');
        } else if (!this.settings.bgImage && !this.settings.customBg) {
            document.querySelector('.bg-preset[data-bg=""]').classList.add('selected');
        }
        
        modal.classList.add('active');
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettingsData() {
        const bgImageUrl = document.getElementById('bgImageUrl').value.trim();
        const bgCustomColor = document.getElementById('bgCustomColor').value.trim();
        const selectedPreset = document.querySelector('.bg-preset.selected');
        const categoryFontSize = parseInt(document.getElementById('categoryFontSize').value);
        const bookmarkFontSize = parseInt(document.getElementById('bookmarkFontSize').value);
        const pageTitle = document.getElementById('pageTitle').value.trim();
        const pageTitleIcon = document.getElementById('pageTitleIcon').value.trim();
        
        // Save page title
        this.settings.pageTitle = pageTitle || 'Bryan\'s Start Page';
        this.settings.pageTitleIcon = pageTitleIcon || 'fa-bookmark';
        
        // Save font sizes
        this.settings.categoryFontSize = categoryFontSize;
        this.settings.bookmarkFontSize = bookmarkFontSize;
        
        if (bgImageUrl) {
            this.settings.bgImage = bgImageUrl;
            this.settings.bgPreset = '';
            this.settings.customBg = '';
        } else if (bgCustomColor) {
            this.settings.customBg = bgCustomColor;
            this.settings.bgImage = '';
            this.settings.bgPreset = '';
        } else if (selectedPreset) {
            this.settings.bgPreset = selectedPreset.dataset.bg;
            this.settings.bgImage = '';
            this.settings.customBg = '';
        }
        
        this.saveSettings();
        this.applyBackgroundSettings();
        this.applyFontSizes();
        this.applyPageTitle();
        this.closeSettingsModal();
    }

    // ========================================
    // Search
    // ========================================
    handleSearch(query) {
        const lowerQuery = query.toLowerCase().trim();
        
        if (!lowerQuery) {
            this.render();
            return;
        }

        const wrapper = document.getElementById('categoriesWrapper');
        wrapper.innerHTML = '';

        this.categories.forEach(category => {
            const matchingBookmarks = category.bookmarks.filter(bookmark =>
                bookmark.title.toLowerCase().includes(lowerQuery) ||
                bookmark.description.toLowerCase().includes(lowerQuery) ||
                bookmark.url.toLowerCase().includes(lowerQuery)
            );

            if (matchingBookmarks.length > 0) {
                const filteredCategory = {
                    ...category,
                    bookmarks: matchingBookmarks,
                    collapsed: false
                };
                const categoryCard = this.createCategoryCard(filteredCategory);
                wrapper.appendChild(categoryCard);
            }
        });

        if (wrapper.children.length === 0) {
            wrapper.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-tertiary);">검색 결과가 없습니다.</div>';
        }
    }

    // ========================================
    // Drag and Drop
    // ========================================
    setupDragAndDrop() {
        // Category drag and drop
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card, index) => {
            card.addEventListener('dragstart', (e) => this.handleCategoryDragStart(e, index));
            card.addEventListener('dragover', (e) => this.handleDragOver(e));
            card.addEventListener('drop', (e) => this.handleCategoryDrop(e, index));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Bookmark drag and drop
        const bookmarkCards = document.querySelectorAll('.bookmark-card');
        bookmarkCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleBookmarkDragStart(e));
            card.addEventListener('dragover', (e) => this.handleDragOver(e));
            card.addEventListener('drop', (e) => this.handleBookmarkDrop(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Bookmarks grid drop zones (for empty categories)
        const bookmarkGrids = document.querySelectorAll('.bookmarks-grid');
        bookmarkGrids.forEach(grid => {
            grid.addEventListener('dragover', (e) => this.handleDragOver(e));
            grid.addEventListener('drop', (e) => this.handleGridDrop(e));
        });
    }

    handleCategoryDragStart(e, index) {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('type', 'category');
        e.dataTransfer.setData('index', index);
        e.currentTarget.classList.add('dragging');
    }

    handleBookmarkDragStart(e) {
        e.stopPropagation();
        const bookmarkId = e.currentTarget.getAttribute('data-bookmark-id');
        const categoryId = e.currentTarget.getAttribute('data-category-id');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('type', 'bookmark');
        e.dataTransfer.setData('bookmarkId', bookmarkId);
        e.dataTransfer.setData('categoryId', categoryId);
        e.currentTarget.classList.add('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleCategoryDrop(e, targetIndex) {
        e.preventDefault();
        e.stopPropagation();
        
        const type = e.dataTransfer.getData('type');
        if (type !== 'category') return;

        const sourceIndex = parseInt(e.dataTransfer.getData('index'));
        if (sourceIndex === targetIndex) return;

        const [movedCategory] = this.categories.splice(sourceIndex, 1);
        this.categories.splice(targetIndex, 0, movedCategory);
        
        this.saveData();
        this.render();
    }

    handleBookmarkDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const type = e.dataTransfer.getData('type');
        if (type !== 'bookmark') return;

        const sourceBookmarkId = e.dataTransfer.getData('bookmarkId');
        const sourceCategoryId = e.dataTransfer.getData('categoryId');
        const targetBookmarkId = e.currentTarget.getAttribute('data-bookmark-id');
        const targetCategoryId = e.currentTarget.getAttribute('data-category-id');

        const sourceCategory = this.categories.find(c => c.id === sourceCategoryId);
        const targetCategory = this.categories.find(c => c.id === targetCategoryId);
        
        const sourceIndex = sourceCategory.bookmarks.findIndex(b => b.id === sourceBookmarkId);
        const targetIndex = targetCategory.bookmarks.findIndex(b => b.id === targetBookmarkId);

        if (sourceCategoryId === targetCategoryId && sourceIndex === targetIndex) return;

        const [movedBookmark] = sourceCategory.bookmarks.splice(sourceIndex, 1);
        targetCategory.bookmarks.splice(targetIndex, 0, movedBookmark);
        
        this.saveData();
        this.render();
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
    }

    handleGridDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const type = e.dataTransfer.getData('type');
        if (type !== 'bookmark') return;

        const sourceBookmarkId = e.dataTransfer.getData('bookmarkId');
        const sourceCategoryId = e.dataTransfer.getData('categoryId');
        const targetCategoryId = e.currentTarget.getAttribute('data-category-id');

        if (!targetCategoryId || sourceCategoryId === targetCategoryId) return;

        const sourceCategory = this.categories.find(c => c.id === sourceCategoryId);
        const targetCategory = this.categories.find(c => c.id === targetCategoryId);
        
        const sourceIndex = sourceCategory.bookmarks.findIndex(b => b.id === sourceBookmarkId);
        const [movedBookmark] = sourceCategory.bookmarks.splice(sourceIndex, 1);
        targetCategory.bookmarks.push(movedBookmark);
        
        this.saveData();
        this.render();
    }

    // ========================================
    // Weather Widget
    // ========================================
    async initWeatherWidget() {
        await this.loadWeatherData();
        // 10분마다 날씨 업데이트
        setInterval(() => this.loadWeatherData(), 600000);
        
        // 날씨 위젯 클릭 이벤트
        document.getElementById('weatherCompact').addEventListener('click', () => {
            this.openWeatherModal();
        });
        
        document.getElementById('closeWeatherModal').addEventListener('click', () => {
            document.getElementById('weatherModal').classList.remove('active');
        });
    }

    async loadWeatherData() {
        try {
            const { weatherCity, weatherApiKey, weatherUnit } = this.settings;
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${weatherApiKey}&units=${weatherUnit}&lang=kr`
            );
            const data = await response.json();
            
            this.currentWeather = data;
            this.updateWeatherDisplay(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            document.querySelector('.weather-temp').textContent = '--°';
            document.querySelector('.weather-location').textContent = 'Error';
        }
    }

    updateWeatherDisplay(data) {
        const temp = Math.round(data.main.temp);
        const icon = this.getWeatherIcon(data.weather[0].main);
        const windSpeed = data.wind?.speed || 0;
        
        document.querySelector('.weather-temp').textContent = `${temp}°`;
        document.querySelector('.weather-location').textContent = data.name;
        document.querySelector('.weather-compact > i').className = icon;
        document.querySelector('.weather-wind').innerHTML = `<i class="fas fa-wind"></i> ${windSpeed.toFixed(1)}m/s`;
        document.querySelector('.weather-wave').innerHTML = `<i class="fas fa-water"></i> --`;
    }

    getWeatherIcon(weather) {
        const icons = {
            'Clear': 'fas fa-sun',
            'Clouds': 'fas fa-cloud',
            'Rain': 'fas fa-cloud-rain',
            'Snow': 'fas fa-snowflake',
            'Thunderstorm': 'fas fa-bolt',
            'Drizzle': 'fas fa-cloud-drizzle',
            'Mist': 'fas fa-smog',
            'Fog': 'fas fa-smog'
        };
        return icons[weather] || 'fas fa-cloud-sun';
    }

    async openWeatherModal() {
        const data = this.currentWeather;
        if (!data) return;
        
        // 기본 날씨 정보 업데이트
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        
        document.getElementById('sunrise').textContent = sunrise;
        document.getElementById('sunset').textContent = sunset;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
        document.getElementById('windDirection').textContent = this.getWindDirection(data.wind.deg);
        document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
        
        document.getElementById('weatherModal').classList.add('active');
    }

    getWindDirection(deg) {
        const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    }

    // ========================================
    // Clock Widget
    // ========================================
    initClockWidget() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const { clockFormat, clockShowSeconds, clockDateFormat, clockTimezone } = this.settings;
        
        // Get time in selected timezone
        const now = new Date();
        const options = { timeZone: clockTimezone || 'Asia/Seoul' };
        const timeInZone = new Date(now.toLocaleString('en-US', options));
        
        // 시간 포맷
        let hours = timeInZone.getHours();
        const minutes = timeInZone.getMinutes().toString().padStart(2, '0');
        const seconds = timeInZone.getSeconds().toString().padStart(2, '0');
        
        const colonVisible = seconds % 2 === 0; // 짝수 초에만 콜론 표시
        const colon = `<span class="colon"${colonVisible ? '' : ' style="opacity: 0;"'}>:</span>`;
        
        if (clockFormat === 12) {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const timeStr = clockShowSeconds 
                ? `${hours}${colon}${minutes}${colon}${seconds} ${ampm}`
                : `${hours}${colon}${minutes} ${ampm}`;
            document.querySelector('.clock-time').innerHTML = timeStr;
        } else {
            const hoursStr = hours.toString().padStart(2, '0');
            const timeStr = clockShowSeconds 
                ? `${hoursStr}${colon}${minutes}${colon}${seconds}`
                : `${hoursStr}${colon}${minutes}`;
            document.querySelector('.clock-time').innerHTML = timeStr;
        }
        
        // 날짜 포맷
        let dateStr;
        if (clockDateFormat === 'ko') {
            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
            dateStr = timeInZone.toLocaleDateString('ko-KR', options);
        } else if (clockDateFormat === 'en') {
            const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
            dateStr = timeInZone.toLocaleDateString('en-US', options);
        } else { // iso
            dateStr = timeInZone.toISOString().split('T')[0];
        }
        document.querySelector('.clock-date').textContent = dateStr;
    }

    // ========================================
    // Search Widget
    // ========================================
    initSearchWidget() {
        const select = document.getElementById('searchEngineSelect');
        const input = document.getElementById('globalSearchInput');
        const btn = document.getElementById('globalSearchBtn');
        const favicon = document.getElementById('searchEngineFavicon');
        
        // Initialize search engine select
        this.updateSearchEngineSelect();
        
        // Update favicon when engine changes
        const updateFavicon = () => {
            const currentEngine = select.value;
            const engineData = this.settings.searchEngines[currentEngine];
            if (engineData && engineData.icon) {
                favicon.src = engineData.icon;
            }
        };
        updateFavicon();
        
        // Search event
        const performSearch = () => {
            const query = input.value.trim();
            if (!query) return;
            
            const currentEngine = select.value;
            const engineData = this.settings.searchEngines[currentEngine];
            if (engineData) {
                const searchUrl = engineData.url || engineData; // Backward compatibility
                window.open(searchUrl + encodeURIComponent(query), '_blank');
                input.value = '';
            }
        };
        
        btn.addEventListener('click', performSearch);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Save selected engine as default and update favicon
        select.addEventListener('change', () => {
            this.settings.defaultSearchEngine = select.value;
            this.saveSettings();
            updateFavicon();
        });
    }

    // ========================================
    // Currency Widget (환율)
    // ========================================
    initCurrencyWidget() {
        this.loadCurrencyData();
        // 1시간마다 환율 업데이트
        setInterval(() => this.loadCurrencyData(), 3600000);
    }

    async loadCurrencyData() {
        try {
            // Exchangerate API (무료)
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
            const data = await response.json();
            
            // USD/KRW, JPY/KRW
            const usdRate = (1 / data.rates.USD).toFixed(2);
            const jpyRate = (100 / data.rates.JPY).toFixed(2);
            
            // Format with commas
            const formatNumber = (num) => {
                return Number(num).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };
            
            const currencyItems = document.querySelectorAll('.currency-item');
            currencyItems[0].querySelector('.currency-value').textContent = `₩${formatNumber(usdRate)}`;
            currencyItems[1].querySelector('.currency-value').textContent = `₩${formatNumber(jpyRate)}`;
        } catch (error) {
            console.error('Currency fetch error:', error);
            document.querySelectorAll('.currency-value').forEach(el => {
                el.textContent = '--';
            });
        }
    }

    // ========================================
    // Stock Widget (주식)
    // ========================================
    initStockWidget() {
        this.loadStockData();
        // 1분마다 주식 업데이트 (실시간 반영)
        setInterval(() => this.loadStockData(), 60000);
    }

    async loadStockData() {
        try {
            // Yahoo Finance API 대신 간단한 방법: 더미 데이터
            // 실제로는 유료 API(Alpha Vantage, Polygon.io 등) 필요
            // 여기서는 한국거래소 KOSPI 예시 (더미)
            const kospi = 2500 + Math.random() * 100;
            const change = (Math.random() - 0.5) * 2;
            
            const stockValue = document.querySelector('.stock-value');
            stockValue.textContent = `${kospi.toFixed(2)}`;
            stockValue.className = 'stock-value ' + (change > 0 ? 'up' : 'down');
        } catch (error) {
            console.error('Stock fetch error:', error);
            document.querySelector('.stock-value').textContent = '--';
        }
    }

    // ========================================
    // Footer Bookmarks
    // ========================================
    loadFooterBookmarks() {
        const saved = localStorage.getItem('footerBookmarks');
        if (saved) {
            this.footerBookmarks = JSON.parse(saved);
        } else {
            // 기본 푸터 북마크
            this.footerBookmarks = [
                { id: this.generateId(), title: 'Google', url: 'https://www.google.com', icon: '' },
                { id: this.generateId(), title: 'YouTube', url: 'https://www.youtube.com', icon: '' },
                { id: this.generateId(), title: 'Gmail', url: 'https://mail.google.com', icon: '' },
                { id: this.generateId(), title: 'Netflix', url: 'https://www.netflix.com', icon: '' }
            ];
            this.saveFooterBookmarks();
        }
    }

    saveFooterBookmarks() {
        localStorage.setItem('footerBookmarks', JSON.stringify(this.footerBookmarks));
    }

    renderFooterBookmarks() {
        const container = document.getElementById('footerBookmarks');
        container.innerHTML = this.footerBookmarks.map(bookmark => `
            <div class="footer-bookmark-item" onclick="window.open('${bookmark.url}', '_blank')">
                <img src="${this.getFaviconUrl(bookmark.url)}" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><text y=%2218%22 font-size=%2220%22>🔖</text></svg>'">
                <div class="footer-bookmark-tooltip">${bookmark.title}</div>
            </div>
        `).join('');
        
        // 푸터 추가 버튼
        document.getElementById('footerAddBtn').onclick = () => {
            const url = prompt('북마크 URL을 입력하세요:', 'https://');
            if (!url) return;
            
            const title = prompt('북마크 이름을 입력하세요:');
            if (!title) return;
            
            this.footerBookmarks.push({
                id: this.generateId(),
                title: title,
                url: url,
                icon: ''
            });
            
            this.saveFooterBookmarks();
            this.renderFooterBookmarks();
        };
    }

    // ========================================
    // Backup & Restore
    // ========================================
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
                    this.saveFooterBookmarks();
                    
                    alert('백업이 복원되었습니다! 페이지를 새로고침합니다.');
                    location.reload();
                }
            } catch (error) {
                alert('백업 파일을 읽는 중 오류가 발생했습니다.\n\n올바른 백업 파일인지 확인해주세요.');
                console.error('Restore error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    // ========================================
    // Widget Settings
    // ========================================
    
    // Weather Widget Settings
    openWeatherSettingsModal() {
        document.getElementById('weatherCity').value = this.settings.weatherCity || 'Ulsan';
        document.getElementById('weatherApiKey').value = this.settings.weatherApiKey || '';
        document.getElementById('weatherUnit').value = this.settings.weatherUnit || 'metric';
        document.getElementById('weatherWidgetSize').value = (this.settings.weatherWidgetSize || 1) * 100;
        document.getElementById('weatherWidgetSizeValue').textContent = Math.round((this.settings.weatherWidgetSize || 1) * 100);
        
        document.getElementById('weatherWidgetSize').addEventListener('input', (e) => {
            document.getElementById('weatherWidgetSizeValue').textContent = e.target.value;
        });
        
        document.getElementById('weatherSettingsModal').classList.add('active');
    }

    closeWeatherSettingsModal() {
        document.getElementById('weatherSettingsModal').classList.remove('active');
    }

    saveWeatherSettings() {
        this.settings.weatherCity = document.getElementById('weatherCity').value.trim() || 'Ulsan';
        this.settings.weatherApiKey = document.getElementById('weatherApiKey').value.trim();
        this.settings.weatherUnit = document.getElementById('weatherUnit').value;
        this.settings.weatherWidgetSize = parseInt(document.getElementById('weatherWidgetSize').value) / 100;
        
        this.saveSettings();
        this.applyWidgetSizes();
        this.closeWeatherSettingsModal();
        
        // Reload weather data
        this.loadWeatherData();
    }

    // Clock Widget Settings
    openClockSettingsModal() {
        document.getElementById('clockTimezone').value = this.settings.clockTimezone || 'Asia/Seoul';
        document.getElementById('clockFormat').value = this.settings.clockFormat || 24;
        document.getElementById('clockShowSeconds').checked = this.settings.clockShowSeconds || false;
        document.getElementById('clockDateFormat').value = this.settings.clockDateFormat || 'ko';
        document.getElementById('clockWidgetSize').value = (this.settings.clockWidgetSize || 1) * 100;
        document.getElementById('clockWidgetSizeValue').textContent = Math.round((this.settings.clockWidgetSize || 1) * 100);
        
        document.getElementById('clockWidgetSize').addEventListener('input', (e) => {
            document.getElementById('clockWidgetSizeValue').textContent = e.target.value;
        });
        
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
        this.applyWidgetSizes();
        this.closeClockSettingsModal();
        
        // Update clock immediately
        this.updateClock();
    }

    // Search Widget Settings
    openSearchSettingsModal() {
        const listContainer = document.getElementById('searchEngineList');
        listContainer.innerHTML = '';
        
        Object.entries(this.settings.searchEngines).forEach(([key, engineData]) => {
            // Handle both old format (string) and new format (object)
            const url = engineData.url || engineData;
            const icon = engineData.icon || '';
            
            const item = document.createElement('div');
            item.className = 'search-engine-item';
            item.innerHTML = `
                <input type="text" value="${key}" placeholder="엔진 이름 (예: google)" data-key="${key}">
                <input type="text" value="${url}" placeholder="검색 URL (예: https://www.google.com/search?q=)" data-url="${key}">
                <input type="text" value="${icon}" placeholder="파비콘 URL (선택)" data-icon="${key}">
                <button class="remove-search-engine" data-remove="${key}">삭제</button>
            `;
            listContainer.appendChild(item);
            
            // Add event listener for remove button
            item.querySelector('.remove-search-engine').addEventListener('click', () => {
                this.removeSearchEngine(key);
            });
        });
        
        document.getElementById('searchWidgetSize').value = (this.settings.searchWidgetSize || 1) * 100;
        document.getElementById('searchWidgetSizeValue').textContent = Math.round((this.settings.searchWidgetSize || 1) * 100);
        
        document.getElementById('searchWidgetSize').addEventListener('input', (e) => {
            document.getElementById('searchWidgetSizeValue').textContent = e.target.value;
        });
        
        document.getElementById('searchSettingsModal').classList.add('active');
    }

    closeSearchSettingsModal() {
        document.getElementById('searchSettingsModal').classList.remove('active');
    }

    saveSearchSettings() {
        // Update search engines
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
        
        this.saveSettings();
        this.applyWidgetSizes();
        this.closeSearchSettingsModal();
        
        // Update search engine select
        this.updateSearchEngineSelect();
    }

    addSearchEngine() {
        const listContainer = document.getElementById('searchEngineList');
        const item = document.createElement('div');
        item.className = 'search-engine-item';
        item.innerHTML = `
            <input type="text" value="" placeholder="엔진 이름 (예: google)" data-key="new">
            <input type="text" value="" placeholder="검색 URL (예: https://www.google.com/search?q=)" data-url="new">
            <input type="text" value="" placeholder="파비콘 URL (선택)" data-icon="new">
            <button class="remove-search-engine">삭제</button>
        `;
        listContainer.appendChild(item);
        
        item.querySelector('.remove-search-engine').addEventListener('click', () => {
            item.remove();
        });
    }

    removeSearchEngine(key) {
        delete this.settings.searchEngines[key];
        this.openSearchSettingsModal(); // Refresh list
    }

    updateSearchEngineSelect() {
        const select = document.getElementById('searchEngineSelect');
        select.innerHTML = '';
        
        Object.keys(this.settings.searchEngines).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            select.appendChild(option);
        });
        
        select.value = this.settings.defaultSearchEngine || 'google';
    }

    // Currency Widget Settings
    openCurrencySettingsModal() {
        document.getElementById('currencyUSD').checked = this.settings.currencyUSD !== false;
        document.getElementById('currencyEUR').checked = this.settings.currencyEUR || false;
        document.getElementById('currencyJPY').checked = this.settings.currencyJPY !== false;
        document.getElementById('currencyCNY').checked = this.settings.currencyCNY || false;
        document.getElementById('currencyWidgetSize').value = (this.settings.currencyWidgetSize || 1) * 100;
        document.getElementById('currencyWidgetSizeValue').textContent = Math.round((this.settings.currencyWidgetSize || 1) * 100);
        
        document.getElementById('currencyWidgetSize').addEventListener('input', (e) => {
            document.getElementById('currencyWidgetSizeValue').textContent = e.target.value;
        });
        
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
        this.applyWidgetSizes();
        this.closeCurrencySettingsModal();
        
        // Update currency display
        this.loadCurrencyData();
    }

    // Stock Widget Settings
    openStockSettingsModal() {
        document.getElementById('stockKOSPI').checked = this.settings.stockKOSPI !== false;
        document.getElementById('stockKOSDAQ').checked = this.settings.stockKOSDAQ || false;
        document.getElementById('stockSP500').checked = this.settings.stockSP500 || false;
        document.getElementById('stockNASDAQ').checked = this.settings.stockNASDAQ || false;
        
        // Load stock symbols
        const listContainer = document.getElementById('stockSymbolList');
        listContainer.innerHTML = '';
        (this.settings.stockSymbols || []).forEach((symbol) => {
            this.renderStockSymbolItem(listContainer, symbol);
        });
        
        document.getElementById('stockWidgetSize').value = (this.settings.stockWidgetSize || 1) * 100;
        document.getElementById('stockWidgetSizeValue').textContent = Math.round((this.settings.stockWidgetSize || 1) * 100);
        
        document.getElementById('stockWidgetSize').addEventListener('input', (e) => {
            document.getElementById('stockWidgetSizeValue').textContent = e.target.value;
        });
        
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
        
        // Save stock symbols
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
        this.applyWidgetSizes();
        this.closeStockSettingsModal();
        
        // Update stock display
        this.loadStockData();
    }

    applyWidgetSizes() {
        document.documentElement.style.setProperty('--weather-widget-scale', this.settings.weatherWidgetSize || 1);
        document.documentElement.style.setProperty('--clock-widget-scale', this.settings.clockWidgetSize || 1);
        document.documentElement.style.setProperty('--search-widget-scale', this.settings.searchWidgetSize || 1);
        document.documentElement.style.setProperty('--footer-widget-scale', this.settings.footerWidgetSize || 1);
    }

    applyWidgetVisibility() {
        document.getElementById('weatherWidget').style.display = this.settings.showWeatherWidget !== false ? 'flex' : 'none';
        document.getElementById('clockWidget').style.display = this.settings.showClockWidget !== false ? 'flex' : 'none';
        document.getElementById('currencyWidget').style.display = this.settings.showCurrencyWidget !== false ? 'flex' : 'none';
        document.getElementById('stockWidget').style.display = this.settings.showStockWidget !== false ? 'flex' : 'none';
        document.getElementById('searchWidget').style.display = this.settings.showSearchWidget !== false ? 'flex' : 'none';
        document.getElementById('footerBookmarkBar').style.display = this.settings.showFooterWidget !== false ? 'flex' : 'none';
    }

    // ========================================
    // Widget Detail Modals
    // ========================================
    openClockDetailModal() {
        document.getElementById('clockModal').classList.add('active');
        // Update clock detail with seconds
        this.updateClockDetail();
    }

    updateClockDetail() {
        const { clockFormat, clockDateFormat, clockTimezone } = this.settings;
        const now = new Date();
        const options = { timeZone: clockTimezone || 'Asia/Seoul' };
        const timeInZone = new Date(now.toLocaleString('en-US', options));
        
        let hours = timeInZone.getHours();
        const minutes = timeInZone.getMinutes().toString().padStart(2, '0');
        const seconds = timeInZone.getSeconds().toString().padStart(2, '0');
        
        if (clockFormat === 12) {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            document.getElementById('clockDetailTime').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
        } else {
            const hoursStr = hours.toString().padStart(2, '0');
            document.getElementById('clockDetailTime').textContent = `${hoursStr}:${minutes}:${seconds}`;
        }
        
        let dateStr;
        if (clockDateFormat === 'ko') {
            const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
            dateStr = timeInZone.toLocaleDateString('ko-KR', opts);
        } else if (clockDateFormat === 'en') {
            const opts = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
            dateStr = timeInZone.toLocaleDateString('en-US', opts);
        } else {
            dateStr = timeInZone.toISOString().split('T')[0];
        }
        document.getElementById('clockDetailDate').textContent = dateStr;
        document.getElementById('clockDetailTimezone').textContent = clockTimezone || 'Asia/Seoul';
    }

    openCurrencyDetailModal() {
        document.getElementById('currencyModal').classList.add('active');
        // Show all currency rates
        this.updateCurrencyDetail();
    }

    async updateCurrencyDetail() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
            const data = await response.json();
            
            const container = document.getElementById('currencyDetailBody');
            container.innerHTML = '';
            
            const currencies = [
                { code: 'USD', name: '미국 달러', rate: 1 / data.rates.USD },
                { code: 'EUR', name: '유로', rate: 1 / data.rates.EUR },
                { code: 'JPY', name: '일본 엔 (100)', rate: 100 / data.rates.JPY },
                { code: 'CNY', name: '중국 위안', rate: 1 / data.rates.CNY },
                { code: 'GBP', name: '영국 파운드', rate: 1 / data.rates.GBP }
            ];
            
            currencies.forEach(curr => {
                const item = document.createElement('div');
                item.className = 'weather-detail-item';
                item.innerHTML = `
                    <i class="fas fa-money-bill-wave"></i>
                    <div>
                        <div class="detail-label">${curr.code} - ${curr.name}</div>
                        <div class="detail-value">₩${curr.rate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                `;
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Currency detail error:', error);
        }
    }

    openStockDetailModal() {
        document.getElementById('stockModal').classList.add('active');
        this.updateStockDetail();
    }

    updateStockDetail() {
        const container = document.getElementById('stockDetailBody');
        container.innerHTML = '';
        
        // Show dummy data for KOSPI/KOSDAQ and custom symbols
        const indices = [
            { label: 'KOSPI', value: 2500 + Math.random() * 100 },
            { label: 'KOSDAQ', value: 800 + Math.random() * 50 }
        ];
        
        indices.forEach(idx => {
            const change = (Math.random() - 0.5) * 2;
            const item = document.createElement('div');
            item.className = 'weather-detail-item';
            item.innerHTML = `
                <i class="fas fa-chart-line"></i>
                <div>
                    <div class="detail-label">${idx.label}</div>
                    <div class="detail-value">${idx.value.toFixed(2)} <span class="${change > 0 ? 'stock-up' : 'stock-down'}">(${change > 0 ? '+' : ''}${change.toFixed(2)}%)</span></div>
                </div>
            `;
            container.appendChild(item);
        });
        
        // Add custom symbols
        (this.settings.stockSymbols || []).forEach(symbol => {
            const value = 50000 + Math.random() * 100000;
            const change = (Math.random() - 0.5) * 10;
            const item = document.createElement('div');
            item.className = 'weather-detail-item';
            item.innerHTML = `
                <i class="fas fa-chart-bar"></i>
                <div>
                    <div class="detail-label">${symbol.name} (${symbol.code})</div>
                    <div class="detail-value">₩${value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} <span class="${change > 0 ? 'stock-up' : 'stock-down'}">(${change > 0 ? '+' : ''}${change.toFixed(2)}%)</span></div>
                </div>
            `;
            container.appendChild(item);
        });
    }
}

// ========================================
// Initialize App
// ========================================
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BookmarkApp();
});