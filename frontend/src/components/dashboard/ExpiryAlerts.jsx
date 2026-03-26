import React from 'react';
import { AlertTriangle, Clock, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

const ExpiryAlerts = ({ medicines }) => {
  const today = new Date();

  const categorized = medicines.reduce((acc, med) => {
    if (!med.expiryDate) return acc;
    
    const expiry = med.expiryDate.toDate ? med.expiryDate.toDate() : new Date(med.expiryDate);
    const daysLeft = differenceInDays(expiry, today);

    if (daysLeft < 0) {
      acc.expired.push({ ...med, daysLeft, expiry });
    } else if (daysLeft <= 30) {
      acc.expiringSoon.push({ ...med, daysLeft, expiry });
    } else {
      acc.safe.push({ ...med, daysLeft, expiry });
    }
    return acc;
  }, { expired: [], expiringSoon: [], safe: [] });

  const alerts = [...categorized.expired, ...categorized.expiringSoon];

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-800">Expiry Status</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-sm text-slate-500 font-medium">All medicines are within safe expiry range</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Expiry Alerts</h3>
        </div>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
          {alerts.length}
        </span>
      </div>

      <div className="p-4 space-y-2">
        {alerts.map((med, index) => {
          const isExpired = med.daysLeft < 0;
          return (
            <div
              key={med.id || index}
              className={`p-3 rounded-xl border transition-colors ${
                isExpired 
                  ? 'bg-red-50/50 border-red-100 hover:bg-red-50' 
                  : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isExpired ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {isExpired 
                      ? <ShieldX className="w-4 h-4 text-red-600" />
                      : <Clock className="w-4 h-4 text-amber-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{med.name}</p>
                    <p className={`text-xs font-medium ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>
                      {isExpired 
                        ? `Expired ${Math.abs(med.daysLeft)} days ago`
                        : `Expires in ${med.daysLeft} days`
                      }
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isExpired 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {isExpired ? 'EXPIRED' : 'EXPIRING'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpiryAlerts;
