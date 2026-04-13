import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { createNote, updateNote, deleteNote, type SessionNote } from '../Services/sessionService';

interface SessionNotesProps {
  sessionId: number;
  notes: SessionNote[];
  onNoteChange: () => void;
}

const SessionNotes: React.FC<SessionNotesProps> = ({ sessionId, notes, onNoteChange }) => {
  const { token, user } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleCreate = async () => {
    if (!newNote.trim() || !token) return;
    try {
      await createNote(sessionId, newNote, token);
      setNewNote('');
      setIsAdding(false);
      onNoteChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (noteId: number) => {
    if (!editContent.trim() || !token) return;
    try {
      await updateNote(sessionId, noteId, editContent, token);
      setEditingNoteId(null);
      setEditContent('');
      onNoteChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(sessionId, noteId, token);
      onNoteChange();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
          <FiMessageSquare className="text-blue-600" />
          Session Notes
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <FiPlus size={14} />
            Add Note
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Write using Markdown</span>
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {isPreview ? 'Back to Editor' : 'Show Preview'}
            </button>
          </div>
          
          {isPreview ? (
            <div className="prose prose-sm max-w-none p-4 bg-white rounded-2xl border border-gray-200 min-h-[120px]">
              <ReactMarkdown>{newNote || 'Nothing to preview'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Deep dive into the session details..."
              className="w-full h-32 p-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
            />
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsAdding(false); setIsPreview(false); setNewNote(''); }}
              className="px-4 py-2 bg-gray-200 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
             <p className="text-sm font-bold text-gray-400">No session notes captured yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              {editingNoteId === note.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-24 p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingNoteId(null)} className="p-2 text-gray-400 hover:text-gray-600"><FiX /></button>
                    <button onClick={() => handleUpdate(note.id)} className="p-2 text-blue-600 hover:text-blue-700"><FiSave /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-[10px] font-black uppercase">
                        {note.author_name ? note.author_name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900">{note.author_name || 'System / Contributor'}</p>
                        <p className="text-[10px] font-bold text-gray-400">{new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    {user?.id === note.user_id && (
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); }}
                           className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                         >
                           <FiEdit2 size={14} />
                         </button>
                         <button
                           onClick={() => handleDelete(note.id)}
                           className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                         >
                           <FiTrash2 size={14} />
                         </button>
                       </div>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 font-medium">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionNotes;
