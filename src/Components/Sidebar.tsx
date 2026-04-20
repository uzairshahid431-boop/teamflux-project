import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiClock, 
  FiAlertCircle, 
  FiArchive,
  FiX,
  FiMenu,
  FiActivity
} from 'react-icons/fi';
import { useUI } from '../Context/UIContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Home', path: '/dashboard', icon: FiHome },
  { name: 'Teams', path: '/dashboard/teams', icon: FiUsers },
  { name: 'Projects', path: '/dashboard/projects', icon: FiBriefcase },
  { name: 'Sessions', path: '/dashboard/sessions', icon: FiClock },
  { name: 'Debt', path: '/dashboard/debt', icon: FiAlertCircle },
  { name: 'Analytics', path: '/dashboard/debt/analytics', icon: FiActivity },
  { name: 'Deprecations', path: '/dashboard/deprecations', icon: FiArchive },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { isSidebarCollapsed: isCollapsed, setIsSidebarCollapsed } = useUI();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed md:sticky top-0 md:top-16 left-0 z-30 h-screen md:h-[calc(100vh-64px)] bg-white border-r border-gray-100 transform transition-opacity duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64 flex flex-col`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} h-16 border-b border-gray-50`}>
          <button
            onClick={() => setIsSidebarCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <FiMenu size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-0' : ''}`} />
          </button>
          
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                // Use 'end' for the root dashboard and 'Debt' to prevent overlapping highlights
                end={item.path === '/dashboard' || item.name === 'Deprecations'}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.name : ""}
                className={({ isActive }) =>
                  `flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className={`${isCollapsed ? 'm-0' : 'mr-3'} h-5 w-5 flex-shrink-0 transition-all`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
        
        {/* {!isCollapsed && (
          <div className="p-4 animate-in fade-in duration-500">
            <div className="bg-blue-50/50 rounded-2xl p-6 text-center">
              <p className="text-sm font-bold text-blue-900 mb-1">Go Premium</p>
              <p className="text-xs text-blue-700 mb-4">Unlock all features</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm">
                Upgrade
              </button>
            </div>
          </div>
        )} */}
      </aside>
    </>
  );
};

export default Sidebar;
