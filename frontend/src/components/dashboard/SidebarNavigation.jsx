import React from 'react';
import { Home, Pill, Building2, CalendarDays, FileText, BarChart3, Store } from 'lucide-react';

const SidebarNavigation = ({ activeTab = 'Dashboard', onTabChange }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Medical Reports', icon: FileText },
    { name: 'Insights', icon: BarChart3 },
    { name: 'Medicine Stock', icon: Pill },
    { name: 'Medicine Store', icon: Store },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed top-0 left-0 z-20">

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onTabChange && onTabChange(item.name)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarNavigation;
