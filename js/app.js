// ========================================
// App State Management
// ========================================
class BookmarkApp {
    constructor() {
        this.categories = [];
        this.currentEditingCategory = null;
        this.currentEditingBookmark = null;
        this.currentCategoryId = null;
        this.deleteCallback = null;
        this.settings = {
            bgImage: '',
            bgPreset: '',
            categoryFontSize: 10,
            bookmarkFontSize: 12,
            pageTitle: 'Bryan\'s Start Page',
            pageTitleIcon: 'fa-bookmark'
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.loadSettings();
        this.setupEventListeners();
        this.render();
        this.initTheme();
        this.applyBackgroundSettings();
        this.applyFontSizes();
        this.applyPageTitle();
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

        // Add category
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());

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

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));

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
}

// ========================================
// Initialize App
// ========================================
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BookmarkApp();
});
