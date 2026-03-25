import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSkeleton({ type = 'card' }) {
  const shimmers = {
    card: (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full h-full flex flex-col gap-4">
        <div className="w-full h-48 bg-gray-200 animate-pulse rounded-xl" />
        <div className="w-3/4 h-6 bg-gray-200 animate-pulse rounded-full mt-2" />
        <div className="w-full h-4 bg-gray-200 animate-pulse rounded-full" />
        <div className="w-5/6 h-4 bg-gray-200 animate-pulse rounded-full" />
        <div className="mt-auto w-1/3 border bg-gray-200 animate-pulse rounded-full h-10" />
      </div>
    ),
    text: (
      <div className="space-y-3 w-full">
        <div className="w-full h-4 bg-gray-200 animate-pulse rounded-full" />
        <div className="w-5/6 h-4 bg-gray-200 animate-pulse rounded-full" />
        <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded-full" />
      </div>
    ),
    chart: (
      <div className="w-full h-64 bg-gray-100 animate-pulse rounded-2xl border border-gray-100" />
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {shimmers[type]}
    </motion.div>
  );
}
