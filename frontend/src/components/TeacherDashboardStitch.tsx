'use client';

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  AlertCircle,
  Download,
  MoreVertical,
  BookOpen,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';

export function TeacherDashboardStitch() {
  const [selectedClass, setSelectedClass] = useState('XII-MIPA-1');

  const classes = ['XII-MIPA-1', 'XII-MIPA-2', 'XII-IPS-1', 'XI-MIPA-1'];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <p className="text-xs md:text-sm text-green-600 font-semibold tracking-wide">
            MANAJEMEN KELAS & PEMBELAJARAN
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
            Dashboard Guru & Konselor: Pemantauan Fokus Kelas {selectedClass}
          </h1>
          <p className="text-neutral-600 text-sm mt-1 max-w-2xl">
            Real-time monitoring fokus kognitif kelas untuk optimalisasi pembelajaran dan intervensi personal.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Class Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {classes.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedClass === cls
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Siswa Aktif"
            value={32}
            unit="/ 34"
            change={{ value: 2, direction: 'down', period: 'sakit & libur' }}
            icon="👥"
            variant="default"
          />
          <StatCard
            title="Fokus Rata-rata"
            value={78}
            unit="/100"
            change={{ value: 5, direction: 'up', period: 'minggu lalu' }}
            icon="🧠"
            variant="highlight"
          />
          <StatCard
            title="Retensi Normal"
            value={44}
            unit="%"
            description="Performa akademik"
            icon="📊"
            variant="default"
          />
          <StatCard
            title="Siswa Perlu Bantuan"
            value={2}
            unit="Segera"
            description="Prioritas intervensi"
            icon="⚠️"
            variant="default"
          />
        </div>

        {/* Heatmap Denah Siswa */}
        <Card variant="elevated" className="mb-8">
          <CardHeader>
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Denah Heatmap Meja Siswa
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              (34 Meja) - Dilihat berdasarkan Tingkat Fokus & Kesiapan Kognitif
            </p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 34 }).map((_, idx) => {
                const focusLevel = Math.random();
                let bgColor = 'bg-neutral-200';
                if (focusLevel > 0.8) bgColor = 'bg-green-500';
                else if (focusLevel > 0.6) bgColor = 'bg-green-200';
                else if (focusLevel > 0.4) bgColor = 'bg-yellow-200';
                else if (focusLevel > 0.2) bgColor = 'bg-orange-200';
                else bgColor = 'bg-red-200';

                return (
                  <div
                    key={idx}
                    className={`aspect-square ${bgColor} rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer hover:shadow-lg transition-shadow`}
                    title={`Siswa ${idx + 1}: ${Math.round(focusLevel * 100)}% fokus`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <p className="text-xs font-semibold text-neutral-600 mb-3">Legenda Tingkat Fokus</p>
              <div className="flex gap-4 flex-wrap text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-200" />
                  <span>Sangat Rendah (&lt;20%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-200" />
                  <span>Rendah (20-40%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-200" />
                  <span>Sedang (40-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-200" />
                  <span>Tinggi (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span>Sangat Tinggi (&gt;80%)</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Siswa dengan Fokus Tinggi */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Siswa Top Performer
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { name: 'Aisyah Inayati Putri', focus: 95, modul: 28 },
                { name: 'Budi Santoso', focus: 92, modul: 26 },
                { name: 'Citra Dewi Lestari', focus: 90, modul: 24 },
              ].map((student, idx) => (
                <div key={idx} className="pb-3 border-b border-neutral-200 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm text-neutral-900">{student.name}</p>
                    <Badge variant="success" size="sm">
                      ⭐ Top
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-600">Fokus</span>
                      <span className="font-semibold">{student.focus}%</span>
                    </div>
                    <ProgressBar value={student.focus} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Siswa yang Perlu Bantuan */}
          <Card variant="elevated" className="border-l-4 border-l-red-500">
            <CardHeader>
              <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Siswa Perlu Intervensi
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { name: 'Dedi Hermawan', focus: 28, status: 'Urgent' },
                { name: 'Eka Putri Wijaya', focus: 35, status: 'Warning' },
              ].map((student, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${
                    student.status === 'Urgent'
                      ? 'bg-red-50 border-l-red-500'
                      : 'bg-yellow-50 border-l-yellow-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm text-neutral-900">{student.name}</p>
                    <Badge
                      variant={student.status === 'Urgent' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-600">Fokus Saat Ini</span>
                    <span className="font-semibold">{student.focus}%</span>
                  </div>
                  <ProgressBar value={student.focus} />
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    👨‍🏫 Intervensi Personal
                  </Button>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Analisis Kelas */}
          <Card variant="elevated">
            <CardHeader>
              <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Rekomendasi Kelas
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900 font-semibold mb-1">📌 Kondisi Ideal Tersedia</p>
                <p className="text-xs text-blue-700">
                  09:00 - 11:30 WIB adalah jendela waktu optimal untuk pembelajaran kompleks di kelas ini
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-900 font-semibold mb-1">✓ Fokus Stabil</p>
                <p className="text-xs text-green-700">
                  Rata-rata fokus 78% menunjukkan kelas responsif terhadap pembelajaran
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-900 font-semibold mb-1">⚠️ Perhatian Diperlukan</p>
                <p className="text-xs text-yellow-700">
                  2 siswa memerlukan intervensi personal untuk kembali fokus
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
