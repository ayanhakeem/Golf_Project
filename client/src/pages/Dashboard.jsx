import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { motion } from 'framer-motion';
import ScoreWidget from '../components/dashboard/ScoreWidget';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import WinningsWidget from '../components/dashboard/WinningsWidget';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subLoading, fetchStatus } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStatus();
    }
  }, [user, fetchStatus]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen p-8 bg-[#FAFAFA] flex items-center justify-center">
        <LoadingSkeleton type="card" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-forest-700 tracking-tight">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-500 mt-2 font-medium">Here's your subscription and performance overview.</p>
          </div>
        </motion.div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 h-[500px]">
            <SubscriptionCard subscription={status} />
          </motion.div>

          {status?.status === 'active' ? (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1 h-[500px]">
                <ScoreWidget />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1 h-[500px]">
                <WinningsWidget />
              </motion.div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Subscription Required</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">You must have an active subscription to submit scores, enter draws, and earn winnings.</p>
              <button 
                onClick={() => navigate('/subscribe')}
                className="bg-gold-500 text-forest-800 font-bold px-8 py-3 rounded-full hover:bg-gold-400 transition-colors shadow-sm"
              >
                Go to Subscription Plans
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
