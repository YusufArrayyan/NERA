"use client";

import { ChevronLeft, BarChart2, Flame, Award, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export default function StudentStats() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi('/gamification/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat statistik gamifikasi...</div>;

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
        <h2 className="font-bold text-secondary text-lg">Statistik Kognitif</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-accent rounded-3xl p-5 text-accent-foreground flex flex-col justify-center items-center text-center shadow-md">
          <Flame className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">{stats?.streak || 0}</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Hari Streak</div>
        </div>
        
        <div className="bg-primary rounded-3xl p-5 text-primary-foreground flex flex-col justify-center items-center text-center shadow-md">
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">{stats?.level || 1}</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Level</div>
        </div>
      </div>

      <div className="organic-card p-6 mt-6">
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Perolehan XP (Experience Points)
        </h3>
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-black text-secondary">{stats?.xp || 0} <span className="text-sm font-bold text-muted-foreground">XP</span></span>
          <span className="text-xs font-bold text-accent">Level Selanjutnya: 1000 XP</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 mb-1">
          <div className="bg-accent h-3 rounded-full" style={{ width: `${((stats?.xp || 0) % 1000) / 10}%` }}></div>
        </div>
      </div>

      <div className="organic-card p-6 mt-4">
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-primary" />
          Histori Fokus Bulanan
        </h3>
        <div className="h-40 flex items-end justify-between space-x-2 pt-4">
          {/* Mock Graph Bars */}
          {[40, 60, 45, 80, 75, 90, 85].map((height, i) => (
            <div key={i} className="w-full bg-primary/20 rounded-t-md relative group">
              <div 
                className={`absolute bottom-0 w-full rounded-t-md transition-all duration-1000 ${height >= 70 ? 'bg-primary' : height >= 50 ? 'bg-accent' : 'bg-red-400'}`}
                style={{ height: `${height}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase">
          <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
        </div>
      </div>
    </div>
  );
}
