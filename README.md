
# Time Tracker Chrome Extension

A simple time tracking application that can be used as a Chrome extension. Track your time on different tasks and projects, and export your data.

## Features

- Start, pause, and stop time tracking
- Name your tasks
- View your time tracking history
- Export your data as JSON
- Settings for notifications and behavior

## How to Use as a Chrome Extension

1. Build the project:
   ```
   npm run build
   ```

2. Open Chrome and navigate to `chrome://extensions/`
  
3. Enable "Developer mode" (toggle in the top right)
  
4. Click "Load unpacked" and select the `dist` folder from this project
  
5. The extension should now be installed. Click the extension icon in the Chrome toolbar to open it.

## Development

To run the project locally:

```
npm install
npm run dev
```

## Building

To build the project for production:

```
npm run build
```

## Notes

- Time entries are stored in your browser's local storage
- For the extension version, data is synced through Chrome's storage API
- You can export your data and import it later

## License

MIT

