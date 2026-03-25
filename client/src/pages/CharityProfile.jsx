import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, ChevronLeft, Heart, Image as ImageIcon } from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function CharityProfile() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const res = await api.get(`/charities/${id}`);
        if (res.data.success) {
          setCharity(res.data.charity);
        }
      } catch (err) {
        console.error('Failed to load charity profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [id]);

  if (loading) {
    return <div className="max-w-5xl mx-auto p-8"><LoadingSkeleton type="text" /></div>;
  }

  if (!charity) {
    return <div className="text-center p-20 text-xl font-bold text-gray-500">Charity not found.</div>;
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24">
      {/* Hero Banner */}
      <div className="h-64 md:h-96 relative bg-forest-800">
        {charity.images && charity.images.length > 0 ? (
          <img 
            src={charity.images[0]} 
            alt={charity.name} 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-forest-700 to-forest-500 opacity-90" />
        )}
        <div className="absolute top-6 left-6 z-10">
          <Link to="/charities" className="flex items-center text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold transition-all">
            <ChevronLeft size={16} className="mr-1" /> Back to Directory
          </Link>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-10 border-b border-gray-100">
            <div>
              {charity.isFeatured && (
                <span className="bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block">
                  Featured Partner
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{charity.name}</h1>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              {/* Independent Donation Demo CTA */}
              <Button size="lg" className="flex items-center gap-2 w-full md:w-auto shadow-gold-500/20 shadow-lg" onClick={() => alert('Independent donation flow placeholder')}>
                <Heart size={18} /> Donate Directly
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Description */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-forest-700 mb-4">About the Cause</h3>
                <p className="text-gray-600 leading-relaxed max-w-none whitespace-pre-wrap">
                  {charity.description}
                </p>
              </div>

              {/* Photo Gallery Grid */}
              {charity.images && charity.images.length > 1 && (
                <div>
                  <h3 className="text-xl font-bold text-forest-700 mb-4 flex items-center gap-2">
                    <ImageIcon size={20} /> Impact Gallery
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {charity.images.slice(1).map((img, idx) => (
                      <div key={idx} className="bg-gray-100 rounded-2xl h-48 overflow-hidden">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar (Events) */}
            <div>
              <div className="bg-forest-50 p-8 rounded-3xl border border-forest-100 sticky top-24">
                <h3 className="text-xl font-bold text-forest-700 mb-6 flex items-center gap-2">
                  <Calendar size={20} /> Upcoming Events
                </h3>
                
                {charity.events && charity.events.length > 0 ? (
                  <div className="space-y-6">
                    {charity.events.map((event, i) => (
                      <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gold-600 font-bold text-sm mb-1 uppercase tracking-wide">
                          {new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No upcoming events scheduled right now.</p>
                )}
                
                <div className="mt-8 pt-8 border-t border-forest-100 text-center">
                  <p className="text-sm text-gray-600 mb-4">Support {charity.name} exclusively through your Golf for Good subscription.</p>
                  <Link to="/register">
                    <Button variant="outline" fullWidth>Link Subscription</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
