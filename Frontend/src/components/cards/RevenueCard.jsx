import React from 'react';

const RevenueCard = ({ period, amount, orders }) => (
  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{period}</span>
    <p className="text-xl font-bold text-slate-800 mt-1">₹{amount}</p>
    <p className="text-xs text-slate-500 mt-1">{orders} Orders</p>
  </div>
);

export default RevenueCard;
