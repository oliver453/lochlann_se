// src/app/studio/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, CalendarDays, Table2, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/studio/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50"
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 border-r bg-background flex flex-col transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl  text-black font-bold">Lochlann Studio</h1>
          <p className="text-sm text-muted-foreground mt-1">Bokningssystem</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink 
            href="/studio" 
            icon={<Home className="h-4 w-4" />}
            active={pathname === '/studio'}
            onClick={() => setSidebarOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink 
            href="/studio/bookings" 
            icon={<CalendarDays className="h-4 w-4" />}
            active={pathname === '/studio/bookings'}
            onClick={() => setSidebarOpen(false)}
          >
            Bokningar
          </NavLink>
          <NavLink 
            href="/studio/tables" 
            icon={<Table2 className="h-4 w-4" />}
            active={pathname === '/studio/tables'}
            onClick={() => setSidebarOpen(false)}
          >
            Bordskarta
          </NavLink>
          <NavLink 
            href="/studio/settings" 
            icon={<Settings className="h-4 w-4" />}
            active={pathname === '/studio/settings'}
            onClick={() => setSidebarOpen(false)}
          >
            Inställningar
          </NavLink>
        </nav>

        <Separator />

        <div className="p-4">
          <form action="/api/admin/logout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logga ut
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children, 
  active, 
  onClick 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}