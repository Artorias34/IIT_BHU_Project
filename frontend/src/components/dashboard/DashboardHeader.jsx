import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';

const DashboardHeader = ({ selectedMember, onSwitchProfile }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div className="flex-1 flex items-center max-w-xl">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines, hospitals..."
            className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6 ml-8">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">{selectedMember?.name || 'User'}</p>
            <button 
              onClick={onSwitchProfile}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Switch Profile
            </button>
          </div>
          
          {selectedMember?.avatar === "neutral-placeholder" || !selectedMember?.avatar ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-200">
              {selectedMember?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          ) : (
             <img src={selectedMember?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
