'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, BarChart3, User } from 'lucide-react';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      icon: Home,
      label: 'Beranda',
      path: '/dashboard/student',
    },
    {
      icon: BarChart3,
      label: 'Statistik',
      path: '/dashboard/student/stats',
    },
    {
      icon: User,
      label: 'Profil',
      path: '/dashboard/student/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 safe-area-inset-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={idx}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#5B7B5A] text-white' 
                    : 'text-[#4B5563] hover:bg-[#F5F3EE]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : 'text-[#4B5563]'}`} />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
