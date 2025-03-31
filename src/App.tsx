
// src/App.tsx
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import LoginPage from './components/LoginPage';
import { AppDataProvider, AppDataContext, AuthUser } from './context/AppDataContext';
import PortfolioDropdown from './components/PortfolioDropdown';
import ProjectDropdown from './components/ProjectDropdown';
import TaskDropdown from './components/TaskDropdown';
import SessionTimer from './components/SessionTimer';
import ScreenshotDisplay from './components/ScreenshotDisplay';
import UrlMappingsPage from './components/UrlMappingsPage';
import { Clock, LogOut, Map, Home } from 'lucide-react';

// NavLink component for consistent styling
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`nav-link flex items-center gap-2 ${isActive ? 'nav-link-active' : ''}`}
    >
      {children}
    </Link>
  );
};

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
    <div className="p-6 w-[640px] max-w-full mx-auto bg-white rounded-lg shadow-card">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Clock size={24} className="text-primary-500" />
          Time Tracking
        </h1>
        <button
          onClick={handleLogout}
          className="btn btn-secondary flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      
      <div className="mb-6 bg-secondary-50 p-4 rounded-lg border border-secondary-100">
        <SessionTimer />
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="portfolio" className="form-label flex items-center gap-1">
            Portfolio
          </label>
          <PortfolioDropdown />
        </div>
        
        <div>
          <label htmlFor="project" className="form-label flex items-center gap-1">
            Project
          </label>
          <ProjectDropdown />
        </div>
        
        <div>
          <label htmlFor="task" className="form-label flex items-center gap-1">
            Task
          </label>
          <TaskDropdown />
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          Latest Screenshot
        </h2>
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <ScreenshotDisplay />
        </div>
      </div>
    </div>
  );
}

// Wrapper for UrlMappingsPage to keep consistent styling
function UrlMappingsWrapper() {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-card p-6">
      <UrlMappingsPage />
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 pb-12">
          <nav className="bg-white shadow-sm mb-6 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-start h-16">
                <div className="flex space-x-4 items-center">
                  <NavLink to="/">
                    <Home size={16} />
                    Home
                  </NavLink>
                  <NavLink to="/url-mappings">
                    <Map size={16} />
                    URL Mappings
                  </NavLink>
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
