'use client';

import React, { useState } from 'react';
import { TrendingUp, Download, Filter, Calendar, BarChart3, LineChart as LineChartIcon, Activity, Brain, Users, Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function AnalyticsPageStitch() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');

  const analyticsData = [
    { label: 'Sen', value: 8 },
    { label: 'Sel', value: 9 },
    { label: 'Rab', value: 7 },
    { label: 'Kam', value: 9 },
    { label: 'Jum', value: 8 },
    { label: 'Sab', value: 6 },
    { label: 'Min', value: 4 },
  ];

  const maxValue = Math.max(...analyticsData.map(d => d.value));

  return (
    <div className="bg-bg-default text-text-default min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-elevated/95 border-b border-border-color backdrop-blur-md">
        <div className="container-max py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge className="badge-primary mb-3">
                <BarChart3 className="w-3 h-3" />
                STATISTIK & ANALISIS
              </Badge>
              <h1 className="text-h2 mt-2">Dashboard Analitik Pembelajaran</h1>
            </div>
            <Button className="button-primary button-sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['week', 'month', 'semester'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-primary text-white'
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
        {/* Summary Cards */}
        <div className="grid-4 gap-6 mb-8">
          {[
            { icon: TrendingUp, label: 'Rata-rata Fokus', value: '79%', color: 'text-primary' },
            { icon: Activity, label: 'Waktu Aktif', value: '48 Jam', color: 'text-secondary' },
            { icon: Brain, label: 'Modul Selesai', value: '23/40', color: 'text-accent-success' },
            { icon: Award, label: 'Ranking', value: '#3 Kelas', color: 'text-accent-warning' },
          ].map((stat, idx) => (
            <Card key={idx} className="card">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
              <div className="text-label text-text-muted mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-text-default">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Distribusi Jam Fokus Harian
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {analyticsData.map((data, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-text-secondary">{data.label}</span>
                      <span className="text-sm font-bold text-primary">{data.value}h</span>
                    </div>
                    <div className="h-3 bg-bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(data.value / maxValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Consistency */}
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" />
                Konsistensi Belajar
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">Hari Aktif</span>
                    <span className="text-2xl font-bold text-primary">28/30</span>
                  </div>
                  <div className="h-3 bg-bg-surface rounded-full overflow-hidden">
                    <div className="h-full w-11/12 bg-primary rounded-full"></div>
                  </div>
                </div>

                <div className="p-4 bg-bg-surface rounded-lg border border-border-color">
                  <p className="text-sm font-semibold text-accent-success mb-1">✓ Habit Terbentuk</p>
                  <p className="text-xs text-text-secondary">Stabilitas fokus meningkat 14% di jam pagi</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Brain Waves & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="card-elevated lg:col-span-2">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Wawasan Otak & Rekomendasi AI
              </h2>
              <Badge className="badge-primary mt-2">MODEL NERA-V3.4</Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-bg-surface rounded-lg border border-primary/30">
                  <p className="text-sm font-semibold text-primary mb-2">📍 Zona Beta Optimal</p>
                  <p className="text-xs text-text-secondary">08:30 - 10:15 WIB dengan presisi 92%</p>
                </div>
                <div className="p-4 bg-bg-surface rounded-lg border border-accent-warning/30">
                  <p className="text-sm font-semibold text-accent-warning mb-2">⚠️ Deteksi Kelelahan</p>
                  <p className="text-xs text-text-secondary">Theta shift setelah 45 menit belajar</p>
                </div>
              </div>
              <Button className="button-primary w-full button-sm">
                Terapkan Rekomendasi
              </Button>
            </CardBody>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4">Progress Target</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">Level 6</p>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary"></div>
                </div>
                <p className="text-xs text-text-muted mt-2">160 XP Lagi</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Badges & Achievements */}
        <Card className="card-elevated">
          <CardHeader>
            <h2 className="text-h4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Lencana & Pencapaian
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🛡️', title: 'Fokus Baja', status: 'UNLOCKED' },
                { icon: '🔥', title: 'Konsisten 7 Hari', status: 'UNLOCKED' },
                { icon: '🧘', title: 'Zen Master', status: 'LEVEL 2' },
                { icon: '🌊', title: 'Alpha Pioneer', status: 'TERKUNCI' },
              ].map((badge, idx) => (
                <Card key={idx} className="card text-center p-4">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-xs font-semibold text-text-default mb-2">{badge.title}</p>
                  <Badge className={
                    badge.status === 'UNLOCKED' ? 'badge-success' :
                    badge.status === 'TERKUNCI' ? 'badge-error' :
                    'badge-warning'
                  }>
                    {badge.status}
                  </Badge>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
