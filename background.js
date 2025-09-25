import { CONFIG } from './config.js';
// Background script for Obsidian Tweet Saver
class ObsidianAPI {
  constructor(baseUrl = 'http://localhost:27123', apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async saveTweet(tweetData) {
    try {
      const fileName = this.generateFileName(tweetData);
      const noteContent = this.formatTweetNote(tweetData, fileName);
      console.log('fileName:', fileName);

      const response = await fetch(
        `${this.baseUrl}/vault/references/${fileName}.md`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/markdown',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: noteContent,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true, fileName };
    } catch (error) {
      console.error('Error saving tweet:', error);
      return { success: false, error: error.message };
    }
  }

  formatTweetNote(tweetData, fileName) {
    const timestamp = new Date(tweetData.timestamp).toLocaleString();
    return `---
title: ${fileName}
tags: [xeet, saved-xeet, new-music]
created: ${timestamp}
listened: false
---

# Tweet Saved

**URL:** ${tweetData.url}
**Author:** ${tweetData.author || 'Unknown'}
**Saved:** ${timestamp}

---

*Saved via Obsidian Tweet Saver Extension*`;
  }

  generateFileName(tweetData) {
    // Extract tweet ID from URL or use timestamp
    const urlParts = tweetData.url.split('/');
    const tweetId = urlParts[urlParts.length - 1];
    const author = tweetData.author
      ? tweetData.author.replace(/[^a-zA-Z0-9]/g, '_')
      : 'unknown';
    return `${author}_${tweetId}`;
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Initialize Obsidian API with configuration
let obsidianAPI;

// Load configuration and initialize API
async function initializeAPI() {
  try {
    // Try to load config.js if it exists
    const apiKey = CONFIG?.apiKey;
    const baseUrl = CONFIG?.baseUrl;

    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE') {
      obsidianAPI = new ObsidianAPI(baseUrl, apiKey);
      console.log('Obsidian API initialized with config file');
    } else {
      // Fallback: try to get API key from Chrome storage
      const settings = await chrome.storage.sync.get(['apiKey', 'baseUrl']);
      if (settings.apiKey) {
        obsidianAPI = new ObsidianAPI(
          settings.baseUrl || 'http://localhost:27123',
          settings.apiKey
        );
        console.log('Obsidian API initialized with stored settings');
      } else {
        obsidianAPI = new ObsidianAPI(
          settings.baseUrl || 'http://localhost:27123',
          settings.apiKey
        );
        console.log(
          'Obsidian API initialized without API key - please configure'
        );
      }
    }
  } catch (error) {
    console.log('Config file not found, trying Chrome storage...');
    // Fallback: try to get API key from Chrome storage
    try {
      const settings = await chrome.storage.sync.get(['apiKey', 'baseUrl']);
      if (settings.apiKey) {
        obsidianAPI = new ObsidianAPI(
          settings.baseUrl || 'http://localhost:27123',
          settings.apiKey
        );
        console.log('Obsidian API initialized with stored settings');
      } else {
        obsidianAPI = new ObsidianAPI(
          settings.baseUrl || 'http://localhost:27123',
          settings.apiKey
        );
        console.log(
          'Obsidian API initialized without API key - please configure'
        );
      }
    } catch (storageError) {
      obsidianAPI = new ObsidianAPI(
        settings.baseUrl || 'http://localhost:27123',
        settings.apiKey
      );
      console.log(
        'Obsidian API initialized without API key - please configure'
      );
    }
  }
}

// Initialize API on startup
initializeAPI();

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveTweet') {
    if (!obsidianAPI) {
      sendResponse({
        success: false,
        error: 'API not initialized. Please configure your API key.',
      });
      return;
    }
    obsidianAPI
      .saveTweet(request.tweetData)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === 'testConnection') {
    if (!obsidianAPI) {
      sendResponse({
        success: false,
        error: 'API not initialized. Please configure your API key.',
      });
      return;
    }
    obsidianAPI
      .testConnection()
      .then((result) => sendResponse({ success: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'updateConfig') {
    // Update API configuration dynamically
    const { apiKey, baseUrl } = request;
    obsidianAPI = new ObsidianAPI(baseUrl || 'http://localhost:27123', apiKey);

    // Save to Chrome storage as backup
    chrome.storage.sync.set({
      apiKey: apiKey,
      baseUrl: baseUrl || 'http://localhost:27123',
    });

    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'getConfig') {
    // Return current configuration status
    const hasApiKey = obsidianAPI && obsidianAPI.apiKey;
    sendResponse({
      success: true,
      hasApiKey: !!hasApiKey,
      baseUrl: obsidianAPI ? obsidianAPI.baseUrl : 'http://localhost:27123',
    });
    return true;
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command:', command);
  if (command === 'save-tweet') {
    console.log('Saving tweet via keyboard shortcut');
    // Send message to content script to save current tweet
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (
        tabs[0] &&
        (tabs[0].url.includes('twitter.com') || tabs[0].url.includes('x.com'))
      ) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'saveTweetFromShortcut',
        });
      }
    });
  }
});

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveTweet',
    title: 'Save Tweet to Obsidian',
    contexts: ['page'],
    documentUrlPatterns: ['*://twitter.com/*', '*://x.com/*'],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveTweet') {
    chrome.tabs.sendMessage(tab.id, { action: 'saveTweetFromContext' });
  }
});
