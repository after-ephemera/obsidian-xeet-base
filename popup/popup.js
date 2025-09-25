// Popup script for Obsidian Tweet Saver
class PopupController {
  constructor() {
    this.elements = {
      status: document.getElementById('status'),
      apiKeyInput: document.getElementById('apiKey'),
      baseUrlInput: document.getElementById('baseUrl'),
      saveConfigBtn: document.getElementById('saveConfig'),
      testConnectionBtn: document.getElementById('testConnection'),
      baseSelect: document.getElementById('baseSelect'),
      refreshBasesBtn: document.getElementById('refreshBases'),
      currentPageInfo: document.getElementById('currentPageInfo'),
    };

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadSettings();
    await this.updateCurrentPageInfo();
    await this.refreshBases();
  }

  setupEventListeners() {
    this.elements.saveConfigBtn.addEventListener('click', () =>
      this.saveConfiguration()
    );
    this.elements.testConnectionBtn.addEventListener('click', () =>
      this.testConnection()
    );
    this.elements.baseSelect.addEventListener('change', () =>
      this.saveSettings()
    );
    this.elements.refreshBasesBtn.addEventListener('click', () =>
      this.refreshBases()
    );
  }

  async testConnection() {
    this.setButtonLoading(this.elements.testConnectionBtn, true);
    this.hideStatus();

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection',
      });

      if (response.success) {
        this.showStatus('✅ Connected to Obsidian successfully!', 'success');
      } else {
        this.showStatus(
          "❌ Failed to connect to Obsidian. Make sure it's running with Local REST API enabled.",
          'error'
        );
      }
    } catch (error) {
      this.showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.setButtonLoading(this.elements.testConnectionBtn, false);
    }
  }

  async refreshBases() {
    this.setButtonLoading(this.elements.refreshBasesBtn, true);

    try {
      // For now, we'll use a default base since we need to implement base discovery
      // This will be enhanced in Phase 2
      const bases = ['default'];

      this.elements.baseSelect.innerHTML = '';
      bases.forEach((base) => {
        const option = document.createElement('option');
        option.value = base;
        option.textContent = base.charAt(0).toUpperCase() + base.slice(1);
        this.elements.baseSelect.appendChild(option);
      });

      // Restore saved selection
      const settings = await chrome.storage.sync.get(['defaultBase']);
      if (settings.defaultBase) {
        this.elements.baseSelect.value = settings.defaultBase;
      }
    } catch (error) {
      console.error('Error refreshing bases:', error);
    } finally {
      this.setButtonLoading(this.elements.refreshBasesBtn, false);
    }
  }

  async loadSettings() {
    try {
      // Load configuration from background script
      const configResponse = await chrome.runtime.sendMessage({
        action: 'getConfig',
      });

      if (configResponse.success) {
        // Don't show the actual API key for security, just indicate if it's set
        if (configResponse.hasApiKey) {
          this.elements.apiKeyInput.placeholder = 'API key is configured';
          this.elements.apiKeyInput.value = '';
        }
        this.elements.baseUrlInput.value =
          configResponse.baseUrl || 'http://localhost:27123';
      }

      // Load other settings
      const settings = await chrome.storage.sync.get(['defaultBase']);
      if (settings.defaultBase) {
        this.elements.baseSelect.value = settings.defaultBase;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async saveConfiguration() {
    this.setButtonLoading(this.elements.saveConfigBtn, true);
    this.hideStatus();

    const apiKey = this.elements.apiKeyInput.value.trim();
    const baseUrl =
      this.elements.baseUrlInput.value.trim() || 'http://localhost:27123';

    if (!apiKey) {
      this.showStatus('❌ Please enter an API key', 'error');
      this.setButtonLoading(this.elements.saveConfigBtn, false);
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'updateConfig',
        apiKey: apiKey,
        baseUrl: baseUrl,
      });

      if (response.success) {
        this.showStatus('✅ Configuration saved successfully!', 'success');
        // Clear the API key input for security
        this.elements.apiKeyInput.value = '';
        this.elements.apiKeyInput.placeholder = 'API key is configured';
      } else {
        this.showStatus('❌ Failed to save configuration', 'error');
      }
    } catch (error) {
      this.showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      this.setButtonLoading(this.elements.saveConfigBtn, false);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        defaultBase: this.elements.baseSelect.value,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  async updateCurrentPageInfo() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (
        tab &&
        (tab.url.includes('twitter.com') || tab.url.includes('x.com'))
      ) {
        this.elements.currentPageInfo.innerHTML = `
          <p><strong>Current Page:</strong> Twitter/X</p>
          <div class="url">${tab.url}</div>
          <p style="margin-top: 8px; font-size: 12px; color: #10b981;">
            ✅ Ready to save tweets from this page
          </p>
        `;
      } else {
        this.elements.currentPageInfo.innerHTML = `
          <p><strong>Current Page:</strong> ${
            tab ? new URL(tab.url).hostname : 'Unknown'
          }</p>
          <p style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            Navigate to Twitter/X to save tweets
          </p>
        `;
      }
    } catch (error) {
      this.elements.currentPageInfo.innerHTML = `
        <p>Unable to detect current page</p>
      `;
    }
  }

  showStatus(message, type) {
    this.elements.status.textContent = message;
    this.elements.status.className = `status ${type}`;
  }

  hideStatus() {
    this.elements.status.className = 'status hidden';
  }

  setButtonLoading(button, loading) {
    const text = button.querySelector('.btn-text');
    const spinner = button.querySelector('.btn-spinner');

    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
