"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { ShieldCheck, Activity, Users, Server, Bell, Settings, ActivitySquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>({ users: 0, activeSessions: 0, serverUptime: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would hit an admin-only endpoint
    // For MVP, we simulate loading global stats
    setTimeout(() => {
      setStats({
        users: 142,
        activeSessions: 12,
        serverUptime: "99.9%",
        wsStatus: "CONNECTED"
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat sistem metrik...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-4xl mx-auto pb-6">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={() => alert("Tidak ada notifikasi sistem.")}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Admin System</h2>
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-secondary rounded-[32px] p-8 text-secondary-foreground relative overflow-hidden shadow-lg">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center mb-6">
          <ShieldCheck className="w-8 h-8 text-primary mr-3" />
          <h3 className="text-xl font-bold">Platform Status: ALL SYSTEMS OPERATIONAL</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="organic-card p-5 flex flex-col justify-center items-center text-center">
          <Users className="w-8 h-8 text-secondary mb-2 opacity-60" />
          <div className="text-3xl font-black text-secondary">{stats.users}</div>
          <div className="text-xs font-bold text-muted-foreground mt-1">TOTAL PENGGUNA</div>
        </div>

        <div className="organic-card p-5 flex flex-col justify-center items-center text-center">
          <ActivitySquare className="w-8 h-8 text-accent mb-2 opacity-60" />
          <div className="text-3xl font-black text-secondary">{stats.activeSessions}</div>
          <div className="text-xs font-bold text-muted-foreground mt-1">SESI AKTIF</div>
        </div>

        <div className="organic-card p-5 flex flex-col justify-center items-center text-center">
          <Server className="w-8 h-8 text-blue-500 mb-2 opacity-60" />
          <div className="text-3xl font-black text-secondary">{stats.serverUptime}</div>
          <div className="text-xs font-bold text-muted-foreground mt-1">UPTIME</div>
        </div>

        <div className="organic-card p-5 flex flex-col justify-center items-center text-center bg-primary/5">
          <Activity className="w-8 h-8 text-primary mb-2" />
          <div className="text-lg font-black text-primary uppercase">{stats.wsStatus}</div>
          <div className="text-xs font-bold text-primary/70 mt-1">WEBSOCKET (10Hz)</div>
        </div>
      </div>
      
      <div className="mt-8 organic-card p-6">
        <h3 className="font-bold text-secondary text-lg mb-4">Pengaturan Server</h3>
        <p className="text-sm text-muted-foreground mb-4 font-medium">Hanya akun Administrator yang dapat mengakses konfigurasi inti Node.js dan model klasifikasi AI (K-Means/Neural Network).</p>
        
        <div className="space-y-3">
          <button className="w-full organic-button-primary bg-secondary">
            Manajemen Basis Data (Prisma)
          </button>
          <button className="w-full organic-button-secondary bg-muted text-secondary hover:bg-muted/80">
            Log Sistem
          </button>
        </div>
      </div>
    </div>
  );
}
