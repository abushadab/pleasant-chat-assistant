
// src/context/AppDataContext.tsx
import React, { createContext, useState, useEffect, FC, ReactNode } from 'react';

export interface PortfolioItem {
  team_id: string;
  name: string;
  description: string;
  owner_id: string;
}

export interface ProjectItem {
  project_id: string;
  name: string;
}

export interface Task {
  task_id: string;
  title: string;
}

// Define an interface for the authenticated user.
export interface AuthUser {
  id: string;
  email: string;
  // Add more fields if needed (e.g., displayName, photoUrl, etc.)
}

export interface AppDataContextType {
  niftyToken: string | null;
  setNiftyToken: (token: string | null) => void;
  portfolios: PortfolioItem[];
  setPortfolios: (portfolios: PortfolioItem[]) => void;
  selectedPortfolio: PortfolioItem | null;
  setSelectedPortfolio: (portfolio: PortfolioItem | null) => void;
  projects: ProjectItem[];
  setProjects: (projects: ProjectItem[]) => void;
  selectedProject: ProjectItem | null;
  setSelectedProject: (project: ProjectItem | null) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  // New fields for the authenticated user
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

interface AppDataProviderProps {
  children: ReactNode;
}

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

export const AppDataProvider: FC<AppDataProviderProps> = ({ children }) => {
  const [niftyToken, setNiftyToken] = useState<string | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load initial values from storage on mount.
  useEffect(() => {
    storageAdapter.get(
      [
        'niftyToken',
        'portfolios',
        'selectedPortfolio',
        'projects',
        'selectedProject',
        'tasks',
        'selectedTask',
        'user',
      ],
      (result) => {
        if (result.niftyToken) setNiftyToken(result.niftyToken);
        if (result.portfolios) setPortfolios(result.portfolios);
        if (result.selectedPortfolio) setSelectedPortfolio(result.selectedPortfolio);
        if (result.projects) setProjects(result.projects);
        if (result.selectedProject) setSelectedProject(result.selectedProject);
        if (result.tasks) setTasks(result.tasks);
        if (result.selectedTask) setSelectedTask(result.selectedTask);
        if (result.user) setUser(result.user);
      }
    );
  }, []);

  // Poll storage for niftyToken changes every 5 seconds.
  useEffect(() => {
    const fetchTokenFromStorage = () => {
      storageAdapter.get('niftyToken', (result) => {
        if (result.niftyToken && result.niftyToken !== niftyToken) {
          console.log("Pulled new niftyToken from storage:", result.niftyToken);
          setNiftyToken(result.niftyToken);
        }
      });
    };

    fetchTokenFromStorage();
    const interval = setInterval(fetchTokenFromStorage, 5000);
    return () => clearInterval(interval);
  }, [niftyToken]);

  // Poll storage for user changes every 5 seconds.
  useEffect(() => {
    const fetchUserFromStorage = () => {
      storageAdapter.get('user', (result) => {
        if (result.user && JSON.stringify(result.user) !== JSON.stringify(user)) {
          console.log("Pulled new user from storage:", result.user);
          setUser(result.user);
        }
      });
    };

    fetchUserFromStorage();
    const interval = setInterval(fetchUserFromStorage, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    storageAdapter.set({ portfolios });
  }, [portfolios]);

  useEffect(() => {
    storageAdapter.set({ selectedPortfolio });
  }, [selectedPortfolio]);

  useEffect(() => {
    storageAdapter.set({ projects });
  }, [projects]);

  useEffect(() => {
    storageAdapter.set({ selectedProject });
  }, [selectedProject]);

  useEffect(() => {
    storageAdapter.set({ tasks });
  }, [tasks]);

  useEffect(() => {
    storageAdapter.set({ selectedTask });
  }, [selectedTask]);

  useEffect(() => {
    storageAdapter.set({ niftyToken });
  }, [niftyToken]);

  useEffect(() => {
    storageAdapter.set({ user });
  }, [user]);

  return (
    <AppDataContext.Provider
      value={{
        niftyToken,
        setNiftyToken,
        portfolios,
        setPortfolios,
        selectedPortfolio,
        setSelectedPortfolio,
        projects,
        setProjects,
        selectedProject,
        setSelectedProject,
        tasks,
        setTasks,
        selectedTask,
        setSelectedTask,
        user,
        setUser,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};
