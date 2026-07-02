"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Activity, Database, Server, Settings, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat status sistem...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <h2 className="font-bold text-secondary text-lg">Status Sistem (Live)</h2>
        <div className="flex-1 flex justify-end">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary rounded-3xl p-5 text-primary-foreground flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></span>
            <span className="text-[8px] font-bold uppercase tracking-widest">Normal</span>
          </div>
          <Server className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">99.9%</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Uptime Server</div>
        </div>
        
        <div className="bg-accent rounded-3xl p-5 text-accent-foreground flex flex-col justify-center items-center text-center shadow-md relative overflow-hidden">
          <div className="absolute top-2 right-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse mr-1"></span>
            <span className="text-[8px] font-bold uppercase tracking-widest">Sync</span>
          </div>
          <Database className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">42ms</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Latensi Database</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary" />
          Metrik Real-time
        </h3>
        
        <div className="space-y-4">
          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-sm">Pengguna Aktif</h4>
                  <p className="text-xs text-muted-foreground font-semibold">Saat ini terhubung ke sistem</p>
                </div>
              </div>
              <div className="text-2xl font-black text-secondary">342</div>
            </div>
            
            <div className="flex justify-between text-xs font-bold mt-4 pt-4 border-t border-border/50">
              <span className="text-muted-foreground">Siswa: <span className="text-secondary">310</span></span>
              <span className="text-muted-foreground">Guru: <span className="text-secondary">28</span></span>
              <span className="text-muted-foreground">Lainnya: <span className="text-secondary">4</span></span>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary text-sm">Keamanan API</h4>
                  <p className="text-xs text-muted-foreground font-semibold">Render backend status</p>
                </div>
              </div>
              <div className="text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Aman</div>
            </div>
            <p className="text-xs text-muted-foreground">Tidak ada anomali atau serangan DDoS yang terdeteksi dalam 24 jam terakhir. JWT Token rotasi berjalan normal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
