import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Trophy, Users } from 'lucide-react';
import Button from '../components/common/Button';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-forest-700 text-white pb-24 pt-32 px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-700 via-forest-600 to-forest-500 opacity-90" />
          {/* Subtle background pattern */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', 
            backgroundSize: '40px 40px' 
          }} />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div variants={childVariants} className="inline-block relative">
            <span className="bg-gold-500 text-forest-700 text-sm font-bold tracking-wide uppercase px-4 py-1.5 rounded-full shadow-sm mb-6 inline-block">
              Meaningful Impact
            </span>
          </motion.div>
          
          <motion.h1 variants={childVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Impact <span className="text-gold-500">Every Swing</span>
          </motion.h1>
          
          <motion.p variants={childVariants} className="text-xl md:text-2xl text-forest-100 max-w-2xl mx-auto font-light leading-relaxed">
            Join the premium charity platform where your golf scores turn into monthly prizes and global change.
          </motion.p>
          
          <motion.div variants={childVariants} className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subscribe">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">Subscribe Now</Button>
            </Link>
            <Link to="/charities">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-forest-100 text-forest-100 hover:bg-forest-600 hover:text-white">View Charities</Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-forest-700 tracking-tight">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Three simple steps to compete, win, and make a difference.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 bg-forest-50 rounded-3xl border border-forest-100 text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-forest-200">
                <Users className="text-forest-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-forest-700 mb-3">1. Subscribe & Select</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Sign up for a monthly or yearly plan and select the charity you wish to support. A portion of your fee goes directly to them.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 bg-forest-50 rounded-3xl border border-forest-100 text-center relative"
            >
              <div className="absolute -top-4 -right-4 bg-gold-500 text-forest-700 font-bold text-xs px-3 py-1 rounded-full transform rotate-12 shadow-md">
                Up to 5 scores!
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-forest-200">
                <Trophy className="text-forest-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-forest-700 mb-3">2. Enter Scores</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Play golf and record your scores (1–45). Only your 5 most recent scores are kept active for the monthly draw.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8 }}
              className="p-8 bg-forest-50 rounded-3xl border border-forest-100 text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-forest-200">
                <Heart className="text-forest-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-forest-700 mb-3">3. Win & Impact</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Match your scores in the algorithmic monthly draw to win from the prize pool, all while knowing your charity is receiving vital funds.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prize Explainer Banner */}
      <section className="py-20 bg-forest-50 border-t border-forest-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center bg-white p-12 rounded-3xl shadow-xl shadow-forest-900/5">
          <h2 className="text-3xl font-extrabold text-forest-700 tracking-tight mb-6">The Prize Pool</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The prize pool is continually funded by active subscriptions. Prizes are split into three tiers based on how many of your 5 active scores match the draw numbers.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-forest-600 text-white rounded-2xl flex flex-col justify-center">
              <span className="text-2xl font-black text-gold-500 mb-1">5</span>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Matches</span>
              <span className="mt-3 font-bold text-xl">40%</span>
              <span className="text-[10px] opacity-75">+ Jackpot</span>
            </div>
            <div className="p-4 bg-forest-50 border border-forest-100 text-forest-700 rounded-2xl flex flex-col justify-center">
              <span className="text-2xl font-black mb-1">4</span>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Matches</span>
              <span className="mt-3 font-bold text-xl text-forest-600">35%</span>
            </div>
            <div className="p-4 bg-forest-50 border border-forest-100 text-forest-700 rounded-2xl flex flex-col justify-center">
              <span className="text-2xl font-black mb-1">3</span>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-70">Matches</span>
              <span className="mt-3 font-bold text-xl text-forest-600">25%</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium">*If there is no 5-match winner, the 40% rolls over to the next month's jackpot.</p>
        </div>
      </section>
    </div>
  );
}
