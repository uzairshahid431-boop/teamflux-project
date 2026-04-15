import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiPlus, FiSearch, FiAlertCircle, FiChevronLeft, FiChevronRight, 
  FiArrowUp, FiArrowDown, FiMaximize2, FiEdit2, FiTrash2, FiTarget,
  FiBriefcase, FiUser, FiClock
} from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { fetchProjects } from '../Services/projectService';
import type { Project } from '../Services/projectService';
import { fetchAllUsers } from '../utils/api';
import type { User } from '../utils/api';
import { 
  fetchTechnicalDebts, 
  createTechnicalDebt, 
  updateTechnicalDebt, 
  deleteTechnicalDebt, 
  updateDebtStatus 
} from '../Services/technicalDebtService';
import type { TechnicalDebt, DebtPriority, DebtStatus, DebtFilters } from '../Services/technicalDebtService';
import DebtModal from '../Components/DebtModal';
import DebtDetailsModal from '../Components/DebtDetailsModal';

const TechnicalDebtPage: React.FC = () => {
  const { token } = useAuth();
  const [debts, setDebts] = useState<TechnicalDebt[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  // Sorting State
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<TechnicalDebt | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const filters: DebtFilters = {
        project_id: projectFilter,
        priority: priorityFilter,
        status: statusFilter,
        search: searchTerm,
        sort_by: sortBy,
        order: sortOrder
      };
      
      const debtsPromise = fetchTechnicalDebts(token, filters).catch(err => {
        console.warn('TechnicalDebt: Failed to fetch debts', err);
        return [] as TechnicalDebt[];
      });
      const projectsPromise = fetchProjects(token).catch(err => {
        console.warn('TechnicalDebt: Failed to fetch projects', err);
        return [] as Project[];
      });
      const usersPromise = fetchAllUsers(token).catch(err => {
        // fetchAllUsers often returns 403 for non-admins
        console.warn('TechnicalDebt: Failed to fetch users', err);
        return [] as User[];
      });

      const [debtsData, projectsData, usersData] = await Promise.all([
        debtsPromise,
        projectsPromise,
        usersPromise
      ]);
      
      setDebts(debtsData || []);
      setProjects(projectsData || []);
      setUsers(usersData || []);
      
      if (debtsData.length === 0 && error === '') {
        // Optional: can check if unauthorized specifically but let's keep it resilient
      }
    } catch (err: any) {
      setError('Archeological Registry Sync Error: Segment isolated.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, projectFilter, priorityFilter, statusFilter, sortBy, sortOrder]);

  // Handle Search Debounce (Simulated with button or immediate if fast)
  useEffect(() => {
    const timer = setTimeout(() => {
        if (searchTerm !== '') loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateNew = () => {
    setSelectedDebt(null);
    setIsModalOpen(true);
  };

  const handleEdit = (debt: TechnicalDebt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewDetails = (debt: TechnicalDebt) => {
    setSelectedDebt(debt);
    setIsDetailsOpen(true);
  };

  const handleSave = async (data: any) => {
    if (!token) return;
    try {
      if (selectedDebt) {
        const updated = await updateTechnicalDebt(selectedDebt.id, data, token);
        setDebts(prev => prev.map(d => d.id === updated.id ? updated : d));
      } else {
        await createTechnicalDebt(data, token);
        // Refresh to get nested objects (owner, project) correctly from backend if needed
        // Or manually inject if we have them
        loadData();
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Erase this technical debt record from the registry?')) return;
    try {
      await deleteTechnicalDebt(id, token);
      setDebts(prev => prev.filter(d => d.id !== id));
      setIsDetailsOpen(false);
    } catch (err: any) {
      alert('Deletion protocol rejected: ' + err.message);
    }
  };

  const handleStatusChange = async (status: DebtStatus) => {
    if (!token || !selectedDebt) return;
    try {
      await updateDebtStatus(selectedDebt.id, status, token);
      // Status update returns a message, we need to refresh or update state locally
      setDebts(prev => prev.map(d => d.id === selectedDebt.id ? { ...d, status } : d));
      setSelectedDebt(prev => prev ? { ...prev, status } : null);
    } catch (err: any) {
      alert('Status realignment failed: ' + err.message);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Frontend filtering for Owner (since backend doesn't support it yet)
  const filteredDebts = useMemo(() => {
    let result = [...debts];
    if (ownerFilter !== 'all') {
      result = result.filter(d => d.owner_id.toString() === ownerFilter);
    }
    return result;
  }, [debts, ownerFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDebts.length / itemsPerPage);
  const paginatedDebts = filteredDebts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPriorityBadge = (priority: DebtPriority) => {
    switch (priority) {
      case 'critical': return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase">Critical</span>;
      case 'high': return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-black uppercase">High</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase">Medium</span>;
      case 'low': return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase">Low</span>;
      default: return null;
    }
  };

  const getStatusLabel = (status: DebtStatus) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Scanning Structural Integrity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Technical Debt</h1>
           <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
             Managing architectural constraints and efficiency bottlenecks
           </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
        >
          <FiPlus size={18} />
          Log Efficiency Debt
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 border border-gray-100 rounded-[2rem] shadow-sm">
        <div className="relative group flex-1 min-w-[200px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search in title or description..."
            className="pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-100 transition-all w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="h-10 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>

        <div className="flex flex-wrap gap-2">
          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="identified">Identified</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="wont_fix">Won't Fix</option>
          </select>

          <select
            className="bg-gray-50/50 text-xs font-bold text-gray-700 focus:outline-none px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer"
            value={ownerFilter}
            onChange={(e) => { setOwnerFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Owners</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Debts Table */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency Issue</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">
                    Priority
                    {sortBy === 'priority' ? (sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />) : <FiArrowDown className="opacity-0 group-hover:opacity-100" />}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project / Owner</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-900 transition-colors group" onClick={() => handleSort('due_date')}>
                  <div className="flex items-center gap-1">
                    Timeline
                    {sortBy === 'due_date' ? (sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />) : <FiArrowDown className="opacity-0 group-hover:opacity-100" />}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedDebts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                           <FiAlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900">Optimal Integrity Detected</h3>
                        <p className="text-gray-400 text-xs font-medium mt-1">No technical debt signals found with current filters.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                paginatedDebts.map(debt => (
                  <tr 
                    key={debt.id} 
                    className="group hover:bg-gray-50/40 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(debt)}
                  >
                    <td className="px-8 py-6 max-w-md">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-black shrink-0">
                          <FiTarget size={18} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-black text-gray-900 group-hover:text-amber-600 transition-colors truncate">{debt.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">{debt.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {getPriorityBadge(debt.priority)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          <FiBriefcase size={12} className="text-gray-400" />
                          {debt.project?.name || 'Unknown'}
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <FiUser size={12} />
                          {debt.owner?.name || debt.owner?.email || 'Unassigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">
                          {debt.due_date ? new Date(debt.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                          <FiClock size={10} />
                          Est: {debt.estimated_effort || 0}h
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="px-3 py-1.5 bg-gray-50 rounded-xl border border-transparent group-hover:border-gray-200 transition-all font-black text-[10px] text-gray-600 uppercase tracking-tight inline-block">
                        {getStatusLabel(debt.status)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewDetails(debt)}
                          className="p-2.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Detailed Analysis"
                        >
                          <FiMaximize2 size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(debt)}
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Refine Record"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(debt.id)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Purge Record"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredDebts.length)} of {filteredDebts.length} Coordinates
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <FiChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all
                    ${currentPage === i + 1 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                      : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        debt={selectedDebt || undefined}
        projects={projects}
        users={users}
      />

      {selectedDebt && (
        <DebtDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          debt={selectedDebt}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default TechnicalDebtPage;
