import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { fetchSessions, type ActionItem } from "../Services/sessionService";
import { FiCheckCircle, FiClock, FiAlertCircle, FiChevronRight } from "react-icons/fi";

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [myActions, setMyActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActions = async () => {
      if (!token || !user) return;
      try {
        const sessions = await fetchSessions(token);
        const allActions = sessions.flatMap(s => s.action_items || []);
        const filtered = allActions.filter(item => item.assignee_id === user.id && item.status !== 'completed');
        setMyActions(filtered.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }));
      } catch (error) {
        console.error("Failed to load dashboard actions", error);
      } finally {
        setLoading(false);
      }
    };

    loadActions();
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
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Projects</h3>
                <p className="text-4xl font-black text-gray-900 mt-3 tracking-tighter">12</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="text-emerald-500 text-xs font-black">+2 This Week</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Active Teams</h3>
                <p className="text-4xl font-black text-gray-900 mt-3 tracking-tighter">4</p>
                <div className="mt-5">
                  <span className="text-gray-400 text-xs font-black">Stable Impact</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Tech Debt Score</h3>
                <p className="text-4xl font-black text-gray-900 mt-3 tracking-tighter">84<span className="text-lg text-gray-300">/100</span></p>
                <div className="mt-5">
                  <span className="text-emerald-500 text-xs font-black">Healthy Refactor</span>
                </div>
              </div>
           </div>

           {/* Activity List */}
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Recent Activity</h2>
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center font-black text-xs mr-5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      P{i}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-[15px] tracking-tight">Project Evolution Update {i}</p>
                      <p className="text-xs text-gray-400 font-bold mt-0.5">Automated synchronization • 2 hours ago</p>
                    </div>
                  </div>
                  <FiChevronRight className="text-gray-300 group-hover:text-blue-600 transition-all" size={20} />
                </div>
              ))}
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
