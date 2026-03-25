import { useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useSubscription = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscriptions/status');
      if (res.data.success) {
        setStatus(res.data.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = async (plan) => {
    try {
      const res = await api.post('/subscriptions/create', { plan });
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating checkout session');
    }
  };

  const cancelSubscription = async () => {
    try {
      const res = await api.post('/subscriptions/cancel');
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStatus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling subscription');
    }
  };

  return { status, loading, fetchStatus, createSession, cancelSubscription };
};
