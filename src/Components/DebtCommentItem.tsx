import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface DebtCommentItemProps {
  comment: any;
  currentUserId: number;
  onUpdate: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const DebtCommentItem: React.FC<DebtCommentItemProps> = ({ comment, currentUserId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.comment);
  const [loading, setLoading] = useState(false);

  const isOwnComment = comment.user_id === currentUserId;

  const handleUpdate = async () => {
    if (!editedText.trim() || editedText === comment.comment) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onUpdate(comment.id, editedText);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment', err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    if (email) return email[0].toUpperCase();
    return '?';
  };

  return (
    <div className="group relative bg-gray-50/50 rounded-2xl p-4 border border-transparent hover:border-gray-100 hover:bg-white transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black">
             {getInitials(comment.user?.name, comment.user?.email)}
          </div>
          <div>
            <p className="text-xs font-black text-gray-900">{comment.user?.name || 'User ' + comment.user_id}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mt-0.5">
              <FiClock size={10} />
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        {isOwnComment && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              <FiEdit2 size={12} />
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full bg-white border border-blue-100 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px]"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsEditing(false); setEditedText(comment.comment); }}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <FiX className="inline mr-1" /> Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center"
                disabled={loading || !editedText.trim()}
              >
                {loading ? (
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                ) : <FiCheck className="inline mr-1" />}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed prose-p:my-0 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown>{comment.comment}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtCommentItem;
