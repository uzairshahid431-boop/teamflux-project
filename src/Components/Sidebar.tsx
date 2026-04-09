import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiClock, 
  FiAlertCircle, 
  FiArchive,
  FiX
} from 'react-icons/fi';

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
  { name: 'Deprecations', path: '/dashboard/deprecations', icon: FiArchive },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
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
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-6">
          <span className="text-2xl font-black text-blue-700 tracking-tight">TeamFlux</span>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4">
          <div className="bg-blue-50/50 rounded-2xl p-6 text-center">
            <p className="text-sm font-bold text-blue-900 mb-1">Go Premium</p>
            <p className="text-xs text-blue-700 mb-4">Unlock all features</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-sm">
              Upgrade
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
