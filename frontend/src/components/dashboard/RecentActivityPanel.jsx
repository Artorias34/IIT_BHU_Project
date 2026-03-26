import React from 'react';
import { Activity, Pill, UserPlus, FileText } from 'lucide-react';

const RecentActivityPanel = () => {
  // Mock data since the backend doesn't seem to have a dedicated activity collection yet
  // In a real app, this would be fetched from Firestore
  const activities = [
    { id: 1, type: 'add_med', text: 'Paracetamol added to inventory', time: '10 min ago', icon: Pill, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 2, type: 'update_stock', text: 'Stock updated for Amoxicillin', time: '1 hour ago', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 3, type: 'alert', text: 'Low stock alert: Ibuprofen', time: '3 hours ago', icon: AlertTriangleIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 4, type: 'report', text: 'Monthly inventory report generated', time: '1 day ago', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
      </div>
      
      <div className="p-6">
        <div className="relative border-l border-slate-200 ml-3 space-y-6">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="relative pl-6">
                <span className={`absolute -left-[1.1rem] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white ${activity.bg} ${activity.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper for the inline icon until AlertTriangle is extracted if needed
const AlertTriangleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export default RecentActivityPanel;
