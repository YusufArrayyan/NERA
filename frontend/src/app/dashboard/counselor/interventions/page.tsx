"use client";

import { CheckCircle, Clock, Send, ChevronLeft, HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CounselorInterventions() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return <div className="animate-pulse p-4">Memuat data intervensi...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Riwayat Intervensi</h2>
        <div className="w-10 h-10"></div>
      </div>

      <div className="bg-primary/10 rounded-3xl p-6 text-center shadow-sm border border-primary/20">
        <HeartPulse className="w-10 h-10 mx-auto text-primary mb-3" />
        <h3 className="font-extrabold text-secondary text-xl mb-1">24 Siswa Terbantu</h3>
        <p className="text-sm text-muted-foreground font-medium">Bulan ini melalui intervensi langsung & modul mindfulness.</p>
      </div>

      <div className="mt-8 space-y-4">
        {/* Log 1 */}
        <div className="flex items-start">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200 z-10 relative">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="absolute w-px h-16 bg-border top-10 left-1/2 -translate-x-1/2 -z-10"></div>
          </div>
          <div className="ml-4 bg-card border border-border/50 rounded-2xl p-4 flex-1 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-secondary text-sm">Sesi Konseling Selesai</h4>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hari Ini, 10:00</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Bersama <span className="font-bold text-secondary">Alya Juwita Putri</span> (Kelas 10A)</p>
            <div className="bg-muted rounded-xl p-3 text-xs text-muted-foreground italic">
              "Siswa mengeluhkan kelelahan karena jadwal ekstrakurikuler yang padat. Telah diberikan jadwal istirahat yang lebih baik."
            </div>
          </div>
        </div>

        {/* Log 2 */}
        <div className="flex items-start mt-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0 border border-accent z-10 relative">
            <Send className="w-4 h-4 text-accent" />
            <div className="absolute w-px h-16 bg-border top-10 left-1/2 -translate-x-1/2 -z-10"></div>
          </div>
          <div className="ml-4 bg-card border border-border/50 rounded-2xl p-4 flex-1 shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-secondary text-sm">Modul Mindfulness Dikirim</h4>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kemarin, 14:30</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-2">Kepada <span className="font-bold text-secondary">Budi Santoso</span> (Kelas 10B)</p>
            <div className="bg-accent/10 rounded-xl px-3 py-2 text-xs font-bold text-accent flex items-center">
              <span className="w-2 h-2 rounded-full bg-accent mr-2"></span> Modul Latihan Pernapasan (5 Menit)
            </div>
          </div>
        </div>

        {/* Log 3 */}
        <div className="flex items-start mt-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200 z-10 relative">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="ml-4 bg-card border border-border/50 rounded-2xl p-4 flex-1 shadow-sm opacity-60">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-secondary text-sm">Menunggu Konfirmasi Jadwal</h4>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">3 Hari Lalu</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Panggilan konseling kepada <span className="font-bold text-secondary">Caca Marica</span> (Kelas 11A) belum dikonfirmasi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
