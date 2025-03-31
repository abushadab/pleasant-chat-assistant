
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Clock, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <span>TimeTracker</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              asChild
              size="sm"
              className="flex items-center gap-2"
            >
              <Link to="/">
                <Clock className="h-4 w-4" />
                <span>Tracker</span>
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/settings' ? 'default' : 'ghost'}
              asChild
              size="sm"
              className="flex items-center gap-2"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-4 text-center text-sm text-gray-500">
        <div className="max-w-3xl mx-auto px-4">
          TimeTracker Chrome Extension &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Layout;
