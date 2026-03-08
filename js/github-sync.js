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

        const gist = await this.apiRequest(`/gists/${gistId}`);
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
                settings: Object.keys(data.settings || {}).length,
                footerBookmarks: data.footerBookmarks?.length || 0
            });

            if (gistId) {
                console.log('📤 Updating existing Gist:', gistId.substring(0, 8) + '...');
                await this.updateGist(data);
            } else {
                console.log('📤 Creating new Gist...');
                const gist = await this.createGist(data);
                console.log('✅ New Gist created:', gist.id);
            }

            this.updateSyncStatus('success', 'Synced successfully');
            console.log('✅ Data pushed to GitHub Gist successfully');
            
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

    async pullData() {
        if (this.isSyncing) {
            console.log('Sync already in progress');
            return;
        }

        try {
            this.isSyncing = true;
            this.updateSyncStatus('syncing', 'Loading from cloud...');

            const data = await this.getGist();

            // Validate data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data structure from Gist');
            }

            // Apply data to app
            if (data.categories) {
                this.app.categories = data.categories;
            }
            if (data.settings) {
                this.app.settings = { ...this.app.settings, ...data.settings };
            }
            if (data.footerBookmarks) {
                this.app.footerBookmarks = data.footerBookmarks;
            }

            // Save to localStorage as backup
            this.app.saveToLocalStorage();

            // Re-render everything
            this.app.render();
            
            // Apply settings
            this.app.applyBackgroundSettings();
            this.app.applyFontSizes();
            this.app.applyPageTitle();
            applyWidgetSizes(this.app);
            applyWidgetVisibility(this.app);
            
            renderFooterBookmarks(this.app);

            this.updateSyncStatus('success', 'Loaded from cloud');
            console.log('✅ Data pulled from GitHub Gist successfully');

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
            console.log('GitHub sync not configured');
            return false;
        }

        try {
            // Check if Gist exists
            const gistId = this.getGistId();
            if (!gistId) {
                console.log('No Gist ID found, will create on first save');
                return false;
            }

            // Try to pull data from existing Gist
            await this.pullData();
            return true;
        } catch (error) {
            console.log('Initial sync failed:', error.message);
            console.log('Will use local data and create Gist on first save');
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
