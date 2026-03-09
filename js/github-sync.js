// ========================================
// GitHub Gist Sync Module
// ========================================

class GitHubSync {
    constructor(app) {
        this.app = app;
        this.apiBase = 'https://api.github.com';
        this.gistFilename = 'startpage-data.json';
        this.syncInterval = null;
        this.isSyncing = false;
    }

    // ========================================
    // Token Management
    // ========================================
    
    getToken() {
        return localStorage.getItem('github_token') || '';
    }

    setToken(token) {
        localStorage.setItem('github_token', token);
    }

    getGistId() {
        return localStorage.getItem('github_gist_id') || '';
    }

    setGistId(gistId) {
        localStorage.setItem('github_gist_id', gistId);
    }

    isConfigured() {
        return this.getToken() && this.getGistId();
    }

    // ========================================
    // GitHub API Methods
    // ========================================

    async apiRequest(endpoint, method = 'GET', body = null) {
        const token = this.getToken();
        if (!token) {
            throw new Error('GitHub token not configured');
        }

        const options = {
            method,
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.apiBase}${endpoint}`, options);
        
        if (!response.ok) {
            let errorMessage = `GitHub API error: ${response.status}`;
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch (e) {
                // Response body is not JSON
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }

    // ========================================
    // Gist Operations
    // ========================================

    async createGist(data) {
        const gistData = {
            description: 'Bryan\'s Start Page - Data Sync',
            public: false,
            files: {
                [this.gistFilename]: {
                    content: JSON.stringify(data, null, 2)
                }
            }
        };

        const gist = await this.apiRequest('/gists', 'POST', gistData);
        this.setGistId(gist.id);
        return gist;
    }

    async updateGist(data) {
        const gistId = this.getGistId();
        if (!gistId) {
            throw new Error('Gist ID not found');
        }

        const gistData = {
            files: {
                [this.gistFilename]: {
                    content: JSON.stringify(data, null, 2)
                }
            }
        };

        return await this.apiRequest(`/gists/${gistId}`, 'PATCH', gistData);
    }

    async getGist() {
        const gistId = this.getGistId();
        if (!gistId) {
            throw new Error('Gist ID not found');
        }

        // Add timestamp to prevent caching
        const cacheBuster = `?_=${Date.now()}`;
        const gist = await this.apiRequest(`/gists/${gistId}${cacheBuster}`);
        const content = gist.files[this.gistFilename]?.content;
        
        if (!content) {
            throw new Error('Gist file not found');
        }

        return JSON.parse(content);
    }

    async verifyToken() {
        try {
            await this.apiRequest('/user');
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // ========================================
    // Auto-discover Gist
    // ========================================
    
    async findStartpageGist() {
        try {
            console.log('🔍 Searching for existing Startpage Gist...');
            const gists = await this.apiRequest('/gists');
            
            // Find gist with startpage-data.json
            const startpageGist = gists.find(gist => 
                gist.files && gist.files[this.gistFilename]
            );
            
            if (startpageGist) {
                console.log('✅ Found existing Gist:', startpageGist.id);
                return startpageGist.id;
            }
            
            console.log('ℹ️ No existing Startpage Gist found');
            return null;
        } catch (error) {
            console.error('Error searching for Gist:', error);
            return null;
        }
    }

    // ========================================
    // Data Sync Methods
    // ========================================

    prepareDataForSync() {
        return {
            categories: this.app.categories,
            settings: this.app.settings,
            footerBookmarks: this.app.footerBookmarks || [],
            lastUpdated: new Date().toISOString(),
            version: '2.1'
        };
    }

    async pushData() {
        if (this.isSyncing) {
            console.log('⏸️ Sync already in progress, skipping...');
            return;
        }

        try {
            this.isSyncing = true;
            this.updateSyncStatus('syncing', 'Syncing...');

            const data = this.prepareDataForSync();
            const gistId = this.getGistId();

            console.log('📦 Data to sync:', {
                categories: data.categories?.length || 0,
                bookmarks: data.categories?.reduce((s,c)=>s+c.bookmarks.length,0) || 0,
                settings: Object.keys(data.settings || {}).length,
                searchEngines: Object.keys(data.settings?.searchEngines || {}).length,
                footerBookmarks: data.footerBookmarks?.length || 0,
                timestamp: data.lastUpdated
            });

            if (gistId) {
                console.log('📤 Updating existing Gist:', gistId.substring(0, 8) + '...');
                const result = await this.updateGist(data);
                console.log('✅ Gist updated successfully');
                
                // Verify update by fetching back
                const verification = await this.getGist();
                console.log('🔍 Verification - Gist now contains:', {
                    categories: verification.categories?.length || 0,
                    bookmarks: verification.categories?.reduce((s,c)=>s+c.bookmarks.length,0) || 0,
                    searchEngines: Object.keys(verification.settings?.searchEngines || {}).length
                });
            } else {
                console.log('📤 Creating new Gist...');
                const gist = await this.createGist(data);
                console.log('✅ New Gist created:', gist.id);
            }

            // Update last sync time
            localStorage.setItem('lastSyncTime', data.lastUpdated);
            
            this.updateSyncStatus('success', 'Synced successfully');
            console.log('✅ Data pushed to GitHub Gist successfully');
            console.log('⏰ Sync timestamp:', data.lastUpdated);
            
            // Auto-hide success message after 3s
            setTimeout(() => {
                this.updateSyncStatus('idle', '');
            }, 3000);

        } catch (error) {
            console.error('❌ Push error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            
            let errorMsg = 'Sync failed';
            if (error.message.includes('401') || error.message.includes('token')) {
                errorMsg = 'Invalid token. Please reconnect.';
            } else if (error.message.includes('403')) {
                errorMsg = 'Permission denied. Check token scope.';
            } else if (error.message.includes('Network')) {
                errorMsg = 'Network error. Check connection.';
            } else {
                errorMsg = `Sync failed: ${error.message}`;
            }
            
            this.updateSyncStatus('error', errorMsg);
        } finally {
            this.isSyncing = false;
        }
    }

    async pullData(forceOverwrite = false) {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        try {
            this.isSyncing = true;
            this.updateSyncStatus('syncing', 'Loading from cloud...');

            const cloudData = await this.getGist();

            // Validate data structure
            if (!cloudData || typeof cloudData !== 'object') {
                throw new Error('Invalid data structure from Gist');
            }

            console.log('☁️ Cloud data received:', {
                categories: cloudData.categories?.length || 0,
                bookmarks: cloudData.categories?.reduce((s,c)=>s+c.bookmarks.length,0) || 0,
                searchEngines: Object.keys(cloudData.settings?.searchEngines || {}).length,
                footerBookmarks: cloudData.footerBookmarks?.length || 0,
                timestamp: cloudData.lastUpdated
            });
            console.log('💾 Local data timestamp:', localStorage.getItem('lastSyncTime'));

            // Conflict detection: compare timestamps
            const localTimestamp = localStorage.getItem('lastSyncTime');
            const cloudTimestamp = cloudData.lastUpdated;

            if (!forceOverwrite && localTimestamp && cloudTimestamp) {
                const localTime = new Date(localTimestamp).getTime();
                const cloudTime = new Date(cloudTimestamp).getTime();

                if (localTime > cloudTime) {
                    console.log('⚠️ Local data is newer than cloud data!');
                    console.log('🔄 Pushing local data to cloud instead...');
                    await this.pushData();
                    return;
                }
            }

            // Apply data to app
            if (cloudData.categories) {
                console.log('📥 카테고리 적용:', cloudData.categories.length);
                this.app.categories = cloudData.categories;
            }
            if (cloudData.settings) {
                console.log('📥 설정 적용:', Object.keys(cloudData.settings).length, '항목');
                // 완전히 덮어쓰기 (병합하지 않음)
                this.app.settings = cloudData.settings;
            }
            if (cloudData.footerBookmarks) {
                console.log('📥 푸터 북마크 적용:', cloudData.footerBookmarks.length);
                this.app.footerBookmarks = cloudData.footerBookmarks;
            }

            // Update last sync time
            localStorage.setItem('lastSyncTime', cloudData.lastUpdated || new Date().toISOString());

            // Save to localStorage as backup
            this.app.saveToLocalStorage();
            localStorage.setItem('settings', JSON.stringify(this.app.settings));
            localStorage.setItem('footerBookmarks', JSON.stringify(this.app.footerBookmarks));
            
            console.log('💾 로컬 백업 저장 완료');

            // Re-render everything
            this.app.render();
            
            // Apply settings
            this.app.applyBackgroundSettings();
            this.app.applyFontSizes();
            this.app.applyPageTitle();
            applyWidgetSizes(this.app);
            applyWidgetVisibility(this.app);
            
            renderFooterBookmarks(this.app);

            // 🔥 모든 위젯 재초기화 (설정 복원)
            console.log('🔄 Re-initializing ALL widgets with restored settings...');
            
            // 날씨 위젯 (도시, API 키, 온도 단위, 서핑지수)
            initWeatherWidget(this.app);
            
            // 시계 위젯 (형식, 초 표시, 날짜 형식, 타임존)
            initClockWidget(this.app);
            
            // 환율 위젯 (USD, EUR, JPY, CNY 선택)
            initCurrencyWidget(this.app);
            
            // 주식 위젯 (KOSPI, KOSDAQ, S&P500, NASDAQ, 심볼)
            initStockWidget(this.app);
            
            // 검색 위젯 (검색 엔진 목록, 기본 엔진)
            initSearchWidget(this.app);
            
            console.log('✅ All widgets reinitialized with settings:', {
                weather: `${this.app.settings.weatherCity} (${this.app.settings.weatherUnit})`,
                clock: `${this.app.settings.clockFormat}h / ${this.app.settings.clockTimezone}`,
                currency: [
                    this.app.settings.currencyUSD && 'USD',
                    this.app.settings.currencyEUR && 'EUR',
                    this.app.settings.currencyJPY && 'JPY',
                    this.app.settings.currencyCNY && 'CNY'
                ].filter(Boolean).join(', '),
                stock: `${this.app.settings.stockSymbols?.length || 0} symbols`,
                search: `${Object.keys(this.app.settings.searchEngines || {}).length} engines`
            });

            this.updateSyncStatus('success', 'Loaded from cloud');
            console.log('✅ Data pulled from GitHub Gist successfully');
            console.log('💾 All Settings Restored:', {
                weather: this.app.settings.weatherCity,
                clock: this.app.settings.clockTimezone,
                currency: Object.keys(this.app.settings).filter(k => k.startsWith('currency') && this.app.settings[k]),
                stock: this.app.settings.stockSymbols?.length || 0,
                search: Object.keys(this.app.settings.searchEngines || {}).length
            });

            // Auto-hide success message after 3s
            setTimeout(() => {
                this.updateSyncStatus('idle', '');
            }, 3000);

        } catch (error) {
            console.error('❌ Pull error:', error);
            
            // More helpful error messages
            let errorMsg = 'Load failed';
            if (error.message.includes('404') || error.message.includes('not found')) {
                errorMsg = 'Gist not found. Will create on first save.';
            } else if (error.message.includes('401') || error.message.includes('token')) {
                errorMsg = 'Invalid token. Please reconnect.';
            } else {
                errorMsg = `Load failed: ${error.message}`;
            }
            
            this.updateSyncStatus('error', errorMsg);
            
            // Re-throw for initialSync to handle
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    async initialSync() {
        if (!this.isConfigured()) {
            console.log('ℹ️ GitHub sync not configured');
            return false;
        }

        try {
            // Check if Gist exists
            const gistId = this.getGistId();
            if (!gistId) {
                console.log('ℹ️ No Gist ID found, will create on first save');
                return false;
            }

            console.log('🔄 Initial sync: Checking for cloud data...');
            
            // Try to pull data from existing Gist
            await this.pullData();
            console.log('✅ Initial sync completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Initial sync failed:', error.message);
            console.log('📂 Using local data instead');
            
            // Don't throw error, just use local data
            return false;
        }
    }

    // ========================================
    // Auto-sync
    // ========================================

    startAutoSync(intervalMinutes = 5) {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            if (this.isConfigured()) {
                this.pushData();
            }
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // ========================================
    // UI Updates
    // ========================================

    updateSyncStatus(status, message) {
        const statusEl = document.getElementById('sync-status');
        if (!statusEl) return;

        statusEl.className = `sync-status ${status}`;
        statusEl.textContent = message;

        // Update icon based on status
        const iconMap = {
            idle: '',
            syncing: '⏳',
            success: '✅',
            error: '❌'
        };

        if (iconMap[status]) {
            statusEl.textContent = `${iconMap[status]} ${message}`;
        }
    }

    // ========================================
    // Migration Helper
    // ========================================

    async migrateFromLocalStorage() {
        if (this.getGistId()) {
            console.log('Already migrated');
            return;
        }

        try {
            this.updateSyncStatus('syncing', 'Migrating to cloud...');
            
            const data = this.prepareDataForSync();
            await this.createGist(data);
            
            this.updateSyncStatus('success', 'Migration complete!');
            console.log('Successfully migrated to GitHub Gist');

            setTimeout(() => {
                this.updateSyncStatus('idle', '');
            }, 3000);

        } catch (error) {
            console.error('Migration error:', error);
            this.updateSyncStatus('error', `Migration failed: ${error.message}`);
        }
    }

    // ========================================
    // Disconnect
    // ========================================

    disconnect() {
        this.stopAutoSync();
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_gist_id');
        this.updateSyncStatus('idle', '');
        console.log('Disconnected from GitHub');
    }
}
