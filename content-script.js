// Content script for Twitter/X integration
class TweetDetector {
  constructor() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.processedTweets = new WeakSet();
    this.saveButton = null;
    this.pendingNodes = new Set();
    this.scanScheduled = false;
  }

  start() {
    // Start observing DOM changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Check if we're already on a tweet page
    this.checkForTweetPage();
  }

  handleMutations(mutations) {
    let hasNewElements = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.pendingNodes.add(node);
          hasNewElements = true;
        }
      });
    });

    if (hasNewElements && !this.scanScheduled) {
      this.scanScheduled = true;
      requestAnimationFrame(() => this.processPendingNodes());
    }
  }

  processPendingNodes() {
    this.scanScheduled = false;

    // Ensure detail page has a single injected button
    if (this.isTweetDetailPage()) {
      this.injectSaveButtonOnDetailPage();
    }

    // Scan only newly added subtrees for tweets
    this.pendingNodes.forEach((node) => {
      this.scanNodeForTweets(node);
    });
    this.pendingNodes.clear();
  }

  scanNodeForTweets(rootNode) {
    const tweetElements = rootNode.querySelectorAll(
      'article[data-testid="tweet"]'
    );

    tweetElements.forEach((tweetElement) => {
      this.injectSaveButton(tweetElement);
    });
  }

  checkForTweetPage(rootNode = document) {
    // Check if we're on a tweet detail page (single tweet view)
    if (this.isTweetDetailPage()) {
      this.injectSaveButtonOnDetailPage();
      return;
    }

    // Look for tweet elements in timeline
    const tweetElements = rootNode.querySelectorAll('[data-testid="tweet"]');

    tweetElements.forEach((tweetElement) => {
      if (!this.processedTweets.has(tweetElement)) {
        this.processedTweets.add(tweetElement);
        this.injectSaveButton(tweetElement);
      }
    });
  }

  isTweetDetailPage() {
    // Check if we're on a tweet detail page by looking for specific elements
    const tweetDetailSelectors = [
      '[data-testid="tweetDetail"]',
      'article[role="article"]',
      '[data-testid="primaryColumn"] article',
      'main article',
      '[data-testid="tweet"]',
    ];

    // Also check URL pattern for tweet detail pages
    const isTweetUrl = /\/status\/\d+/.test(window.location.pathname);

    return (
      tweetDetailSelectors.some(
        (selector) => document.querySelector(selector) !== null
      ) && isTweetUrl
    );
  }

  injectSaveButtonOnDetailPage() {
    // Look for the bookmark button or action bar on tweet detail page
    const bookmarkButton = document.querySelector('[data-testid="bookmark"]');
    const actionBar = document.querySelector('[role="group"]');
    const shareButton = document.querySelector('[data-testid="share"]');

    // Hide the default bookmark button
    if (bookmarkButton) {
      bookmarkButton.style.display = 'none';
    }

    const tryInsertInto = (container, afterNode = null) => {
      if (!container) return false;
      if (container.querySelector('.obsidian-save-button')) return true;
      const saveButton = this.createSaveButton(true);
      if (afterNode) {
        container.insertBefore(saveButton, afterNode.nextSibling);
      } else {
        container.appendChild(saveButton);
      }
      return true;
    };

    // Try to replace the bookmark button position
    if (bookmarkButton && bookmarkButton.parentElement) {
      if (tryInsertInto(bookmarkButton.parentElement, bookmarkButton)) return;
    }
    if (shareButton && shareButton.parentElement) {
      if (tryInsertInto(shareButton.parentElement, shareButton)) return;
    }
    if (actionBar) {
      if (tryInsertInto(actionBar)) return;
    }

    const buttonContainer =
      document.querySelector('[role="group"]') ||
      document.querySelector('[data-testid="reply"]')?.parentElement;
    if (buttonContainer) {
      tryInsertInto(buttonContainer);
    }
  }

  injectSaveButton(tweetElement) {
    // Find the action bar (where like, retweet, etc. buttons are)
    const actionBar = tweetElement.querySelector('[role="group"]');
    if (!actionBar) return;

    // Hide the default bookmark button
    const bookmarkButton = tweetElement.querySelector(
      '[data-testid="bookmark"]'
    );
    if (bookmarkButton) {
      bookmarkButton.style.display = 'none';
    }

    // Check if save button already exists
    if (actionBar.querySelector('.obsidian-save-button')) return;

    // Create save button
    const saveButton = this.createSaveButton();

    // Try to replace the bookmark button position first
    if (bookmarkButton && bookmarkButton.parentElement) {
      bookmarkButton.parentElement.insertBefore(
        saveButton,
        bookmarkButton.nextSibling
      );
      return;
    }

    // Insert before the last element (usually the share button)
    const lastChild = actionBar.lastElementChild;
    if (lastChild) {
      actionBar.insertBefore(saveButton, lastChild);
    } else {
      actionBar.appendChild(saveButton);
    }
  }

  createSaveButton(isDetail = false) {
    const button = document.createElement('div');
    button.className =
      'obsidian-save-button' + (isDetail ? ' obsidian-detail' : '');
    button.setAttribute('title', 'Save to Obsidian');

    // Create the button element
    const buttonElement = document.createElement('div');
    buttonElement.setAttribute('role', 'button');
    buttonElement.setAttribute('tabindex', '0');
    buttonElement.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: rgb(113, 118, 123);
      position: relative;
      margin: 0 4px;
    `;

    const svg = document.createElement('div');
    svg.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#252323" width="512" height="512" rx="100"/>
        <path d="M359.9 434.3c-2.6 19.1-21.3 34-40 28.9-26.4-7.3-57-18.7-84.7-20.8l-42.3-3.2a27.9 27.9 0 0 1-18-8.4l-73-75a27.9 27.9 0 0 1-5.4-31s45.1-99 46.8-104.2c1.7-5.1 7.8-50 11.4-74.2a28 28 0 0 1 9-16.6l86.2-77.5a28 28 0 0 1 40.6 3.5l72.5 92a29.7 29.7 0 0 1 6.2 18.3c0 17.4 1.5 53.2 11.1 76.3a303 303 0 0 0 35.6 58.5 14 14 0 0 1 1.1 15.7c-6.4 10.8-18.9 31.4-36.7 57.9a143.3 143.3 0 0 0-20.4 59.8Z" fill="#8adb8f"/>
      </svg>
    `;

    // Create indicator dot
    const indicator = document.createElement('div');
    indicator.className = 'obsidian-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: #6366f1;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    // Assemble the button
    buttonElement.appendChild(svg);
    buttonElement.appendChild(indicator);
    button.appendChild(buttonElement);

    // Add hover event listeners
    buttonElement.addEventListener('mouseover', () => {
      buttonElement.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
      buttonElement.style.color = 'rgb(99, 102, 241)';
    });

    buttonElement.addEventListener('mouseout', () => {
      buttonElement.style.backgroundColor = 'transparent';
      buttonElement.style.color = 'rgb(113, 118, 123)';
    });

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.saveCurrentTweet();

      // Show visual feedback
      if (indicator) {
        indicator.style.opacity = '1';
        setTimeout(() => {
          indicator.style.opacity = '0';
        }, 1000);
      }
    });

    return button;
  }

  extractTweetData() {
    const url = window.location.href;

    // Try to extract author from various possible selectors
    let author = 'Unknown';
    const authorSelectors = [
      '[data-testid="User-Name"]',
      '[data-testid="User-Names"]',
      'a[href*="/"] span[dir="ltr"]',
      '[role="link"] span[dir="ltr"]',
    ];

    for (const selector of authorSelectors) {
      const authorElement = document.querySelector(selector);
      if (authorElement) {
        author = authorElement.textContent.trim();
        break;
      }
    }

    return {
      url,
      author,
      timestamp: new Date().toISOString(),
      pageTitle: document.title,
      tweetContent: document
        .querySelector('[data-testid="tweetText"]')
        .textContent.trim(),
    };
  }

  async saveCurrentTweet() {
    const tweetData = this.extractTweetData();

    // Show loading state
    this.showSaveStatus('Saving...', 'loading');

    try {
      // Get user's preferred base from storage
      const result = await chrome.storage.sync.get(['defaultBase']);
      const baseName = result.defaultBase || 'default';

      // Send to background script
      const response = await chrome.runtime.sendMessage({
        action: 'saveTweet',
        tweetData: tweetData,
        baseName: baseName,
      });

      if (response.success) {
        this.showSaveStatus('Saved to Obsidian!', 'success');
      } else {
        this.showSaveStatus(`Error: ${response.error}`, 'error');
      }
    } catch (error) {
      this.showSaveStatus(`Error: ${error.message}`, 'error');
    }
  }

  showSaveStatus(message, type) {
    // Remove existing status if any
    const existingStatus = document.querySelector('.obsidian-status');
    if (existingStatus) {
      existingStatus.remove();
    }

    // Create status element
    const status = document.createElement('div');
    status.className = 'obsidian-status';
    status.textContent = message;
    status.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: opacity 0.3s ease;
      ${type === 'success' ? 'background: #10b981; color: white;' : ''}
      ${type === 'error' ? 'background: #ef4444; color: white;' : ''}
      ${type === 'loading' ? 'background: #3b82f6; color: white;' : ''}
    `;

    document.body.appendChild(status);

    // Auto-remove after 3 seconds (unless it's a loading state)
    if (type !== 'loading') {
      setTimeout(() => {
        if (status.parentNode) {
          status.style.opacity = '0';
          setTimeout(() => status.remove(), 300);
        }
      }, 3000);
    }
  }
}

// Add CSS styles for the save button
const addStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide the default bookmark button */
    [data-testid="bookmark"] {
      display: none !important;
    }
    
    .obsidian-save-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .obsidian-save-button:hover {
      transform: scale(1.05);
    }
    
    .obsidian-save-button:active {
      transform: scale(0.95);
    }
    
    /* Ensure button doesn't interfere with Twitter's layout */
    .obsidian-save-button * {
      box-sizing: border-box;
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .obsidian-save-button [role="button"] {
        color: rgb(113, 118, 123) !important;
      }
      
      .obsidian-save-button:hover [role="button"] {
        color: rgb(99, 102, 241) !important;
        background-color: rgba(99, 102, 241, 0.1) !important;
      }
    }
  `;
  document.head.appendChild(style);
};

// Initialize tweet detector when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    const detector = new TweetDetector();
    detector.start();
  });
} else {
  addStyles();
  const detector = new TweetDetector();
  detector.start();
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
    request.action === 'saveTweetFromShortcut' ||
    request.action === 'saveTweetFromContext'
  ) {
    const detector = new TweetDetector();
    detector.saveCurrentTweet();
  }
});
