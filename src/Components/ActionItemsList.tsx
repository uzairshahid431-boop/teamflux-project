import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiCheckCircle, FiCircle, FiUser, FiCalendar, FiClock, FiCheck } from 'react-icons/fi';
import { useAuth } from '../Context/AuthContext';
import { createActionItem, updateActionItem, deleteActionItem, type ActionItem, type ActionItemStatus } from '../Services/sessionService';

interface ActionItemsListProps {
  sessionId: number;
  items: ActionItem[];
  members: { id: number; name: string }[];
  onItemChange: () => void;
}

const ActionItemsList: React.FC<ActionItemsListProps> = ({ sessionId, items, members, onItemChange }) => {
  const { token, user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    assignee_id: undefined as number | undefined,
    due_date: '',
  });

  const getStatusConfig = (status: ActionItemStatus) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-emerald-50 text-emerald-600', icon: <FiCheckCircle size={16} /> };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-50 text-blue-600', icon: <FiClock size={16} /> };
      default:
        return { label: 'Pending', color: 'bg-gray-50 text-gray-500', icon: <FiCircle size={16} /> };
    }
  };

  const handleCreate = async () => {
    if (!newItem.title.trim() || !token) return;
    try {
      await createActionItem(sessionId, {
        title: newItem.title,
        assignee_id: newItem.assignee_id,
        due_date: newItem.due_date || undefined,
        status: 'pending'
      }, token);
      setNewItem({ title: '', assignee_id: undefined, due_date: '' });
      setIsAdding(false);
      onItemChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (item: ActionItem) => {
    if (!token) return;
    const nextStatus: ActionItemStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateActionItem(sessionId, item.id, { 
        status: nextStatus,
        completed: nextStatus === 'completed'
      }, token);
      onItemChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (itemId: number, status: ActionItemStatus) => {
    if (!token) return;
    try {
      await updateActionItem(sessionId, itemId, { 
        status,
        completed: status === 'completed'
      }, token);
      onItemChange();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!token) return;
    if (!window.confirm('Remove this action item?')) return;
    try {
      await deleteActionItem(sessionId, itemId, token);
      onItemChange();
    } catch (error) {
      console.error(error);
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
            placeholder="What needs to be done?"
            className="w-full p-4 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiUser size={12} /> Assignee
              </label>
              <select
                value={newItem.assignee_id || ''}
                onChange={(e) => setNewItem({ ...newItem, assignee_id: Number(e.target.value) || undefined })}
                className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs font-bold outline-none"
              >
                <option value="">Select Assignee</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FiCalendar size={12} /> Due Date
              </label>
              <input
                type="date"
                value={newItem.due_date}
                onChange={(e) => setNewItem({ ...newItem, due_date: e.target.value })}
                className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setIsAdding(false); setNewItem({ title: '', assignee_id: undefined, due_date: '' }); }}
              className="px-4 py-2 bg-gray-200 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
             <p className="text-sm font-bold text-gray-400">No action items assigned from this session.</p>
          </div>
        ) : (
          items.map((item) => {
            const config = getStatusConfig(item.status);
            const assignee = members.find(m => m.id === item.assignee_id);
            const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed';

            return (
              <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 group hover:border-gray-200 transition-all">
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
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                        <FiUser size={10} />
                        {assignee.name}
                      </div>
                    )}
                    {item.due_date && (
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-gray-400'}`}>
                        <FiCalendar size={10} />
                        {new Date(item.due_date).toLocaleDateString()}
                        {isOverdue && <span className="bg-rose-50 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Overdue</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as ActionItemStatus)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border-none outline-none shadow-sm cursor-pointer transition-all ${config.color}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActionItemsList;
