'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Brain,
  AlertCircle,
  Download,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';

export function StudentDashboardStitch() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Heatmap data (weekly)
  const heatmapData = [
    [5, 8, 9, 7, 8, 6, 0], // Week 1
    [8, 9, 8, 9, 7, 8, 4], // Week 2
    [7, 8, 7, 9, 8, 7, 2], // Week 3
    [9, 9, 8, 7, 8, 6, 1], // Week 4
  ];

  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-neutral-100';
    if (value < 3) return 'bg-red-100';
    if (value < 6) return 'bg-yellow-100';
    if (value < 8) return 'bg-green-100';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs md:text-sm text-green-600 font-semibold tracking-wide">
                LAPORAN BIOMETRIK & KOGNITIF
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                Dashboard Analitik Pembelajaran
              </h1>
              <p className="text-neutral-600 text-sm mt-1 max-w-2xl">
                Insights mendalam tentang pola kognitif, konsistensi fokus, dan rekomendasi personalisasi.
              </p>
            </div>
            <Button variant="secondary" size="md">
              <Download className="w-4 h-4" />
              Unduh Laporan PDF
            </Button>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
                }`}
              >
                {range === 'week' ? '7 Hari' : '30 Hari'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Top Metrics - 4 Column Grid */}
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
            variant="default"
          />
          <StatCard
            title="Modul Diselesaikan"
            value="23"
            unit="/ 40"
            change={{ value: 3, direction: 'up', period: 'bulan ini' }}
            icon="✓"
            variant="default"
          />
          <StatCard
            title="Waktu Belajar"
            value="48"
            unit="Jam"
            change={{ value: 12, direction: 'up', period: 'target +60' }}
            icon="⏱"
            variant="default"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Heatmap */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Denah Heatmap Pola Belajar
                </h2>
              </CardHeader>
              <CardBody className="space-y-6">
                {/* Heatmap Grid */}
                <div className="space-y-3">
                  {heatmapData.map((weekData, weekIdx) => (
                    <div key={weekIdx} className="space-y-2">
                      <p className="text-xs font-semibold text-neutral-600">{weeks[weekIdx]}</p>
                      <div className="flex gap-2">
                        {weekData.map((value, dayIdx) => (
                          <div
                            key={dayIdx}
                            className={`flex-1 h-12 rounded-lg ${getHeatmapColor(value)} flex items-center justify-center relative group cursor-pointer`}
                            title={`${days[dayIdx]}: ${value} jam`}
                          >
                            <span className="text-xs font-semibold text-neutral-700">{value}h</span>
                            <div className="absolute bottom-full left-0 mb-2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                              {days[dayIdx]}: {value} jam belajar
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-600 mb-2">Intensitas Belajar</p>
                  <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-neutral-100" />
                      <span>0 jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-100" />
                      <span>&lt;3 jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-100" />
                      <span>3-6 jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-100" />
                      <span>6-8 jam</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <span>&gt;8 jam</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Cognitive Window */}
            <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardBody className="space-y-3">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Jendela Belajar Optimal
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-neutral-700">
                    <span className="font-semibold">09:00 - 11:30 WIB</span>
                  </p>
                  <p className="text-xs text-neutral-600">
                    Puncak kognitif pagi - Waktu terbaik untuk pembelajaran kompleks
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Focus Capacity */}
            <Card variant="elevated">
              <CardBody className="space-y-3">
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Kapasitas Fokus
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Baseline Hari Ini</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">81.4</span>
                      <span className="text-sm text-neutral-600">/100</span>
                    </div>
                  </div>
                  <ProgressBar value={81.4} />
                </div>
              </CardBody>
            </Card>

            {/* Next Optimal Window */}
            <Card variant="outlined">
              <CardBody className="space-y-2">
                <p className="text-xs text-neutral-600 font-semibold">JENDELA BELAJAR OPTIMAL BERIKUTNYA</p>
                <p className="text-sm font-semibold text-neutral-900">Besok 14:30 - 16:00 WIB</p>
                <p className="text-xs text-neutral-600">
                  Durasi lebih singkat, cocok untuk review dan konsolidasi memori
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Recent Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Modul Terbaru Selesai</h2>
            <button className="text-green-600 font-medium text-sm flex items-center gap-1 hover:text-green-700">
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
                category: 'SAINS & FISIKA',
                duration: '45m',
                completion: 100,
                date: 'Hari ini',
                eeg: 'Alpha Stabil',
              },
              {
                title: 'Kalkulus Diferensial Lanjut',
                category: 'MATEMATIKA TERAPAN',
                duration: '55m',
                completion: 100,
                date: 'Kemarin',
                eeg: 'Beta-rendah',
              },
            ].map((module, idx) => (
              <Card key={idx} variant="outlined">
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-neutral-600 font-semibold">{module.category}</p>
                      <h3 className="font-bold text-neutral-900 text-sm mt-1">{module.title}</h3>
                    </div>
                    <Badge variant="success" size="sm">
                      ✓ Selesai
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>{module.date}</span>
                    <span>{module.duration}</span>
                  </div>
                  <p className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded w-fit">
                    {module.eeg}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Alert Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-neutral-900 mb-1">Konsistensi Belajar Menurun</h3>
            <p className="text-sm text-neutral-700 mb-3">
              Anda belum belajar selama 2 hari terakhir. Mulai dengan modul ringan untuk kembali konsisten.
            </p>
            <Button variant="primary" size="sm">
              Mulai Belajar Sekarang
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
