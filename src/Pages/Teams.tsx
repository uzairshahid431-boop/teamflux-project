import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers } from 'react-icons/fi';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../Services/teamService';
import type { Team } from '../Services/teamService';
import { fetchAllUsers } from '../utils/api';
import type { User } from '../utils/api';
import { useAuth } from '../Context/AuthContext';
import TeamDialog from '../Components/TeamDialog';

const Teams: React.FC = () => {
  const { token } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [teamsData, usersData] = await Promise.all([
        fetchTeams(token),
        fetchAllUsers(token)
      ]);
      setTeams(teamsData);
      setAllUsers(usersData);
    } catch (err: any) {
      setError('System failure: Unable to synchronize with team matrix.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateTeam = () => {
    setSelectedTeam(undefined);
    setDialogOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

  const handleDeleteTeam = async (id: number) => {
    if (!token || !window.confirm('Are you sure you want to dismantle this team? All member associations will be severed.')) return;
    try {
      await deleteTeam(id, token);
      setTeams(teams.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Deletion protocol failed.');
    }
  };

  const handleSaveTeam = async (name: string, leadId: number) => {
    if (!token) return;
    try {
      if (selectedTeam) {
        const updated = await updateTeam(selectedTeam.id, name, leadId, token);
        setTeams(teams.map(t => t.id === updated.id ? updated : t));
      } else {
        const created = await createTeam(name, leadId, token);
        setTeams([...teams, created]);
      }
      loadData(); // Reload to get full lead/member details if not returned fully
    } catch (err: any) {
      throw err;
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.lead?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && teams.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 animate-pulse">
          <FiUsers className="text-gray-300" size={32} />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Teams</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Manage your collaborative members and leadership
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            </div>
            <input
              type="text"
              placeholder="Filter teams"
              className="pl-11 pr-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full md:w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleCreateTeam}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 group"
          >
            <FiPlus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Team
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          {error}
        </div>
      )}

      {/* Teams Display */}
      {filteredTeams.length === 0 && !loading ? (
        <div className="p-16 bg-white border border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6 border border-gray-100">
            <FiUsers className="text-gray-300" size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900">Virtual Void Detected</h3>
          <p className="text-gray-400 mt-2 max-w-xs text-sm font-medium leading-relaxed">
            No active members found in this sector. Initialize your first team to begin collaboration.
          </p>
          <button
            onClick={handleCreateTeam}
            className="mt-8 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2"
          >
            <FiPlus size={18} />
            Initialize Team
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Team Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Leadership</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Members</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="group hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{team.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">ID: #{team.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-black border border-white ring-2 ring-gray-50">
                        {team.lead?.name.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">{team.lead?.name || 'Unassigned'}</p>
                        <p className="text-[10px] text-gray-400 font-semibold lowercase">lead</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl">
                      <FiUsers className="text-gray-400" size={14} />
                      <span className="text-sm font-bold text-gray-700">{team.members?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Core"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Dismantle"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination / Status Info */}
      <div className="flex items-center justify-between px-4">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
          Total Teams: <span className="text-gray-900">{filteredTeams.length}</span>
        </p>
        <div className="flex items-center gap-2">
           {/* Add mini-pagers if needed later */}
        </div>
      </div>

      <TeamDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveTeam}
        team={selectedTeam}
        allUsers={allUsers}
      />
    </div>
  );
};

export default Teams;
