"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { Users, TrendingUp, AlertTriangle, Send, Bell, Settings, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [classData, setClassData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntervention, setShowIntervention] = useState<string | null>(null);
  const [interventionNote, setInterventionNote] = useState("");

  useEffect(() => {
    const loadClassData = async () => {
      try {
        const data = await fetchApi('/analytics/class');
        setClassData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadClassData();
  }, []);

  const handleSendIntervention = async (studentId: string) => {
    try {
      await fetchApi('/interventions', {
        method: 'POST',
        body: JSON.stringify({
          toUserId: studentId,
          type: 'COGNITIVE_NUDGE',
          title: 'Saran Guru',
          notes: interventionNote,
          priority: 'MEDIUM'
        })
      });
      setShowIntervention(null);
      setInterventionNote("");
      alert("Intervensi berhasil dikirim ke siswa!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="animate-pulse p-4">Memuat data kelas...</div>;

  const avgFocus = classData.length ? Math.round(classData.reduce((a, b) => a + b.avgFocus, 0) / classData.length) : 0;
  const needsAttention = classData.filter(s => s.avgFocus < 50).length;

  return (
    <div className="space-y-6 max-w-md md:max-w-3xl mx-auto pb-6">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center mb-2">
        <button 
          onClick={() => alert("Tidak ada notifikasi")}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-secondary text-lg">Beranda Guru</h2>
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stats Card (Secondary Color) */}
      <div className="bg-secondary rounded-[32px] p-8 text-secondary-foreground relative overflow-hidden shadow-lg">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-end relative z-10">
          <div>
            <h3 className="font-semibold text-secondary-foreground/80 mb-1">Rata-rata Fokus Kelas</h3>
            <div className="text-6xl font-black tracking-tighter">{avgFocus}%</div>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-secondary-foreground/80 mb-1">Siswa</h3>
            <div className="text-4xl font-bold">{classData.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Alerts */}
      {needsAttention > 0 && (
        <div className="bg-red-50 text-red-600 p-4 rounded-3xl border border-red-100 flex items-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-sm">Butuh Perhatian Khusus</p>
            <p className="text-xs font-medium opacity-80">{needsAttention} siswa memiliki skor fokus di bawah 50% minggu ini.</p>
          </div>
        </div>
      )}

      {/* Roster Section */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-extrabold text-secondary text-lg">Daftar Siswa</h3>
          <button className="p-2 rounded-full text-muted-foreground hover:bg-muted">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {classData.length === 0 ? (
            <div className="organic-card p-8 text-center text-muted-foreground">Belum ada data siswa.</div>
          ) : (
            classData.map((student) => (
              <div key={student.studentId} className="organic-card p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary text-sm">{student.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${student.avgFocus >= 70 ? 'bg-primary' : student.avgFocus >= 50 ? 'bg-accent' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-medium text-muted-foreground">Fokus: {student.avgFocus}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {showIntervention !== student.studentId && (
                    <button 
                      onClick={() => setShowIntervention(student.studentId)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                      title="Kirim Intervensi"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {showIntervention === student.studentId && (
                  <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-secondary mb-2">Kirim Pesan / Intervensi Kognitif</p>
                    <textarea 
                      value={interventionNote}
                      onChange={(e) => setInterventionNote(e.target.value)}
                      placeholder="Contoh: Coba ganti materi ke visual untuk sementara waktu..."
                      className="w-full bg-background border border-input rounded-xl p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-20"
                    />
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleSendIntervention(student.studentId)}
                        className="flex-1 bg-primary text-primary-foreground rounded-full py-2 text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex justify-center items-center"
                      >
                        <Send className="w-4 h-4 mr-2" /> Kirim
                      </button>
                      <button 
                        onClick={() => setShowIntervention(null)}
                        className="flex-1 bg-muted text-muted-foreground rounded-full py-2 text-sm font-bold hover:bg-muted/80 transition-opacity"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
