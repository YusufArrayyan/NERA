'use client';

import React, { useState } from 'react';
import {
  Flame,
  Brain,
  TrendingUp,
  Zap,
  Award,
  AlertCircle,
  Download,
  BarChart3,
  Clock,
  Target,
  Sun,
  Heart,
  BookOpen,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { Heatmap } from '@/components/ui/Heatmap';

export function StudentAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  // Mock 30-day attendance heatmap data
  const attendanceHeatmap = [
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1],
  ].map((week) =>
    week.map((day) => (day === 1 ? Math.floor(Math.random() * 40 + 60) : 0))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm">
                  LAPORAN BIOMETRIK & KOGNITIF
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">
                Dashboard Analitik Pembelajaran
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mt-2">
                Insights mendalam tentang pola kognitif, konsistensi fokus, dan rekomendasi personalisasi pembelajaran.
              </p>
            </div>
            <Button variant="secondary" size="md">
              <Download className="w-4 h-4" />
              Unduh Laporan PDF
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
              }`}
            >
              {range === '7d' ? '7 Hari' : '30 Hari'}
            </button>
          ))}
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Rerata Fokus"
            value={79}
            unit="/100"
            change={{ value: 8, direction: 'up', period: 'vs pekan lalu' }}
            icon="🧠"
            variant="highlight"
          />
          <StatCard
            title="Streak Konsistensi"
            value="7"
            unit="Hari"
            description="Fokus konsisten 🔥"
            icon="🔥"
            change={{ value: 2, direction: 'up', period: 'rekor pribadi' }}
          />
          <StatCard
            title="Level Pembelajaran"
            value="5"
            description="Master Learner"
            icon="👑"
          />
          <StatCard
            title="Progres XP"
            value="2840"
            unit="/ 3000"
            description="160 XP hingga Level 6"
            icon="⚡"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Rhythm Chart */}
            <ChartContainer
              title="Ritme Harian - Durasi Fokus & Gelombang"
              description="Pola aktivitas serebral 7 hari terakhir"
            >
              <div className="h-64 flex items-end justify-between gap-2 px-4 py-8 bg-neutral-50 rounded-lg">
                {[
                  { day: 'Sen', value: 2.1, label: '2.1h' },
                  { day: 'Sel', value: 2.8, label: '2.8h' },
                  { day: 'Rab', value: 3.9, label: '3.9h' },
                  { day: 'Kam', value: 2.4, label: '2.4h' },
                  { day: 'Jum', value: 3.1, label: '3.1h' },
                  { day: 'Sab', value: 1.5, label: '1.5h' },
                  { day: 'Min', value: 2.9, label: '2.9h' },
                ].map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-green-600 to-teal-500 rounded-t-lg transition-all hover:shadow-lg"
                        style={{ height: `${(day.value / 4) * 200}px` }}
                      />
                    </div>
                    <p className="text-xs font-bold text-neutral-900">{day.label}</p>
                    <p className="text-xs text-neutral-600">{day.day}</p>
                  </div>
                ))}
              </div>
            </ChartContainer>

            {/* Attendance Heatmap */}
            <ChartContainer
              title="Matriks Kehadiran 30 Hari Aktivitas Serebral"
              description="28/30 hari dengan aktivitas terdeteksi"
            >
              <Heatmap
                data={attendanceHeatmap}
                labels={{
                  rows: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'],
                  cols: [
                    'Sen',
                    'Sel',
                    'Rab',
                    'Kam',
                    'Jum',
                    'Sab',
                    'Min',
                  ],
                }}
              />
            </ChartContainer>

            {/* AI Diagnostics */}
            <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  🧠 AI Neuro-Diagnostics - Insight Kognitif Cerdas
                </h2>
                <p className="text-xs text-neutral-600 mt-1">v2.4 Adapt - Analisis real-time berbasis ML</p>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Golden Hour */}
                <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sun className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900">Jam Emas Kognitif</p>
                      <p className="text-sm font-semibold text-yellow-700 mt-1">08:30 - 10:15 WIB</p>
                      <p className="text-sm text-neutral-700 mt-2">
                        Rasio gelombang Beta / Theta Anda mencapai puncak sinkronisasi tertinggi (1.82) pada rentang waktu
                        ini. Direkomendasikan untuk materi analitis dan pemecahan masalah rumit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Theta Alert */}
                <div className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900">Peringatan Lonjakan Theta</p>
                      <p className="text-sm font-semibold text-orange-700 mt-1">45+ Menit</p>
                      <p className="text-sm text-neutral-700 mt-2">
                        Kelelahan mikro terdeteksi: Theta wave melonjak 34% setelah sesi 45 menit tanpa jeda, menandakan
                        penurunan retensi memori kerja.
                      </p>
                      <Button variant="secondary" size="sm" className="mt-3">
                        Mulai Protokol Reset 3 Menit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Focus Zone */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  Zona Optimal
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-green-600">08:30</p>
                  <p className="text-sm text-neutral-600 mt-2">Puncak Fokus (Peak Focus Zone)</p>
                  <p className="text-xs text-neutral-500 mt-1">Konsistensi gelombang Beta stabil tertinggi di pagi hari</p>
                </div>
                <ProgressBar value={95} label="Kestabilan Gelombang" variant="success" size="md" />
              </CardBody>
            </Card>

            {/* Total Flow Time */}
            <MetricCard
              icon={Clock}
              label="Total Waktu Flow"
              value="18 Jam"
              unit="45 Mnt"
              status="good"
              description="Produktivitas tinggi"
            />

            {/* Biometric Status */}
            <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  Status Biometrik
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-sm text-neutral-700">Denyut Nadi Rata-rata</span>
                  <span className="font-bold text-neutral-900">72 bpm</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-sm text-neutral-700">Variabilitas HRV</span>
                  <span className="font-bold text-neutral-900">45 ms</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-neutral-700">Stres Kognitif</span>
                  <Badge variant="success" size="sm">Rendah</Badge>
                </div>
              </CardBody>
            </Card>

            {/* Level Progress */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900">Level 5</h3>
                  <Badge variant="info" size="sm">Master Learner</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                <ProgressBar value={94} label="XP Progress" variant="gradient" size="lg" />
                <div className="text-xs text-neutral-600 text-center">
                  <p className="font-semibold">160 XP menuju Level 6</p>
                  <p className="text-neutral-500 mt-1">(Deep Thinker)</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            Pencapaian & Medal - Koleksi Badge Kognitif
          </h2>
          <Card variant="elevated">
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: '🛡️',
                    title: 'Fokus Baja',
                    desc: '>90m tanpa distraksi',
                    progress: 100,
                    status: 'Unlocked',
                  },
                  {
                    icon: '🔥',
                    title: '7 Hari Konsisten',
                    desc: 'Streak mingguan penuh',
                    progress: 100,
                    status: 'Unlocked',
                  },
                  {
                    icon: '🧘',
                    title: 'Zen Master',
                    desc: 'Theta stabil 20/30 sesi',
                    progress: 66,
                    status: 'In Progress',
                  },
                  {
                    icon: '🔬',
                    title: 'Alpha Pioneer',
                    desc: 'Kondisi tenang di bawah uji',
                    progress: 0,
                    status: 'Locked',
                  },
                  {
                    icon: '📚',
                    title: 'Knowledge Seeker',
                    desc: 'Selesaikan 50 modul',
                    progress: 0,
                    status: 'Locked',
                  },
                  {
                    icon: '🚀',
                    title: 'Speed Learner',
                    desc: 'Capai 85%+ akurasi',
                    progress: 0,
                    status: 'Locked',
                  },
                ].map((achievement, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-5xl mb-2 ${achievement.status === 'Locked' ? 'opacity-30' : ''}`}>
                      {achievement.icon}
                    </div>
                    <p className="font-semibold text-neutral-900 text-sm">{achievement.title}</p>
                    <p className="text-xs text-neutral-600 mt-1">{achievement.desc}</p>
                    {achievement.progress > 0 && (
                      <div className="mt-2">
                        <ProgressBar value={achievement.progress} label="" variant="success" size="sm" showLabel={false} />
                        <p className="text-xs text-neutral-500 mt-1">{achievement.progress}%</p>
                      </div>
                    )}
                    <Badge
                      variant={
                        achievement.status === 'Unlocked' ? 'success' : achievement.status === 'In Progress' ? 'warning' : 'default'
                      }
                      size="sm"
                      className="mt-2"
                    >
                      {achievement.status === 'Locked' ? '🔒 Terkunci' : achievement.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Course Modules Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Modul Pembelajaran Tersedia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
                desc: 'Pelajari konsep dasar fisika kuantum dengan fokus pada sifat dual partikel.',
                progress: 65,
                difficulty: 'Menengah',
              },
              {
                title: 'Biologi Sel & Mekanisme Replikasi',
                desc: 'Memahami proses mitosis, meiosis, dan mekanisme replikasi DNA.',
                progress: 0,
                difficulty: 'Lanjut',
              },
              {
                title: 'Kimia Organik: Sintesis & Transformasi',
                desc: 'Strategi umum sintesis & reaksi penting dalam kimia organik.',
                progress: 45,
                difficulty: 'Menengah',
              },
              {
                title: 'Graft Langsung & Struktur Data & Algoritma',
                desc: 'Struktur data grafis & algoritma traversal dalam implementasi.',
                progress: 0,
                difficulty: 'Lanjut',
              },
            ].map((module, idx) => (
              <Card key={idx} variant="elevated">
                <CardHeader>
                  <h3 className="font-bold text-neutral-900 text-sm">{module.title}</h3>
                </CardHeader>
                <CardBody className="space-y-3">
                  <p className="text-sm text-neutral-600">{module.desc}</p>
                  {module.progress > 0 && (
                    <>
                      <ProgressBar value={module.progress} label="Progres" variant="success" size="md" />
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={module.difficulty === 'Lanjut' ? 'error' : 'warning'} size="sm">
                      {module.difficulty}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {module.progress > 0 ? 'Lanjutkan' : 'Mulai'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-neutral-500 text-xs">
          <p>
            🧠 AI-powered cognitive diagnostics • Real-time EEG analysis • Adaptive learning pathways • © 2024 NERA
            Neuro-Adaptive Platform
          </p>
        </div>
      </div>
    </div>
  );
}
