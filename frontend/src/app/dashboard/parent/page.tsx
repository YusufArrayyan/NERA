"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { Brain, FileText, HeartPulse, Bell, Settings, Award, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ParentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi('/users/my-children');
        setChildren(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat data anak...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-3xl mx-auto pb-6">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={() => alert("Tidak ada notifikasi untuk Anda hari ini.")}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Portal Orang Tua</h2>
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Intro Card */}
      <div className="bg-primary rounded-[32px] p-8 text-primary-foreground relative overflow-hidden shadow-lg">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h3 className="font-semibold text-primary-foreground/90 mb-1">Anak Terdaftar</h3>
          <div className="text-5xl font-black tracking-tighter mb-2">{children.length}</div>
          <p className="text-sm opacity-90 font-medium">Pantau perkembangan kognitif dan saran belajar AI untuk anak Anda.</p>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="organic-card p-8 text-center">
          <p className="text-muted-foreground font-medium">Belum ada akun anak yang terhubung dengan akun Anda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map((child) => (
            <div key={child.id} className="organic-card overflow-hidden border-2 border-border/50">
              
              {/* Child Header Profile */}
              <div className="p-5 bg-background flex justify-between items-center border-b border-border/40">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center mr-4 shadow-sm border-2 border-white">
                    <span className="text-2xl font-black">{child.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-secondary">{child.name}</h2>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Level {child.gamification?.level || 1}</span>
                      <span className="text-xs font-bold text-accent">🔥 {child.gamification?.streak || 0} Hari</span>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total XP</div>
                  <div className="text-2xl font-black text-secondary flex items-center justify-end">
                    {child.gamification?.xp || 0} <Award className="w-5 h-5 ml-1 text-accent" />
                  </div>
                </div>
              </div>

              {/* Data Section */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-card">
                
                {/* AI Insights Card */}
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <h3 className="font-bold text-secondary flex items-center mb-3">
                    <Brain className="w-5 h-5 mr-2 text-primary" />
                    Analisis Kognitif AI
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary/80 font-medium mb-4">
                    {child.name} menunjukkan retensi terbaik saat menggunakan materi <strong>{child.sessions?.[0]?.learningMode === 'VISUAL' ? 'Visual' : child.sessions?.[0]?.learningMode === 'AUDITORY' ? 'Auditori' : 'Kinestetik'}</strong>. Gelombang Beta (fokus) memuncak pada 15 menit pertama.
                  </p>
                  <div className="flex items-start bg-white p-3 rounded-xl border border-border/40 shadow-sm">
                    <FileText className="w-5 h-5 mr-2 mt-0.5 text-accent shrink-0" />
                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                      Saran AI: Batasi sesi belajar menjadi blok 20 menit dengan istirahat 5 menit untuk menjaga rasio fokus tetap optimal.
                    </p>
                  </div>
                </div>

                {/* Recent Sessions List */}
                <div>
                  <h3 className="font-bold text-secondary flex items-center mb-3">
                    <Clock className="w-5 h-5 mr-2 text-accent" />
                    Riwayat Belajar Terakhir
                  </h3>
                  <div className="space-y-2">
                    {child.sessions && child.sessions.length > 0 ? (
                      child.sessions.slice(0, 3).map((sess: any) => (
                        <div key={sess.id} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border/50 hover:bg-muted/30 transition-colors">
                          <div>
                            <p className="text-sm font-bold text-secondary">{new Date(sess.startTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                            <p className="text-xs text-muted-foreground font-medium">{Math.round(sess.duration / 60)} menit • {sess.learningMode}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black ${sess.avgFocus >= 70 ? 'text-primary' : sess.avgFocus >= 40 ? 'text-accent' : 'text-red-500'}`}>
                              {sess.avgFocus}%
                            </p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Fokus</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 bg-background rounded-xl border border-border/50 border-dashed text-muted-foreground text-sm font-medium">
                        Belum ada sesi belajar
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
