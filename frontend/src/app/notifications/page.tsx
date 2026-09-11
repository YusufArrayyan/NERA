"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: CheckCircle,
      title: 'Sesi Belajar Selesai',
      message: 'Kamu telah menyelesaikan sesi fokus 45 menit dengan skor 89%!',
      time: '2 menit yang lalu',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      icon: Info,
      title: 'Level Naik!',
      message: 'Selamat! Kamu naik ke Level 6. Unlock 3 badge baru tersedia.',
      time: '1 jam yang lalu',
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      icon: AlertTriangle,
      title: 'Streak Hampir Hilang',
      message: 'Jangan lupa belajar hari ini untuk menjaga 7 hari streak kamu!',
      time: '3 jam yang lalu',
      read: true,
    },
    {
      id: 4,
      type: 'info',
      icon: Bell,
      title: 'Modul Baru Tersedia',
      message: 'Modul "Advanced Memory Techniques" sudah dapat diakses.',
      time: 'Kemarin',
      read: true,
    },
  ];

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-[#5B7B5A] bg-green-50';
      default: return 'text-[#4B5563] bg-[#F5F3EE]';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB] hover:bg-[#F5F3EE] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#1F2937]">Notifikasi</h1>
          </div>
          <button className="text-sm font-semibold text-[#5B7B5A] hover:underline">
            Tandai Semua Dibaca
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-2xl p-5 border transition-colors ${
                notif.read 
                  ? 'border-[#E5E7EB] opacity-70' 
                  : 'border-[#5B7B5A] shadow-sm'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(notif.type)}`}>
                  <notif.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-[#1F2937]">{notif.title}</h3>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-[#5B7B5A] rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-[#4B5563] mb-2">{notif.message}</p>
                  <p className="text-xs text-[#9CA3AF]">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#4B5563]">Belum ada notifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
}
