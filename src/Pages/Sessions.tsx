import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiCalendar, FiExternalLink, FiMaximize2, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { fetchTeams } from '../Services/teamService';
import type { Team } from '../Services/teamService';
import { 
  fetchSessions, 
  createSession, 
  updateSession, 
  deleteSession, 
  updateSessionStatus, 
  exportIcs 
} from '../Services/sessionService';
import type { GrowthSession, SessionStatus } from '../Services/sessionService';
import SessionModal from '../Components/SessionModal';
import SessionDetailsModal from '../Components/SessionDetailsModal';

const Sessions: React.FC = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<GrowthSession[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<GrowthSession | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sessionsData, teamsData] = await Promise.all([
        fetchSessions(token),
        fetchTeams(token)
      ]);
      setSessions(sessionsData);
      setTeams(teamsData);
    } catch (err: any) {
      setError('Connection disrupted: Intelligence retrieval failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateNew = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const handleEdit = (session: GrowthSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewDetails = (session: GrowthSession) => {
    setSelectedSession(session);
    setIsDetailsOpen(true);
  };

  const handleSave = async (data: any) => {
    if (!token) return;
    try {
      if (selectedSession) {
        const updated = await updateSession(selectedSession.id, data, token);
        setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await createSession(data, token);
        setSessions(prev => [...prev, created]);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Terminate this session profile? This action is final.')) return;
    try {
      await deleteSession(id, token);
      setSessions(prev => prev.filter(s => s.id !== id));
      setIsDetailsOpen(false);
    } catch (err: any) {
      alert('Termination protocol failed: ' + err.message);
    }
  };

  const handleStatusChange = async (status: SessionStatus) => {
    if (!token || !selectedSession) return;
    try {
      const updated = await updateSessionStatus(selectedSession.id, status, token);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSelectedSession(updated);
    } catch (err: any) {
      alert('Status realignment failed: ' + err.message);
    }
  };

  const handleExport = async () => {
    if (!token || !selectedSession) return;
    try {
      await exportIcs(selectedSession.id, token);
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter === 'all' || s.team_id.toString() === teamFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const getTeamName = (id: number) => teams.find(t => t.id === id)?.name || 'Unknown Squad';

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Growth Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Growth Sessions</h1>
           <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             Coordinating developmental strategies and milestones
           </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           {/* Filters */}
           <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-100 rounded-2xl shadow-sm">
              <div className="relative group">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Find session..."
                  className="pl-10 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-100 transition-all w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="h-8 w-[1px] bg-gray-100 mx-1"></div>

              <select
                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-3 cursor-pointer"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              >
                <option value="all">All Squads</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <select
                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-3 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="planned">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
           </div>

           <button
             onClick={handleCreateNew}
             className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
           >
             <FiPlus size={18} />
             Initialize Session
           </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold leading-none">
          {error}
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Context</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chronology</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Squad</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                         <FiCalendar size={32} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900">No signals detected</h3>
                      <p className="text-gray-400 text-xs font-medium mt-1">Refine your resonance filters or schedule a new interaction.</p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredSessions.map(session => (
                <tr 
                  key={session.id} 
                  className="group hover:bg-gray-50/40 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(session)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                        {session.title.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{session.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">{session.location || 'Remote Protocol'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-gray-700">{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                       <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                          {session.start_time.split(' ')[1]?.substring(0, 5) || '--:--'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-transparent group-hover:border-gray-200 transition-all font-bold text-xs text-gray-600">
                      {getTeamName(session.team_id)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight
                      ${session.status === 'completed' ? 'text-emerald-600 bg-emerald-50' : 
                        session.status === 'cancelled' ? 'text-rose-600 bg-rose-50' : 
                        'text-blue-600 bg-blue-50'}`}
                    >
                      {session.status === 'planned' ? 'Scheduled' : session.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {session.meeting_link && (
                        <a 
                          href={session.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Join Meeting"
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => handleViewDetails(session)}
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="View Protocol"
                      >
                        <FiMaximize2 size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(session)}
                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Modify Session"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        session={selectedSession || undefined}
        teams={teams}
      />

      {selectedSession && (
        <SessionDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          session={selectedSession}
          team={teams.find(t => t.id === selectedSession.team_id)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default Sessions;