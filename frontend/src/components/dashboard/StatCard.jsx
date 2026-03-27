import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, highlightClass }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${highlightClass}`}></div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
        </div>
        
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110 duration-300`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
