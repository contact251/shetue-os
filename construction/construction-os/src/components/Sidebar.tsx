import React, { Suspense, lazy } from 'react';
import { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';

// Icon mapping with lazy loading for better performance and maintainability
const ICON_MAP = {
  dashboard: lazy(() => import('lucide-react').then(mod => ({ default: mod.LayoutDashboard }))),
  projects: lazy(() => import('lucide-react').then(mod => ({ default: mod.Briefcase }))),
  checklist: lazy(() => import('lucide-react').then(mod => ({ default: mod.Zap }))),
  inventory: lazy(() => import('lucide-react').then(mod => ({ default: mod.Package }))),
  labor: lazy(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
  photos: lazy(() => import('lucide-react').then(mod => ({ default: mod.Camera }))),
  contractors: lazy(() => import('lucide-react').then(mod => ({ default: mod.HardHat }))),
  payments: lazy(() => import('lucide-react').then(mod => ({ default: mod.DollarSign }))),
  payroll: lazy(() => import('lucide-react').then(mod => ({ default: mod.Wallet }))),
  settings: lazy(() => import('lucide-react').then(mod => ({ default: mod.Settings }))),
  logout: lazy(() => import('lucide-react').then(mod => ({ default: mod.LogOut }))),
  chevronLeft: lazy(() => import('lucide-react').then(mod => ({ default: mod.ChevronLeft }))),
  chevronRight: lazy(() => import('lucide-react').then(mod => ({ default: mod.ChevronRight }))),
} as const;

type IconName = keyof typeof ICON_MAP;

const SidebarIcon = ({ name, ...props }: { name: IconName } & any) => {
  const IconComponent = ICON_MAP[name];
  return (
    <Suspense fallback={<div className={cn("w-5 h-5 animate-pulse bg-zinc-800 rounded-full", props.className)} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const menuItems: { id: string; label: string; icon: IconName }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'checklist', label: 'Electrical Checklist', icon: 'checklist' },
    { id: 'inventory', label: 'Material Inventory', icon: 'inventory' },
    { id: 'labor', label: 'Labor Log (Hazira)', icon: 'labor' },
    { id: 'photos', label: 'Site Photos', icon: 'photos' },
    { id: 'contractors', label: 'Contractors', icon: 'contractors' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'payroll', label: 'Payroll', icon: 'payroll' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50 px-2 py-1 flex justify-around items-center">
        {menuItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
              activeTab === item.id ? "text-orange-500" : "text-zinc-500"
            )}
          >
            <SidebarIcon name={item.icon} className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 p-2 text-zinc-500"
        >
          <SidebarIcon name="logout" className="w-5 h-5" />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex h-screen bg-zinc-950 text-zinc-400 border-r border-zinc-800 transition-all duration-300 flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <SidebarIcon name="contractors" className="w-6 h-6 text-black" />
              </div>
              <span>Const OS</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-zinc-800 hover:text-white"
          >
            <SidebarIcon name={collapsed ? "chevronRight" : "chevronLeft"} />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  activeTab === item.id 
                    ? "bg-orange-500/10 text-orange-500" 
                    : "hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <SidebarIcon 
                  name={item.icon} 
                  className={cn(
                    "w-5 h-5",
                    activeTab === item.id ? "text-orange-500" : "group-hover:text-zinc-100"
                  )} 
                />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          {!collapsed && (
            <div className="bg-zinc-900 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-black font-bold text-xs">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">User</p>
                <p className="text-xs text-zinc-500 truncate">Project Manager</p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10",
              collapsed ? "justify-center px-0" : "px-3 justify-start"
            )}
          >
            <SidebarIcon name="logout" className="w-5 h-5" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
