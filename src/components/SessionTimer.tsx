
// src/components/SessionTimer.tsx
import React, { useState, useEffect } from 'react';
import { Square, Play } from 'lucide-react';

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
  }
};

// Create a runtime messaging adapter
const runtimeAdapter = {
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
      }
    }
  }
};

const SessionTimer = () => {
  const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
  const [isRunning, setIsRunning] = useState(false);

  // Function to fetch elapsed time and running state from storage
  const fetchElapsedTime = () => {
    // Request elapsed time
    runtimeAdapter.sendMessage({ type: 'GET_ELAPSED_TIME' }, (response) => {
      if (response && typeof response.elapsed === 'number') {
        setElapsedTime(response.elapsed);
      }
    });
    
    // Also update isRunning state directly from storage
    storageAdapter.get('isRunning', (result) => {
      setIsRunning(result.isRunning || false);
    });
  };

  // Toggle timer state
  const toggleTimer = () => {
    runtimeAdapter.sendMessage({ type: 'TOGGLE_TIMER' }, (response) => {
      // Optionally, you can update local isRunning state after toggling.
      // Here we rely on the subsequent polling to update the state.
    });
  };

  // Poll for elapsed time every second
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchElapsedTime();
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Convert elapsed time (ms) into total seconds, then hours and minutes
  const totalSeconds = Math.floor(elapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl mb-4">
        Session Time: {hours}hrs {formattedMinutes}m
      </p>
      <button
        onClick={toggleTimer}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
      >
        {isRunning ? (
          <>
            <Square className="w-5 h-5" /> Stop
          </>
        ) : (
          <>
            <Play className="w-5 h-5" /> Start
          </>
        )}
      </button>
    </div>
  );
};

export default SessionTimer;
