'use client';

import React, { useState } from 'react';
import {
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Award,
  Brain,
  Focus,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Heatmap } from '@/components/ui/Heatmap';
import { Table } from '@/components/ui/Table';
import { ChartContainer } from '@/components/ui/ChartContainer';

export function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState('12-IPA-1');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Mock student attention heatmap (8 students x 6 time periods)
  const studentAttentionHeatmap = [
    [78, 82, 75, 68, 72, 65],
    [85, 88, 92, 88, 85, 80],
    [62, 58, 52, 55, 60, 48],
    [90, 92, 88, 85, 89, 92],
    [45, 50, 48, 42, 38, 35],
    [72, 75, 70, 68, 71, 69],
    [88, 85, 82, 79, 83, 86],
    [55, 60, 58, 52, 56, 54],
  ];

  // Mock student data for table
  const studentData = [
    {
      id: 'S001',
      name: 'Ahmad Rizki',
      avgFocus: 82,
      streak: 7,
      focusZone: 'Puncak',
      status: 'Optimal',
      trend: 'up',
    },
    {
      id: 'S002',
      name: 'Bella Kusuma',
      avgFocus: 88,
      streak: 5,
      focusZone: 'Puncak',
      status: 'Luar Biasa',
      trend: 'up',
    },
    {
      id: 'S003',
      name: 'Citra Dewi',
      avgFocus: 52,
      streak: 1,
      focusZone: 'Risiko',
      status: 'Perlu Bantuan',
      trend: 'down',
    },
    {
      id: 'S004',
      name: 'Dedi Gunawan',
      avgFocus: 92,
      streak: 12,
      focusZone: 'Puncak',
      status: 'Juara',
      trend: 'up',
    },
    {
      id: 'S005',
      name: 'Eka Putri',
      avgFocus: 38,
      streak: 0,
      focusZone: 'Kritis',
      status: 'Butuh Intervensi',
      trend: 'down',
    },
    {
      id: 'S006',
      name: 'Fajar Rahman',
      avgFocus: 71,
      streak: 3,
      focusZone: 'Moderat',
      status: 'Berkembang',
      trend: 'up',
    },
    {
      id: 'S007',
      name: 'Gina Santoso',
      avgFocus: 85,
      streak: 8,
      focusZone: 'Puncak',
      status: 'Konsisten',
      trend: 'neutral',
    },
    {
      id: 'S008',
      name: 'Hendra Wijaya',
      avgFocus: 48,
      streak: 2,
      focusZone: 'Rawan',
      status: 'Perlu Perhatian',
      trend: 'down',
    },
  ];

  const focusHistory = [
    { time: '08:00', fp1: 75, fp2: 78, af7: 72, af8: 74 },
    { time: '08:15', fp1: 78, fp2: 82, af7: 75, af8: 77 },
    { time: '08:30', fp1: 82, fp2: 85, af7: 80, af8: 83 },
    { time: '08:45', fp1: 88, fp2: 90, af7: 85, af8: 88 },
    { time: '09:00', fp1: 85, fp2: 87, af7: 83, af8: 85 },
    { time: '09:15', fp1: 80, fp2: 82, af7: 78, af8: 80 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              DASHBOARD GURU & KONSELOR
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
            Pemantauan Kelas & Analisis Kesejahteraan Siswa
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Pantau pola konsentrasi real-time, identifikasi siswa yang membutuhkan intervensi, dan optimalkan
            pembelajaran adaptif.
          </p>
        </div>

        {/* Class Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['12-IPA-1', '12-IPA-2', '12-IPS-1', '11-MIPA', 'Semua Kelas'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                selectedClass === cls
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Siswa"
            value="32"
            change={{ value: 2, direction: 'up', period: 'pendaftar baru' }}
            icon="👥"
            variant="highlight"
          />
          <StatCard
            title="Fokus Rata-rata Kelas"
            value="78"
            unit="%"
            change={{ value: 5, direction: 'up', period: 'vs minggu lalu' }}
            icon="🧠"
          />
          <StatCard
            title="Tingkat Perhatian"
            value="44"
            unit="%"
            change={{ value: 8, direction: 'down', period: 'perlu bantuan' }}
            icon="⚠️"
          />
          <StatCard
            title="Siswa Berprestasi"
            value="8"
            description="Mencapai puncak fokus hari ini"
            icon="🏆"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Attention Heatmap */}
            <ChartContainer
              title="Peta Panas Perhatian Siswa - Periode 2 Jam"
              description="Konsentrasi real-time per siswa sepanjang sesi pembelajaran"
              action={<Filter className="w-5 h-5 text-teal-600 cursor-pointer" />}
            >
              <Heatmap
                data={studentAttentionHeatmap}
                labels={{
                  rows: [
                    'Ahmad R.',
                    'Bella K.',
                    'Citra D.',
                    'Dedi G.',
                    'Eka P.',
                    'Fajar R.',
                    'Gina S.',
                    'Hendra W.',
                  ],
                  cols: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'],
                }}
              />
            </ChartContainer>

            {/* Focus Trend Chart - Multi-line */}
            <ChartContainer
              title="Tren Fokus Zona Multi-Channel"
              description="Perbandingan aktivitas gelombang otak FP1, FP2, AF7, AF8"
            >
              <div className="h-64 flex items-end justify-between gap-4 px-4 py-8 bg-neutral-50 rounded-lg">
                {focusHistory.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full h-40 flex items-end justify-around gap-1">
                      {[
                        { value: data.fp1, color: 'from-red-500' },
                        { value: data.fp2, color: 'from-blue-500' },
                        { value: data.af7, color: 'from-green-500' },
                        { value: data.af8, color: 'from-yellow-500' },
                      ].map((bar, barIdx) => (
                        <div
                          key={barIdx}
                          className={`flex-1 bg-gradient-to-t ${bar.color} to-neutral-200 rounded-t transition-all hover:shadow-lg`}
                          style={{ height: `${(bar.value / 100) * 100}px` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-neutral-900">{data.time}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 justify-center text-xs">
                {[
                  { label: 'FP1', color: 'bg-red-500' },
                  { label: 'FP2', color: 'bg-blue-500' },
                  { label: 'AF7', color: 'bg-green-500' },
                  { label: 'AF8', color: 'bg-yellow-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 ${item.color} rounded`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alerts & Interventions */}
            <Card variant="elevated" className="bg-gradient-to-br from-red-50 to-orange-50 border-orange-200">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Perlu Intervensi
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {studentData
                  .filter((s) => s.status.includes('Butuh'))
                  .map((student) => (
                    <div key={student.id} className="pb-3 border-b border-orange-200 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-neutral-900 text-sm">{student.name}</p>
                        <Badge variant="error" size="sm">
                          {student.avgFocus}%
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-600">{student.status}</p>
                    </div>
                  ))}
              </CardBody>
            </Card>

            {/* Top Performers */}
            <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Siswa Terbaik Hari Ini
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {studentData
                  .filter((s) => s.avgFocus >= 85)
                  .sort((a, b) => b.avgFocus - a.avgFocus)
                  .map((student, idx) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm truncate">
                          {student.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <ProgressBar
                            value={student.avgFocus}
                            label=""
                            variant="success"
                            size="sm"
                            showLabel={false}
                          />
                          <span className="text-xs font-bold text-neutral-700 flex-shrink-0">
                            {student.avgFocus}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardBody>
            </Card>

            {/* Class Statistics */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900">Statistik Kelas</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {[
                  { label: 'Siswa Fokus (80%+)', value: 8, total: 32 },
                  { label: 'Moderat (50-79%)', value: 14, total: 32 },
                  { label: 'Butuh Bantuan (<50%)', value: 10, total: 32 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-700">{stat.label}</span>
                      <span className="text-xs font-bold text-neutral-900">
                        {stat.value}/{stat.total}
                      </span>
                    </div>
                    <ProgressBar
                      value={stat.value}
                      max={stat.total}
                      label=""
                      variant="gradient"
                      size="sm"
                      showLabel={false}
                    />
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Student Performance Table */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-600" />
            Data Detail Siswa
          </h2>
          <Table
            columns={[
              { key: 'name', label: 'Nama Siswa', width: 'w-32' },
              {
                key: 'avgFocus',
                label: 'Fokus Rata-rata',
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={value}
                      label=""
                      variant="gradient"
                      size="sm"
                      showLabel={false}
                    />
                    <span className="font-bold text-neutral-900">{value}%</span>
                  </div>
                ),
              },
              {
                key: 'streak',
                label: 'Konsistensi',
                render: (value) => (
                  <Badge variant={value >= 5 ? 'success' : value >= 3 ? 'warning' : 'error'} size="sm">
                    🔥 {value} hari
                  </Badge>
                ),
              },
              { key: 'focusZone', label: 'Zona Fokus' },
              {
                key: 'status',
                label: 'Status Pembelajaran',
                render: (value) => (
                  <Badge
                    variant={
                      value === 'Luar Biasa' || value === 'Juara'
                        ? 'success'
                        : value === 'Optimal' || value === 'Konsisten'
                        ? 'info'
                        : 'error'
                    }
                    size="sm"
                  >
                    {value}
                  </Badge>
                ),
              },
              {
                key: 'trend',
                label: 'Tren',
                render: (value) => (
                  <span
                    className={
                      value === 'up'
                        ? 'text-green-600 font-bold'
                        : value === 'down'
                        ? 'text-red-600 font-bold'
                        : 'text-neutral-600'
                    }
                  >
                    {value === 'up' ? '📈' : value === 'down' ? '📉' : '➡️'} {value}
                  </span>
                ),
              },
            ]}
            data={studentData}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📊',
              title: 'Ekspor Laporan',
              desc: 'Download analisis mingguan dalam format PDF',
            },
            {
              icon: '💬',
              title: 'Kirim Pesan ke Siswa',
              desc: 'Berikan umpan balik atau motivasi personal',
            },
            {
              icon: '⚙️',
              title: 'Atur Sesi Pembelajaran',
              desc: 'Konfigurasi parameter adaptif untuk kelas',
            },
          ].map((action, idx) => (
            <Card key={idx} variant="elevated">
              <CardBody className="flex gap-4 items-start">
                <span className="text-3xl flex-shrink-0">{action.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{action.title}</p>
                  <p className="text-sm text-neutral-600 mt-1">{action.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-neutral-500 text-xs">
          <p>
            🔒 Semua data siswa dilindungi sesuai GDPR dan peraturan privasi pendidikan • Data hanya untuk
            penggunaan pedagogis • © 2024 NERA Neuro-Adaptive Platform
          </p>
        </div>
      </div>
    </div>
  );
}
