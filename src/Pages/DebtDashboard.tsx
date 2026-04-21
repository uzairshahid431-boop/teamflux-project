import React from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useGetDebtDashboardQuery, useGetTechnicalDebtsQuery } from '../store/apiSlice';
import { FiDownload, FiAlertCircle, FiClock, FiActivity, FiTarget, FiRefreshCcw } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

import { useAuth } from '../Context/AuthContext';

const DebtDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useGetDebtDashboardQuery();
  const { data: debts = [], isLoading: isDebtsLoading, isError: isDebtsError, refetch: refetchDebts } = useGetTechnicalDebtsQuery({});

  const isAdmin = user?.role === 'admin';
  const isLead = user?.role === 'lead';
  const isViewer = user?.role === 'viewer';

  const PRIORITY_COLORS: Record<string, string> = {
    critical: '#e11d48',
    high: '#ea580c',
    medium: '#d97706',
    low: '#059669',
  };

  const STATUS_COLORS: Record<string, string> = {
    identified: '#64748b',
    in_progress: '#2563eb',
    resolved: '#10b981',
    wont_fix: '#ef4444',
  };

  const handleExportCSV = async () => {
    if (isViewer) {
      toast.error('Unauthorized: Viewers cannot export data registries.');
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await axios.get('/api/dashboard/technical_debt/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `technical_debt_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export downloaded successfully');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export CSV. Please try again.');
    }
  };

  if (isStatsLoading || isDebtsLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6 lg:p-8">
        <div className="h-10 bg-gray-200 rounded-xl w-48 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 rounded-[2.5rem] h-40"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-gray-100 rounded-[3rem] h-[400px]"></div>
          <div className="bg-gray-100 rounded-[3rem] h-[400px]"></div>
        </div>
      </div>
    );
  }

  if (isStatsError || isDebtsError) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
        <span className="text-rose-600 text-sm font-bold">Failed to load analytics matrix.</span>
        <button 
          onClick={() => { refetchStats(); refetchDebts(); }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors"
        >
          <FiRefreshCcw size={14} /> Retry
        </button>
      </div>
    );
  }

  // Prepare Chart Data
  const priorityData = stats?.priority_breakdown ? Object.entries(stats.priority_breakdown).map(([key, value]) => ({
    name: key.toUpperCase(),
    value
  })) : [];

  const statusData = stats?.by_status ? Object.entries(stats.by_status).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value,
    color: STATUS_COLORS[key] || '#94a3b8'
  })) : [];

  // Aging report (items older than 30 days)
  const agingItems = debts.filter((d: any) => {
    const createdDate = new Date(d.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate < thirtyDaysAgo && d.status !== 'resolved';
  }).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
            Efficiency Analytics
            {isAdmin && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase border border-indigo-100">Global Admin</span>}
            {isLead && <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100">Team Lead</span>}
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Real-time technical debt telemetry and structural insights
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            <FiDownload size={18} />
            Export Coordinates (CSV)
          </button>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Integrity Debt</h3>
              <FiAlertCircle className="text-amber-500" size={20} />
           </div>
           <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats?.total_debts}</p>
           <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Identified Bottlenecks</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm ring-4 ring-rose-500/5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-rose-500 text-[10px] font-black uppercase tracking-widest">Critical Aging</h3>
              <FiClock className="text-rose-500" size={20} />
           </div>
           <p className="text-4xl font-black text-rose-600 tracking-tighter">{agingItems.length}</p>
           <p className="text-[10px] text-rose-400 font-bold mt-2 uppercase">Items Over 30 Days Old</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Active Resolution</h3>
              <FiActivity className="text-blue-500" size={20} />
           </div>
           <p className="text-4xl font-black text-blue-600 tracking-tighter">
             {stats?.by_status?.in_progress || 0}
           </p>
           <p className="text-[10px] text-blue-400 font-bold mt-2 uppercase">Engaged Items</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Total Resolved</h3>
              <FiTarget className="text-emerald-500" size={20} />
           </div>
           <p className="text-4xl font-black text-emerald-600 tracking-tighter">
             {stats?.by_status?.resolved || 0}
           </p>
           <p className="text-[10px] text-emerald-400 font-bold mt-2 uppercase">Neutralized Risks</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Priority Pie Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Priority Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Bar Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tighter uppercase">Status Breakdown</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Aging Report Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
           <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Aging Report (30+ Days)</h3>
           <div className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase">Requires Attention</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Debt Item</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stagnation</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {agingItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Zero Critical Stagnation Detected</p>
                  </td>
                </tr>
              ) : (
                agingItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-gray-900">{item.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{item.project?.name}</p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                        <FiClock size={14} />
                        {formatDistanceToNow(new Date(item.created_at))} record
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border
                        ${item.priority === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          item.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-bold text-xs text-gray-600">
                      {item.owner?.name || item.owner?.email}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtDashboard;
