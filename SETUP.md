# Obsidian Tweet Saver - Setup Guide

## API Key Configuration

This extension requires an API key from Obsidian's Local REST API plugin. You have two ways to configure it:

### Method 1: Configuration File (Recommended for Development)

1. Copy the template file:

   ```bash
   cp config.js.template config.js
   ```

2. Edit `config.js` and replace `YOUR_API_KEY_HERE` with your actual API key:

   ```javascript
   const CONFIG = {
     apiKey: 'your-actual-api-key-here',
     baseUrl: 'http://localhost:27123', // Optional: change if needed
   };
   ```

3. The `config.js` file is automatically excluded from version control via `.gitignore`

### Method 2: Extension Popup (Recommended for End Users)

1. Open the extension popup by clicking the extension icon
2. Enter your API key in the "Configuration" section
3. Optionally change the server URL (default: `http://localhost:27123`)
4. Click "Save Configuration"

## Getting Your Obsidian API Key

1. Open Obsidian
2. Go to Settings (⚙️)
3. Navigate to "Core plugins"
4. Enable "Local REST API"
5. Click on "Local REST API" to open its settings
6. Copy the API token
7. Make sure the server is running (default port: 27123)

## Security Notes

- **Never commit your actual API key to version control**
- The `config.js` file is automatically ignored by git
- API keys entered through the popup are stored securely in Chrome's storage
- The popup will never display your actual API key for security reasons

## Troubleshooting

- If you see "API not initialized" errors, make sure you've configured your API key
- Test the connection using the "Test Obsidian Connection" button in the popup
- Ensure Obsidian is running with the Local REST API plugin enabled
- Check that the server URL matches your Obsidian configuration

