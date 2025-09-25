# Obsidian Tweet Saver Chrome Extension

A Chrome extension that allows you to save tweets directly to your Obsidian vault using the Local REST API.

## Features

- **One-click tweet saving**: Save tweets with a single click while browsing Twitter/X
- **Smart button placement**: Save button appears next to bookmark button on tweet detail pages
- **Keyboard shortcuts**: Use `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux) to save tweets
- **Context menu integration**: Right-click on Twitter/X pages to save tweets
- **Obsidian integration**: Directly saves to your Obsidian vault using the Local REST API
- **Clean note format**: Creates well-formatted markdown notes for each saved tweet
- **Visual feedback**: Button shows hover effects and click animations

## Installation

### Prerequisites

1. **Obsidian** with the **Local REST API** plugin installed and enabled
2. **Chrome browser** (or Chromium-based browser)

### Setup

1. **Install the Local REST API plugin in Obsidian:**

   - Open Obsidian
   - Go to Settings → Community plugins
   - Search for "Local REST API" and install it
   - Enable the plugin and note the port (default: 27123)

2. **Load the extension in Chrome:**

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select this folder
   - The extension should now appear in your extensions list

3. **Test the connection:**
   - Click the extension icon in your browser toolbar
   - Click "Test Obsidian Connection" to verify everything is working

## Usage

### Saving Tweets

1. **Navigate to any tweet on Twitter/X**
2. **Click the save button** that appears next to the tweet's action buttons (like, retweet, etc.)
3. **Or use the keyboard shortcut**: `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows/Linux)
4. **Or right-click** on the page and select "Save Tweet to Obsidian"

### Extension Popup

- Click the extension icon to open the popup
- Test your Obsidian connection
- Configure your default base (vault)
- View current page information

## File Structure

```
obsidian-tweet-saver/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API communication
├── content-script.js      # Twitter/X page integration
├── popup/
│   ├── popup.html        # Extension popup interface
│   ├── popup.css         # Popup styling
│   └── popup.js          # Popup functionality
├── icons/
│   ├── icon16.png        # 16x16 extension icon
│   ├── icon48.png        # 48x48 extension icon
│   └── icon128.png       # 128x128 extension icon
└── README.md             # This file
```

## Development

### Local Development

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension card
4. Test your changes

### Testing

- Test on various Twitter/X page layouts
- Verify Obsidian integration works
- Check error handling scenarios
- Test keyboard shortcuts and context menu

## Troubleshooting

### Connection Issues

- **"Failed to connect to Obsidian"**: Make sure Obsidian is running and the Local REST API plugin is enabled
- **"HTTP 404"**: Check that the Local REST API plugin is properly configured
- **"Connection refused"**: Verify the API port (default: 27123) is correct

### Extension Issues

- **Save button not appearing**: Refresh the Twitter/X page
- **Keyboard shortcut not working**: Make sure you're on a Twitter/X page
- **Context menu not showing**: Check that the extension has the correct permissions

## Contributing

This is Phase 1 of the implementation. Future phases will include:

- Multiple base (vault) support
- Advanced UI features
- Performance optimizations
- Enhanced error handling

## License

MIT License - see LICENSE file for details.
