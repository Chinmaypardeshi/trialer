import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, trend, trendType, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-xl`}>
        <Icon className={colorClass.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trendType === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }`}>
          {trendType === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default StatCard;
