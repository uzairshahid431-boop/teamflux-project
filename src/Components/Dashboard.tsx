import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { fetchSessions, type ActionItem } from "../Services/sessionService";
import { fetchDashboardSummary, type DashboardStats } from "../Services/dashboardService";
import { FiCheckCircle, FiClock, FiAlertCircle, FiChevronRight, FiBriefcase, FiTarget, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [myActions, setMyActions] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token || !user) return;
      try {
        const [sessions, summaryData] = await Promise.all([
          fetchSessions(token),
          fetchDashboardSummary(token)
        ]);
        
        // Process Actions
        const allActions = sessions.flatMap(s => s.action_items || []);
        const filtered = allActions.filter(item => item.assignee_id === user.id && item.status !== 'completed');
        setMyActions(filtered.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }));

        setStats(summaryData);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token, user]);

  const overdueCount = myActions.filter(item => item.due_date && new Date(item.due_date) < new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back, {user?.name || user?.email?.split('@')[0]}!</p>
        </div>
        <div className="hidden sm:block">
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100">
            {user?.role || 'Contributor'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Column */}
        <div className="lg:col-span-3 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard/projects')}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FiBriefcase size={80} />
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Projects</h3>
                <p className="text-4xl font-black text-gray-900 mt-3 tracking-tighter">{loading ? '...' : stats?.totalProjects}</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-emerald-500 text-xs font-black">{stats?.projectsChange}</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard/teams')}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FiUsers size={80} />
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Active Teams</h3>
                <p className="text-4xl font-black text-gray-900 mt-3 tracking-tighter">{loading ? '...' : stats?.activeTeams}</p>
                <div className="mt-5">
                  <span className="text-blue-500 text-xs font-black">{stats?.teamsStatus}</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all cursor-pointer" onClick={() => navigate('/dashboard/debt')}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FiTarget size={80} />
                </div>
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Tech Debt Score</h3>
                <p className="text-4xl font-black text-gray-900 mt-3 tracking-tighter">{loading ? '...' : stats?.debtScore}<span className="text-lg text-gray-300">/100</span></p>
                <div className="mt-5">
                  <span className={`${(stats?.debtScore || 0) > 80 ? 'text-emerald-500' : (stats?.debtScore || 0) > 60 ? 'text-amber-500' : 'text-rose-500'} text-xs font-black`}>
                    {stats?.debtStatus}
                  </span>
                </div>
              </div>
           </div>

           {/* Activity List */}
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[400px]">
            <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Recent Activity</h2>
            <div className="space-y-8">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center animate-pulse">
                    <div className="h-12 w-12 bg-gray-100 rounded-2xl mr-5"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                       <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-[2rem]">
                   <p className="text-sm font-bold text-gray-400">No recent activity detected.</p>
                </div>
              ) : (
                stats.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group cursor-pointer" onClick={() => item.link && navigate(item.link)}>
                    <div className="flex items-center">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs mr-5 transition-all
                        ${item.type === 'project' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 
                          item.type === 'debt' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' : 
                          'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}
                      >
                        {item.type === 'project' ? 'PROJ' : item.type === 'debt' ? 'DEBT' : 'GESS'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-[15px] tracking-tight">{item.title}</p>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">{item.subtitle} • {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-gray-300 group-hover:text-blue-600 transition-all" size={20} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Widget: My Action Items */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 p-8 rounded-[3rem] shadow-2xl shadow-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-white text-sm font-black uppercase tracking-widest">My Tasks</h3>
               {overdueCount > 0 && (
                 <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-pulse">
                   {overdueCount} OVERDUE
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
              {loading ? (
                <div className="py-10 text-center">
                   <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full mx-auto"></div>
                </div>
              ) : myActions.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/20">
                    <FiCheckCircle size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-500">All caught up!</p>
                </div>
              ) : (
                myActions.map(item => {
                  const isOverdue = item.due_date && new Date(item.due_date) < new Date();
                  return (
                    <div key={item.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all cursor-pointer group">
                       <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${item.status === 'in_progress' ? 'text-blue-400' : 'text-gray-500'}`}>
                             {item.status === 'in_progress' ? <FiClock size={16} /> : <FiAlertCircle size={16} />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-gray-100 tracking-tight leading-snug group-hover:text-white transition-colors">{item.title}</p>
                             {item.due_date && (
                               <p className={`text-[10px] font-black mt-2 uppercase tracking-widest ${isOverdue ? 'text-rose-400' : 'text-gray-500'}`}>
                                 Due {new Date(item.due_date).toLocaleDateString()}
                               </p>
                             )}
                          </div>
                       </div>
                    </div>
                  )
                })
              )}
            </div>

            <button className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95">
               Expand Task Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
