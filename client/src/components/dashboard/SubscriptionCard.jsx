import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertCircle, Heart } from 'lucide-react';

export default function SubscriptionCard({ subscription }) {
  const { user } = useAuth();
  
  if (!subscription) {
    return (
      <div className="bg-forest-50 p-6 rounded-3xl border border-forest-100 h-full flex flex-col justify-center items-center text-center">
        <Shield className="text-forest-300 w-12 h-12 mb-4" />
        <h3 className="font-bold text-forest-700 text-lg">No Active Plan</h3>
        <p className="text-sm text-gray-500 mt-2">Subscribe to enter the draw.</p>
      </div>
    );
  }

  const isActive = subscription.status === 'active';

  return (
    <div className={`p-6 rounded-3xl border h-full flex flex-col ${isActive ? 'bg-white border-forest-100 shadow-sm' : 'bg-red-50 border-red-100'}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 capitalize">{subscription.plan} Plan</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {subscription.status}
            </span>
          </div>
        </div>
        {!isActive && <AlertCircle className="text-red-500" />}
      </div>

      <div className="space-y-4 flex-grow">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Renewal Date</p>
          <p className="font-medium text-gray-900">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
        </div>
        
        {user?.charityId && (
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3">
            <Heart className="text-forest-500 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-xs text-forest-600/70 uppercase tracking-wider font-semibold mb-1">Supporting</p>
              <p className="font-semibold text-forest-700 line-clamp-1">{user.charityId.name}</p>
              <p className="text-xs text-forest-600 mt-1">{user.charityPercentage}% contribution</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
