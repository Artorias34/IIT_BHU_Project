import React from 'react';
import { Home, Pill, Building2 } from 'lucide-react';

const SidebarNavigation = ({ activeTab = 'Dashboard' }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Medicine Stock', icon: Pill },
    { name: 'Hospitals', icon: Building2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          IIT-BHU Care
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 text-center">
          <p>Powered by Codecure</p>
          <p className="mt-1 font-medium text-slate-700">v2.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNavigation;
