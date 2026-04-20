import React, { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2, FiEdit2, FiSave, FiAlertCircle, FiCalendar } from 'react-icons/fi';

import type { DeprecationItem, Milestone, MilestoneType } from '../Pages/Deprecations';

interface DeprecationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deprecation: DeprecationItem | null;
  onSave: (dep: DeprecationItem) => void;
  onDelete: (id: number) => void;
  projects: any[];
}

const DeprecationDetailModal: React.FC<DeprecationDetailModalProps> = ({ isOpen, onClose, deprecation, onSave, onDelete, projects }) => {
  const [formData, setFormData] = useState<Partial<DeprecationItem>>({
    title: '',
    type: 'API',
    description: '',
    current_version: '',
    deprecated_in: '',
    target_removal_date: '',
    replacement_options: '',
    migration_notes: '',
    impact_level: 'Low',
    project_id: null,
    milestones: []
  });

  const [error, setError] = useState<string>('');

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  
  const [milestoneForm, setMilestoneForm] = useState<Partial<Milestone>>({
    type: 'Announced',
    date: '',
    description: ''
  });

  useEffect(() => {
    if (deprecation) {
      setFormData(deprecation);
      setMilestones(deprecation.milestones || []);
    } else {
      setFormData({
        title: '',
        type: 'API',
        description: '',
        current_version: '',
        deprecated_in: '',
        target_removal_date: '',
        replacement_options: '',
        migration_notes: '',
        impact_level: 'Low',
        project_id: null,
        milestones: []
      });
      setMilestones([]);
    }
  }, [deprecation, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'project_id' ? (value ? Number(value) : null) : value
    }));
    setError('');
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      setError('Item Name is required');
      return;
    }
    onSave({
      ...(formData as DeprecationItem),
      id: deprecation ? deprecation.id : Date.now(),
      milestones: [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    });
    onClose();
  };

  const handleMilestoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMilestoneForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddedMilestone = () => {
    if (!milestoneForm.date || !milestoneForm.type) return;

    if (editingMilestoneId !== null) {
      setMilestones(prev => prev.map(m => m.id === editingMilestoneId ? ({ ...m, ...milestoneForm } as Milestone) : m));
      setEditingMilestoneId(null);
    } else {
      setMilestones(prev => [...prev, {
        id: Date.now(),
        type: milestoneForm.type as MilestoneType,
        date: milestoneForm.date as string,
        description: milestoneForm.description || ''
      }]);
    }
    setMilestoneForm({ type: 'Announced', date: '', description: '' });
  };

  const editMilestone = (m: Milestone) => {
    setEditingMilestoneId(m.id);
    setMilestoneForm({ type: m.type, date: m.date, description: m.description });
  };

  const deleteMilestone = (id: number) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getMilestoneTypeColor = (type: MilestoneType) => {
    switch (type) {
        case 'Announced': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Warning Added': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'Last Support Date': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Removed': return 'bg-rose-100 text-rose-700 border-rose-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-900">{deprecation ? 'Edit Deprecation' : 'New Deprecation'}</h2>
            <p className="text-xs font-semibold text-gray-500 mt-1">Manage deprecation details and timeline</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white flex flex-col lg:flex-row gap-10">
            {/* Form Column */}
            <div className="flex-1 space-y-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <FiAlertCircle className="text-blue-500"/> Item Details
                </h3>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Item Name <span className="text-rose-500">*</span></label>
                        <input name="title" value={formData.title} onChange={handleChange} className={`w-full px-4 py-3 rounded-xl border ${error.includes('Name') ? 'border-rose-400' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all`} placeholder="e.g. v1 Customer REST API" required />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Type <span className="text-rose-500">*</span></label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all">
                            <option value="API">API</option>
                            <option value="Feature">Feature</option>
                            <option value="Library">Library</option>
                            <option value="Database">Database</option>
                            <option value="Tool">Tool</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Impact Level <span className="text-rose-500">*</span></label>
                        <select name="impact_level" value={formData.impact_level} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all">
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Project</label>
                        <select name="project_id" value={formData.project_id || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all">
                            <option value="">Global / Cross-project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Removal Planned For</label>
                        <input type="date" name="target_removal_date" value={formData.target_removal_date} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all" />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Current Version</label>
                        <input name="current_version" value={formData.current_version} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all" placeholder="e.g. 1.0.0" />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Deprecated In (Version)</label>
                        <input name="deprecated_in" value={formData.deprecated_in} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all" placeholder="e.g. 1.2.0" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all resize-none" placeholder="Explain why it is deprecated..." />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Replacement</label>
                        <input name="replacement_options" value={formData.replacement_options} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all" placeholder="e.g. Use v2 API" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Migration Notes</label>
                        <textarea name="migration_notes" value={formData.migration_notes} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all resize-none" placeholder="Provide link or tips for migration..." />
                    </div>
                </div>
            </div>

            {/* Timeline Column */}
            <div className="w-full lg:w-[400px] flex flex-col h-full bg-gray-50/50 rounded-3xl border border-gray-100 p-6">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6">
                    <FiCalendar className="text-blue-500"/> Milestones
                </h3>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {sortedMilestones.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <FiCalendar size={32} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-bold">No milestones yet</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pl-6">
                            {sortedMilestones.map((m, idx) => (
                                <div key={m.id} className="relative group animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-blue-500 -left-[31px] top-1 z-10" />
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getMilestoneTypeColor(m.type)}`}>
                                                {m.type}
                                            </span>
                                            <span className="text-xs font-bold text-gray-500">
                                                {new Date(m.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {m.description && <p className="text-sm text-gray-600 font-medium mb-3">{m.description}</p>}
                                        
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                            <button type="button" onClick={() => editMilestone(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                <FiEdit2 size={12}/>
                                            </button>
                                            <button type="button" onClick={() => deleteMilestone(m.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                                <FiTrash2 size={12}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Milestone Form */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-black text-gray-800 mb-4">{editingMilestoneId ? 'Edit Milestone' : 'Add Milestone'}</h4>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <input type="date" name="date" value={milestoneForm.date} onChange={handleMilestoneChange} className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                            <select name="type" value={milestoneForm.type} onChange={handleMilestoneChange} className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium">
                                <option value="Announced">Announced</option>
                                <option value="Warning Added">Warning Added</option>
                                <option value="Last Support Date">Last Support Date</option>
                                <option value="Removed">Removed</option>
                            </select>
                        </div>
                        <input type="text" name="description" value={milestoneForm.description} onChange={handleMilestoneChange} placeholder="Details (optional)" className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                        <div className="flex gap-2">
                             <button type="button" onClick={handleAddedMilestone} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                                {editingMilestoneId ? <><FiSave size={14}/> Update</> : <><FiPlus size={14}/> Add Milestone</>}
                             </button>
                             {editingMilestoneId && (
                                 <button type="button" onClick={() => { setEditingMilestoneId(null); setMilestoneForm({ type: 'Announced', date: '', description: ''}); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">
                                     Cancel
                                 </button>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          {deprecation && (
            <button onClick={() => { onDelete(deprecation.id); onClose(); }} className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold transition-all flex items-center gap-2 mr-auto">
              <FiTrash2 size={16} /> Delete
            </button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold transition-all">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20">
            <FiSave size={16} /> Save Deprecation
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeprecationDetailModal;
