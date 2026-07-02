"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield, LogOut, ChevronLeft, Award } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-md mx-auto pb-24">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Profil Saya</h2>
        <div className="w-10 h-10"></div> {/* Spacer for center alignment */}
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary border-4 border-white shadow-lg mb-4">
          <span className="text-4xl font-black">{user.name?.charAt(0).toUpperCase()}</span>
        </div>
        <h3 className="text-2xl font-black text-secondary">{user.name}</h3>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Siswa NERA</p>
      </div>

      <div className="organic-card overflow-hidden">
        <div className="p-4 flex items-center border-b border-border/40">
          <Mail className="w-5 h-5 text-muted-foreground mr-4" />
          <div>
            <p className="text-xs font-bold text-muted-foreground">Email</p>
            <p className="text-sm font-semibold text-secondary">{user.email}</p>
          </div>
        </div>
        <div className="p-4 flex items-center border-b border-border/40">
          <Shield className="w-5 h-5 text-muted-foreground mr-4" />
          <div>
            <p className="text-xs font-bold text-muted-foreground">Status Akun</p>
            <p className="text-sm font-semibold text-green-600">Aktif & Terverifikasi</p>
          </div>
        </div>
        <div className="p-4 flex items-center">
          <Award className="w-5 h-5 text-muted-foreground mr-4" />
          <div>
            <p className="text-xs font-bold text-muted-foreground">Level Kognitif</p>
            <p className="text-sm font-semibold text-accent">Level 5 (Advanced Learner)</p>
          </div>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full organic-button-secondary bg-red-50 text-red-600 hover:bg-red-100 mt-6 font-bold"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Keluar Akun
      </button>
    </div>
  );
}
