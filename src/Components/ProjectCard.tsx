import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiLayers, FiActivity, FiClock, FiCheckCircle, FiChevronDown, FiMaximize2 } from 'react-icons/fi';
import type { Project, ProjectStatus } from '../Services/projectService';
import type { Team } from '../Services/teamService';

interface ProjectCardProps {
  project: Project;
  team?: Team;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onViewDetails: (project: Project) => void;
  onStatusChange: (projectId: number, status: ProjectStatus) => Promise<void>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  team,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'inactive': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Archived';
      case 'inactive': return 'On Hold';
      default: return status;
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'active': return <FiActivity size={12} />;
      case 'completed': return <FiCheckCircle size={12} />;
      case 'inactive': return <FiClock size={12} />;
      default: return null;
    }
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
  };

  const handleStatusSelect = async (status: ProjectStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    await onStatusChange(project.id, status);
    setShowStatusMenu(false);
  };

  return (
    <div 
      className="bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-gray-100 hover:border-blue-100 transition-all group flex flex-col h-full cursor-pointer"
      onClick={() => onViewDetails(project)}
    >
      {/* Top Section: Team & Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-xl border border-gray-100">
          <FiLayers size={13} className="text-gray-400" />
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider truncate max-w-[100px]">
            {team?.name || 'Unassigned'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onViewDetails(project)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Focus View"
          >
            <FiMaximize2 size={14} />
          </button>
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <div className="relative">
            <button 
              onClick={handleStatusClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight whitespace-nowrap transition-all hover:scale-105 active:scale-95 ${getStatusColor(project.status)}`}
            >
              <StatusIcon status={project.status} />
              {getStatusLabel(project.status)}
              <FiChevronDown size={10} className={`transition-transform duration-300 ${showStatusMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Status Quick Menu */}
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-20 animate-in slide-in-from-top-2">
                {(['active', 'completed', 'inactive'] as ProjectStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={(e) => handleStatusSelect(s, e)}
                    className={`flex items-center w-full px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-gray-50
                      ${project.status === s ? 'text-gray-900 bg-gray-50' : 'text-gray-400'}`}
                  >
                    {getStatusLabel(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-sm font-medium text-gray-500 line-clamp-3 leading-relaxed">
          {project.description || 'No strategic description provided for this campaign.'}
        </p>
      </div>

      {/* Bottom Footer Details */}
      <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
          Sector ID: <span className="text-gray-900">#PRJ-{project.id.toString().padStart(3, '0')}</span>
        </div>
        <div className="flex -space-x-2">
           <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white"></div>
           <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
