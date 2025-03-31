
// src/components/ScreenshotDisplay.tsx
import React, { useEffect, useState } from 'react';

// Check if we're running in a Chrome extension context
const isChromeExtension = typeof chrome !== 'undefined' && chrome.storage !== undefined;

// Create a storage adapter that works in both environments
const storageAdapter = {
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

const ScreenshotDisplay = () => {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the initial screenshot URL from storage
    storageAdapter.get(['screenshot'], (result) => {
      if (result.screenshot) {
        setScreenshotUrl(result.screenshot);
      }
    });

    // Listener to update screenshot URL when changes occur in storage
    const handleStorageChange = (
      changes: { [key: string]: any },
      areaName: string
    ) => {
      if (areaName === 'local' && changes.screenshot) {
        setScreenshotUrl(changes.screenshot.newValue);
      }
    };

    storageAdapter.onChanged.addListener(handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      storageAdapter.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return (
    <div className="flex justify-center items-center">
      {screenshotUrl ? (
        <img src={screenshotUrl} alt="Latest Screenshot" className="max-w-full" />
      ) : (
        <p>No screenshot available.</p>
      )}
    </div>
  );
};

export default ScreenshotDisplay;
