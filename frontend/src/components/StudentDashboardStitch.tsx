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
  Activity,
  Award,
  Flame,
  Clock,
  Signal,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';

export function StudentDashboardStitch() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week');

  const heatmapData = [
    [5, 8, 9, 7, 8, 6, 0],
    [8, 9, 8, 9, 7, 8, 4],
    [7, 8, 7, 9, 8, 7, 2],
    [9, 9, 8, 7, 8, 6, 1],
  ];

  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-neutral-800';
    if (value < 3) return 'bg-accent-error/30';
    if (value < 6) return 'bg-accent-warning/30';
    if (value < 8) return 'bg-primary/40';
    return 'bg-primary';
  };

  const brainWaves = [
    { name: 'Beta (18-24 Hz)', value: 92, color: 'text-secondary', label: 'Fokus Optimal' },
    { name: 'Alpha (8-12 Hz)', value: 65, color: 'text-accent-success', label: 'Relaksasi' },
    { name: 'Theta (4-8 Hz)', value: 35, color: 'text-accent-warning', label: 'Kreativitas' },
  ];

  return (
    <div className="bg-bg-default text-text-default min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-elevated/95 border-b border-border-color backdrop-blur-md">
        <div className="container-max py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge className="badge-primary mb-3">
                <Signal className="w-3 h-3" />
                LAPORAN BIOMETRIK & KOGNITIF
              </Badge>
              <h1 className="text-h2 mt-2">Dashboard Analitik Pembelajaran</h1>
              <p className="text-text-secondary text-base mt-2 max-w-2xl">
                Insights mendalam tentang pola kognitif, konsistensi fokus, dan rekomendasi personalisasi berdasarkan data EEG real-time.
              </p>
            </div>
            <Button className="button-primary button-sm">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'semester'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-bg-surface text-text-secondary border border-border-color hover:border-primary/50'
                }`}
              >
                {range === 'week' ? '7 Hari' : range === 'month' ? '30 Hari' : 'Semester'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container-max py-8">
        {/* Top Metrics - 4 Column Grid */}
        <div className="grid-4 mb-8">
          <Card className="card">
            <div className="flex items-start justify-between mb-4">
              <Flame className="w-6 h-6 text-accent-error" />
              <span className="text-xs font-semibold text-primary">↑ 8%</span>
            </div>
            <div className="text-label text-text-muted mb-1">Rerata Fokus</div>
            <div className="text-4xl font-bold text-text-default">79</div>
            <div className="text-sm text-text-secondary mt-2">vs minggu lalu +8%</div>
          </Card>

          <Card className="card">
            <div className="flex items-start justify-between mb-4">
              <Award className="w-6 h-6 text-secondary" />
              <Badge className="badge-primary">Level 5</Badge>
            </div>
            <div className="text-label text-text-muted mb-1">Level Kognitif</div>
            <div className="text-4xl font-bold text-text-default">Master</div>
            <div className="text-sm text-text-secondary mt-2">2,840 / 3,000 XP</div>
          </Card>

          <Card className="card">
            <div className="flex items-start justify-between mb-4">
              <Clock className="w-6 h-6 text-accent-info" />
              <span className="text-xs font-semibold text-accent-info">↑ +4h</span>
            </div>
            <div className="text-label text-text-muted mb-1">Waktu Flow Kognitif</div>
            <div className="text-4xl font-bold text-text-default">18h 45m</div>
            <div className="text-sm text-text-secondary mt-2">Minggu ini via EEG Band</div>
          </Card>

          <Card className="card">
            <div className="flex items-start justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <Badge className="badge-primary">7 Hari</Badge>
            </div>
            <div className="text-label text-text-muted mb-1">Streak Konsistensi</div>
            <div className="text-4xl font-bold text-primary">7</div>
            <div className="text-sm text-text-secondary mt-2">Fokus Konsisten 🔥</div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Heatmap & Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Heatmap Section */}
            <Card className="card-elevated">
              <CardHeader>
                <h2 className="text-h4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  Distribusi Jam Fokus Harian
                </h2>
                <p className="text-sm text-text-secondary mt-2">Fluktuasi konsentrasi mendalam berdasarkan pembacaan sensor EEG</p>
              </CardHeader>
              <CardBody className="space-y-6">
                {heatmapData.map((weekData, weekIdx) => (
                  <div key={weekIdx}>
                    <div className="text-sm font-semibold text-text-secondary mb-3 flex items-center justify-between">
                      <span>{weeks[weekIdx]}</span>
                      <span className="text-xs text-text-muted">{weekData.reduce((a, b) => a + b)} jam</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {weekData.map((value, dayIdx) => (
                        <div key={dayIdx} className="group">
                          <div
                            className={`h-16 rounded-lg ${getHeatmapColor(value)} flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer border border-border-color hover:border-primary`}
                            title={`${days[dayIdx]}: ${value} jam`}
                          >
                            <span className="text-xs font-bold text-text-default">{value}h</span>
                            <span className="text-xs text-text-muted">{days[dayIdx]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Brain Waves Chart Section */}
            <Card className="card-elevated">
              <CardHeader>
                <h2 className="text-h4 flex items-center gap-3">
                  <Brain className="w-5 h-5 text-primary" />
                  Status Gelombang Otak Real-Time
                </h2>
                <p className="text-sm text-text-secondary mt-2">Aktivitas neural current monitoring</p>
              </CardHeader>
              <CardBody className="space-y-6">
                {brainWaves.map((wave, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-default">{wave.name}</span>
                      <span className={`text-sm font-bold ${wave.color}`}>{wave.value}%</span>
                    </div>
                    <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          wave.name.includes('Beta') ? 'bg-secondary' :
                          wave.name.includes('Alpha') ? 'bg-accent-success' :
                          'bg-accent-warning'
                        }`}
                        style={{ width: `${wave.value}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-text-muted mt-1">{wave.label}</div>
                  </div>
                ))}

                {/* Peak Time Insight */}
                <div className="mt-6 pt-6 border-t border-border-color">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-text-default mb-1">Peak Focus Zone (09:00 - 11:30)</p>
                      <p className="text-sm text-text-secondary">Zona Beta 18-24 Hz dengan presisi 92%. Jadwalkan materi kompleks pada waktu ini.</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Insights & Recommendations */}
          <div className="space-y-8">
            {/* Konsistensi Belajar */}
            <Card className="card-elevated">
              <CardHeader>
                <h3 className="text-h4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Konsistensi Belajar
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Hari Aktif</span>
                    <span className="text-2xl font-bold text-primary">28/30</span>
                  </div>
                  <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                    <div className="h-full w-11/12 bg-primary rounded-full"></div>
                  </div>
                  <p className="text-xs text-text-muted">Aktivitas kognitif 30 hari terakhir</p>
                  
                  <div className="pt-4 border-t border-border-color">
                    <p className="text-xs font-semibold text-accent-success mb-2">✓ Habit Neuroplastic Terbentuk!</p>
                    <p className="text-xs text-text-secondary">Stabilitas fokus Anda meningkat 14% di jam pagi.</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* AI Recommendations */}
            <Card className="card-elevated border-primary/30">
              <CardHeader>
                <h3 className="text-h4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-secondary" />
                  Wawasan Otak & Rekomendasi
                </h3>
                <Badge className="badge-primary mt-2">MODEL NERA-V3.4</Badge>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="p-4 bg-bg-surface rounded-lg border border-border-color">
                  <p className="text-sm font-semibold text-text-default mb-2">📍 Jam Emas Kognitif: 08:30 – 10:15 WIB</p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Sensor mendeteksi gelombang Beta tertinggi Anda tercapai konsisten di interval ini dengan kapasitas memori kerja 100%.
                  </p>
                </div>

                <div className="p-4 bg-bg-surface rounded-lg border border-accent-warning/30">
                  <p className="text-sm font-semibold text-accent-warning mb-2">⚠️ Deteksi Kelelahan</p>
                  <p className="text-xs text-text-secondary">Lonjakan Theta setelah 45 menit. Adopsi Pomodoro 45/10.</p>
                </div>

                <Button className="button-primary w-full button-sm">
                  Atur Jadwal Otomatis
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardBody>
            </Card>

            {/* Target Progress */}
            <Card className="card-elevated bg-gradient-dark">
              <CardHeader>
                <h3 className="text-h4">Target Mingguan</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-secondary mb-2">Menuju Level 6</p>
                    <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-xs text-text-muted mt-2">160 XP Lagi</p>
                  </div>
                  
                  <div className="pt-4 border-t border-border-color">
                    <p className="text-sm text-text-secondary mb-3">Langkah selanjutnya:</p>
                    <Button className="button-primary w-full button-sm">
                      Mulai Sesi Fokus Pagi
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-bg-elevated/50 rounded-xl p-8 border border-border-color">
          <h3 className="text-h4 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Lencana & Pencapaian Gamifikasi
          </h3>
          <p className="text-sm text-text-secondary mb-6">3 dari 8 Lencana Terbuka • Peringkat #3 Kelas Kognitif</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🛡️', title: 'Fokus Baja', status: 'UNLOCKED', progress: '100% Selesai' },
              { icon: '🔥', title: '7 Hari Konsisten', status: 'UNLOCKED', progress: '7 / 7 Hari' },
              { icon: '🧘', title: 'Zen Master', status: 'LEVEL 2/3', progress: '66% - 4 / 6 Sesi' },
              { icon: '🌊', title: 'Alpha Wave Pioneer', status: 'TERKUNCI', progress: '18.75 / 20 Jam' },
            ].map((badge, idx) => (
              <Card key={idx} className="card text-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-sm font-semibold text-text-default mb-1">{badge.title}</p>
                <Badge className={badge.status === 'UNLOCKED' ? 'badge-success' : badge.status === 'TERKUNCI' ? 'badge-error' : 'badge-warning'}>
                  {badge.status}
                </Badge>
                <p className="text-xs text-text-muted mt-2">{badge.progress}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
