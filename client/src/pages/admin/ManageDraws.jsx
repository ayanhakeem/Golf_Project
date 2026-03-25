import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import { Target, Gift, Trophy, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageDraws() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [drawResult, setDrawResult] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.post('/draws/simulate', { 
        month: new Date().toISOString().substring(0, 7),
        drawType: 'algorithmic',
        bias: 'most'
      });
      if (res.data.success) {
        setDrawResult(res.data.simulation);
        toast.success('Simulation complete');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!drawResult) return;
    if (!window.confirm('THIS ACTION CANNOT BE UNDONE. Publish Official Draw and distribute Winnings?')) return;
    
    setSimulating(true); // Reuse loading state
    try {
      const res = await api.post('/draws/publish', {
        drawId: drawResult.drawId,
        month: drawResult.month,
        numbers: drawResult.drawnNumbers,
        potSize: drawResult.potSize
      });
      if (res.data.success) {
        toast.success(`Published! Distributed ${res.data.totalWinners} prizes.`);
        setDrawResult(null); // Clear simulation
        fetchStats(); // Update stats
      }
    } catch (err) {
      toast.error('Failed to publish draw');
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !stats) return <div className="p-8">Loading Draw metrics...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Draw Engine</h1>
          <p className="text-gray-500 mt-1">Simulate algorithmic outcomes before officially publishing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-forest-800 text-white p-6 rounded-3xl shadow-lg border border-forest-600">
          <Trophy className="text-gold-500 mb-4" size={32} />
          <p className="text-forest-200 text-sm font-semibold uppercase tracking-wider mb-1">Current Pot Size</p>
          <h2 className="text-4xl font-black text-gold-500">£{(stats.totalPotSize / 100).toFixed(2)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <Target className="text-forest-500 mb-4" size={32} />
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Active Entries</p>
          <h2 className="text-4xl font-black text-gray-900">{stats.activeSubs}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <Gift className="text-forest-500 mb-4" size={32} />
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Pending Charity Funds</p>
          <h2 className="text-4xl font-black text-gray-900 line-clamp-1 truncate">£{(stats.totalPotSize * 0.1 / 100).toFixed(2)} +</h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold text-gray-900">Monthly Simulator</h2>
          <Button onClick={handleSimulate} isLoading={simulating} className="flex items-center gap-2" variant="outline">
            <RefreshCw size={16} /> Run Algorithmic Simulation
          </Button>
        </div>

        {drawResult ? (
          <div className="bg-forest-50 border border-forest-100 rounded-2xl p-8">
            <h3 className="font-bold text-forest-700 text-lg mb-4">Simulation Results ({drawResult.month})</h3>
            
            <div className="flex flex-wrap gap-4 mb-8">
              {drawResult.drawnNumbers.map((num, i) => (
                <div key={i} className="w-14 h-14 bg-white shadow-sm border border-forest-200 rounded-full flex items-center justify-center text-xl font-bold text-forest-800">
                  {num}
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                  <tr>
                    <th className="p-3">Match Tier</th>
                    <th className="p-3">Total Winners</th>
                    <th className="p-3 border-l border-gray-200">Payout per Winner</th>
                    <th className="p-3 text-right border-l border-gray-200">Total Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['match5', 'match4', 'match3'].map((tier, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-forest-700 capitalize">{tier.replace('match', '')} Matches</td>
                      <td className="p-3 font-medium">{drawResult.results[tier]?.winnersCount || 0}</td>
                      <td className="p-3 border-l border-gray-100 font-bold text-green-600">
                        £{((drawResult.results[tier]?.payoutPerWinner || 0) / 100).toFixed(2)}
                      </td>
                      <td className="p-3 border-l border-gray-100 text-right font-medium">
                        £{((drawResult.results[tier]?.totalPayout || 0) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-4 border-t border-forest-200 pt-6">
              <Button variant="danger" onClick={() => setDrawResult(null)}>Discard Simulation</Button>
              <Button onClick={handlePublish} isLoading={simulating} className="bg-gold-500 hover:bg-gold-400 text-forest-800">
                Official Publish & Payout
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Run a simulation to generate numbers against the live database of active scorecards.</p>
          </div>
        )}
      </div>
    </div>
  );
}
