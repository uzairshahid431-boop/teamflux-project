import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiSearch, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { useGetProjectsQuery, useGetTechnicalDebtsQuery, useGetSessionsQuery, useGetTeamsQuery, useGetDeprecationsQuery } from '../store/apiSlice';
import { formatDistanceToNow } from 'date-fns';

interface NavbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: debts = [] } = useGetTechnicalDebtsQuery({});
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const { data: deprecations = [] } = useGetDeprecationsQuery();

  const [readIds, setReadIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('teamflux_read_notifications');
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    let generated: any[] = [];
    
    // Recent Debts
    const recentDebts = [...debts].sort((a: any, b: any) => b.id - a.id).slice(0, 3);
    recentDebts.forEach((d: any) => {
      const id = `debt-${d.id}`;
      generated.push({
        id,
        text: `New debt: ${d.title}`,
        unread: !readIds.includes(id),
        time: d.created_at ? formatDistanceToNow(new Date(d.created_at), { addSuffix: true }) : 'Recently',
        timestamp: new Date(d.created_at || Date.now()).getTime()
      });
    });

    // Recent Projects
    const recentProjects = [...projects].sort((a: any, b: any) => b.id - a.id).slice(0, 3);
    recentProjects.forEach((p: any) => {
      const id = `proj-${p.id}`;
      generated.push({
        id,
        text: `New mission: ${p.name}`,
        unread: !readIds.includes(id),
        time: p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : 'Recently',
        timestamp: new Date(p.created_at || Date.now()).getTime()
      });
    });

    // Recent Teams
    const recentTeams = [...teams].sort((a: any, b: any) => b.id - a.id).slice(0, 3);
    recentTeams.forEach((t: any) => {
      const id = `team-${t.id}`;
      generated.push({
        id,
        text: `New squad: ${t.name}`,
        unread: !readIds.includes(id),
        time: 'Just now',
        timestamp: Date.now() - (1000 * 60 * 5) // Artificial timestamp for teams if missing
      });
    });

    // Upcoming Sessions
    const upcomingSessions = [...sessions].filter((s: any) => new Date(s.date).getTime() >= new Date().getTime()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
    upcomingSessions.forEach((s: any) => {
      const id = `session-${s.id}`;
      generated.push({
        id,
        text: `Growth session: ${s.title}`,
        unread: !readIds.includes(id),
        time: s.date ? formatDistanceToNow(new Date(s.date), { addSuffix: true }) : 'Soon',
        timestamp: new Date(s.date || 0).getTime()
      });
    });

    // Recent Deprecations
    const recentDeps = [...deprecations].sort((a: any, b: any) => b.id - a.id).slice(0, 3);
    recentDeps.forEach((dep: any) => {
      const id = `dep-${dep.id}`;
      generated.push({
        id,
        text: `New deprecation: ${dep.title}`,
        unread: !readIds.includes(id),
        time: 'Recently',
        timestamp: Date.now() - (1000 * 60 * 10)
      });
    });

    generated.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(generated);
  }, [debts, projects, sessions, teams, deprecations, readIds]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const newReadIds = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(newReadIds);
    localStorage.setItem('teamflux_read_notifications', JSON.stringify(newReadIds));
  };

  const markAsRead = (id: string) => {
    const newReadIds = Array.from(new Set([...readIds, id]));
    setReadIds(newReadIds);
    localStorage.setItem('teamflux_read_notifications', JSON.stringify(newReadIds));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
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
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {notificationsOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-xl shadow-xl py-2 bg-white border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 transition-colors ${notif.unread ? 'bg-blue-50/30' : ''}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.unread ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${notif.unread ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                          {notif.text}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
