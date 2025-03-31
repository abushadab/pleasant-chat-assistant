
// src/utils/storageAdapter.ts

// Check if we're running in a Chrome extension context
export const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage !== undefined;

// Create a storage adapter that works in both environments
export const storageAdapter = {
  get: (keys: string | string[] | Record<string, any>, callback: (result: any) => void) => {
    if (isChromeExtension) {
      chrome.storage.local.get(keys, callback);
    } else {
      // In development, use localStorage as a fallback
      const result: Record<string, any> = {};
      if (Array.isArray(keys)) {
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              result[key] = JSON.parse(value);
            } catch {
              result[key] = value;
            }
          }
        });
      } else if (typeof keys === 'string') {
        const value = localStorage.getItem(keys);
        if (value) {
          try {
            result[keys] = JSON.parse(value);
          } catch {
            result[keys] = value;
          }
        }
      } else {
        Object.keys(keys).forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              result[key] = JSON.parse(value);
            } catch {
              result[key] = value;
            }
          } else {
            result[key] = keys[key]; // Default value
          }
        });
      }
      callback(result);
    }
  },
  set: (items: Record<string, any>, callback?: () => void) => {
    if (isChromeExtension) {
      chrome.storage.local.set(items, callback);
    } else {
      // In development, use localStorage as a fallback
      Object.entries(items).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      if (callback) callback();
    }
  },
  onChanged: {
    addListener: (callback: (changes: Record<string, any>, areaName: string) => void) => {
      if (isChromeExtension) {
        chrome.storage.onChanged.addListener(callback);
      }
      // We don't have a good way to listen for localStorage changes
      // in a different context, so this is a no-op in development
    },
    removeListener: (callback: (changes: Record<string, any>, areaName: string) => void) => {
      if (isChromeExtension) {
        chrome.storage.onChanged.removeListener(callback);
      }
    }
  }
};

// Create a runtime messaging adapter
export const runtimeAdapter = {
  sendMessage: (message: any, callback?: (response: any) => void) => {
    if (isChromeExtension) {
      chrome.runtime.sendMessage(message, callback);
    } else {
      // In development, simulate responses
      if (message.type === 'GET_ELAPSED_TIME') {
        const now = Date.now();
        const isRunning = localStorage.getItem('isRunning') === 'true';
        const accumulatedTime = parseInt(localStorage.getItem('accumulatedTime') || '0', 10);
        const sessionStart = parseInt(localStorage.getItem('sessionStart') || '0', 10);
        
        let elapsed = accumulatedTime;
        if (isRunning && sessionStart) {
          elapsed += (now - sessionStart);
        }
        
        if (callback) callback({ elapsed });
      } else if (message.type === 'TOGGLE_TIMER') {
        const isRunning = localStorage.getItem('isRunning') === 'true';
        const accumulatedTime = parseInt(localStorage.getItem('accumulatedTime') || '0', 10);
        const sessionStart = parseInt(localStorage.getItem('sessionStart') || '0', 10);
        
        if (!isRunning) {
          localStorage.setItem('isRunning', 'true');
          localStorage.setItem('sessionStart', Date.now().toString());
        } else {
          const now = Date.now();
          const sessionElapsed = now - sessionStart;
          const newAccumulated = accumulatedTime + sessionElapsed;
          localStorage.setItem('isRunning', 'false');
          localStorage.setItem('accumulatedTime', newAccumulated.toString());
          localStorage.setItem('sessionStart', '0');
        }
        
        if (callback) callback({ success: true });
      } else if (message.type === 'CALL_REACT_FUNCTION') {
        console.log('Development mode received request:', message.payload);
        if (callback) callback({ result: 'Development mode processing complete' });
      }
    }
  }
};
