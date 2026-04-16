import React, { useState, useEffect, useMemo } from 'react';
import {
  FiSearch, FiAlertTriangle, FiArchive, FiDatabase,
  FiTool, FiBox, FiActivity, FiBriefcase, FiCalendar, FiArrowRight, FiPlus,
  FiClock, FiPieChart, FiShield
} from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { fetchProjects } from '../Services/projectService';
import DeprecationDetailModal from '../Components/DeprecationDetailModal';
import {
  useGetDeprecationsQuery,
  useAddDeprecationMutation,
  useUpdateDeprecationMutation,
  useDeleteDeprecationMutation,
  useAddDeprecationTimelineMutation
} from '../store/apiSlice';

export type DeprecationType = 'API' | 'Feature' | 'Library' | 'Database' | 'Tool';
export type ImpactLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type MilestoneType = 'Announced' | 'Warning Added' | 'Last Support Date' | 'Removed';

export interface Milestone {
  id: number;
  type: MilestoneType;
  date: string;
  description: string;
}

export interface DeprecationItem {
  id: number;
  title: string;
  description: string;
  type: DeprecationType;
  impact_level: ImpactLevel;
  project_id: number | null;
  target_removal_date: string;
  replacement_options: string;
  current_version: string;
  deprecated_in: string;
  migration_notes: string;
  milestones: Milestone[];
}

