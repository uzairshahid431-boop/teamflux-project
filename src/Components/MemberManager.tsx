import React, { useState } from 'react';
import { FiUserPlus, FiX, FiSearch } from 'react-icons/fi';
import type { User } from '../utils/api';
import type { UserInTeam } from '../Services/teamService';

interface MemberManagerProps {
  currentMembers: UserInTeam[];
  allUsers: User[];
  onAddMember: (userId: number) => Promise<void>;
  onRemoveMember: (userId: number) => Promise<void>;
}

const MemberManager: React.FC<MemberManagerProps> = ({
  currentMembers,
  allUsers,
  onAddMember,
  onRemoveMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<number | null>(null);

  const filteredAvailableUsers = allUsers.filter(
    (user) => 
      !currentMembers.some((m) => m.id === user.id) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async (userId: number) => {
    setLoading(userId);
    try {
      await onAddMember(userId);
      setSearchTerm('');
    } finally {
      setLoading(null);
    }
  };

  const handleRemove = async (userId: number) => {
    setLoading(userId);
    try {
      await onRemoveMember(userId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Team Members</label>
        
        {/* Current Members List */}
        <div className="flex flex-wrap gap-2">
          {currentMembers.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No members added yet.</p>
          ) : (
            currentMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 pl-3 pr-2 py-1.5 rounded-full transition-all hover:border-gray-300"
              >
                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-gray-700">{member.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(member.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                  disabled={loading !== null}
                >
                  <FiX size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Add Member Section */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add Member</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" size={14} />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <div className="bg-white border border-gray-200 rounded-xl max-h-48 overflow-y-auto shadow-sm divide-y divide-gray-50">
            {filteredAvailableUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No users found or already in team.</div>
            ) : (
              filteredAvailableUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 leading-none">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-1">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(user.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    disabled={loading !== null}
                  >
                    <FiUserPlus size={14} />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberManager;
