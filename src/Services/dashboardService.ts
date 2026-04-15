import { fetchProjects } from "./projectService";
import { fetchTeams } from "./teamService";
import { fetchTechnicalDebts } from "./technicalDebtService";
import { fetchSessions } from "./sessionService";

export interface ActivityItem {
  id: number | string;
  type: 'project' | 'debt' | 'session';
  title: string;
  subtitle: string;
  date: string;
  link?: string;
}

export interface DashboardStats {
  totalProjects: number;
  projectsChange: string;
  activeTeams: number;
  teamsStatus: string;
  debtScore: number;
  debtStatus: string;
  recentActivity: ActivityItem[];
}

export const fetchDashboardSummary = async (token: string): Promise<DashboardStats> => {
  // Use safe wrappers to prevent partial failures from killing the entire dashboard load
  const [projects, teams, debts, sessions] = await Promise.all([
    (async () => { try { return await fetchProjects(token); } catch (e) { console.warn("Dashboard: Projects load failed", e); return []; } })(),
    (async () => { try { return await fetchTeams(token); } catch (e) { console.warn("Dashboard: Teams load failed", e); return []; } })(),
    (async () => { try { return await fetchTechnicalDebts(token); } catch (e) { console.warn("Dashboard: Debts load failed", e); return []; } })(),
    (async () => { try { return await fetchSessions(token); } catch (e) { console.warn("Dashboard: Sessions load failed", e); return []; } })()
  ]);

  // Calculate stats
  const totalProjects = projects.length;
  const activeTeams = teams.length;
  
  // Basic score calculation: start with 100, subtract for each open debt
  // More points subtracted for higher priority
  const openDebts = debts.filter(d => d.status === 'open' || d.status === 'in_progress' || d.status === 'identified');
  const debtScore = Math.max(0, 100 - (openDebts.length * 2) - (openDebts.filter(d => d.priority === 'critical' || d.priority === 'high').length * 3));
  
  const debtStatus = debtScore > 80 ? 'Healthy Refactor' : debtScore > 60 ? 'Managing Debt' : 'Critical Focus';

  // Compose Recent Activity
  const activity: ActivityItem[] = [
    ...projects.slice(-5).map(p => ({
      id: `p-${p.id}`,
      type: 'project' as const,
      title: p.name,
      subtitle: `Project initialized in ${p.status} state`,
      date: new Date().toISOString() // Projects model doesn't have created_at in frontend interface yet, using mock for now or we could add it
    })),
    ...debts.slice(-5).map(d => ({
      id: `d-${d.id}`,
      type: 'debt' as const,
      title: d.title,
      subtitle: `${d.project?.name || 'In-System'} Efficiency Debt • ${d.priority}`,
      date: d.created_at
    })),
    ...sessions.slice(-5).map(s => ({
      id: `s-${s.id}`,
      type: 'session' as const,
      title: s.title,
      subtitle: `Growth Session • ${s.status}`,
      date: s.date // Using session date
    }))
  ];

  // Sort by date descending
  const sortedActivity = activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return {
    totalProjects,
    projectsChange: `+${projects.filter(_ => {
        // Mocking logic for "This week" if no real date, but let's assume +0 for now or calculate if field exists
        return false;
    }).length} This Week`,
    activeTeams,
    teamsStatus: "Stable Impact",
    debtScore,
    debtStatus,
    recentActivity: sortedActivity
  };
};
