"use client";

import { BarChart2, Calendar, Target, Award, ChevronLeft, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ParentReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat laporan anak...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-3xl mx-auto pb-6">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Laporan Belajar Anak</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary rounded-3xl p-5 text-primary-foreground flex flex-col justify-center items-center text-center shadow-md">
          <Calendar className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">12</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Jam Belajar</div>
        </div>
        
        <div className="bg-accent rounded-3xl p-5 text-accent-foreground flex flex-col justify-center items-center text-center shadow-md">
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">2.5K</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">XP Terkumpul</div>
        </div>
      </div>

      <div className="organic-card p-6 mt-6">
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-primary" />
          Tingkat Fokus (Mingguan)
        </h3>
        <div className="h-40 flex items-end justify-between space-x-2 pt-4">
          {[50, 70, 65, 90, 85, 40, 60].map((height, i) => (
            <div key={i} className="w-full bg-primary/20 rounded-t-md relative group flex flex-col justify-end h-full">
              <div 
                className={`w-full rounded-t-md transition-all duration-1000 ${height >= 75 ? 'bg-primary' : height >= 50 ? 'bg-accent' : 'bg-orange-400'}`}
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
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-primary" />
          Analisis Kognitif AI
        </h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 shrink-0"></span>
            <span>Alya paling mudah menyerap materi saat menggunakan metode belajar visual.</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 mr-2 shrink-0"></span>
            <span>Tingkat stres cenderung meningkat setelah belajar 30 menit tanpa henti. Disarankan untuk menggunakan teknik Pomodoro.</span>
          </li>
          <li className="flex items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2 shrink-0"></span>
            <span>Fokus terbaik biasanya tercapai di siang hari (Pukul 14.00 - 16.00).</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
