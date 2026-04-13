import React from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiLink, FiUser, FiUsers, FiCheckCircle, FiXCircle, FiDownload, FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { GrowthSession, SessionStatus } from '../Services/sessionService';
import type { Team } from '../Services/teamService';
import SessionNotes from './SessionNotes';
import ActionItemsList from './ActionItemsList';

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: GrowthSession;
  team?: Team;
  onEdit: (session: GrowthSession) => void;
  onDelete: (id: number) => void;
  onStatusChange: (status: SessionStatus) => void;
  onExport: () => void;
  onRefresh: () => void;
}

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  isOpen,
  onClose,
  session,
  team,
  onEdit,
  onDelete,
  onStatusChange,
  onExport,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const presenter = team?.members.find(m => m.id === session.presenter_id);

  const getStatusDisplay = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'text-emerald-600 bg-emerald-50', icon: <FiCheckCircle size={14} /> };
      case 'cancelled':
        return { label: 'Cancelled', color: 'text-rose-600 bg-rose-50', icon: <FiXCircle size={14} /> };
      default:
        return { label: 'Scheduled', color: 'text-blue-600 bg-blue-50', icon: <FiCalendar size={14} /> };
    }
  };

  const statusInfo = getStatusDisplay(session.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner / Header */}
        <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-end">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
          >
            <FiX size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className={`${statusInfo.color} p-2 rounded-full flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tighter shadow-xl`}>
               {statusInfo.icon}
               {statusInfo.label}
             </div>
             <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Growth Session Profile</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">
              {session.title}
            </h2>
            <div className="flex items-center gap-4 mt-4">
               <div className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                  <FiUsers size={14} />
                  {team?.name || 'Assigned Squad'}
               </div>
               <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                  <FiClock size={14} />
                  {session.duration || 60} mins
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1.5">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <FiCalendar size={12} />
                 Chronological Link
               </p>
               <p className="text-sm font-black text-gray-900">
                 {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </p>
               <p className="text-xs font-bold text-gray-500">
                 {session.start_time.split(' ')[1]?.substring(0, 5) || '10:00'} — {session.end_time.split(' ')[1]?.substring(0, 5) || '11:00'}
               </p>
            </div>

            <div className="space-y-1.5">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <FiUser size={12} />
                 Presenter
               </p>
               <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-[10px] font-black">
                     {presenter ? presenter.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <p className="text-sm font-black text-gray-900">{presenter?.name || 'TBD / Unassigned'}</p>
               </div>
            </div>
          </div>

          <hr className="border-gray-50" />

          <div className="space-y-4">
             {session.location && (
               <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl">
                    <FiMapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Physical Venue</p>
                    <p className="text-sm font-bold text-gray-700">{session.location}</p>
                  </div>
               </div>
             )}

             {session.meeting_link && (
               <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                    <FiLink size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Virtual Access</p>
                    <a 
                      href={session.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4 truncate block"
                    >
                      {session.meeting_link}
                    </a>
                  </div>
               </div>
             )}
          </div>

          <hr className="border-gray-50" />

          {/* New Sections: Notes & Action Items */}
          <div className="space-y-12 pb-10">
            <SessionNotes 
              sessionId={session.id} 
              notes={session.notes || []} 
              onNoteChange={onRefresh} 
            />
            
            <hr className="border-gray-50" />

            <ActionItemsList 
              sessionId={session.id} 
              items={session.action_items || []} 
              members={team?.members || []} 
              onItemChange={onRefresh} 
            />
          </div>
        </div>

        {/* Dynamic Actions */}
        <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(session)}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
              title="Edit Profile"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
              title="Terminate Session"
            >
              <FiTrash2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 text-xs font-black rounded-2xl hover:border-gray-300 transition-all shadow-sm active:scale-95"
            >
              <FiDownload size={14} />
              Export .ICS
            </button>

            {session.status === 'planned' && (
              <>
                <button
                  onClick={() => onStatusChange('cancelled')}
                  className="px-5 py-3 bg-rose-50 text-rose-600 text-xs font-black rounded-2xl hover:bg-rose-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onStatusChange('completed')}
                  className="px-5 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  Mark Completed
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
