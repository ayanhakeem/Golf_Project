import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trophy, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WinningsWidget() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinnings = async () => {
      try {
        const res = await api.get('/winners/me');
        if (res.data.success) {
          setWinnings(res.data.winners);
        }
      } catch (err) {
        console.error('Error fetching winnings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWinnings();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const pendingProofs = winnings.filter(w => !w.proofImageUrl);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-forest-700 flex items-center gap-2">
          <Trophy className="text-gold-500" /> Winnings History
        </h3>
        <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          Total: £{(winnings.reduce((acc, w) => acc + w.prizeAmount, 0) / 100).toFixed(2)}
        </span>
      </div>

      {pendingProofs.length > 0 && (
        <div className="bg-gold-50 border border-gold-200 p-4 rounded-xl mb-6">
          <p className="text-gold-700 font-bold mb-2">Claim Required!</p>
          <p className="text-sm text-gold-600 mb-3">You have {pendingProofs.length} unclaimed prize(s). Upload proof now.</p>
          <Link to="/dashboard/winner" className="inline-flex items-center text-sm font-bold text-forest-600 hover:text-forest-500">
            Upload Proof <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      )}

      <div className="flex-grow space-y-4 overflow-y-auto pr-2">
        {winnings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm font-medium">No winnings yet.</p>
            <p className="text-xs mt-1">Keep playing for your chance to win!</p>
          </div>
        ) : (
          winnings.map((win) => (
            <div key={win._id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-forest-700">£{(win.prizeAmount / 100).toFixed(2)}</span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  win.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                  win.verificationStatus === 'pending' && win.proofImageUrl ? 'bg-yellow-100 text-yellow-700' :
                  win.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {win.paymentStatus === 'paid' ? 'Paid' : win.verificationStatus === 'pending' && win.proofImageUrl ? 'In Review' : win.verificationStatus === 'rejected' ? 'Rejected' : 'Action Needed'}
                </span>
              </div>
              <div className="text-sm text-gray-600 flex justify-between">
                <span>{win.drawId?.month || 'Unknown Month'} Draw</span>
                <span className="font-semibold">{win.matchType}</span>
              </div>
              
              {!win.proofImageUrl && (
                <Link to="/dashboard/winner" className="mt-2 text-xs font-bold text-forest-600 bg-forest-50 hover:bg-forest-100 px-3 py-2 rounded-lg text-center transition-colors">
                  Upload Screenshot Proof
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
