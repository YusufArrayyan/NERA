"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { HeartHandshake, ShieldAlert, CheckCircle2, Bell, Settings, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CounselorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi('/interventions');
        setInterventions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingInterventions = interventions.filter(i => i.status === 'PENDING' || i.status === 'IN_PROGRESS');
  const completedInterventions = interventions.filter(i => i.status === 'RESOLVED');

  if (loading) return <div className="animate-pulse p-4">Memuat data konseling...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-3xl mx-auto pb-6">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={() => alert("Tidak ada notifikasi.")}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Portal Konselor</h2>
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Intro Card */}
      <div className="bg-accent rounded-[32px] p-8 text-accent-foreground relative overflow-hidden shadow-lg">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-accent-foreground/90 mb-1">Kasus Membutuhkan Perhatian</h3>
            <div className="text-5xl font-black tracking-tighter mb-2">{pendingInterventions.length}</div>
          </div>
          <HeartHandshake className="w-16 h-16 opacity-80" />
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-extrabold text-secondary text-lg mb-4 ml-1">Daftar Intervensi Aktif</h3>

        {pendingInterventions.length === 0 ? (
          <div className="organic-card p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-primary opacity-50 mb-3" />
            <p className="text-secondary font-bold">Semua Aman!</p>
            <p className="text-muted-foreground text-sm font-medium mt-1">Tidak ada siswa yang membutuhkan intervensi saat ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingInterventions.map((intervention) => (
              <div key={intervention.id} className="organic-card p-5 border-l-4 border-l-red-400 border-t border-r border-b border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Prioritas {intervention.priority}</span>
                      <span className="text-[10px] text-muted-foreground">• {new Date(intervention.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-extrabold text-secondary">{intervention.title}</h4>
                    <p className="text-sm text-secondary/80 font-medium mt-1">{intervention.notes}</p>
                    
                    <div className="mt-3 bg-muted/50 p-2 rounded-lg inline-block">
                      <span className="text-xs text-muted-foreground font-semibold">Tujuan: </span>
                      <span className="text-xs font-bold text-secondary">{intervention.toUserId}</span>
                    </div>
                  </div>
                  
                  <button className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors p-3 rounded-full flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {completedInterventions.length > 0 && (
        <div className="pt-4">
          <h3 className="font-bold text-secondary text-base mb-3 ml-1">Riwayat Selesai</h3>
          <div className="space-y-2 opacity-70">
            {completedInterventions.slice(0,3).map((intervention) => (
              <div key={intervention.id} className="bg-card border border-border/40 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-secondary text-sm">{intervention.title}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(intervention.createdAt).toLocaleDateString()}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
