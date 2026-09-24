import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Plus, Settings } from 'lucide-react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ApplicationFormModal } from '../applications/ApplicationFormModal';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const mobileNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet context={{ openAddModal: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors p-1.5 rounded-lg',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
        {/* Mobile Quick Add Floating/Action Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 p-1.5"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add</span>
        </button>
      </div>

      {/* Add Application Modal */}
      <ApplicationFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
