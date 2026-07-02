"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import EEGChart from "@/components/EEGChart";
import { 
  Play, Activity, Clock, Zap, Brain, Bell, Settings, 
  Trophy, Flame, Award, Edit3, Smile, Frown, Meh, X, BookOpen, HeartPulse
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentSuperDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Data States
  const [stats, setStats] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimer, setSessionTimer] = useState(0);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'LEARNING' | 'PROGRESS' | 'JOURNAL'>('LEARNING');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");

  // Simulated live focus for gauge (0-100)
  const [liveFocus, setLiveFocus] = useState(80);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, currentSession] = await Promise.all([
          fetchApi('/gamification/stats'),
          fetchApi('/eeg/sessions').then(res => res[0]?.status === 'ACTIVE' ? res[0] : null)
        ]);
        setStats(statsData);
        setActiveSession(currentSession);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Timer logic for active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        // Simulate fluctuating live focus for gauge
        setLiveFocus(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      }, 1000);
    } else {
      setSessionTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = async () => {
    try {
      const res = await fetchApi('/eeg/sessions/start', { method: 'POST' });
      setActiveSession(res.session);
    } catch (error) {
      console.error(error);
    }
  };

  const stopSession = async () => {
    try {
      if (!activeSession) return;
      await fetchApi(`/eeg/sessions/${activeSession.id}/stop`, { method: 'POST' });
      setActiveSession(null);
    } catch (error) {
      console.error(error);
    }
  };

  const submitJournal = async () => {
    if (!journalText) return;
    try {
      await fetchApi('/journal', {
        method: 'POST',
        body: JSON.stringify({
          title: "Catatan Kognitif Harian",
          content: journalText,
          mood: mood === 'happy' ? 'HAPPY' : mood === 'sad' ? 'SAD' : 'NEUTRAL'
        })
      });
      alert("Jurnal berhasil disimpan!");
      setJournalText("");
      setMood(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="animate-pulse p-4 text-center font-bold text-muted-foreground mt-10">Mempersiapkan NERA...</div>;

  return (
    <div className="space-y-6 max-w-md md:max-w-4xl mx-auto pb-6 relative overflow-hidden">
      
      {/* Top Header & Navigation */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <button 
          onClick={() => setShowNotifications(true)}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <h2 className="font-bold text-secondary text-lg">Pusat Belajar</h2>
        <button 
          onClick={() => router.push('/dashboard/student/profile')}
          className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border/40 text-secondary hover:bg-muted transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Slide-out Notification Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in">
          <div className="w-80 h-full bg-card shadow-2xl p-6 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Notifikasi</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 bg-muted rounded-full hover:bg-red-50">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <p className="text-xs font-bold text-primary mb-1">🎉 Pencapaian Baru!</p>
                <p className="text-sm font-semibold">Kamu mencapai Streak 5 Hari!</p>
              </div>
              <div className="p-4 bg-muted rounded-2xl border border-border/50">
                <p className="text-xs font-bold text-muted-foreground mb-1">Pesan dari Guru</p>
                <p className="text-sm font-semibold text-secondary">"Bagus sekali fokusnya hari ini. Lanjutkan!"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-card p-1 rounded-full shadow-sm border border-border/40 mb-6 relative z-10 mx-auto max-w-sm">
        {['LEARNING', 'PROGRESS', 'JOURNAL'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
              activeTab === tab 
                ? 'bg-primary text-primary-foreground shadow-sm scale-105' 
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {tab === 'LEARNING' ? 'Belajar' : tab === 'PROGRESS' ? 'Progres' : 'Jurnal'}
          </button>
        ))}
      </div>

      {/* =========================================
          TAB 1: LEARNING (Sesi Belajar Aktif)
      ========================================= */}
      {activeTab === 'LEARNING' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Main Focus Panel */}
          <div className={`rounded-[32px] p-6 relative overflow-hidden shadow-lg transition-colors duration-500 ${activeSession ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
            <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="text-center relative z-10 mb-6">
              <h3 className="font-semibold opacity-90 mb-1">
                {activeSession ? "Sesi Sedang Berjalan" : "Siap Untuk Fokus?"}
              </h3>
              {activeSession && (
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-mono text-xl font-bold tracking-widest">{formatTime(sessionTimer)}</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold ml-2">VISUAL MODE</span>
                </div>
              )}
            </div>

            {/* Circular Gauge UI */}
            <div className="flex justify-center items-center mb-8 relative z-10">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="10" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * Math.round(liveFocus)) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-5xl font-black tracking-tighter">{activeSession ? Math.round(liveFocus) : '--'}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Skor Fokus</div>
                </div>
              </div>
            </div>

            {/* Play/Stop Action */}
            <div className="flex justify-center relative z-10">
              {!activeSession ? (
                <button 
                  onClick={startSession}
                  className="bg-card text-secondary rounded-full px-8 py-4 flex items-center justify-center shadow-xl hover:scale-105 transition-transform font-bold"
                >
                  <Play className="w-5 h-5 mr-2 fill-secondary" /> Mulai Sesi Belajar
                </button>
              ) : (
                <button 
                  onClick={stopSession}
                  className="bg-red-500 text-white rounded-full px-8 py-4 flex items-center justify-center shadow-xl hover:scale-105 transition-transform font-bold"
                >
                  <div className="w-4 h-4 bg-white rounded-sm mr-2"></div> Hentikan Sesi
                </button>
              )}
            </div>
          </div>

          {/* Real-time Line Chart (EEG) */}
          {activeSession && (
            <div className="animate-in slide-in-from-bottom-4">
              <EEGChart sessionId={activeSession.id} />
            </div>
          )}

          {/* AI Recommendations */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-secondary ml-1">Saran Adaptif AI</h3>
            <div className="organic-card p-4 flex items-start">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mr-4 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-secondary text-sm mb-1">Materi Visual Lebih Efektif</h4>
                <p className="text-xs text-muted-foreground font-medium">Berdasarkan rasio Theta/Beta kamu, belajar dengan gambar atau video akan meningkatkan daya ingat hari ini.</p>
              </div>
            </div>
          </div>

        </div>
      )}


      {/* =========================================
          TAB 2: PROGRESS (Gamifikasi & XP)
      ========================================= */}
      {activeTab === 'PROGRESS' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="organic-card p-5 flex flex-col items-center justify-center text-center bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
              <Flame className="w-8 h-8 text-accent mb-2 drop-shadow-sm" />
              <div className="text-4xl font-black text-secondary">{stats?.streak || 5}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hari Streak</div>
            </div>
            <div className="organic-card p-5 flex flex-col items-center justify-center text-center bg-gradient-to-bl from-primary/10 to-transparent border-primary/20">
              <Trophy className="w-8 h-8 text-primary mb-2 drop-shadow-sm" />
              <div className="text-4xl font-black text-secondary">{stats?.level || 3}</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Level Saat Ini</div>
            </div>
          </div>

          <div className="organic-card p-6">
            <h3 className="font-extrabold text-secondary mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" /> Perolehan XP
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-3xl font-black text-secondary">{stats?.xp || 850} <span className="text-sm text-muted-foreground">XP</span></span>
              <span className="text-xs font-bold text-accent">Menuju Lvl 4</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4 shadow-inner overflow-hidden">
              <div className="bg-accent h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `85%` }}></div>
            </div>
          </div>

          {/* Achievement Gallery */}
          <div>
            <h3 className="font-extrabold text-secondary mb-3 ml-1">Lencana Pencapaian</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🎯", name: "Fokus Baja", active: true },
                { icon: "🔥", name: "7 Hari Konsisten", active: true },
                { icon: "🧘‍♂️", name: "Zen Master", active: false }
              ].map((badge, i) => (
                <div key={i} className={`organic-card p-4 flex flex-col items-center justify-center text-center ${!badge.active ? 'opacity-50 grayscale' : ''}`}>
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-[10px] font-bold text-secondary leading-tight">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* =========================================
          TAB 3: JOURNAL (Kognitif & Mood)
      ========================================= */}
      {activeTab === 'JOURNAL' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
          
          <div className="organic-card p-6">
            <h3 className="font-extrabold text-secondary text-lg mb-4 flex items-center">
              <HeartPulse className="w-5 h-5 mr-2 text-rose-500" />
              Bagaimana perasaanmu hari ini?
            </h3>
            <div className="flex justify-around mb-6 bg-muted/50 p-2 rounded-full">
              {[
                { id: 'sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-100' },
                { id: 'neutral', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-100' },
                { id: 'happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-100' }
              ].map((m) => {
                const Icon = m.icon;
                const isActive = mood === m.id;
                return (
                  <button 
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={`p-4 rounded-full transition-all duration-300 ${isActive ? `${m.bg} shadow-md scale-110` : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Icon className={`w-8 h-8 ${isActive ? m.color : ''}`} />
                  </button>
                )
              })}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 flex items-center">
                <Edit3 className="w-3 h-3 mr-1" /> Catatan Refleksi Belajar
              </label>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Hari ini materinya cukup sulit dipahami, tapi saya berhasil menyelesaikannya..."
                className="w-full h-32 p-4 rounded-2xl bg-background border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <button 
                onClick={submitJournal}
                disabled={!mood || !journalText}
                className="w-full organic-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Jurnal Kognitif
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-secondary mb-3 ml-1">Jurnal Sebelumnya</h3>
            <div className="space-y-3">
              <div className="organic-card p-4 border-l-4 border-l-green-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-muted-foreground">1 Juli 2026</span>
                  <Smile className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm font-medium text-secondary/80">Sangat fokus saat membaca modul sains. AI menyarankan istirahat tepat waktu.</p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
