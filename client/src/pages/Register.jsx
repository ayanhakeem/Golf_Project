import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    charityId: '', charityPercentage: 10
  });
  const [charities, setCharities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active charities for dropdown
    const fetchCharities = async () => {
      try {
        const res = await api.get('/charities?limit=100');
        if (res.data.success) setCharities(res.data.charities);
      } catch (err) {
        toast.error('Could not load charities');
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        charityId: formData.charityId || undefined,
        charityPercentage: Number(formData.charityPercentage)
      });
      toast.success('Registration successful!');
      navigate('/subscribe'); // redirect to payment flow
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gold-50 rounded-bl-[100px] -z-10 opacity-70" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-forest-100/50 rounded-tr-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl inline-block mb-4">⛳</Link>
          <h2 className="text-3xl font-extrabold text-forest-700">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-500">Log in</Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">Email Address</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">Password</label>
              <input type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest-700 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" required minLength="6" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500 outline-none" placeholder="••••••••" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-forest-700 mb-4">Your Charitable Impact</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-forest-700 mb-2">Select a Charity</label>
                <select 
                  name="charityId" 
                  required 
                  value={formData.charityId} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest-500 bg-white"
                >
                  <option value="" disabled>Choose a charity to support</option>
                  {charities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-forest-700">Contribution Percentage</label>
                  <span className="text-2xl font-black text-gold-500">{formData.charityPercentage}%</span>
                </div>
                <input 
                  type="range" 
                  name="charityPercentage" 
                  min="10" 
                  max="100" 
                  step="5"
                  value={formData.charityPercentage} 
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-forest-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  <span>Standard (10%)</span>
                  <span>Maximum (100%)</span>
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  By default, 10% of your subscription goes to your selected charity. You can increase this at completely no extra cost to your overall subscription fee (reduces your prize pool contribution).
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} className="mt-8">
            Create Account
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
