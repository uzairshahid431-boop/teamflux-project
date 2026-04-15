import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiTag, FiAlertCircle, FiUser, FiBriefcase, FiClock, FiCalendar } from 'react-icons/fi';
import type { TechnicalDebt, DebtPriority } from '../Services/technicalDebtService';
import type { Project } from '../Services/projectService';
import type { User } from '../utils/api';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  debt?: TechnicalDebt;
  projects: Project[];
  users: User[];
}

const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  debt,
  projects,
  users,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number>(0);
  const [ownerId, setOwnerId] = useState<number>(0);
  const [priority, setPriority] = useState<DebtPriority>('medium');
  const [severity, setSeverity] = useState<number>(5);
  const [estimatedEffort, setEstimatedEffort] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (debt) {
      setTitle(debt.title);
      setDescription(debt.description || '');
      setProjectId(debt.project_id);
      setOwnerId(debt.owner_id);
      setPriority(debt.priority);
      setSeverity(debt.severity || 5);
      setEstimatedEffort(debt.estimated_effort || 0);
      setDueDate(debt.due_date ? debt.due_date.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || 0);
      setOwnerId(users[0]?.id || 0);
      setPriority('medium');
      setSeverity(5);
      setEstimatedEffort(0);
      setDueDate('');
    }
    setError('');
  }, [debt, isOpen, projects, users]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is mandatory for intelligence tracking.');
      return;
    }
    if (!projectId) {
      setError('A project assignment is required.');
      return;
    }
    if (!ownerId) {
      setError('An owner must be designated.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const payload: any = {
        title,
        description,
        project_id: projectId,
        owner_id: ownerId,
        priority,
        severity,
        estimated_effort: estimatedEffort,
        due_date: dueDate || null,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transmission failed: Data storage error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <FiAlertCircle size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                {debt ? 'Refine Technical Debt' : 'Identify New Debt'}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                {debt ? 'Synchronizing architectural constraints' : 'Cataloging efficiency bottlenecks'}
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
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              <FiTag size={14} className="text-gray-400" />
              Intelligence Title
            </label>
            <input
              type="text"
              className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              placeholder="e.g. Refactor API polling mechanism"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              Description
            </label>
            <textarea
              className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
              placeholder="Detailed analysis of the debt and its impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiBriefcase size={14} className="text-gray-400" />
                Linked Project
              </label>
              <select
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                value={projectId}
                onChange={(e) => setProjectId(Number(e.target.value))}
                required
              >
                <option value={0} disabled>Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiUser size={14} className="text-gray-400" />
                Assignee (Owner)
              </label>
              <select
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                value={ownerId}
                onChange={(e) => setOwnerId(Number(e.target.value))}
                required
              >
                <option value={0} disabled>Select Owner</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                Priority Matrix
              </label>
              <select
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                value={priority}
                onChange={(e) => setPriority(e.target.value as DebtPriority)}
              >
                <option value="low">Low (Maintenance)</option>
                <option value="medium">Medium (Optimization)</option>
                <option value="high">High (Structural)</option>
                <option value="critical">Critical (Immediate Resolve)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                Severity Score (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiClock size={14} className="text-gray-400" />
                Est. Effort (Hours)
              </label>
              <input
                type="number"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                value={estimatedEffort}
                onChange={(e) => setEstimatedEffort(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiCalendar size={14} className="text-gray-400" />
                Remediation Due Date
              </label>
              <input
                type="date"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
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
            Abort Identification
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
            {debt ? 'Commit Refinement' : 'Log Technical Debt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebtModal;
