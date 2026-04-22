'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  CheckSquare, 
  Files, 
  HardHat, 
  LayoutDashboard, 
  Settings, 
  Users 
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Project Checklists', icon: CheckSquare, href: '/checklists' },
  { label: 'Material Inventory', icon: Files, href: '/inventory' },
  { label: 'Contractors', icon: Users, href: '/contractors' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-white shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <HardHat size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Construction OS</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all group"
          >
            <item.icon size={20} className="group-hover:text-indigo-400" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
            JH
          </div>
          <div>
            <p className="text-sm font-semibold">Jahirul Huq</p>
            <p className="text-xs text-slate-400">Senior Architect</p>
          </div>
        </div>
      </div>
    </div>
  );
}
