import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';

const LowStockAlerts = ({ medicines }) => {
  const lowStockMeds = medicines.filter(med => med.stock < 10 && med.stock > 0);
  const criticalMeds = medicines.filter(med => med.stock === 0);
  
  const alerts = [...criticalMeds, ...lowStockMeds].slice(0, 5); // Show top 5 urgent

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-800">Stock Alerts</h3>
        {alerts.length > 0 && (
          <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>
      
      <div className="p-2 flex-1 flex flex-col h-full overscroll-y-auto">
        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 font-medium">All stock levels are optimal</p>
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {alerts.map((med, index) => (
              <li key={med.id || index} className="p-3 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{med.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {med.stock === 0 ? (
                      <span className="text-red-500 font-medium">Critical: Out of stock</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Only {med.stock} left</span>
                    )}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LowStockAlerts;
