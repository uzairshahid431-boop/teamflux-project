import React, { useState, useEffect } from 'react';
import { 
  useGetDebtCommentsQuery, 
  useAddDebtCommentMutation, 
  useUpdateDebtCommentMutation, 
  useDeleteDebtCommentMutation 
} from '../store/apiSlice';
import DebtCommentItem from './DebtCommentItem';
import { FiMessageSquare, FiSend, FiLoader } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';

interface DebtCommentsProps {
  debtId: number;
}

const DebtComments: React.FC<DebtCommentsProps> = ({ debtId }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  
  const { data: apiComments = [], isLoading, refetch, isFetching } = useGetDebtCommentsQuery(debtId);
  const [addComment, { isLoading: isAdding }] = useAddDebtCommentMutation();
  const [updateComment] = useUpdateDebtCommentMutation();
  const [deleteComment] = useDeleteDebtCommentMutation();

  const [localComments, setLocalComments] = useState<any[]>([]);
  const STORAGE_KEY = `debt_comments_fallback_${debtId}`;

  // Load Local Fallback
  useEffect(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) setLocalComments(JSON.parse(local));
  }, [debtId]);

  const isViewer = user?.role === 'viewer';

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const tempComment = {
      id: Date.now(),
      debt_id: debtId,
      user_id: user?.id || 0,
      comment: commentText,
      created_at: new Date().toISOString(),
      user: { name: user?.name || 'Local Contributor' }
    };

    // Save to Local immediately
    const updatedLocal = [...localComments, tempComment];
    setLocalComments(updatedLocal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    try {
      await addComment({ debtId, comment: commentText }).unwrap();
      refetch();
    } catch (err) {
      console.error('Persistence Sync Failure: Collaborative stream restricted.', err);
    }

    setCommentText('');
  };

  const handleUpdate = async (commentId: number, text: string) => {
    try {
      await updateComment({ commentId, debtId, comment: text }).unwrap();
    } catch (err) {
      console.error('Failed to update comment', err);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('Erase this intelligence thread?')) return;
    
    // Remove from local
    const updatedLocal = localComments.filter(c => c.id !== commentId);
    setLocalComments(updatedLocal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    try {
      await deleteComment({ commentId, debtId }).unwrap();
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const allComments = [...apiComments];
  localComments.forEach(lc => {
    if (!allComments.find(ac => ac.id === lc.id)) allComments.push(lc);
  });

  if (isLoading && allComments.length === 0) {
    return (
      <div className="flex flex-col items-center py-10">
        <FiLoader className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Hydrating Stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
          <FiMessageSquare className="text-blue-500" />
          Collaboration Stream
          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-500">
            {isFetching ? '...' : allComments.length}
          </span>
        </h3>
      </div>

      {/* Add Comment Form */}
      {!isViewer && (
        <form onSubmit={handleAddComment} className="relative group">
          <textarea
            placeholder="Add intelligence to the stream..."
            className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 pr-14 text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-100 transition-all min-h-[100px] resize-none"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={isAdding || !commentText.trim()}
            className="absolute right-3 bottom-3 p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all disabled:opacity-30 shadow-lg active:scale-95"
          >
            {isAdding ? <FiLoader className="animate-spin" /> : <FiSend size={18} />}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {allComments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-xs font-bold leading-none">No collaborative intelligence recorded.</p>
          </div>
        ) : (
          [...allComments]
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            })
            .map((comment: any) => (
              <DebtCommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id || 0}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default DebtComments;
