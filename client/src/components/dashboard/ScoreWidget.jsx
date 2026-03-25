import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Target, Calendar as CalendarIcon, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';

export default function ScoreWidget() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Custom form state
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDate, setEditDate] = useState('');

  const fetchScores = async () => {
    try {
      const res = await api.get('/scores/me');
      if (res.data.success) setScores(res.data.scores);
    } catch (err) {
      toast.error('Failed to load scores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await api.post('/scores/add', { value: Number(newScore), date: newDate });
      if (res.data.success) {
        setScores(res.data.scores);
        setNewScore('');
        setNewDate('');
        toast.success('Score added! (Rolling 5-score limit enforced)');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding score');
    } finally {
      setAdding(false);
    }
  };

  const handleEditInit = (score) => {
    setEditingId(score._id);
    setEditValue(score.value);
    setEditDate(score.date.split('T')[0]);
  };

  const handleEditSave = async (id) => {
    try {
      const res = await api.put(`/scores/${id}`, { value: Number(editValue), date: editDate });
      if (res.data.success) {
        setScores(res.data.scores);
        setEditingId(null);
        toast.success('Score updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating score');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return;
    try {
      const res = await api.delete(`/scores/${id}`);
      if (res.data.success) {
        setScores(res.data.scores);
        toast.success('Score deleted');
      }
    } catch (err) {
      toast.error('Error deleting score');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-forest-700 flex items-center gap-2">
          <Target className="text-gold-500" /> Active Scores
        </h3>
        <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {scores.length} / 5
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-6 line-clamp-2">
        Enter your scores (1-45). The system automatically uses your 5 most recent scores for the monthly draw.
      </p>

      {/* Add Score Form */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8 bg-forest-50 p-4 rounded-2xl border border-forest-100">
        <input 
          type="number" 
          min="1" max="45" 
          required 
          value={newScore} 
          onChange={(e) => setNewScore(e.target.value)}
          placeholder="Score" 
          className="w-20 px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest-500 outline-none text-center font-bold"
        />
        <input 
          type="date" 
          required 
          value={newDate} 
          onChange={(e) => setNewDate(e.target.value)}
          className="flex-grow px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest-500 outline-none text-sm text-gray-600"
        />
        <Button type="submit" size="sm" isLoading={adding}>Add</Button>
      </form>

      {/* Score List */}
      <div className="flex-grow overflow-y-auto pr-2 space-y-3">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No active scores yet.</div>
        ) : (
          scores.map((s, i) => (
            <div key={s._id} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-forest-200 hover:bg-forest-50/50 transition-colors">
              {editingId === s._id ? (
                <div className="flex gap-2 w-full pr-2">
                  <input type="number" min="1" max="45" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-16 px-2 py-1 border rounded" />
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-2 py-1 border rounded text-xs" />
                  <button onClick={() => handleEditSave(s._id)} className="text-green-600 p-1"><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-red-500 p-1"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-gold-100 text-gold-700' : 'bg-forest-100 text-forest-700'}`}>
                      {s.value}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Entry {scores.length - i}</div>
                      <div className="text-sm text-gray-700 flex items-center gap-1">
                        <CalendarIcon size={12} className="text-gray-400" />
                        {new Date(s.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => handleEditInit(s)} className="p-1.5 text-gray-400 hover:text-forest-600 bg-white rounded-md shadow-sm border border-gray-100"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(s._id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-100"><X size={14} /></button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
