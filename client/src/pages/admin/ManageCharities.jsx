import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Edit2, Trash2, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: null, name: '', description: '', isFeatured: false });
  const [files, setFiles] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await api.get('/charities?limit=100');
      if (res.data.success) setCharities(res.data.charities);
    } catch (err) {
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (charity = null) => {
    if (charity) {
      setFormData({ id: charity._id, name: charity.name, description: charity.description, isFeatured: charity.isFeatured });
    } else {
      setFormData({ id: null, name: '', description: '', isFeatured: false });
    }
    setFiles(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('isFeatured', formData.isFeatured);
      
      if (files) {
        for (let i = 0; i < files.length; i++) {
          data.append('images', files[i]);
        }
      }

      const isUpdate = !!formData.id;
      const url = isUpdate ? `/charities/${formData.id}` : '/charities';
      const method = isUpdate ? 'put' : 'post';

      const res = await api({ method, url, data, headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.data.success) {
        toast.success(isUpdate ? 'Charity updated' : 'Charity created');
        setIsModalOpen(false);
        fetchCharities();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving charity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this charity permanently?')) return;
    try {
      await api.delete(`/charities/${id}`);
      toast.success('Deleted');
      fetchCharities();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Charities</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove partner charities.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus size={18} /> Add Charity
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-forest-50 border-b border-forest-100 text-forest-700 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Charity Name</th>
              <th className="p-4 font-semibold">Featured</th>
              <th className="p-4 font-semibold">Images</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : charities.map(c => (
              <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{c.name}</td>
                <td className="p-4">
                  {c.isFeatured && <Star size={18} className="text-gold-500 fill-gold-500" />}
                </td>
                <td className="p-4">
                  {c.images && c.images.length > 0 ? (
                    <img src={c.images[0]} alt="thumb" className="w-12 h-12 rounded-lg object-cover" />
                  ) : <span className="text-xs text-gray-400">None</span>}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleOpenModal(c)} className="p-2 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Charity" : "Add New Charity"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl h-24" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="rounded text-forest-600" />
              Featured Partner
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Images (Max 5)</label>
            <input type="file" multiple accept="image/*" onChange={e => setFiles(e.target.files)} className="w-full text-sm" />
            <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing images.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>Save Charity</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
