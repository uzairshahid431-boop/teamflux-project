import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiCalendar, FiClock, FiMapPin, FiLink, FiUsers, FiUser } from 'react-icons/fi';
import type { GrowthSession, GrowthSessionCreate } from '../Services/sessionService';
import type { Team, UserInTeam } from '../Services/teamService';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  session?: GrowthSession;
  teams: Team[];
}

const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  session,
  teams,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [teamId, setTeamId] = useState<number>(0);
  const [presenterId, setPresenterId] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [duration, setDuration] = useState<number>(60);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState<UserInTeam[]>([]);

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setDate(session.date);
      setStartTime(session.start_time.split(' ')[1] || ''); // Assuming "YYYY-MM-DD HH:MM:SS"
      setEndTime(session.end_time.split(' ')[1] || '');
      setTeamId(session.team_id);
      setPresenterId(session.presenter_id || 0);
      setLocation(session.location || '');
      setMeetingLink(session.meeting_link || '');
      setDuration(session.duration || 60);
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('10:00');
      setEndTime('11:00');
      setTeamId(teams[0]?.id || 0);
      setPresenterId(0);
      setLocation('');
      setMeetingLink('');
      setDuration(60);
    }
    setError('');
  }, [session, isOpen, teams]);

  useEffect(() => {
    if (teamId) {
      const selectedTeam = teams.find(t => t.id === teamId);
      setTeamMembers(selectedTeam?.members || []);
      if (selectedTeam && !selectedTeam.members.some(m => m.id === presenterId)) {
        setPresenterId(0);
      }
    } else {
      setTeamMembers([]);
      setPresenterId(0);
    }
  }, [teamId, teams]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Session title is required');
      return;
    }
    if (!teamId) {
      setError('Please select a team');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Logic to combine date and time for backend if needed
      // Backend expects "YYYY-MM-DD" for date and likely DateTime for start/end
      const payload: GrowthSessionCreate = {
        title,
        date,
        start_time: `${date} ${startTime}:00`,
        end_time: `${date} ${endTime}:00`,
        team_id: teamId,
        location,
        meeting_link: meetingLink,
        duration,
        presenter_id: presenterId || undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save session');
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
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <FiCalendar size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                {session ? 'Edit Session' : 'Schedule Session'}
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                {session ? 'Refining developmental trajectory' : 'Initializing growth protocols'}
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
              <FiCalendar size={14} className="text-gray-400" />
              Session Title
            </label>
            <input
              type="text"
              className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              placeholder="e.g. Q2 Strategic Alignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiCalendar size={14} className="text-gray-400" />
                Date
              </label>
              <input
                type="date"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <FiClock size={14} className="text-gray-400" />
                  Start
                </label>
                <input
                  type="time"
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <FiClock size={14} className="text-gray-400" />
                  End
                </label>
                <input
                  type="time"
                  className="block w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiUsers size={14} className="text-gray-400" />
                Squad (Team)
              </label>
              <select
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                value={teamId}
                onChange={(e) => setTeamId(Number(e.target.value))}
                required
              >
                <option value="" disabled>Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiUser size={14} className="text-gray-400" />
                Presenter
              </label>
              <select
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none appearance-none cursor-pointer"
                value={presenterId}
                onChange={(e) => setPresenterId(Number(e.target.value))}
              >
                <option value={0}>TBD / No Specific Presenter</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiMapPin size={14} className="text-gray-400" />
                Physical Location
              </label>
              <input
                type="text"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                placeholder="e.g. Conference Room A"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FiClock size={14} className="text-gray-400" />
                Duration (minutes)
              </label>
              <input
                type="number"
                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
              <FiLink size={14} className="text-gray-400" />
              Meeting Link (Optional)
            </label>
            <input
              type="url"
              className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none"
              placeholder="e.g. https://meet.google.com"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Abort
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white text-sm font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FiCheck size={18} />
            )}
            {session ? 'Commit Updates' : 'Schedule Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;
