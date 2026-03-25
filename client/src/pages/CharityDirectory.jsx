import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Search, Heart } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function CharityDirectory() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCharities = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/charities?search=${search}`);
        if (res.data.success) {
          setCharities(res.data.charities);
        }
      } catch (err) {
        console.error('Error fetching charities', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchCharities();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="bg-forest-700 pt-16 pb-32 px-6 text-center text-white font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-forest-800/50" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Partner Charities</h1>
          <p className="text-lg text-forest-100 font-light mb-10 max-w-2xl mx-auto">
            Discover the incredible organizations making a difference worldwide. 
            Choose who to support when you subscribe.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto shadow-2xl rounded-full">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search charities by name or cause..."
              className="block w-full pl-14 pr-6 py-4 rounded-full text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-forest-500/30 transition-all text-lg border-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-20 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <LoadingSkeleton key={i} type="card" />)}
          </div>
        ) : charities.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {charities.map((charity, i) => (
              <motion.div
                key={charity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col group hover:-translate-y-2 transition-transform duration-300"
              >
                {/* Image Handle */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {charity.images && charity.images.length > 0 ? (
                    <img 
                      src={charity.images[0]} 
                      alt={charity.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-forest-50">
                      <Heart className="text-forest-200 w-16 h-16" />
                    </div>
                  )}
                  {charity.isFeatured && (
                    <div className="absolute top-4 left-4 bg-gold-500 text-forest-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      Featured
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{charity.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {charity.description}
                  </p>
                  <div className="mt-auto">
                    <Link 
                      to={`/charities/${charity._id}`}
                      className="inline-block w-full text-center bg-forest-50 text-forest-700 font-semibold py-3 rounded-xl hover:bg-forest-600 hover:text-white transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No charities found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
