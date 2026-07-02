"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { Users, TrendingUp, AlertTriangle, Send, Bell, Settings, Search, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [classData, setClassData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIntervention, setShowIntervention] = useState<string | null>(null);
  const [interventionNote, setInterventionNote] = useState("");
  
  // New state for live EEG data
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [isLive, setIsLive] = useState(false);

  // 1. Fetch initial class roster
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

  // 2. Connect to WebSockets for Live Monitoring
  useEffect(() => {
    if (classData.length === 0) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Connect to the /eeg namespace
    const socket = io(`${apiUrl}/eeg`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to EEG WebSocket');
      setIsLive(true);
      
      // Tell backend to start class simulation for our students
      const studentIds = classData.map(s => s.studentId);
      socket.emit('startClassSimulation', { studentIds });
    });

    socket.on('disconnect', () => {
      setIsLive(false);
    });

    // Receive live updates every 2 seconds
    socket.on('classEegData', (data: any[]) => {
      const liveDataMap = data.reduce((acc, curr) => {
        acc[curr.studentId] = curr;
        return acc;
      }, {});
      setLiveData(liveDataMap);
    });

    return () => {
      socket.disconnect();
    };
  }, [classData.length]); // Only run after classData is populated

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

  // Calculate live average focus
  const liveFocusValues = Object.values(liveData).map(d => d.focusIndex);
  const avgFocus = liveFocusValues.length > 0 
    ? Math.round(liveFocusValues.reduce((a, b) => a + b, 0) / liveFocusValues.length)
    : (classData.length ? Math.round(classData.reduce((a, b) => a + b.avgFocus, 0) / classData.length) : 0);

  // Count how many students need attention (Stress or Low Focus)
  const needsAttention = Object.values(liveData).filter(d => 
    d.focusCategory === 'LOW_FOCUS' || d.focusCategory === 'STRESS'
  ).length;

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
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-secondary text-lg">Beranda Guru</h2>
          {isLive ? (
            <div className="flex items-center text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5"></span> LIVE MONITORING
            </div>
          ) : (
            <div className="flex items-center text-xs text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-full mt-1">
              CONNECTING...
            </div>
          )}
        </div>
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="bg-secondary rounded-[32px] p-8 text-secondary-foreground relative overflow-hidden shadow-lg transition-all duration-500">
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-end relative z-10">
          <div>
            <h3 className="font-semibold text-secondary-foreground/80 mb-1 flex items-center">
              Rata-rata Fokus Kelas <Activity className="w-4 h-4 ml-2 animate-pulse" />
            </h3>
            <div className="text-6xl font-black tracking-tighter transition-all duration-300">
              {avgFocus}%
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-secondary-foreground/80 mb-1">Siswa</h3>
            <div className="text-4xl font-bold">{classData.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Alerts */}
      {needsAttention > 0 && (
        <div className="bg-red-50 text-red-600 p-4 rounded-3xl border border-red-100 flex items-center shadow-sm animate-in slide-in-from-top-2">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-sm">Butuh Perhatian Khusus</p>
            <p className="text-xs font-medium opacity-80">{needsAttention} siswa sedang stres atau kehilangan fokus saat ini.</p>
          </div>
        </div>
      )}

      {/* Roster Section */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-extrabold text-secondary text-lg">Daftar Siswa (Live)</h3>
          <button className="p-2 rounded-full text-muted-foreground hover:bg-muted">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {classData.length === 0 ? (
            <div className="organic-card p-8 text-center text-muted-foreground">Belum ada data siswa.</div>
          ) : (
            classData.map((student) => {
              const liveStudentData = liveData[student.studentId];
              const currentFocus = liveStudentData?.focusIndex ?? student.avgFocus;
              const category = liveStudentData?.focusCategory ?? 'UNKNOWN';
              
              // Determine UI based on category
              let statusColor = 'bg-accent text-accent-foreground';
              let dotColor = 'bg-accent';
              let statusLabel = 'Memuat...';

              if (category === 'HIGH' || category === 'HIGH_FOCUS') {
                statusColor = 'bg-green-100 text-green-700';
                dotColor = 'bg-green-500';
                statusLabel = 'Sangat Fokus';
              } else if (category === 'MODERATE' || category === 'MODERATE_FOCUS') {
                statusColor = 'bg-primary/10 text-primary';
                dotColor = 'bg-primary';
                statusLabel = 'Fokus Normal';
              } else if (category === 'LOW' || category === 'LOW_FOCUS') {
                statusColor = 'bg-orange-100 text-orange-700';
                dotColor = 'bg-orange-500 animate-pulse';
                statusLabel = 'Kurang Fokus';
              } else if (category === 'STRESS') {
                statusColor = 'bg-red-100 text-red-700 border border-red-200';
                dotColor = 'bg-red-600 animate-bounce';
                statusLabel = 'Stres / Lelah';
              }

              return (
                <div key={student.studentId} className="organic-card p-4 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold mr-3 shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary text-sm">{student.name}</h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${dotColor}`}></span>
                            {statusLabel}
                          </span>
                          <span className="text-xs font-bold text-secondary transition-all">
                            {currentFocus}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {showIntervention !== student.studentId && (
                      <button 
                        onClick={() => setShowIntervention(student.studentId)}
                        className={`p-2 rounded-full transition-colors ${category === 'STRESS' || category === 'LOW_FOCUS' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'text-primary hover:bg-primary/10'}`}
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
                        placeholder="Contoh: Ayo tarik napas panjang sebentar..."
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
