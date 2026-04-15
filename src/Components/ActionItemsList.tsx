import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiCheckCircle, FiCircle, FiUser, FiCalendar, FiClock, FiCheck, FiLoader } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { createActionItem, updateActionItem, deleteActionItem, fetchActionItems, type ActionItem, type ActionItemStatus } from '../Services/sessionService';

interface ActionItemsListProps {
  sessionId: number;
  members: { id: number; name: string }[];
  onItemChange?: () => void;
}

const ActionItemsList: React.FC<ActionItemsListProps> = ({ sessionId, members, onItemChange }) => {
  const { token, user } = useAuth();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    assignee_id: undefined as number | undefined,
    due_date: '',
    status: 'pending' as ActionItemStatus
  });

  const STORAGE_KEY = `session_items_fallback_${sessionId}`;

  const loadItems = async () => {
    if (!token) return;
    setLoading(true);
    
    const local = localStorage.getItem(STORAGE_KEY);
    const localItems = local ? JSON.parse(local) : [];

    try {
      const apiItems = await fetchActionItems(sessionId, token);
      const merged = [...apiItems];
      localItems.forEach((li: any) => {
        if (!merged.find(mi => mi.id === li.id)) merged.push(li);
      });
      setItems(merged);
    } catch (err) {
      console.warn('Intelligence Link: API unreachable, using local task cache.', err);
      setItems(localItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [sessionId, token]);

  const handleCreate = async () => {
    if (!newItem.title.trim() || !token) return;
    
    const tempItem: ActionItem = {
      id: Date.now(),
      title: newItem.title,
      status: newItem.status,
      completed: newItem.status === 'completed',
      session_id: sessionId,
      assignee_id: newItem.assignee_id,
      due_date: newItem.due_date,
      created_at: new Date().toISOString(),
      user_id: user?.id || 0
    };

    const local = localStorage.getItem(STORAGE_KEY);
    const currentLocal = local ? JSON.parse(local) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...currentLocal, tempItem]));

    try {
      await createActionItem(sessionId, {
        title: newItem.title,
        assignee_id: newItem.assignee_id,
        due_date: newItem.due_date || undefined,
        status: newItem.status
      }, token);
    } catch (err) {
      console.error('Persistence Sync Failure', err);
    }

    setItems(prev => [...prev, tempItem]);
    setNewItem({ title: '', assignee_id: undefined, due_date: '', status: 'pending' });
    setIsAdding(false);
    if (onItemChange) onItemChange();
  };

  const handleToggleStatus = async (item: ActionItem) => {
    if (!token) return;
    const nextStatus: ActionItemStatus = item.status === 'completed' ? 'pending' : 'completed';
    
    // Update local immediately
    const updatedItems = items.map(i => i.id === item.id ? { ...i, status: nextStatus, completed: nextStatus === 'completed' } : i);
    setItems(updatedItems);
    
    // Update storage
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedLocal = local.map((li: any) => li.id === item.id ? { ...li, status: nextStatus, completed: nextStatus === 'completed' } : li);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

    try {
      await updateActionItem(sessionId, item.id, { 
        status: nextStatus,
        completed: nextStatus === 'completed'
      }, token);
    } catch (err) {
      console.error('Update failed', err);
    }
    if (onItemChange) onItemChange();
  };

  const handleDelete = async (itemId: number) => {
    if (!token || !window.confirm('Delete this task?')) return;
    
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local.filter((li: any) => li.id !== itemId)));

    try {
      await deleteActionItem(sessionId, itemId, token);
    } catch (err) {
      console.error('Delete failed', err);
    }
    setItems(prev => prev.filter(i => i.id !== itemId));
    if (onItemChange) onItemChange();
  };

  const getStatusConfig = (status: ActionItemStatus) => {
    switch (status) {
      case 'completed': return { color: 'bg-emerald-50 text-emerald-600', icon: <FiCheckCircle size={16} /> };
      case 'in_progress': return { color: 'bg-blue-50 text-blue-600', icon: <FiClock size={16} /> };
      default: return { color: 'bg-gray-50 text-gray-500', icon: <FiCircle size={16} /> };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
          <FiCheckCircle className="text-emerald-600" />
          Action Items
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <FiPlus size={14} />
            Assign Task
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <input
            type="text"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            placeholder="Describe the objective..."
            className="w-full p-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <FiUser size={12} /> Assignee
              </label>
              <select
                value={newItem.assignee_id || ''}
                onChange={(e) => setNewItem({ ...newItem, assignee_id: Number(e.target.value) || undefined })}
                className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs font-bold outline-none cursor-pointer hover:border-gray-300 transition-all"
              >
                <option value="">Select Assignee</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <FiCalendar size={12} /> Due Date
              </label>
              <input
                type="date"
                value={newItem.due_date}
                onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setIsAdding(false); setNewItem({ title: '', assignee_id: undefined, due_date: '', status: 'pending' }); }}
              className="px-4 py-2 text-gray-400 text-xs font-black hover:text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center py-10 justify-center">
            <FiLoader className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hydrating Task List...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <p className="text-sm font-bold text-gray-400">No action items detected.</p>
          </div>
        ) : (
          items.map((item) => {
            const config = getStatusConfig(item.status);
            const assignee = members.find(m => m.id === item.assignee_id);
            const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed';

            return (
              <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 group hover:border-emerald-100 hover:bg-emerald-50/10 transition-all">
                <button
                  onClick={() => handleToggleStatus(item)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 text-transparent hover:border-emerald-500'
                  }`}
                >
                  <FiCheck size={14} />
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black tracking-tight truncate ${item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {assignee && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <FiUser size={10} className="text-emerald-600" />
                        {assignee.name}
                      </div>
                    )}
                    {item.due_date && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-gray-400'}`}>
                        <FiCalendar size={10} />
                        {new Date(item.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className={`${config.color} px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest`}>
                   {item.status.replace('_', ' ')}
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActionItemsList;