const getThirtyDaysFromNow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const DeprecationsPage: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  
  const { data: dbItems = [], isLoading } = useGetDeprecationsQuery();
  const [addDeprecation] = useAddDeprecationMutation();
  const [updateDeprecation] = useUpdateDeprecationMutation();
  const [deleteDeprecationItem] = useDeleteDeprecationMutation();
  const [addDeprecationTimeline] = useAddDeprecationTimelineMutation();

  const items = useMemo(() => {
    if (!dbItems || !Array.isArray(dbItems)) return [];
    return dbItems.map((dbItem: any) => ({
      ...dbItem,
      id: dbItem.id,
      title: dbItem.item_name || '',
      target_removal_date: dbItem.removal_planned_for || '',
      replacement_options: dbItem.replacement || '',
      type: dbItem.type === 'api' ? 'API' : (dbItem.type ? dbItem.type.charAt(0).toUpperCase() + dbItem.type.slice(1) : 'API'),
      impact_level: dbItem.impact_level ? dbItem.impact_level.charAt(0).toUpperCase() + dbItem.impact_level.slice(1).toLowerCase() : 'Low',
      milestones: (dbItem.timeline || []).map((t: any) => ({
        id: t.id,
        type: t.stage.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        date: t.planned_date,
        description: t.notes || ''
      }))
    })) as DeprecationItem[];
  }, [dbItems]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DeprecationItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');

  useEffect(() => {
    const loadProjects = async () => {
      if (!token) return;
      try {
        const fetchedProjects = await fetchProjects(token);
        setProjects(fetchedProjects);
      } catch (err) {
        console.error('Failed to load projects for deprecations filter', err);
      }
    };
    loadProjects();
  }, [token]);

  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => {
      const titleMatch = item.title ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const descMatch = item.description ? item.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const matchesSearch = titleMatch || descMatch;
      const matchesProject = projectFilter === 'all' || item.project_id?.toString() === projectFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesImpact = impactFilter === 'all' || item.impact_level === impactFilter;

      return matchesSearch && matchesProject && matchesType && matchesImpact;
    });
  }, [items, searchTerm, projectFilter, typeFilter, impactFilter]);

  const dashboardStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const thirtyDaysStr = getThirtyDaysFromNow();
    
    let upcoming = 0;
    let overdue = 0;
    const impactBreakdown: Record<ImpactLevel, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const typeBreakdown: Record<DeprecationType, number> = { API: 0, Feature: 0, Library: 0, Database: 0, Tool: 0 };

    if (items && Array.isArray(items)) {
        items.forEach(item => {
           if (item.target_removal_date) {
               if (item.target_removal_date < todayStr) {
                   overdue++;
               } else if (item.target_removal_date <= thirtyDaysStr) {
                   upcoming++;
               }
           }
           if (item.impact_level) impactBreakdown[item.impact_level]++;
           if (item.type) typeBreakdown[item.type]++;
        });
    }

    return { upcoming, overdue, impactBreakdown, typeBreakdown };
  }, [items]);

  const getTypeIcon = (type: DeprecationType) => {
    switch (type) {
      case 'API': return <FiActivity size={14} className="text-purple-500" />;
      case 'Feature': return <FiBox size={14} className="text-blue-500" />;
      case 'Library': return <FiArchive size={14} className="text-emerald-500" />;
      case 'Database': return <FiDatabase size={14} className="text-amber-500" />;
      case 'Tool': return <FiTool size={14} className="text-slate-500" />;
      default: return <FiArchive size={14} />;
    }
  };

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'Critical': return <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-wider">Critical</span>;
      case 'High': return <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-black uppercase tracking-wider">High</span>;
      case 'Medium': return <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-wider">Medium</span>;
      case 'Low': return <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider">Low</span>;
      default: return <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black uppercase tracking-wider">{impact}</span>;
    }
  };

  const handleSave = async (savedItem: DeprecationItem) => {
      try {
          const impactMap: Record<string, number> = { Critical: 6000, High: 5001, Medium: 501, Low: 0 };
          const payload = {
              project_id: savedItem.project_id,
              item_name: savedItem.title,
              type: savedItem.type.toLowerCase(),
              current_version: savedItem.current_version,
              deprecated_in: savedItem.deprecated_in,
              removal_planned_for: savedItem.target_removal_date,
              replacement: savedItem.replacement_options,
              affected_users_count: impactMap[savedItem.impact_level] || 0,
              migration_notes: savedItem.migration_notes || ""
          };

          let savedDbItemId: number;

          if (editingItem && savedItem.id && savedItem.id === editingItem.id) {
              await updateDeprecation({ id: savedItem.id, data: payload }).unwrap();
              savedDbItemId = savedItem.id;
          } else {
              const res = await addDeprecation(payload).unwrap();
              savedDbItemId = res.id;
          }

          for (const m of savedItem.milestones) {
              if (m.id > 100000000) { // New timeline created with Date.now() timestamp ID
                 try {
                     await addDeprecationTimeline({
                        deprecationId: savedDbItemId,
                        data: {
                            stage: m.type.replace(/ /g, '_').toLowerCase(),
                            planned_date: m.date,
                            notes: m.description
                        }
                     }).unwrap();
                 } catch (e) {
                     console.error("Failed saving timeline stage", m.type, e);
                 }
              }
          }
      } catch (err) {
          console.error("Failed to save deprecation", err);
          alert("Failed to save deprecation. See console for details.");
      }
  };

  const handleDelete = async (id: number) => {
      if (confirm("Are you sure you want to delete this item?")) {
          try {
              await deleteDeprecationItem(id).unwrap();
          } catch (err) {
              console.error("Failed to delete deprecation", err);
              alert("Failed to delete. See console for details.");
          }
      }
  };

  const openNewModal = () => {
      setEditingItem(null);
      setIsModalOpen(true);
  };

  const openEditModal = (item: DeprecationItem) => {
      setEditingItem(item);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Deprecations</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Track systems, features, and tools scheduled for removal
          </p>
        </div>
        <button onClick={openNewModal} className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl flex items-center gap-2 font-bold transition-all shadow-md active:scale-95">
            <FiPlus size={18} /> New Deprecation
        </button>
      </div>

      {/* Dashboard Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
                <div className="p-2 bg-amber-50 rounded-xl"><FiClock size={20} /></div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest">Upcoming</h3>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-gray-900">{dashboardStats.upcoming}</span>
                <span className="text-xs font-bold text-gray-400 mb-1">next 30 days</span>
            </div>
        </div>
        
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 text-rose-500 mb-2">
                <div className="p-2 bg-rose-50 rounded-xl"><FiAlertTriangle size={20} /></div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest">Overdue</h3>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-rose-600">{dashboardStats.overdue}</span>
                <span className="text-xs font-bold text-rose-400 mb-1">past due</span>
            </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center">
             <div className="flex items-center gap-3 text-gray-500 mb-3">
                <div className="p-2 bg-gray-50 rounded-xl"><FiShield size={20} /></div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest">Impact Breakdown</h3>
            </div>
            <div className="flex gap-2">
                {Object.entries(dashboardStats.impactBreakdown).map(([k, v]) => v > 0 && (
                    <div key={k} className="flex-1 bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                        <span className="block text-xs font-bold text-gray-400 mb-1">{k}</span>
                        <span className="block text-lg font-black text-gray-800">{v}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-center">
             <div className="flex items-center gap-3 text-blue-500 mb-3">
                <div className="p-2 bg-blue-50 rounded-xl"><FiPieChart size={20} /></div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest">Type Breakdown</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {Object.entries(dashboardStats.typeBreakdown).map(([k, v]) => v > 0 && (
                     <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                         <span className="text-[10px] font-black text-gray-400 uppercase">{k}</span>
                         <span className="text-xs font-black text-gray-800 bg-white px-1.5 py-0.5 rounded-md shadow-sm">{v}</span>
                     </div>
                ))}
            </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-gray-100 rounded-[2rem] shadow-sm">
        <div className="relative group flex-1 min-w-[200px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search deprecations..."
            className="pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-100 transition-all w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="h-10 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>

        <div className="flex flex-wrap gap-2">
          {/* Project Filter */}
          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Type Filter */}
          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="API">API</option>
            <option value="Feature">Feature</option>
            <option value="Library">Library</option>
            <option value="Database">Database</option>
            <option value="Tool">Tool</option>
          </select>

          {/* Impact Filter */}
          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
          >
            <option value="all">Any Impact</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Deprecations Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Item</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Impact</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Removal Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                  <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center">
                              <span className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin mb-4"></span>
                              <h3 className="text-sm font-black text-gray-900">Loading Deprecations...</h3>
                          </div>
                      </td>
                  </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                        <FiAlertTriangle size={32} />
                      </div>
                      <h3 className="text-lg font-black text-gray-900">No Deprecations Found</h3>
                      <p className="text-gray-400 text-xs font-medium mt-1">Adjust filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const projectMatch = projects.find(p => p.id === item.project_id);
                  const isOverdue = item.target_removal_date && item.target_removal_date < new Date().toISOString().split('T')[0];
                  
                  return (
                    <tr
                      key={item.id}
                      onClick={() => openEditModal(item)}
                      className="group hover:bg-gray-50/40 transition-colors cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <td className="px-8 py-6 max-w-md">
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-sm font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-2">{item.description}</p>
                          </div>
                          {item.replacement_options && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                              <FiArrowRight size={10} />
                              Rep: {item.replacement_options}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {getImpactBadge(item.impact_level)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          <FiBriefcase size={12} className="text-gray-400" />
                          {projectMatch ? projectMatch.name : 'Global / Cross'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          <FiCalendar size={12} />
                          <span className="text-xs font-bold">
                            {item.target_removal_date ? new Date(item.target_removal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeprecationDetailModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         deprecation={editingItem}
         projects={projects}
         onSave={handleSave}
         onDelete={handleDelete}
      />
    </div>
  );
};

export default DeprecationsPage;
