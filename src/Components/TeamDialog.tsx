import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiUsers } from 'react-icons/fi';
import { addTeamMember, removeTeamMember } from '../Services/teamService';
import type { Team, UserInTeam } from '../Services/teamService';
import type { User } from '../utils/api';
import MemberManager from './MemberManager';
import { useAuth } from '../Context/AuthContext';

interface TeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, leadId: number) => Promise<void>;
  team?: Team; // If present, we're in edit mode
  allUsers: User[];
}

const TeamDialog: React.FC<TeamDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  team,
  allUsers,
}) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [leadId, setLeadId] = useState<number>(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMembers, setCurrentMembers] = useState<UserInTeam[]>([]);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setLeadId(team.lead_id);
      setCurrentMembers(team.members || []);
    } else {
      setName('');
      setLeadId(allUsers[0]?.id || 0);
      setCurrentMembers([]);
    }
    setError('');
  }, [team, isOpen, allUsers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Team name is required');
      return;
    }
    if (!leadId) {
      setError('Team lead is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave(name, leadId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: number) => {
    if (!team || !token) return;
    try {
      await addTeamMember(team.id, userId, token);
      const userToAdd = allUsers.find(u => u.id === userId);
      if (userToAdd) {
        setCurrentMembers([...currentMembers, { id: userToAdd.id, name: userToAdd.name, role: userToAdd.role || 'developer' }]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!team || !token) return;
    try {
      await removeTeamMember(team.id, userId, token);
      setCurrentMembers(currentMembers.filter(m => m.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${team ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
              <FiUsers size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                {team ? 'Edit Team' : 'Create New Team'}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                {team ? 'Refining squad parameters' : 'Initializing new coordinate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1">Team Name <span className="text-rose-500">*</span></label>
            <input
              id="name"
              type="text"
              className={`block w-full px-5 py-3.5 bg-gray-50/50 border ${error.includes('name') ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all`}
              placeholder="e.g. Frontend Mavericks"
              value={name}
              onChange={(e) => {setName(e.target.value); setError('');}}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lead" className="text-sm font-bold text-gray-700 ml-1">Team Lead <span className="text-rose-500">*</span></label>
            <select
              id="lead"
              className={`block w-full px-5 py-3.5 bg-gray-50/50 border ${error.includes('lead') ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer`}
              value={leadId}
              onChange={(e) => {setLeadId(Number(e.target.value)); setError('');}}
              required
            >
              <option value="" disabled>Select User</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {team && (
            <div className="pt-2">
              <MemberManager
                currentMembers={currentMembers}
                allUsers={allUsers}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              <>
                <FiCheck size={18} />
                {team ? 'Update Team' : 'Create Team'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDialog;
