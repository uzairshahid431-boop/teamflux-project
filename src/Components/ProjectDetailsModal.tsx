import React from 'react';
import { FiX, FiBriefcase, FiLayers, FiActivity, FiEdit2, FiTrash2, FiInfo, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import type { Project, ProjectStatus } from '../Services/projectService';
import type { Team } from '../Services/teamService';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  team?: Team;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onStatusChange: (status: ProjectStatus) => Promise<void>;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  team,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!isOpen) return null;

  const getStatusInfo = (status: ProjectStatus) => {
    switch (status) {
      case 'active': return { label: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <FiActivity size={16} /> };
      case 'completed': return { label: 'Archived', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <FiCheckCircle size={16} /> };
      case 'inactive': return { label: 'On Hold', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <FiClock size={16} /> };
    }
  };

  const statusInfo = getStatusInfo(project.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner / Header */}
        <div className="relative h-32 bg-gray-900 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
          <div className="absolute top-6 right-8">
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="absolute -bottom-10 left-10">
            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-gray-900 border-4 border-white">
              <FiBriefcase size={40} />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-16 px-10 pb-10 space-y-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{project.name}</h2>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sector ID: #CAM-{project.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { onEdit(project); onClose(); }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all border border-gray-100"
              >
                <FiEdit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => { onDelete(project.id); onClose(); }}
                className="p-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <FiInfo size={14} />
                  Operational Scope
                </h3>
                <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                    {project.description || 'No strategic overview provided for this coordinate zone.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <FiLayers size={14} />
                  Squad Allocation
                </h3>
                <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-900 font-black shadow-sm">
                    {team?.name.substring(0, 1).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">{team?.name || 'Unassigned Sector'}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Assigned Force</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <FiActivity size={14} />
                  Status Management
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['active', 'completed', 'inactive'] as ProjectStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => onStatusChange(s)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all
                        ${project.status === s 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200' 
                          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'}`}
                    >
                      {s === 'completed' ? 'Archive' : s === 'inactive' ? 'Hold' : 'Active'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initialized: 09 APR 2026</span>
                  </div>
               </div>
               <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all border border-gray-100"
               >
                 Dismiss Focus
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
