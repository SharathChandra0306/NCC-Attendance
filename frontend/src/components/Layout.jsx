import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen  bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex relative pt-16"> {/* Add top padding for fixed navbar */}
        <div className={`${isMobile ? 'fixed z-30 top-16' : 'relative'} ${isMobile && !sidebarOpen ? 'hidden' : ''}`}>
          <Sidebar isOpen={sidebarOpen} onLinkClick={closeSidebar} />
        </div>
        
        {/* Mobile Overlay - only covers main content */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 top-16 bg-black bg-opacity-30 z-20"
            onClick={closeSidebar}
          ></div>
        )}
        
        <main className={`flex-1 p-3 sm:p-4 md:p-6 transition-all duration-300 ${!isMobile && !sidebarOpen ? 'ml-0' : isMobile ? 'ml-0' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
