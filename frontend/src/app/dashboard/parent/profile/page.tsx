"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, Bell, LogOut, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ParentProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Profil Orang Tua</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-black mb-4 border-4 border-background shadow-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-black text-secondary text-2xl">{user.name}</h3>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full mt-2">
          {user.role}
        </span>
      </div>

      <div className="organic-card p-2 space-y-1 mt-6">
        <div className="flex items-center p-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4 text-muted-foreground shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</p>
            <p className="font-semibold text-secondary text-sm truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border-t border-border/50">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4 text-muted-foreground shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keamanan</p>
            <p className="font-semibold text-green-600 text-sm flex items-center">Terverifikasi</p>
          </div>
        </div>

        <div className="flex items-center p-4 border-t border-border/50">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4 text-muted-foreground shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Laporan Mingguan</p>
              <p className="font-semibold text-secondary text-sm">Dikirim via Email</p>
            </div>
            <div className="w-10 h-6 bg-primary rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-3xl flex items-center justify-center mt-6 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Keluar dari Akun
      </button>
    </div>
  );
}
