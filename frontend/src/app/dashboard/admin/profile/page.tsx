"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, Shield, LogOut, ChevronLeft, Key, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminProfile() {
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
        <h2 className="font-bold text-secondary text-lg">Administrator Sistem</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-black mb-4 border-4 border-background shadow-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h3 className="font-black text-secondary text-2xl">{user.name}</h3>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full mt-2">
          Root Access
        </span>
      </div>

      <div className="organic-card p-2 space-y-1 mt-6">
        <div className="flex items-center p-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4 text-muted-foreground shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Level Izin</p>
            <p className="font-semibold text-secondary text-sm truncate">Super Admin (Lvl 5)</p>
          </div>
        </div>
        
        <div className="flex items-center p-4 border-t border-border/50">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4 text-muted-foreground shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mode Pemeliharaan</p>
              <p className="font-semibold text-green-600 text-sm flex items-center">Nonaktif</p>
            </div>
            <div className="w-10 h-6 bg-muted rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center p-4 border-t border-border/50">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4 text-muted-foreground shrink-0">
            <Settings2 className="w-5 h-5" />
          </div>
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Konfigurasi API</p>
              <p className="font-semibold text-secondary text-sm">render.com / supabase</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 text-red-600 font-bold p-4 rounded-3xl flex items-center justify-center mt-6 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Keluar dari Akun Root
      </button>
    </div>
  );
}
