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
    chrome.storage.local?.remove?.(['user'], () => {
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
    <div className="p-6 w-[640px] max-w-full bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Time Tracking</h1>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-6">
        <SessionTimer />
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="portfolio" className="form-label">
            Portfolio
          </label>
          <PortfolioDropdown />
        </div>
        
        <div>
          <label htmlFor="project" className="form-label">
            Project
          </label>
          <ProjectDropdown />
        </div>
        
        <div>
          <label htmlFor="task" className="form-label">
            Task
          </label>
          <TaskDropdown />
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Latest Screenshot</h2>
        <div className="border rounded-lg overflow-hidden">
          <ScreenshotDisplay />
        </div>
      </div>
    </div>
  );
}

// Wrapper for UrlMappingsPage to keep consistent styling
function UrlMappingsWrapper() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <UrlMappingsPage />
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm mb-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-start h-16">
                <div className="flex space-x-8 items-center">
                  <Link to="/" className="text-gray-700 hover:text-blue-500 px-3 py-2 text-sm font-medium transition-colors">
                    Home
                  </Link>
                  <Link to="/url-mappings" className="text-gray-700 hover:text-blue-500 px-3 py-2 text-sm font-medium transition-colors">
                    URL Mappings
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<MainApp />} />
              <Route path="/url-mappings" element={<UrlMappingsWrapper />} />
              {/* Default unknown paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppDataProvider>
  );
}

export default App;
