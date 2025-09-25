# Product Requirements Document (PRD)

## Obsidian Tweet Saver Chrome Extension

### 1. Product Overview

**Product Name:** Obsidian Tweet Saver  
**Product Type:** Chrome Browser Extension  
**Version:** 1.0  
**Target Users:** Obsidian users who want to save tweet links for future reference

### 2. Problem Statement

Users want to save interesting tweets they encounter while browsing Twitter/X, but prefer to store these references in their Obsidian knowledge base rather than relying on Twitter's bookmarking system. This allows for better organization, searchability, and integration with their existing knowledge management workflow.

### 3. Product Goals

- Enable users to quickly save tweet links to their Obsidian vault
- Provide a seamless integration between Twitter/X and Obsidian
- Support multiple Obsidian bases for organized tweet storage
- Maintain simplicity while being extensible for future enhancements

### 4. User Stories

#### Primary User Story

**As a** music enthusiast and Obsidian user  
**I want to** save interesting tweet links to my Obsidian vault  
**So that** I can revisit them later for discovering new music and other content

#### Secondary User Stories

- **As a** user, **I want to** choose which Obsidian base to save tweets to **so that** I can organize them by topic or purpose
- **As a** user, **I want to** save tweets with minimal clicks **so that** the workflow doesn't interrupt my browsing
- **As a** user, **I want to** see confirmation when tweets are saved **so that** I know the action was successful

### 5. Functional Requirements

#### 5.1 Core Features

- **Tweet Link Detection**: Automatically detect when user is viewing a tweet on Twitter/X
- **One-Click Save**: Provide a simple button/action to save the current tweet link
- **Obsidian Integration**: Send tweet links to Obsidian via Local REST API
- **Base Selection**: Allow users to choose which Obsidian base to save to
- **Success Feedback**: Show confirmation when tweet is successfully saved

#### 5.2 Technical Requirements

- **Chrome Extension**: Implement as a browser extension for Chrome
- **Content Script**: Inject UI elements into Twitter/X pages
- **Background Script**: Handle communication with Obsidian API
- **Local REST API**: Integrate with Obsidian's Local REST API plugin
- **iCloud Compatibility**: Work with Obsidian vaults stored in iCloud

#### 5.3 Data Requirements

- **Tweet URL**: Capture the full URL of the tweet
- **Timestamp**: Record when the tweet was saved
- **Base Selection**: Store user's preferred base for different types of content
- **Metadata**: Optionally capture tweet author and basic metadata

### 6. Non-Functional Requirements

#### 6.1 Performance

- Extension should load quickly and not impact Twitter/X page performance
- API calls to Obsidian should complete within 2 seconds
- Minimal memory footprint

#### 6.2 Usability

- Intuitive user interface that doesn't clutter Twitter/X interface
- Clear visual feedback for all actions
- Keyboard shortcuts for power users

#### 6.3 Reliability

- Graceful error handling when Obsidian is not available
- Retry mechanism for failed API calls
- Offline capability (queue saves when Obsidian is unavailable)

#### 6.4 Security

- No data collection or external API calls
- All data stays local between browser and Obsidian
- Secure communication with Local REST API

### 7. User Interface Requirements

#### 7.1 Twitter/X Integration

- **Floating Action Button**: Small, unobtrusive button on tweet pages
- **Context Menu**: Right-click option on tweets
- **Toolbar Integration**: Optional toolbar button for quick access

#### 7.2 Extension Popup

- **Base Selection**: Dropdown to choose target Obsidian base
- **Settings**: Configuration for default base and preferences
- **Status**: Show connection status with Obsidian

#### 7.3 Visual Design

- **Minimal Design**: Clean, simple interface that doesn't distract
- **Twitter/X Theme**: Match Twitter/X's design language
- **Accessibility**: Support for screen readers and keyboard navigation

### 8. Technical Architecture

#### 8.1 Extension Structure

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
└── options/
    ├── options.html
    ├── options.js
    └── options.css
```

#### 8.2 Data Flow

1. User visits Twitter/X tweet page
2. Content script detects tweet and injects save button
3. User clicks save button
4. Extension captures tweet URL and metadata
5. Background script sends data to Obsidian via Local REST API
6. User receives confirmation of successful save

### 9. Integration Requirements

#### 9.1 Obsidian Integration

- **Local REST API**: Use Obsidian's community plugin for API access
- **Base Support**: Create notes in specified Obsidian bases
- **Note Format**: Standardized note format for saved tweets
- **Metadata**: Include timestamp, URL, and optional metadata

#### 9.2 Browser Integration

- **Chrome Extension API**: Use standard Chrome extension APIs
- **Permissions**: Minimal required permissions
- **Storage**: Local storage for user preferences

### 10. Success Metrics

#### 10.1 User Engagement

- Number of tweets saved per user per week
- User retention rate (users who continue using after first week)
- Time to complete save action (should be < 5 seconds)

#### 10.2 Technical Performance

- API response time (< 2 seconds)
- Extension load time (< 1 second)
- Error rate (< 5% of save attempts)

### 11. Future Enhancements

#### 11.1 Phase 2 Features

- **Multiple Site Support**: Extend to other social media platforms
- **Content Extraction**: Save tweet content, not just links
- **Tagging System**: Add tags to saved tweets
- **Search Integration**: Full-text search within saved tweets

#### 11.2 Advanced Features

- **Batch Operations**: Save multiple tweets at once
- **Scheduled Saves**: Queue tweets for later saving
- **Export Options**: Export saved tweets to other formats
- **Analytics**: Track saving patterns and preferences

### 12. Constraints and Assumptions

#### 12.1 Constraints

- Must work with Obsidian's Local REST API plugin
- Limited to Chrome browser initially
- Cannot modify Twitter/X's core functionality
- Must respect Twitter/X's terms of service

#### 12.2 Assumptions

- User has Obsidian installed with Local REST API plugin
- User's Obsidian vault is accessible via local API
- User prefers link-based saving over content extraction
- iCloud sync works reliably with Obsidian

### 13. Risk Assessment

#### 13.1 Technical Risks

- **API Changes**: Twitter/X or Obsidian API changes could break functionality
- **iCloud Sync**: Potential conflicts with iCloud synchronization
- **Browser Updates**: Chrome extension API changes

#### 13.2 Mitigation Strategies

- Regular testing with latest versions
- Graceful degradation when APIs are unavailable
- Clear error messages and user guidance
- Backup save mechanisms

### 14. Launch Plan

#### 14.1 MVP Scope

- Basic tweet link saving to single Obsidian base
- Simple UI integration with Twitter/X
- Local REST API integration
- Basic error handling

#### 14.2 Post-Launch

- User feedback collection
- Performance monitoring
- Feature iteration based on usage patterns
- Expansion to additional platforms
