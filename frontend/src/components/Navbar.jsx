import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg fixed top-0 left-0 right-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Toggle + Logo + Title */}
          <div className="flex items-center min-w-0 flex-1">
            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="mr-3 p-2 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Logo */}
            <img 
              src="/ncc-logo.png" 
              alt="NCC Logo" 
              className="h-10 w-10 mr-3 flex-shrink-0 rounded-full border-2 border-white shadow-sm"
            />
            
            {/* Title - Hidden on very small screens */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">NCC Management System</h1>
              <p className="text-xs text-blue-200 hidden sm:block">Unity • Discipline • Excellence</p>
            </div>
          </div>

          {/* Right Section: User Info + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* User Info - Responsive */}
            <div className="hidden sm:flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium truncate max-w-32">{user?.fullName}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                user?.accessLevel === 'super_admin' ? 'bg-red-600' :
                user?.accessLevel === 'admin' ? 'bg-blue-700' :
                'bg-green-600'
              }`}>
                {user?.accessLevel?.replace('_', ' ').toUpperCase() || 'USER'}
              </span>
            </div>
            
            {/* Mobile User Info - Just name and access level */}
            <div className="sm:hidden flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span className={`text-xs px-2 py-1 rounded-full ${
                user?.accessLevel === 'super_admin' ? 'bg-red-600' :
                user?.accessLevel === 'admin' ? 'bg-blue-700' :
                'bg-green-600'
              }`}>
                {user?.accessLevel?.replace('_', ' ').toUpperCase() || 'USER'}
              </span>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-sm bg-blue-700 hover:bg-blue-600 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
