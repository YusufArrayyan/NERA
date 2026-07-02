"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Home, BarChart2, User, Leaf } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const roleNavigation = {
    STUDENT: [
      { name: "Beranda", href: "/dashboard/student", icon: Home },
      { name: "Statistik", href: "/dashboard/student/stats", icon: BarChart2 },
      { name: "Profil", href: "/dashboard/student/profile", icon: User },
    ],
    TEACHER: [
      { name: "Kelas", href: "/dashboard/teacher", icon: Home },
    ],
    PARENT: [
      { name: "Anak", href: "/dashboard/parent", icon: Home },
    ],
    COUNSELOR: [
      { name: "Overview", href: "/dashboard/counselor", icon: Home },
    ],
    ADMIN: [
      { name: "System", href: "/dashboard/admin", icon: Home },
    ],
  };

  const navItems = roleNavigation[user.role] || [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      
      {/* Top Header */}
      <header className="h-16 flex items-center px-6 bg-card border-b border-border/40 z-10 shrink-0 shadow-sm">
        {/* Left: Logo */}
        <div className="flex items-center sm:w-48 shrink-0">
          <Leaf className="w-6 h-6 text-primary mr-2" />
          <span className="font-extrabold tracking-tight text-secondary text-xl">NERA</span>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden sm:flex items-center justify-center flex-1">
          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors text-sm ${
                    isActive ? "bg-primary text-primary-foreground font-bold shadow-sm" : "text-muted-foreground hover:bg-muted font-semibold"
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'opacity-90' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Profile & Logout */}
        <div className="flex items-center justify-end flex-1 sm:flex-none space-x-4 ml-auto shrink-0">
          <div className="hidden lg:flex items-center space-x-2 mr-2 whitespace-nowrap">
            <span className="text-sm font-bold text-secondary">{user.name}</span>
            <span className="text-[10px] uppercase tracking-wider bg-muted px-2 py-1 rounded-full text-muted-foreground font-bold">{user.role}</span>
          </div>
          <button 
            onClick={logout}
            title="Keluar"
            className="p-2 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors bg-background border border-border/50 shadow-sm shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
        <div className="max-w-md sm:max-w-5xl mx-auto pb-20 sm:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(74,55,40,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center p-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full ${isActive ? 'bg-primary/10' : ''}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} />
              </div>
              <span className="text-[10px] font-bold mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
