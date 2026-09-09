'use client';

import React, { useState } from 'react';
import {
  Bluetooth,
  Battery,
  Bell,
  Settings,
  Play,
  CheckCircle,
  BookOpen,
  Brain,
  Zap,
  Timer,
  Users,
  Volume2,
  Eye,
  Lightbulb,
  Menu,
  X,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function StudentDashboardMobile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - Mobile */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-neutral-100 rounded-lg">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-neutral-900">NERA</span>
            </div>
          </div>

          {/* Right: Notifications & Avatar */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <img
              src="https://i.pravatar.cc/32?img=1"
              alt="Avatar"
              className="w-8 h-8 rounded-full border-2 border-green-600"
            />
          </div>
        </div>

        {/* Hardware Status Bar */}
        <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Bluetooth className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">Terkoneksi</span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="w-4 h-4 text-green-600" />
              <span className="text-green-700">84%</span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-green-600 cursor-pointer hover:text-green-700" />
        </div>
      </header>

      <main className="pb-24">
        {/* Circadian Window & Cognitive Peak */}
        <section className="p-4 space-y-4">
          {/* Circadian Status */}
          <Card variant="elevated">
            <CardBody className="bg-gradient-to-br from-yellow-50 to-orange-50 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-yellow-700" />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Jendela Sirkadian Aktif</p>
                  <p className="text-sm font-bold text-neutral-900">09:00 - 11:30 WIB</p>
                </div>
              </div>
              <div className="text-xs text-neutral-700">
                ✨ Puncak Kognitif Pagi - Waktu terbaik untuk pembelajaran kompleks
              </div>
            </CardBody>
          </Card>

          {/* Cognitive Baseline */}
          <div className="flex gap-4">
            <Card variant="elevated" className="flex-1">
              <CardBody className="text-center space-y-2">
                <p className="text-xs text-neutral-600">Baseline Hari Ini</p>
                <p className="text-3xl font-bold text-green-600">81.4</p>
                <p className="text-xs text-neutral-700">/100</p>
              </CardBody>
            </Card>

            <Card variant="elevated" className="flex-1">
              <CardBody className="text-center space-y-2">
                <p className="text-xs text-neutral-600">Status EEG</p>
                <Zap className="w-6 h-6 text-blue-500 mx-auto" />
                <p className="text-xs font-medium text-neutral-900">Optimal</p>
              </CardBody>
            </Card>
          </div>

          {/* EEG Insights */}
          <Card variant="outlined">
            <CardBody className="space-y-2">
              <div className="flex items-start gap-2">
                <Volume2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                <div className="text-xs">
                  <p className="font-medium text-neutral-900">Pita frekuensi Beta-rendah (14-18 Hz) optimal</p>
                  <p className="text-neutral-600">untuk retensi spasial ✓</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Today's Modules */}
        <section className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">Modul Terpilih Hari Ini</h2>
            <div className="flex gap-2">
              {['Semua', 'Sains', 'Math', 'Bio'].map((tag) => (
                <button
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 hover:bg-green-200 font-medium"
                >
                  {tag === 'Semua' ? '✓ ' + tag : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Module */}
          <Card variant="elevated">
            <CardBody className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" size="sm" className="mb-2">
                    EEG: Harmonik Alpha
                  </Badge>
                  <h3 className="font-bold text-neutral-900">Fisika Kuantum: Dualitas Gelombang-Partikel</h3>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-neutral-600">
                Eksplorasi eksperimen celah ganda adaptif yang menyesuaikan visualisasi partikel saat sensor NERA
                mendeteksi kedalaman fokus Anda.
              </p>

              {/* Stats */}
              <div className="flex gap-3 py-3 border-t border-neutral-200">
                <div className="text-center flex-1">
                  <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600">+1.4k</p>
                  <p className="text-xs font-medium">siswa aktif</p>
                </div>
                <div className="text-center flex-1">
                  <Brain className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600">92%</p>
                  <p className="text-xs font-medium">Kesiapan</p>
                </div>
                <div className="text-center flex-1">
                  <Zap className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                  <p className="text-xs text-neutral-600">85%</p>
                  <p className="text-xs font-medium">Sinkronisasi</p>
                </div>
              </div>

              {/* Start Button */}
              <Button variant="primary" className="w-full mt-2">
                <Play className="w-4 h-4" />
                Mulai Belajar dengan Headband
              </Button>
            </CardBody>
          </Card>

          {/* Other Modules */}
          <div className="space-y-3">
            {[
              {
                icon: <Lightbulb className="w-4 h-4" />,
                eeg: 'Alpha Stabil',
                category: 'Matematika Terapan',
                title: 'Kalkulus Diferensial Lanjut',
                desc: 'Optimasi turunan parsial multivariabel dengan representasi topologi 3D interaktif real-time.',
                time: '45m',
                level: '3',
              },
              {
                icon: <Brain className="w-4 h-4" />,
                eeg: 'Theta Dalam',
                category: 'Biologi & Neurosains',
                title: 'Biologi Sel & Neurotransmiter',
                desc: 'Mekanisme transmisi vesikel sinaptik dan potensial aksi dopaminergik dengan simulasi mikroskopis.',
                time: '28m',
                level: '2',
              },
            ].map((module, idx) => (
              <Card key={idx} variant="outlined">
                <CardBody className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center">{module.icon}</div>
                    <div className="flex-1">
                      <Badge variant="primary" size="sm" className="mb-1">
                        {module.eeg}
                      </Badge>
                      <p className="text-xs text-neutral-600 font-medium">{module.category}</p>
                      <p className="font-bold text-neutral-900 text-sm">{module.title}</p>
                      <p className="text-xs text-neutral-600 mt-1">{module.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                    <div className="flex gap-3 text-xs text-neutral-600">
                      <span>⏱️ {module.time}</span>
                      <span>⚡ Tingkat {module.level}</span>
                    </div>
                    <Button variant="secondary" size="sm">
                      Buka Modul →
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Sensor Check */}
          <Card variant="outlined" className="bg-yellow-50 border-yellow-200">
            <CardBody className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="text-sm">
                  <p className="font-medium text-neutral-900">Sensor Kurang Menempel?</p>
                  <p className="text-xs text-neutral-700">Periksa impedansi elektrode dahi Anda</p>
                  <Button variant="primary" size="sm" className="mt-2">
                    Kalibrasi Ulang
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { icon: BookOpen, label: 'Beranda' },
            { icon: Menu, label: 'Modul' },
            { icon: BarChart3, label: 'Statistik' },
            { icon: Zap, label: 'Hardware' },
          ].map(({ icon: Icon, label }, idx) => (
            <button key={idx} className="flex flex-col items-center gap-1 p-2 hover:bg-neutral-50 rounded-lg flex-1">
              <Icon className={`w-5 h-5 ${idx === 0 ? 'text-green-600' : 'text-neutral-600'}`} />
              <span className={`text-xs font-medium ${idx === 0 ? 'text-green-600' : 'text-neutral-600'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="w-64 h-screen bg-white p-6 space-y-6">
            <h3 className="font-bold text-neutral-900">Menu</h3>
            {/* Add sidebar items here */}
          </div>
        </div>
      )}
    </div>
  );
}

import { AlertCircle, BarChart3 } from 'lucide-react';
