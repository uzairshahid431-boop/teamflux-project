import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useUI } from '../Context/UIContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isNavbarHidden } = useUI();

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {!isNavbarHidden && (
        <Navbar setSidebarOpen={setSidebarOpen} />
      )}
      
      <div className="flex flex-1 min-w-0 overflow-hidden relative">
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
