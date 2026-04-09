import React, { useState, useEffect } from 'react';
import { FiPlus, FiGrid, FiList, FiSearch, FiBriefcase, FiLayers, FiActivity, FiEdit2, FiTrash2, FiMaximize2 } from 'react-icons/fi';
import { fetchProjects, createProject, updateProject, deleteProject } from '../Services/projectService';
import type { Project, ProjectStatus } from '../Services/projectService';
import { fetchTeams } from '../Services/teamService';
import type { Team } from '../Services/teamService';
import { useAuth } from '../Context/AuthContext';
import ProjectDialog from '../Components/ProjectDialog';
import ProjectCard from '../Components/ProjectCard';
import ProjectDetailsModal from '../Components/ProjectDetailsModal';

const Projects: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  
  // Dialog/Modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [projectsData, teamsData] = await Promise.all([
        fetchProjects(token),
        fetchTeams(token)
      ]);
      setProjects(projectsData);
      setTeams(teamsData);
    } catch (err: any) {
      setError('System failure: Matrix connectivity lost.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateProject = () => {
    setSelectedProject(undefined);
    setDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  const handleStatusUpdate = async (projectId: number, status: ProjectStatus) => {
    if (!token) return;
    try {
      await updateProject(projectId, { status }, token);
      setProjects(projects.map(p => p.id === projectId ? { ...p, status } : p));
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, status });
      }
    } catch (err: any) {
      alert(err.message || 'Status transition failed.');
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!token || !window.confirm('Delete this mission profile? This action is irreversible.')) return;
    try {
      await deleteProject(id, token);
      setProjects(projects.filter(p => p.id !== id));
      if (selectedProject?.id === id) setDetailsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Deletion protocol failed.');
    }
  };

  const handleSaveProject = async (data: any) => {
    if (!token) return;
    try {
      if (selectedProject) {
        const updated = await updateProject(selectedProject.id, data, token);
        setProjects(projects.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await createProject(data, token);
        setProjects([...projects, created]);
      }
      loadData();
    } catch (err: any) {
      throw err;
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesTeam = teamFilter === 'all' || p.team_id.toString() === teamFilter;
    return matchesSearch && matchesStatus && matchesTeam;
  });

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.name || 'Unknown Team';
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Campaign Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Projects</h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Operational theater for all active campaigns
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters Bar */}
          <div className="flex items-center gap-2 bg-white p-1.5 border border-gray-100 rounded-2xl shadow-sm">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" size={16} />
              </div>
              <input
                type="text"
                placeholder="Find project..."
                className="pl-10 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-100 transition-all w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="h-8 w-[1px] bg-gray-100 mx-1"></div>
            
            <select
              className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-3 cursor-pointer"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select
              className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-3 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Archived</option>
              <option value="inactive">On Hold</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex border border-gray-100 rounded-2xl p-1 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid View"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <FiList size={18} />
            </button>
          </div>

          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            <FiPlus size={18} />
            New Mission
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold leading-none">
          {error}
        </div>
      )}

      {/* Projects Grid/Table */}
      {filteredProjects.length === 0 ? (
        <div className="p-20 bg-white border border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 rounded-[2.5rem] bg-gray-50 flex items-center justify-center mb-6 text-gray-200">
            <FiBriefcase size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900">Zero Visibility</h3>
          <p className="text-gray-400 mt-2 max-w-xs text-sm font-medium leading-relaxed">
            No projects found matching these coordinates. Adjust your filters or initialize a new campaign.
          </p>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                team={teams.find(t => t.id === p.team_id)}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onViewDetails={handleViewDetails}
                onStatusChange={handleStatusUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Identity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Squad</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProjects.map(p => (
                  <tr key={p.id} className="group hover:bg-gray-50/40 transition-colors cursor-pointer" onClick={() => handleViewDetails(p)}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-black">
                          {p.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">ID: #CAM-{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-transparent group-hover:border-gray-200 transition-all font-bold text-xs text-gray-600">
                        <FiLayers size={13} />
                        {getTeamName(p.team_id)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div 
                        onClick={(e) => { e.stopPropagation(); }} // Prevent modal opening when clicking status (though table doesn't have quick switcher yet)
                        className={`inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-tight
                        ${p.status === 'active' ? 'text-emerald-600 bg-emerald-50' : 
                          p.status === 'completed' ? 'text-blue-600 bg-blue-50' : 
                          'text-amber-600 bg-amber-50'}`}
                      >
                        <FiActivity size={10} />
                        {p.status === 'completed' ? 'Archived' : p.status === 'inactive' ? 'On Hold' : 'Active'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <FiMaximize2 size={16} />
                        </button>
                        <button
                          onClick={() => handleEditProject(p)}
                          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <ProjectDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveProject}
        project={selectedProject}
        teams={teams}
      />

      {selectedProject && (
        <ProjectDetailsModal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          project={selectedProject}
          team={teams.find(t => t.id === selectedProject.team_id)}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onStatusChange={(status) => handleStatusUpdate(selectedProject.id, status)}
        />
      )}
    </div>
  );
};

export default Projects;
