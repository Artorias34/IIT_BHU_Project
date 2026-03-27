import React from 'react';
import { Search, Menu } from 'lucide-react';

const DashboardHeader = ({ selectedMember, onSwitchProfile, onToggleSidebar }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <div className="flex-1 flex items-center max-w-xl space-x-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
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
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end justify-center">
            <span className="text-sm font-semibold text-slate-700 leading-tight">{selectedMember?.name || 'User'}</span>
            <button 
              onClick={onSwitchProfile}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors mt-0.5"
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
