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
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
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
            console.log('Sync already in progress');
            return;
        }

        try {
            this.isSyncing = true;
            this.updateSyncStatus('syncing', 'Syncing...');

            const data = this.prepareDataForSync();
            const gistId = this.getGistId();

            if (gistId) {
                await this.updateGist(data);
            } else {
                await this.createGist(data);
            }

            this.updateSyncStatus('success', 'Synced successfully');
            console.log('Data pushed to GitHub Gist successfully');
            
            // Auto-hide success message after 3s
            setTimeout(() => {
                this.updateSyncStatus('idle', '');
            }, 3000);

        } catch (error) {
            console.error('Push error:', error);
            this.updateSyncStatus('error', `Sync failed: ${error.message}`);
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
            this.app.renderCategories();
            this.app.applySettings();
            if (window.footerManager) {
                window.footerManager.render();
            }

            this.updateSyncStatus('success', 'Loaded from cloud');
            console.log('Data pulled from GitHub Gist successfully');

            // Auto-hide success message after 3s
            setTimeout(() => {
                this.updateSyncStatus('idle', '');
            }, 3000);

        } catch (error) {
            console.error('Pull error:', error);
            this.updateSyncStatus('error', `Load failed: ${error.message}`);
        } finally {
            this.isSyncing = false;
        }
    }

    async initialSync() {
        if (!this.isConfigured()) {
            console.log('GitHub sync not configured');
            return;
        }

        try {
            // Try to pull data first
            await this.pullData();
        } catch (error) {
            console.log('No remote data found, will create on first save');
            // If gist doesn't exist yet, it will be created on first push
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
