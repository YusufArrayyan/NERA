"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, User, Bell, Lock, Palette, Globe, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const settingsSections = [
    {
      title: "Akun",
      items: [
        { icon: User, label: "Informasi Profil", action: () => router.push('/dashboard/student/profile') },
        { icon: Lock, label: "Keamanan & Privasi", action: () => {} },
      ]
    },
    {
      title: "Preferensi",
      items: [
        { icon: Bell, label: "Notifikasi", action: () => router.push('/notifications') },
        { icon: Palette, label: "Tampilan", action: () => {} },
        { icon: Globe, label: "Bahasa", action: () => {} },
      ]
    },
    {
      title: "Bantuan",
      items: [
        { icon: HelpCircle, label: "Pusat Bantuan", action: () => {} },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB] hover:bg-[#F5F3EE] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-[#1F2937]">Pengaturan</h1>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB]">
              <div className="px-6 py-3 bg-[#F5F3EE] border-b border-[#E5E7EB]">
                <h2 className="text-sm font-bold text-[#4B5563] uppercase">{section.title}</h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={item.action}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F5F3EE] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-[#5B7B5A]" />
                      <span className="text-sm font-medium text-[#1F2937]">{item.label}</span>
                    </div>
                    <span className="material-icons text-[#9CA3AF]">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full mt-8 bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors"
        >
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
