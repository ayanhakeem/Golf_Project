import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from '../components/common/Button';

export default function Subscribe() {
  const { user } = useAuth();
  const { createSession, loading } = useSubscription();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSubscribe = (plan) => {
    createSession(plan);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-forest-700 tracking-tight mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Activate your subscription to enter the monthly draws and begin supporting your selected charity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100 flex flex-col relative"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly Member</h3>
            <p className="text-gray-500 mb-6">Perfect for casual golfers.</p>
            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-5xl font-black text-forest-700">£9.99</span>
              <span className="text-lg text-gray-500 font-medium">/ month</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {['1 active charity contribution', 'Up to 5 score entries per month', 'Entry into monthly algorithmic draw', 'Cancel anytime'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <Check className="text-forest-500 shrink-0 mt-0.5" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg" 
              fullWidth 
              onClick={() => handleSubscribe('monthly')} 
              isLoading={loading}
              className="mt-auto"
            >
              Select Monthly
            </Button>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-forest-700 p-8 md:p-10 rounded-[2rem] shadow-2xl border border-forest-600 flex flex-col relative transform md:-translate-y-4"
          >
            <div className="absolute -top-5 left-0 right-0 flex justify-center">
              <span className="bg-gold-500 text-forest-800 text-sm font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                Save ~16% (2 Months Free)
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 mt-4">Yearly Member</h3>
            <p className="text-forest-100 mb-6">For the dedicated golfer.</p>
            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-5xl font-black text-gold-500">£99.99</span>
              <span className="text-lg text-forest-200 font-medium">/ year</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {['Everything in Monthly', 'Commitment to long-term charity impact', 'Priority review on prize claims', 'Billed annually'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-white">
                  <Check className="text-gold-500 shrink-0 mt-0.5" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg" 
              fullWidth 
              variant="secondary"
              onClick={() => handleSubscribe('yearly')} 
              isLoading={loading}
              className="mt-auto shadow-gold-500/30"
            >
              Select Yearly
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
