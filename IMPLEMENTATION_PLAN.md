# Implementation Plan

## Obsidian Tweet Saver Chrome Extension

### 1. Project Overview

This document outlines the step-by-step implementation plan for building the Obsidian Tweet Saver Chrome extension. The project will be developed in phases, starting with a minimal viable product (MVP) and expanding with additional features.

### 2. Development Phases

#### Phase 1: Foundation & MVP (Weeks 1-2)

**Goal:** Create a working Chrome extension that can save tweet links to Obsidian

#### Phase 2: Enhanced Features (Weeks 3-4)

**Goal:** Add base selection, improved UI, and error handling

#### Phase 3: Polish & Optimization (Week 5)

**Goal:** Performance optimization, testing, and documentation

### 3. Technical Stack

- **Frontend:** HTML, CSS, JavaScript (ES6+)
- **Extension Framework:** Chrome Extension Manifest V3
- **API Integration:** Obsidian Local REST API
- **Build Tools:** Webpack (optional for bundling)
- **Testing:** Jest (for unit tests), Chrome Extension testing

### 4. Phase 1: Foundation & MVP

#### 4.1 Project Setup (Day 1)

**Tasks:**

- [x] Initialize project structure
- [x] Create `manifest.json` with basic configuration
- [x] Set up development environment
- [x] Create basic file structure

**Deliverables:**

```
obsidian-tweet-saver/
├── manifest.json
├── background.js
├── content-script.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

**Implementation Details:**

- Configure manifest.json with required permissions
- Set up content script injection for Twitter/X pages
- Create basic popup interface
- Add extension icons

#### 4.2 Twitter/X Integration (Days 2-3)

**Tasks:**

- [x] Detect tweet pages on Twitter/X
- [x] Inject save button into tweet interface
- [x] Extract tweet URL and metadata
- [x] Handle different tweet page layouts

**Implementation Details:**

```javascript
// content-script.js
function detectTweetPage() {
  // Check if we're on a tweet page
  const tweetElement = document.querySelector('[data-testid="tweet"]');
  return tweetElement !== null;
}

function extractTweetData() {
  // Extract tweet URL and basic metadata
  const url = window.location.href;
  const author = document.querySelector(
    '[data-testid="User-Name"]'
  )?.textContent;
  return { url, author, timestamp: new Date().toISOString() };
}

function injectSaveButton() {
  // Add save button to tweet interface
  const saveButton = createSaveButton();
  // Insert into appropriate location
}
```

#### 4.3 Obsidian API Integration (Days 4-5)

**Tasks:**

- [x] Research Obsidian Local REST API endpoints
- [x] Implement API communication
- [x] Handle authentication and base selection
- [x] Create note format for saved tweets

**Implementation Details:**

```javascript
// background.js
class ObsidianAPI {
  constructor(baseUrl = 'http://localhost:27123') {
    this.baseUrl = baseUrl;
  }

  async saveTweet(tweetData, baseName = 'default') {
    const noteContent = this.formatTweetNote(tweetData);
    const response = await fetch(`${this.baseUrl}/vault/${baseName}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: `tweets/${this.generateFileName(tweetData)}.md`,
        content: noteContent,
      }),
    });
    return response.ok;
  }

  formatTweetNote(tweetData) {
    return `# Tweet Saved

**URL:** ${tweetData.url}
**Author:** ${tweetData.author || 'Unknown'}
**Saved:** ${new Date(tweetData.timestamp).toLocaleString()}

---
*Saved via Obsidian Tweet Saver Extension*`;
  }
}
```

#### 4.4 Basic UI Implementation (Days 6-7)

**Tasks:**

- [x] Design and implement popup interface
- [x] Create save button for tweet pages
- [x] Add basic styling and responsiveness
- [x] Implement user feedback (success/error messages)

**Implementation Details:**

```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        width: 300px;
        padding: 16px;
      }
      .status {
        margin: 8px 0;
        padding: 8px;
        border-radius: 4px;
      }
      .success {
        background: #d4edda;
        color: #155724;
      }
      .error {
        background: #f8d7da;
        color: #721c24;
      }
    </style>
  </head>
  <body>
    <h3>Obsidian Tweet Saver</h3>
    <div id="status"></div>
    <button id="testConnection">Test Obsidian Connection</button>
    <div id="settings">
      <label>Default Base:</label>
      <select id="baseSelect">
        <option value="default">Default</option>
      </select>
    </div>
    <script src="popup.js"></script>
  </body>
</html>
```

### 5. Phase 2: Enhanced Features

#### 5.1 Base Management (Days 8-9)

**Tasks:**

- [ ] Implement dynamic base discovery
- [ ] Add base creation functionality
- [ ] Store user preferences
- [ ] Implement base selection UI

**Implementation Details:**

```javascript
// Enhanced ObsidianAPI class
async getAvailableBases() {
    const response = await fetch(`${this.baseUrl}/vault/bases`);
    return response.json();
}

async createBase(baseName) {
    const response = await fetch(`${this.baseUrl}/vault/bases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: baseName })
    });
    return response.ok;
}
```

#### 5.2 Advanced UI Features (Days 10-11)

**Tasks:**

- [ ] Add keyboard shortcuts
- [ ] Implement context menu integration
- [ ] Add settings page
- [ ] Improve visual design and animations

**Implementation Details:**

```javascript
// Keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-tweet') {
    // Trigger save action
  }
});

