import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiSearch, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';

interface NavbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 sticky top-0 w-full animate-in slide-in-from-top duration-300">
      <div className="flex items-center flex-1 gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700"
        >
          <FiMenu size={24} />
        </button>

        <span className="text-xl font-black text-blue-700 tracking-tight">TeamFlux</span>
        
        <div className="h-6 w-[1px] bg-gray-100 mx-2 hidden md:block"></div>
        
        {/* Search Bar */}
        <div className="hidden sm:flex relative items-center max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" size={16} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            placeholder="Search tasks, teammates, or projects..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <FiBell size={20} />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-50 transition-all"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
              {getInitials(displayName)}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{displayName}</span>
            <FiChevronDown className={`hidden md:block text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} size={16} />
          </button>

          {/* Dropdown Menu - Simple */}
          {dropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-1 bg-white border border-slate-200 z-50 animate-in">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Account</p>
                <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
              </div>
              
              <div className="py-1 px-1">
                <a href="#" className="flex items-center px-4 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                  <FiUser className="mr-3 text-slate-400" size={14} />
                  My Profile
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                  <FiSettings className="mr-3 text-slate-400" size={14} />
                  Settings
                </a>
              </div>
              
              <div className="border-t border-slate-100 mt-1 py-1 px-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-lg transition-all"
                >
                  <FiLogOut className="mr-3" size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
