import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyWinners() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/winners?status=pending');
      if (res.data.success) setPending(res.data.winners);
    } catch (err) {
      toast.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status, note = '') => {
    if (status === 'rejected' && (!note || note.trim() === '')) {
      const reason = prompt('Please enter a reason for rejection:');
      if (!reason) return; // Cancelled
      note = reason;
    }

    if (status === 'approved' && !window.confirm('Approve proof? The user will be automatically designated for payment.')) return;

    setVerifyingId(id);
    try {
      const res = await api.put(`/winners/${id}/verify`, { status, reviewNote: note });
      if (res.data.success) {
        toast.success(`Proof ${status === 'approved' ? 'Approved' : 'Rejected'}`);
        setPending(prev => prev.filter(w => w._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error verifying proof');
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading pending validations...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Winners</h1>
          <p className="text-gray-500 mt-1">Review user-uploaded scorecard screenshots for draw matches.</p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-forest-50 border border-forest-100 p-12 text-center rounded-3xl">
          <CheckCircle className="text-forest-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-forest-700">Inbox Zero</h3>
          <p className="text-gray-600 mt-2">All uploaded proofs have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pending.map(win => (
            <div key={win._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-100 flex items-center justify-center relative group">
                <img 
                  src={win.proofImageUrl} 
                  alt="Proof" 
                  className="w-full h-full object-cover cursor-pointer" 
                  onClick={() => window.open(win.proofImageUrl, '_blank')}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-white font-bold flex items-center gap-2 drop-shadow-md">
                    <ImageIcon size={20} /> View Full
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{win.userId?.name}</h3>
                    <p className="text-sm text-gray-500">{win.userId?.email}</p>
                  </div>
                  <span className="bg-gold-100 text-gold-700 font-bold px-2 py-1 rounded text-xs uppercase tracking-wider">
                    {win.matchType}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-6 flex-grow">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Claimed Draw</p>
                  <p className="font-bold text-forest-700">{win.drawId?.month}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-3 mb-1">Prize Value</p>
                  <p className="font-bold text-gray-900">£{(win.prizeAmount / 100).toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Button 
                    variant="danger" 
                    onClick={() => handleVerify(win._id, 'rejected')}
                    isLoading={verifyingId === win._id}
                    disabled={verifyingId !== null}
                    className="flex justify-center"
                  >
                    <XCircle size={18} className="mr-2" /> Reject
                  </Button>
                  <Button 
                    onClick={() => handleVerify(win._id, 'approved')}
                    isLoading={verifyingId === win._id}
                    disabled={verifyingId !== null}
                    className="bg-green-600 hover:bg-green-700 focus:ring-green-600 flex justify-center text-white"
                  >
                    <CheckCircle size={18} className="mr-2" /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
