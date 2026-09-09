'use client';

import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  Brain,
  Clock,
  Zap,
  Award,
  ChevronRight,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { Heatmap } from '@/components/ui/Heatmap';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Mock heatmap data - represents focus zones by hour
  const focusHeatmapData = [
    [45, 52, 58, 65, 78, 82, 88, 85, 72, 68, 62, 55],
    [48, 55, 61, 68, 81, 85, 90, 87, 75, 70, 65, 58],
    [50, 57, 63, 70, 82, 86, 88, 84, 73, 68, 62, 56],
    [42, 49, 55, 62, 75, 79, 85, 82, 70, 65, 59, 52],
    [35, 42, 48, 55, 68, 72, 78, 75, 63, 58, 52, 45],
    [38, 45, 51, 58, 71, 75, 81, 78, 66, 61, 55, 48],
    [52, 59, 65, 72, 85, 89, 93, 90, 78, 73, 67, 60],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              ANALITIK PEMBELAJARAN
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
            Kapasitas Pembelajaran & Perjalanan Fokus Anda
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Melacak pola konsentrasi harian, misi AI, dan pencapaian pembelajaran neuro-adaptif.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
              }`}
            >
              {range === '7d' && '7 Hari'}
              {range === '30d' && '30 Hari'}
              {range === '90d' && '90 Hari'}
            </button>
          ))}
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tingkat Fokus Rata-rata"
            value="78"
            unit="%"
            change={{ value: 12, direction: 'up', period: 'vs minggu lalu' }}
            icon="🧠"
            variant="highlight"
          />
          <StatCard
            title="Konsistensi Harian"
            value="7"
            unit="hari"
            description="Anda telah belajar 7 hari berturut-turut"
            icon="🔥"
            change={{ value: 3, direction: 'up', period: 'rekor pribadi' }}
          />
          <StatCard
            title="Tingkat Energi"
            value="Level 5"
            description="Energi mental Anda dalam puncak"
            icon="⚡"
          />
          <StatCard
            title="Zona Konsentrasi"
            value="4"
            unit="zona"
            description="Pola optimal diidentifikasi AI NERA"
            icon="🎯"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Heatmap - Fokus Konsistensi */}
          <div className="lg:col-span-2">
            <ChartContainer
              title="Peta Panas Konsistensi Fokus"
              description="Pola konsentrasi per jam untuk setiap hari dalam minggu"
            >
              <Heatmap
                data={focusHeatmapData}
                labels={{
                  rows: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
                  cols: ['06', '08', '10', '12', '14', '16', '18', '20', '22', '00', '02', '04'],
                }}
              />
            </ChartContainer>
          </div>

          {/* Daily Focus Distribution */}
          <div className="space-y-6">
            <ChartContainer
              title="Distribusi Fokus Harian"
              description="Breakdown waktu konsentrasi"
              action={<BarChart3 className="w-5 h-5 text-teal-600" />}
            >
              <div className="space-y-4">
                {[
                  { label: 'Sangat Fokus', value: 35, color: 'bg-green-600' },
                  { label: 'Fokus', value: 28, color: 'bg-green-400' },
                  { label: 'Moderat', value: 22, color: 'bg-yellow-400' },
                  { label: 'Terdistraksi', value: 15, color: 'bg-orange-400' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                      <span className="text-sm font-bold text-neutral-900">{item.value}%</span>
                    </div>
                    <ProgressBar value={item.value} label="" variant="success" size="sm" showLabel={false} />
                  </div>
                ))}
              </div>
            </ChartContainer>

            {/* AI Recommendation */}
            <Card variant="elevated" className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-200">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  💡 Rekomendasi AI NERA
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-start gap-2 pb-3 border-b border-green-200">
                  <Badge variant="success" size="sm">
                    Puncak
                  </Badge>
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-900">08:00-10:00 Optimal</p>
                    <p className="text-neutral-600 text-xs">Mulai tugas kompleks di waktu ini</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 pb-3 border-b border-green-200">
                  <Badge variant="warning" size="sm">
                    Risiko
                  </Badge>
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-900">14:00-15:00 Rawan</p>
                    <p className="text-neutral-600 text-xs">Ambil istirahat atau pindah aktivitas</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="info" size="sm">
                    Saran
                  </Badge>
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-900">Kurangi Blue Light 21:00</p>
                    <p className="text-neutral-600 text-xs">Tingkatkan kualitas tidur malam</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Missions & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Missions */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Misi Aktif Mingguan
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                {
                  title: 'Fokus Konsisten 45 Menit',
                  progress: 32,
                  reward: '+150 XP',
                  icon: '🎯',
                },
                {
                  title: 'Pelajaran Tanpa Distraksi',
                  progress: 5,
                  reward: '+200 XP',
                  icon: '🔒',
                },
                {
                  title: 'Jam Belajar Kumulatif',
                  progress: 8,
                  reward: '+100 XP',
                  icon: '⏰',
                },
              ].map((mission, idx) => (
                <div key={idx} className="pb-4 border-b border-neutral-200 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-xl">{mission.icon}</span>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{mission.title}</p>
                        <p className="text-xs text-neutral-600">{mission.reward}</p>
                      </div>
                    </div>
                  </div>
                  <ProgressBar
                    value={mission.progress}
                    max={50}
                    label=""
                    variant="gradient"
                    size="sm"
                    showLabel={false}
                  />
                  <p className="text-xs text-neutral-500 mt-1">{mission.progress}/50</p>
                </div>
              ))}
            </CardBody>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Lihat Semua Misi <ChevronRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Achievements Unlocked */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Pencapaian Terbaru
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji: '🏆', title: 'Juara Fokus', desc: '7 hari berturut-turut' },
                  { emoji: '🚀', title: 'Roket Dimulai', desc: '3 sesi pertama' },
                  { emoji: '🎓', title: 'Akademik', desc: 'Habiskan 10 jam belajar' },
                  { emoji: '⭐', title: 'Bintang Naik', desc: '80%+ fokus konsistensi' },
                  { emoji: '💪', title: 'Kebiasaan Besi', desc: 'Akses 5x seminggu' },
                  { emoji: '🔥', title: 'Api Fokus', desc: 'Capai puncak energi' },
                ].map((achievement, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <p className="text-3xl mb-1">{achievement.emoji}</p>
                    <p className="text-xs font-bold text-neutral-900">{achievement.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{achievement.desc}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Focus Trend Chart */}
        <Card variant="elevated">
          <CardHeader>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-teal-600" />
              Tren Fokus 7 Hari
            </h2>
            <p className="text-sm text-neutral-600 mt-1">Rata-rata tingkat konsentrasi per hari</p>
          </CardHeader>
          <CardBody className="h-64 flex items-end justify-between gap-2 px-4 py-8 bg-neutral-50 rounded-lg">
            {[
              { day: 'Sen', value: 65, label: '65%' },
              { day: 'Sel', value: 72, label: '72%' },
              { day: 'Rab', value: 68, label: '68%' },
              { day: 'Kam', value: 75, label: '75%' },
              { day: 'Jum', value: 82, label: '82%' },
              { day: 'Sab', value: 88, label: '88%' },
              { day: 'Min', value: 78, label: '78%' },
            ].map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-teal-500 rounded-t-lg transition-all hover:shadow-lg"
                    style={{ height: `${(day.value / 100) * 200}px` }}
                  />
                </div>
                <p className="text-xs font-bold text-neutral-900">{day.label}</p>
                <p className="text-xs text-neutral-600">{day.day}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Footer Insights */}
        <div className="mt-12 bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '📈',
                title: 'Tren Positif',
                desc: 'Fokus meningkat 12% dibanding minggu lalu',
              },
              {
                icon: '🕐',
                title: 'Waktu Terbaik',
                desc: 'Produktivitas puncak antara 08:00-10:00',
              },
              {
                icon: '✨',
                title: 'Kontrol Anda',
                desc: 'Gunakan insights untuk optimasi pembelajaran',
              },
            ].map((insight, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-3xl flex-shrink-0">{insight.icon}</span>
                <div>
                  <p className="font-semibold text-neutral-900 mb-1">{insight.title}</p>
                  <p className="text-sm text-neutral-600">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-neutral-500 text-xs">
          <p>
            🔒 Semua data pembelajaran terenkripsi end-to-end • Tidak ada data yang dibagikan ke pihak ketiga • ©
            2024 NERA Neuro-Adaptive Platform
          </p>
        </div>
      </div>
    </div>
  );
}
