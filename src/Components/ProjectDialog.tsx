import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiBriefcase, FiInfo, FiLayers, FiActivity } from 'react-icons/fi';
import type { Project, ProjectStatus, ProjectCreateData } from '../Services/projectService';
import type { Team } from '../Services/teamService';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectCreateData) => Promise<void>;
  project?: Project;
  teams: Team[];
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  teams,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState<number>(0);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setTeamId(project.team_id);
      setStatus(project.status);
    } else {
      setName('');
      setDescription('');
      setTeamId(teams[0]?.id || 0);
      setStatus('active');
    }
    setError('');
  }, [project, isOpen, teams]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (!teamId) {
      setError('Assigning a team is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        name,
        description,
        team_id: teamId,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <FiBriefcase size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                {project ? 'Edit Project' : 'New Project'}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                {project ? 'Modifying campaign sectors' : 'Initializing new mission'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              <FiBriefcase size={14} className="text-gray-400" />
              Project Name{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              className={`block w-full px-5 py-3.5 bg-gray-50/50 border ${error.includes('name') ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium`}
              placeholder="e.g. Phoenix Rising"
              value={name}
              onChange={(e) => {setName(e.target.value); setError('');}}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              <FiInfo size={14} className="text-gray-400" />
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium resize-none"
              placeholder="Strategic parameters for this venture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="team" className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiLayers size={14} className="text-gray-400" />
                Team <span className="text-rose-500">*</span>
              </label>
              <select
                id="team"
                className={`block w-full px-5 py-3.5 bg-gray-50/50 border ${error.includes('Team') ? 'border-rose-400' : 'border-gray-200'} rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer`}
                value={teamId}
                onChange={(e) => {setTeamId(Number(e.target.value)); setError('');}}
                required
              >
                <option value="" disabled>Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiActivity size={14} className="text-gray-400" />
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                id="status"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                required
              >
                <option value="active">Active</option>
                <option value="completed">Archived</option>
                <option value="inactive">On Hold</option>
              </select>
            </div>
          </div>
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
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FiCheck size={18} />
            )}
            {project ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDialog;
