// src/App.tsx
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './components/LoginPage';
import { AppDataProvider, AppDataContext, AuthUser } from './context/AppDataContext';
import PortfolioDropdown from './components/PortfolioDropdown';
import ProjectDropdown from './components/ProjectDropdown';
import TaskDropdown from './components/TaskDropdown';
import SessionTimer from './components/SessionTimer';
import ScreenshotDisplay from './components/ScreenshotDisplay';
import UrlMappingsPage from './components/UrlMappingsPage';

function MainApp() {
  const { user, setUser } = useContext(AppDataContext)!;

  useEffect(() => {
    // Check for an authenticated user from Supabase
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const loggedInUser: AuthUser = {
          id: sessionUser.id,
          email: sessionUser.email || '',
        };
        setUser(loggedInUser);
      }
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        const loggedInUser: AuthUser = {
          id: sessionUser.id,
          email: sessionUser.email || '',
        };
        setUser(loggedInUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [setUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Remove user from Chrome storage
    chrome.storage.local.remove(['user'], () => {
      console.log("User removed from storage");
    });
    // Update context
    setUser(null);
  };

  // If no user, render the login page
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="p-4 w-[640px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Time Tracking</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <SessionTimer />
      <label htmlFor="portfolio" className="block mb-2">
        Portfolio:
      </label>
      <PortfolioDropdown />
      <label htmlFor="project" className="block mb-2">
        Project:
      </label>
      <ProjectDropdown />
      <label htmlFor="task" className="block mb-2">
        Task:
      </label>
      <TaskDropdown />
      <div className="mt-2">
        <h2 className="text-lg font-bold">Latest Screenshot</h2>
        <ScreenshotDisplay />
      </div>
    </div>
  );
}

// Wrapper for UrlMappingsPage to keep consistent styling
function UrlMappingsWrapper() {
  return (
    <div className="w-[640px]">
      <UrlMappingsPage />
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <Router>
        <nav className="p-4 bg-gray-100 mb-4">
          <Link to="/" className="mr-4">Home</Link>
          <Link to="/url-mappings">URL Mappings</Link>
        </nav>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/url-mappings" element={<UrlMappingsWrapper />} />
          {/* Default unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppDataProvider>
  );
}

export default App;
