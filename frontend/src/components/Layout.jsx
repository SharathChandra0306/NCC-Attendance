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
    <div className="h-screen bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex relative pt-16">
        {/* Desktop Sidebar - Fixed positioning */}
        {!isMobile && (
          <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out flex-shrink-0`}>
            <Sidebar isOpen={sidebarOpen} onLinkClick={closeSidebar} />
          </div>
        )}
        
        {/* Mobile Sidebar - Overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div className="fixed inset-0 top-16 bg-black bg-opacity-50 z-10" onClick={closeSidebar}></div>
            <div className="fixed top-16 left-0 z-20">
              <Sidebar isOpen={true} onLinkClick={closeSidebar} />
            </div>
          </>
        )}
        
        <main className={`flex-1 p-3 sm:p-4 md:p-6 transition-all duration-300 overflow-auto h-[calc(100vh-4rem)]`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
