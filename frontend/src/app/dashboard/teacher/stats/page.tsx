"use client";

import { BarChart2, TrendingUp, Users, Target, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export default function TeacherStats() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Simulasi memuat data analitik kelas
    setTimeout(() => {
      setStats({
        avgFocusWeek: 78,
        avgStressWeek: 25,
        interventionsSent: 12,
        mostEffectiveMode: "Visual",
        focusImprovement: 15
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat analitik kelas...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-3xl mx-auto pb-6">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Analitik Kelas</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary rounded-3xl p-5 text-primary-foreground flex flex-col justify-center items-center text-center shadow-md">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">+{stats.focusImprovement}%</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Peningkatan Fokus</div>
        </div>
        
        <div className="bg-accent rounded-3xl p-5 text-accent-foreground flex flex-col justify-center items-center text-center shadow-md">
          <Target className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">{stats.interventionsSent}</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Intervensi Terkirim</div>
        </div>
      </div>

      <div className="organic-card p-6 mt-6">
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-primary" />
          Tren Fokus Kelas Mingguan
        </h3>
        <div className="h-40 flex items-end justify-between space-x-2 pt-4">
          {/* Mock Graph Bars */}
          {[60, 65, 55, 75, 78, 85, 82].map((height, i) => (
            <div key={i} className="w-full bg-primary/20 rounded-t-md relative group flex flex-col justify-end h-full">
              <div 
                className={`w-full rounded-t-md transition-all duration-1000 ${height >= 75 ? 'bg-primary' : height >= 60 ? 'bg-accent' : 'bg-orange-400'}`}
                style={{ height: `${height}%` }}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground uppercase">
          <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
        <h3 className="font-extrabold text-secondary mb-3">Rekomendasi Sistem</h3>
        <p className="text-sm text-muted-foreground">
          Berdasarkan data minggu ini, metode pembelajaran <span className="font-bold text-primary">{stats.mostEffectiveMode}</span> terbukti paling efektif dalam menjaga fokus kelas. Rata-rata tingkat stres siswa berada di angka <span className="font-bold text-green-500">{stats.avgStressWeek}% (Aman)</span>.
        </p>
      </div>
    </div>
  );
}
