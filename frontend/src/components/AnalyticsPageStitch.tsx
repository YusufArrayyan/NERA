'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ApiClient } from '@/lib/api-client';

export function AnalyticsPageStitch() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'focus' | 'time' | 'consistency'>('focus');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const period = timeRange === 'week' ? 'WEEKLY' : timeRange === 'month' ? 'MONTHLY' : 'MONTHLY';
      const data = await ApiClient.getUserAnalytics(period).catch(() => mockData);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics(mockData);
    } finally {
      setLoading(false);
    }
  };

  const mockData = {
    avgFocus: 79,
    totalMinutes: 2880,
    totalSessions: 23,
    avgStress: 35,
    focusDistribution: { LOW: 3, MODERATE: 12, HIGH: 8 },
    dailyData: [
      { date: '2026-01-20', focus: 75, duration: 8 },
      { date: '2026-01-21', focus: 82, duration: 9 },
      { date: '2026-01-22', focus: 88, duration: 7 },
      { date: '2026-01-23', focus: 76, duration: 9 },
      { date: '2026-01-24', focus: 85, duration: 8 },
      { date: '2026-01-25', focus: 70, duration: 6 },
      { date: '2026-01-26', focus: 65, duration: 4 },
    ],
  };

  const data = analytics || mockData;
  const completedModules = 23;
  const totalModules = 40;

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Image 
                  src="/nera-logo.svg" 
                  alt="NERA Logo" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <div className="font-bold text-lg text-[#1F2937]">NERA</div>
                  <div className="text-[10px] text-[#9CA3AF] -mt-1">NEURO-ADAPTIVE LEARNING</div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                <a href="/" className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors">
                  Beranda
                </a>
                <a href="/analytics" className="px-4 py-2 text-sm font-medium bg-[#5B7B5A] text-white rounded-full">
                  Statistik & Analisis
                </a>
                <a href="/journal" className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors">
                  Jurnal Refleksi
                </a>
                <a href="/hardware/calibration" className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors">
                  Hardware Headband
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F3EE] rounded-lg transition-colors">
                <span className="material-icons text-[#4B5563] text-lg">notifications</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F3EE] rounded-lg transition-colors">
                <span className="material-icons text-[#4B5563] text-lg">settings</span>
              </button>

              <div className="flex items-center gap-3 ml-2">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#1F2937]">Alya Juwita Putri</div>
                  <div className="text-xs text-[#9CA3AF]">SISWA AKTIF</div>
                </div>
                <div className="w-10 h-10 bg-[#5B7B5A] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
              <span className="material-icons text-sm">bar_chart</span>
              STATISTIK KOGNITIF & ANALISIS
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
            Dashboard Analitik Pembelajaran
          </h1>
          <p className="text-[#4B5563]">
            Pelacakan mendalam terhadap pola belajar, konsistensi kognitif, dan rekomendasi AI berbasis data EEG real-time
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-3 mb-8">
          {(['week', 'month', 'semester'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                timeRange === range
                  ? 'bg-[#5B7B5A] text-white'
                  : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#5B7B5A]'
              }`}
            >
              {range === 'week' ? '7 Hari' : range === 'month' ? '30 Hari' : 'Semester'}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: 'trending_up', label: 'Rata-rata Fokus', value: `${data.avgFocus}%`, color: '#5B7B5A', change: '+8%' },
            { icon: 'schedule', label: 'Waktu Aktif', value: `${Math.floor(data.totalMinutes / 60)} Jam`, color: '#7A9B79', change: '+12h' },
            { icon: 'school', label: 'Modul Selesai', value: `${completedModules}/${totalModules}`, color: '#10b981', change: '+5' },
            { icon: 'workspace_premium', label: 'Ranking Kelas', value: '#3', color: '#f59e0b', change: '↑2' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#E5E7EB] cursor-pointer hover:border-[#5B7B5A] transition-all"
              onClick={() => setSelectedMetric(idx === 0 ? 'focus' : idx === 1 ? 'time' : 'consistency')}
            >
              <span className="material-icons text-4xl mb-4" style={{ color: stat.color }}>
                {stat.icon}
              </span>
              <div className="text-xs font-bold text-[#9CA3AF] uppercase mb-2">{stat.label}</div>
              <div className="text-3xl font-black text-[#1F2937] mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-[#10b981]">{stat.change} minggu ini</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#1F2937] mb-1">Distribusi Jam Fokus Harian</h3>
                <p className="text-xs text-[#9CA3AF]">Fluktuasi konsentrasi mendalam per hari</p>
              </div>
              <div className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-lg">
                OPTIMAL
              </div>
            </div>

            <div className="space-y-4">
              {data.dailyData.map((day: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold text-[#4B5563]">
                    {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="bg-[#5B7B5A] h-8 rounded-lg transition-all hover:bg-[#4A6349] cursor-pointer"
                      style={{ width: `${(day.duration / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm font-bold text-[#1F2937] text-right">{day.duration}h</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2 p-4 bg-[#F5F3EE] rounded-xl">
              <span className="material-icons text-[#5B7B5A] text-sm">insights</span>
              <p className="text-xs text-[#4B5563]">
                <span className="font-bold">Kamis</span> mencatatkan fokus tertinggi minggu ini:{' '}
                <span className="font-bold">9 Jam</span>
              </p>
            </div>
          </div>

          {/* Consistency Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <h3 className="text-lg font-bold text-[#1F2937] mb-1">Konsistensi Belajar</h3>
            <p className="text-xs text-[#9CA3AF] mb-6">Aktivitas kognitif 30 hari terakhir</p>

            <div className="text-center mb-6">
              <div className="text-4xl font-black text-[#1F2937] mb-1">{data.totalSessions}/30</div>
              <div className="text-sm text-[#4B5563]">Hari Aktif</div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[#4B5563]">Hari Aktif</span>
                  <span className="font-bold text-[#5B7B5A]">{Math.round((data.totalSessions / 30) * 100)}%</span>
                </div>
                <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#5B7B5A] rounded-full" style={{ width: `${(data.totalSessions / 30) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="material-icons text-[#10b981] text-sm">auto_awesome</span>
                  <div>
                    <div className="text-xs font-bold text-[#10b981] mb-1">Habit Terbentuk!</div>
                    <div className="text-xs text-[#4B5563]">
                      Stabilitas fokus meningkat 14% di jam pagi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights & Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#5B7B5A] text-2xl">psychology</span>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Wawasan Otak & Rekomendasi AI</h3>
              <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1">
                MODEL NERA-V3.4
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="border-2 border-[#5B7B5A]/30 rounded-xl p-5 text-left hover:border-[#5B7B5A] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-[#5B7B5A] uppercase">Zona Beta Optimal</div>
                <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-xs font-bold px-2 py-1 rounded">
                  92% Precision
                </div>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <span className="material-icons text-[#f59e0b]">lightbulb</span>
                <div className="text-sm font-bold text-[#1F2937]">Jam Emas: 08:30 – 10:15 WIB</div>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Jadwalkan materi eksakt pada interval ini untuk retensi maksimal
              </p>
            </button>

            <button className="border-2 border-[#ef4444]/30 rounded-xl p-5 text-left hover:border-[#ef4444] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-[#ef4444] uppercase">Deteksi Kelelahan</div>
                <div className="bg-[#ef4444]/10 text-[#ef4444] text-xs font-bold px-2 py-1 rounded">
                  Theta Shift
                </div>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <span className="material-icons text-[#ef4444]">warning</span>
                <div className="text-sm font-bold text-[#1F2937]">Theta spike setelah 45 menit</div>
              </div>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Adopsi Pomodoro 45/10 dengan audio binaural
              </p>
            </button>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#5B7B5A] text-2xl">workspace_premium</span>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Lencana & Pencapaian</h3>
              <p className="text-xs text-[#9CA3AF]">3 dari 8 Terbuka • Peringkat #3 Kelas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛡️', title: 'Fokus Baja', status: 'UNLOCKED', progress: 100 },
              { icon: '🔥', title: 'Konsisten 7 Hari', status: 'UNLOCKED', progress: 100 },
              { icon: '🧘', title: 'Zen Master', status: 'LEVEL 2', progress: 66 },
              { icon: '🌊', title: 'Alpha Pioneer', status: 'TERKUNCI', progress: 93 },
            ].map((badge, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#5B7B5A] transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-sm font-bold text-[#1F2937] mb-1">{badge.title}</div>
                <div
                  className={`text-[10px] font-bold px-2 py-1 rounded mb-3 ${
                    badge.status === 'UNLOCKED'
                      ? 'bg-[#10b981]/10 text-[#10b981]'
                      : badge.status === 'TERKUNCI'
                        ? 'bg-[#E5E7EB] text-[#9CA3AF]'
                        : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                  }`}
                >
                  {badge.status}
                </div>
                <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5B7B5A] rounded-full"
                    style={{ width: `${badge.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs font-semibold text-[#4B5563] mt-2">{badge.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-sm text-[#9CA3AF] mb-2">
            <span className="font-bold text-[#1F2937]">NERA</span> © 2024 NERA Neuro-Adaptive Platform.
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-[#4B5563]">
            <a href="#" className="hover:text-[#5B7B5A]">
              Headband IoT
            </a>
            <a href="#" className="hover:text-[#5B7B5A]">
              Privasi
            </a>
            <a href="#" className="hover:text-[#5B7B5A]">
              Bantuan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
