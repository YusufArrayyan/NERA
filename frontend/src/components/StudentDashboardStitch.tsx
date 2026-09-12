'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ApiClient } from '@/lib/api-client';
import { RealTimeEEGPanel } from './RealTimeEEGPanel';
import { BottomNav } from './BottomNav';

export function StudentDashboardStitch() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week');
  const [analytics, setAnalytics] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadDashboardData();
  }, [timeRange, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const period = timeRange === 'week' ? 'WEEKLY' : timeRange === 'month' ? 'MONTHLY' : 'MONTHLY';
      const [analyticsData, badgesData, levelData, streakData] = await Promise.all([
        ApiClient.getUserAnalytics(period),
        ApiClient.getUserBadges(),
        ApiClient.getUserLevel(),
        ApiClient.getUserStreak(),
      ]);

      setAnalytics(analyticsData);
      setGamification({
        badges: badgesData,
        level: levelData,
        streak: streakData,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setAnalytics(null);
      setGamification(null);
    } finally {
      setLoading(false);
    }
  };

  const data = analytics || {
    avgFocus: 0,
    totalMinutes: 0,
    totalSessions: 0,
    avgStress: 0,
    dailyData: [],
  };

  const gamif = gamification || {
    badges: [],
    level: { level: 1, xp: 0, xpToNext: 1000 },
    streak: { days: 0, isActive: false },
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 overflow-x-hidden">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-4 sm:gap-8 min-w-0">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                <Image 
                  src="/nera-logo.svg" 
                  alt="NERA Logo" 
                  width={40} 
                  height={40}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <div className="hidden sm:block">
                  <div className="font-bold text-base sm:text-lg text-[#1F2937]">NERA</div>
                  <div className="text-[10px] text-[#9CA3AF] -mt-1">NEURO-ADAPTIVE LEARNING</div>
                </div>
              </button>
              
              <div className="hidden lg:flex items-center gap-1">
                <button onClick={() => router.push('/dashboard/student')} className="px-3 py-1.5 text-sm font-medium bg-[#5B7B5A] text-white rounded-full whitespace-nowrap">
                  Beranda
                </button>
                <button onClick={() => router.push('/analytics')} className="px-3 py-1.5 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors whitespace-nowrap">
                  Statistik
                </button>
                <button onClick={() => router.push('/journal')} className="px-3 py-1.5 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors whitespace-nowrap">
                  Jurnal
                </button>
                <button onClick={() => router.push('/hardware/calibration')} className="px-3 py-1.5 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors whitespace-nowrap">
                  Hardware
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#F5F3EE] rounded-lg">
                <span className="material-icons text-[#5B7B5A] text-sm">sensors</span>
                <span className="text-xs font-bold text-[#5B7B5A]">98%</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#F5F3EE] rounded-lg">
                <span className="material-icons text-[#10b981] text-sm">battery_charging_full</span>
                <span className="text-xs font-bold text-[#10b981]">84%</span>
              </div>

              <button 
                onClick={() => router.push('/notifications')}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F3EE] rounded-lg transition-colors"
              >
                <span className="material-icons text-[#4B5563] text-lg">notifications</span>
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F3EE] rounded-lg transition-colors"
              >
                <span className="material-icons text-[#4B5563] text-lg">settings</span>
              </button>

              <button 
                onClick={() => router.push('/dashboard/student/profile')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:block text-right">
                  <div className="text-xs sm:text-sm font-bold text-[#1F2937] truncate max-w-[120px]">Alya Juwita Putri</div>
                  <div className="text-[10px] text-[#9CA3AF]">SISWA AKTIF</div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#5B7B5A] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base">A</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 overflow-x-hidden">
        {/* EEG Status Banner */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
                <span className="material-icons text-[#10b981]">check_circle</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#10b981] uppercase mb-1">Telemetri EEG Aktif</div>
                <div className="text-sm text-[#4B5563]">SYNC-ID: <span className="font-mono font-bold">#NR-88219</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
            Analisis Belajar & Kapasitas Kognitif Alya
          </h1>
          <p className="text-[#4B5563]">
            Pola neuro-adaptif, stabilitas gelombang otak, dan ringkasan gamifikasi performa belajar mandiri secara berkala.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              timeRange === 'week'
                ? 'bg-[#5B7B5A] text-white'
                : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#5B7B5A]'
            }`}
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              timeRange === 'month'
                ? 'bg-[#5B7B5A] text-white'
                : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#5B7B5A]'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setTimeRange('semester')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              timeRange === 'semester'
                ? 'bg-[#5B7B5A] text-white'
                : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#5B7B5A]'
            }`}
          >
            Semester Genap 2026
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Streak Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="text-xs font-bold text-[#9CA3AF] uppercase mb-4">Streak Kognitif</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-[#f59e0b] text-4xl">local_fire_department</span>
            </div>
            <div className="text-3xl font-black text-[#1F2937] mb-1">{gamif.streak.days} Hari</div>
            <div className="text-sm text-[#4B5563] mb-3">Runtun</div>
            <div className="bg-[#FEF3C7] text-[#92400E] text-xs font-bold px-3 py-1.5 rounded-lg inline-block">
              Fokus Konsisten 🔥
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="text-xs font-bold text-[#9CA3AF] uppercase mb-4">Level Kognitif</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-[#5B7B5A] text-4xl">military_tech</span>
            </div>
            <div className="text-3xl font-black text-[#1F2937] mb-1">Level {gamif.level.level}</div>
            <div className="text-sm text-[#4B5563] mb-4">Master Learner</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4B5563]">{gamif.level.xp} / {gamif.level.xpToNext} XP</span>
                <span className="font-bold text-[#5B7B5A]">
                  {Math.round((gamif.level.xp / gamif.level.xpToNext) * 100)}% ke Lvl {gamif.level.level + 1}
                </span>
              </div>
              <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5B7B5A] rounded-full"
                  style={{ width: `${(gamif.level.xp / gamif.level.xpToNext) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Focus Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="text-xs font-bold text-[#9CA3AF] uppercase mb-4">Rerata Fokus</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-[#5B7B5A] text-4xl">psychology_alt</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-3xl font-black text-[#1F2937]">{data.avgFocus}</div>
              <div className="text-lg text-[#4B5563]">/ 100</div>
            </div>
            <div className="flex items-center gap-1 text-sm text-[#10b981]">
              <span className="material-icons text-base">arrow_upward</span>
              <span className="font-semibold">+8% dibanding minggu lalu</span>
            </div>
          </div>

          {/* Flow Time Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="text-xs font-bold text-[#9CA3AF] uppercase mb-4">Waktu Flow Kognitif</div>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons text-[#5B7B5A] text-4xl">timelapse</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-3xl font-black text-[#1F2937]">{Math.floor(data.totalMinutes / 60)}</div>
              <div className="text-sm text-[#4B5563]">Jam</div>
              <div className="text-3xl font-black text-[#1F2937]">{data.totalMinutes % 60}</div>
              <div className="text-sm text-[#4B5563]">Mnt</div>
            </div>
            <div className="text-xs text-[#9CA3AF]">Tercatat pekan ini via EEG Band</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Real-Time EEG Streaming Panel */}
          <div className="lg:col-span-1">
            <RealTimeEEGPanel autoStart={activeSession !== null} sessionId={activeSession?.id} />
          </div>

          {/* Daily Focus Distribution - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#1F2937] mb-1">Distribusi Jam Fokus Harian</h3>
                <p className="text-xs text-[#9CA3AF]">Fluktuasi konsentrasi mendalam berdasarkan pembacaan sensor EEG</p>
              </div>
              <div className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-lg">
                OPTIMAL
              </div>
            </div>

            {/* Peak Focus Zone Banner */}
            <div className="bg-[#5B7B5A]/10 border border-[#5B7B5A]/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="material-icons text-[#5B7B5A]">verified</span>
                <div>
                  <div className="text-sm font-bold text-[#5B7B5A] mb-1">
                    Peak Focus Zone (09:00 - 11:30)
                  </div>
                  <div className="text-xs text-[#4B5563]">Zona Beta 18-24 Hz</div>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              {data.dailyData.map((day: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold text-[#4B5563]">
                    {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="bg-[#5B7B5A] h-8 rounded-lg transition-all hover:bg-[#4A6349]"
                      style={{ width: `${(day.duration / 4.5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-bold text-[#1F2937] text-right">
                    {day.duration.toFixed(1)}h
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2 p-4 bg-[#F5F3EE] rounded-xl">
              <span className="material-icons text-[#5B7B5A] text-sm">insights</span>
              <p className="text-xs text-[#4B5563]">
                <span className="font-bold">Rabu</span> mencatatkan rekor flow kognitif terpanjang minggu ini:{' '}
                <span className="font-bold">4 Jam 12 Menit</span>.
              </p>
            </div>
          </div>

          {/* Consistency Calendar - 1 column */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <h3 className="text-lg font-bold text-[#1F2937] mb-1">Konsistensi Belajar</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Aktivitas kognitif 30 hari terakhir</p>

            <div className="text-center mb-6">
              <div className="text-3xl font-black text-[#1F2937] mb-1">28/30</div>
              <div className="text-sm text-[#4B5563]">Hari Aktif</div>
            </div>

            {/* Heatmap Grid */}
            <div className="mb-4">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-md"
                    style={{
                      backgroundColor:
                        idx % 7 === 5 || idx % 7 === 6
                          ? '#E5E7EB'
                          : ['#5B7B5A', '#6D8F6C', '#4A6349'][Math.floor(Math.random() * 3)],
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <span className="material-icons text-[#10b981] text-sm">auto_awesome</span>
                <div>
                  <div className="text-xs font-bold text-[#10b981] mb-1">
                    Habit Neuroplastic Terbentuk!
                  </div>
                  <div className="text-xs text-[#4B5563]">
                    Stabilitas fokus Anda meningkat 14% di jam pagi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#5B7B5A] text-2xl">psychology</span>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Wawasan Otak & Rekomendasi Adaptif AI</h3>
              <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1">
                MODEL NERA-V3.4 ACTIVE
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-[#5B7B5A]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-[#5B7B5A] uppercase">Zona Gelombang Beta</div>
                <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-xs font-bold px-2 py-1 rounded">
                  92% Precision
                </div>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <span className="material-icons text-[#f59e0b]">lightbulb</span>
                <div className="text-sm font-bold text-[#1F2937]">
                  Jam Emas Kognitif: 08:30 – 10:15 WIB
                </div>
              </div>
              <p className="text-xs text-[#4B5563] mb-4 leading-relaxed">
                Sensor mendeteksi gelombang Beta tertinggi Anda tercapai konsisten di interval ini.
              </p>
              <button className="w-full bg-[#5B7B5A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4A6349] transition-colors flex items-center justify-center gap-2">
                <span className="material-icons text-base">schedule</span>
                Sinkronkan
              </button>
            </div>

            <div className="border-2 border-[#ef4444]/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-[#ef4444] uppercase">Deteksi Kelelahan</div>
                <div className="bg-[#ef4444]/10 text-[#ef4444] text-xs font-bold px-2 py-1 rounded">
                  Theta Shift Trigger
                </div>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <span className="material-icons text-[#ef4444]">warning</span>
                <div className="text-sm font-bold text-[#1F2937]">
                  Lonjakan Gelombang Theta Setelah 45 Menit
                </div>
              </div>
              <p className="text-xs text-[#4B5563] mb-4 leading-relaxed">
                Sangat disarankan mengadopsi metode Pomodoro adaptif 45/10 dengan panduan audio binaural.
              </p>
              <button className="w-full bg-[#ef4444] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#dc2626] transition-colors flex items-center justify-center gap-2">
                <span className="material-icons text-base">timelapse</span>
                Aktifkan
              </button>
            </div>
          </div>
        </div>

        {/* Gamification Badges */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#5B7B5A] text-2xl">workspace_premium</span>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Lencana & Pencapaian Gamifikasi</h3>
              <p className="text-xs text-[#9CA3AF]">
                3 dari 8 Lencana Terbuka • Peringkat #3 Kelas Kognitif
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: 'shield',
                title: 'Fokus Baja',
                desc: 'Mencapai skor fokus ≥ 85 selama lebih dari 120 menit beruntun.',
                status: 'UNLOCKED',
                progress: 100,
                color: '#10b981',
              },
              {
                icon: 'whatshot',
                title: '7 Hari Konsisten',
                desc: 'Mempertahankan minimal 1 sesi EEG harian selama seminggu penuh.',
                status: 'UNLOCKED',
                progress: 100,
                color: '#f59e0b',
              },
              {
                icon: 'self_improvement',
                title: 'Zen Master',
                desc: 'Menstabilkan ritme pernapasan & rasio Alpha/Beta saat jeda mikro.',
                status: 'LEVEL 2/3',
                progress: 66,
                color: '#5B7B5A',
              },
              {
                icon: 'waves',
                title: 'Alpha Wave Pioneer',
                desc: 'Capai total akumulasi 20 Jam Flow kognitif dalam satu pekan.',
                status: 'TERKUNCI',
                progress: 93,
                color: '#9CA3AF',
              },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-[#E5E7EB] rounded-xl p-5 hover:border-[#5B7B5A]/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${badge.color}20` }}
                  >
                    <span className="material-icons" style={{ color: badge.color }}>
                      {badge.icon}
                    </span>
                  </div>
                  <div
                    className="text-[10px] font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor:
                        badge.status === 'UNLOCKED'
                          ? '#10b98120'
                          : badge.status === 'TERKUNCI'
                            ? '#E5E7EB'
                            : '#5B7B5A20',
                      color:
                        badge.status === 'UNLOCKED'
                          ? '#059669'
                          : badge.status === 'TERKUNCI'
                            ? '#6B7280'
                            : '#5B7B5A',
                    }}
                  >
                    {badge.status}
                  </div>
                </div>

                <div className="text-sm font-bold text-[#1F2937] mb-2">{badge.title}</div>
                <p className="text-xs text-[#4B5563] mb-4 leading-relaxed">{badge.desc}</p>

                <div className="space-y-1">
                  <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${badge.progress}%`, backgroundColor: badge.color }}
                    ></div>
                  </div>
                  <div className="text-xs font-semibold text-[#4B5563]">
                    {badge.progress}% Selesai
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="bg-gradient-to-r from-[#5B7B5A] to-[#4A6349] rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <span className="material-icons text-4xl">neurology</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Target Mingguan: Menuju Level 6</h3>
              <p className="text-lg font-semibold mb-1">160 XP Lagi</p>
              <p className="text-sm opacity-90 mb-6">
                Selesaikan 1 sesi deep focus 45 menit besok pagi untuk membuka lencana Alpha Wave Pioneer
                dan upgrade rank!
              </p>
              <button className="bg-white text-[#5B7B5A] font-bold px-6 py-3 rounded-xl hover:bg-[#F5F3EE] transition-colors">
                Mulai Sesi Fokus Pagi
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-sm text-[#9CA3AF] mb-2">
            <span className="font-bold text-[#1F2937]">NERA</span> © 2024 NERA Neuro-Adaptive Platform.
            Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-[#4B5563]">
            <button onClick={() => router.push('/hardware/setup')} className="hover:text-[#5B7B5A]">
              Setup Headband IoT
            </button>
            <button onClick={() => router.push('/privacy')} className="hover:text-[#5B7B5A]">
              Privasi Kognitif
            </button>
            <button onClick={() => router.push('/hardware/calibration')} className="hover:text-[#5B7B5A]">
              Bantuan & Kalibrasi
            </button>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
}
