import React from 'react';
import { FiX, FiAlertCircle, FiUser, FiBriefcase, FiCalendar, FiClock, FiEdit2, FiTrash2, FiInfo, FiCheckCircle, FiActivity, FiSearch, FiTarget } from 'react-icons/fi';
import type { TechnicalDebt, DebtStatus, DebtPriority } from '../Services/technicalDebtService';

import DebtComments from './DebtComments';

interface DebtDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: TechnicalDebt;
  onEdit: (debt: TechnicalDebt) => void;
  onDelete: (id: number) => void;
  onStatusChange: (status: DebtStatus) => Promise<void>;
}

const DebtDetailsModal: React.FC<DebtDetailsModalProps> = ({
  isOpen,
  onClose,
  debt,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!isOpen) return null;

  const getPriorityInfo = (priority: DebtPriority) => {
    switch (priority) {
      case 'critical': return { label: 'Critical', color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'high': return { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-100' };
      case 'medium': return { label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-100' };
      case 'low': return { label: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      default: return { label: priority, color: 'text-gray-600 bg-gray-50 border-gray-100' };
    }
  };

  const statusOptions: { value: DebtStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'identified', label: 'Identified', icon: <FiSearch size={14} /> },
    { value: 'in_progress', label: 'In Progress', icon: <FiActivity size={14} /> },
    { value: 'resolved', label: 'Resolved', icon: <FiCheckCircle size={14} /> },
    { value: 'wont_fix', label: "Won't Fix", icon: <FiX size={14} /> },
  ];

  const priorityInfo = getPriorityInfo(debt.priority);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="relative h-32 bg-gray-900 overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
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
              <FiAlertCircle size={40} className="text-amber-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-16 px-10 pb-10 space-y-8 custom-scrollbar">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{debt.title}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${priorityInfo.color}`}>
                  <FiTarget size={12} />
                  {priorityInfo.label} Priority
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">DEBT ID: #TD-{debt.id}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { onEdit(debt); onClose(); }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-all border border-gray-100"
              >
                <FiEdit2 size={16} />
                Refine
              </button>
              <button
                onClick={() => { onDelete(debt.id); onClose(); }}
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
                  Intelligence Overview
                </h3>
                <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 min-h-[120px]">
                  <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                    {debt.description || 'No detailed analysis provided for this structural bottleneck.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <FiActivity size={14} />
                  Quick Status Update
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onStatusChange(opt.value)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all
                        ${debt.status === opt.value 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200' 
                          : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'}`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <FiBriefcase size={14} />
                  System Ecosystem
                </h3>
                <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-900 font-black shadow-sm uppercase">
                    {debt.project?.name.substring(0, 1) || 'P'}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">{debt.project?.name || 'Unlinked System'}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Target Project</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <FiUser size={14} />
                  Intelligence Owner
                </h3>
                <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-sm uppercase">
                    {debt.owner?.name.substring(0, 1) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">{debt.owner?.name || 'Unassigned'}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{debt.owner?.email}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Effort</div>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <FiClock className="text-gray-400" size={14} />
                    <span className="text-sm font-bold text-gray-700">{debt.estimated_effort}h</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</div>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                    <FiCalendar className="text-gray-400" size={14} />
                    <span className="text-sm font-bold text-gray-700">
                      {debt.due_date ? new Date(debt.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-8 border-t border-gray-100">
            <DebtComments debtId={debt.id} />
          </div>

          <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 italic text-xs">
              <FiCalendar size={14} />
              Detected on {new Date(debt.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              Dismiss Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtDetailsModal;