// Context menu
chrome.contextMenus.create({
  id: 'saveTweet',
  title: 'Save Tweet to Obsidian',
  contexts: ['page'],
  documentUrlPatterns: ['*://twitter.com/*', '*://x.com/*'],
});
```

#### 5.3 Error Handling & Resilience (Days 12-13)

**Tasks:**

- [ ] Implement comprehensive error handling
- [ ] Add retry mechanisms
- [ ] Handle offline scenarios
- [ ] Add connection status monitoring

**Implementation Details:**

```javascript
class ErrorHandler {
  static async withRetry(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
      }
    }
  }

  static handleObsidianError(error) {
    if (error.code === 'ECONNREFUSED') {
      return 'Obsidian is not running or Local REST API is not enabled';
    }
    return 'Unknown error occurred';
  }
}
```

### 6. Phase 3: Polish & Optimization

#### 6.1 Performance Optimization (Days 14-15)

**Tasks:**

- [ ] Optimize content script injection
- [ ] Minimize API calls
- [ ] Implement caching strategies
- [ ] Add performance monitoring

**Implementation Details:**

```javascript
// Optimized content script
class TweetDetector {
  constructor() {
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.processedTweets = new Set();
  }

  start() {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  handleMutations(mutations) {
    // Efficiently detect new tweets without excessive DOM queries
  }
}
```

#### 6.2 Testing & Quality Assurance (Days 16-17)

**Tasks:**

- [ ] Write unit tests for core functionality
- [ ] Test on different Twitter/X page layouts
- [ ] Test with various Obsidian configurations
- [ ] Perform cross-browser compatibility testing

**Implementation Details:**

```javascript
// Example unit test
describe('ObsidianAPI', () => {
  test('should format tweet note correctly', () => {
    const tweetData = {
      url: 'https://twitter.com/user/status/123',
      author: 'Test User',
      timestamp: '2024-01-01T00:00:00Z',
    };

    const api = new ObsidianAPI();
    const note = api.formatTweetNote(tweetData);

    expect(note).toContain('https://twitter.com/user/status/123');
    expect(note).toContain('Test User');
  });
});
```

#### 6.3 Documentation & Deployment (Days 18-19)

**Tasks:**

- [ ] Create user documentation
- [ ] Write developer documentation
- [ ] Prepare Chrome Web Store listing
- [ ] Create installation instructions

### 7. Development Environment Setup

#### 7.1 Required Tools

- **Node.js** (v16+)
- **Chrome Browser** (for testing)
- **Obsidian** with Local REST API plugin
- **Git** for version control

#### 7.2 Development Workflow

1. **Local Development:**

   ```bash
   # Load extension in Chrome
   chrome://extensions/ -> Developer mode -> Load unpacked
   ```

2. **Testing:**

   - Test on Twitter/X pages
   - Verify Obsidian integration
   - Check error handling scenarios

3. **Debugging:**
   - Use Chrome DevTools for content scripts
   - Check background script logs
   - Monitor network requests to Obsidian API

### 8. Risk Mitigation Strategies

#### 8.1 Technical Risks

- **Twitter/X Layout Changes:** Use robust selectors and fallback detection methods
- **Obsidian API Changes:** Implement version checking and graceful degradation
- **iCloud Sync Issues:** Add conflict resolution and retry mechanisms

#### 8.2 Development Risks

- **Scope Creep:** Stick to MVP features in Phase 1
- **Timeline Delays:** Build in buffer time and prioritize core features
- **Testing Challenges:** Set up automated testing early

### 9. Success Criteria

#### 9.1 Phase 1 Success Criteria

- [ ] Extension loads without errors
- [ ] Can detect tweets on Twitter/X
- [ ] Successfully saves tweet links to Obsidian
- [ ] Basic error handling works

#### 9.2 Phase 2 Success Criteria

- [ ] Multiple base support works
- [ ] User preferences are saved
- [ ] Advanced UI features function correctly
- [ ] Error handling is comprehensive

#### 9.3 Phase 3 Success Criteria

- [ ] Performance meets requirements (< 2s API calls)
- [ ] All tests pass
- [ ] Documentation is complete
- [ ] Ready for Chrome Web Store submission

### 10. Post-Launch Roadmap

#### 10.1 Immediate Post-Launch (Week 6)

- Monitor user feedback
- Fix critical bugs
- Performance optimization based on real usage

#### 10.2 Future Enhancements (Months 2-3)

- Support for other social media platforms
- Advanced content extraction
- Batch operations
- Analytics and insights

### 11. Resource Requirements

#### 11.1 Development Resources

- **Developer Time:** ~4-5 weeks for full implementation
- **Testing Time:** ~1 week for comprehensive testing
- **Documentation:** ~3-4 days for complete documentation

#### 11.2 Technical Resources

- Chrome extension development knowledge
- Obsidian Local REST API familiarity
- JavaScript/HTML/CSS proficiency
- Testing framework experience

### 12. Conclusion

This implementation plan provides a structured approach to building the Obsidian Tweet Saver Chrome extension. By following this phased approach, we can deliver a working MVP quickly while building a foundation for future enhancements. The plan emphasizes testing, error handling, and user experience throughout the development process.

## Other future work

- enable multiple add-on buttons for saving various types of content/to different bases
- fetch from obsidian when loading the page to determine if content has already been saved, and make saving idempotent where content can't be saved more than once
