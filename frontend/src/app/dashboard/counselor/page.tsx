"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AlertOctagon, Brain, Search, Send, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function CounselorOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat data konseling sekolah...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <h2 className="font-bold text-secondary text-lg">Kasus Perhatian Khusus</h2>
        <div className="flex-1 flex justify-end">
          <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary rounded-3xl p-5 text-primary-foreground flex flex-col justify-center items-center text-center shadow-md">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-4xl font-black">120</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Total Siswa</div>
        </div>
        
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-3xl p-5 flex flex-col justify-center items-center text-center shadow-md">
          <AlertOctagon className="w-8 h-8 mb-2 opacity-80 animate-pulse" />
          <div className="text-4xl font-black">3</div>
          <div className="text-xs font-bold mt-1 uppercase tracking-wide">Stres Kronis (Red Flag)</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-extrabold text-secondary mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-primary" />
          Daftar Siswa Red Flag (3 Hari Terakhir)
        </h3>
        
        <div className="space-y-4">
          {/* Siswa 1 */}
          <div className="bg-card border-2 border-red-200/50 rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-3 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-wider">
              Tindakan Diperlukan
            </div>
            <div className="flex items-center mt-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black mr-3 shrink-0">
                A
              </div>
              <div>
                <h4 className="font-bold text-secondary text-sm">Alya Juwita Putri</h4>
                <p className="text-xs text-muted-foreground font-semibold">Kelas 10A • Terdeteksi hari ini</p>
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="font-bold text-secondary">Rata-rata Stres:</span>
                <span className="font-bold text-red-500">85% (Sangat Tinggi)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-secondary">Gejala Utama:</span>
                <span className="font-medium">Kelelahan kognitif & hilang fokus</span>
              </div>
            </div>

            <button className="w-full bg-primary/10 text-primary font-bold py-2 rounded-xl text-xs hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
              <Send className="w-3 h-3 mr-2" /> Panggil untuk Sesi Konseling
            </button>
          </div>

          {/* Siswa 2 */}
          <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 px-3 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-wider">
              Pemantauan
            </div>
            <div className="flex items-center mt-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black mr-3 shrink-0">
                B
              </div>
              <div>
                <h4 className="font-bold text-secondary text-sm">Budi Santoso</h4>
                <p className="text-xs text-muted-foreground font-semibold">Kelas 10B • Terdeteksi 2 hari lalu</p>
              </div>
            </div>
            
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="font-bold text-secondary">Rata-rata Stres:</span>
                <span className="font-bold text-orange-500">72% (Tinggi)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-secondary">Gejala Utama:</span>
                <span className="font-medium">Sering melamun di sesi siang</span>
              </div>
            </div>

            <button className="w-full bg-background border border-border/50 text-muted-foreground font-bold py-2 rounded-xl text-xs hover:bg-muted transition-colors flex items-center justify-center">
              Kirimkan Modul Mindfulness
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
