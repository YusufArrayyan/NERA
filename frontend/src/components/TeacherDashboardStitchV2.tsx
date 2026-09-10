'use client';

import React, { useState } from 'react';
import { Users, TrendingUp, Brain, AlertCircle, BarChart3, Filter, Download } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function TeacherDashboardStitchV2() {
  const [filterRole, setFilterRole] = useState<'all' | 'top' | 'need-help'>('all');

  const students = [
    { name: 'Alya Juwita Putri', id: 'STU-001', focus: 79, level: 5, streak: 7, status: 'active' },
    { name: 'Budi Santoso', id: 'STU-002', focus: 72, level: 4, streak: 5, status: 'active' },
    { name: 'Citra Dewi', id: 'STU-003', focus: 85, level: 5, streak: 9, status: 'active' },
    { name: 'Doni Wicaksono', id: 'STU-004', focus: 62, level: 3, streak: 2, status: 'need-help' },
    { name: 'Eka Sari', id: 'STU-005', focus: 91, level: 6, streak: 14, status: 'top' },
  ];

  const filteredStudents = students.filter(s => {
    if (filterRole === 'all') return true;
    if (filterRole === 'top') return s.focus >= 85;
    if (filterRole === 'need-help') return s.focus < 70;
    return true;
  });

  return (
    <div className="bg-bg-default text-text-default min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-elevated/95 border-b border-border-color backdrop-blur-md">
        <div className="container-max py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge className="badge-primary mb-3">
                <Users className="w-3 h-3" />
                GURU & PEDAGOGIK
              </Badge>
              <h1 className="text-h2 mt-2">Dashboard Guru - Monitoring Kelas</h1>
            </div>
            <Button className="button-primary button-sm">
              <Download className="w-4 h-4" />
              Export Laporan
            </Button>
          </div>

          <div className="flex gap-2">
            {(['all', 'top', 'need-help'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  filterRole === role
                    ? 'bg-primary text-white'
                    : 'bg-bg-surface text-text-secondary border border-border-color'
                }`}
              >
                {role === 'all' ? 'Semua Siswa' : role === 'top' ? 'Top Performer' : 'Butuh Bantuan'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container-max py-8">
        {/* Summary Stats */}
        <div className="grid_4 gap-6 mb-8">
          {[
            { label: 'Total Siswa', value: '34', icon: Users },
            { label: 'Rata-rata Fokus', value: '76%', icon: Brain },
            { label: 'Aktif Hari Ini', value: '28', icon: TrendingUp },
            { label: 'Perlu Bantuan', value: '3', icon: AlertCircle },
          ].map((stat, idx) => (
            <Card key={idx} className="card">
              <stat.icon className="w-6 h-6 text-primary mb-4" />
              <div className="text-label text-text-muted mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-text-default">{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Student Grid */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <h2 className="text-h4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Monitoring Siswa Kelas
            </h2>
            <p className="text-sm text-text-secondary mt-2">Data real-time berdasarkan sensor EEG dan aktivitas pembelajaran</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-bg-surface rounded-lg border border-border-color hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-text-default">{student.name}</p>
                      <p className="text-xs text-text-muted">{student.id}</p>
                    </div>
                    <Badge className={
                      student.status === 'top' ? 'badge-success' :
                      student.status === 'need-help' ? 'badge-error' :
                      'badge-primary'
                    }>
                      {student.status === 'top' ? '⭐ Top' : student.status === 'need-help' ? '⚠️ Help' : '✓ Active'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Fokus</p>
                      <p className="text-lg font-bold text-primary">{student.focus}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Level</p>
                      <p className="text-lg font-bold text-secondary">{student.level}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Streak</p>
                      <p className="text-lg font-bold text-accent-success">{student.streak}d</p>
                    </div>
                  </div>

                  <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${student.focus}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Analytics & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Statistik Kelas
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Fokus >= 80%</span>
                  <span className="font-bold text-primary">12 siswa</span>
                </div>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Level 4-5</span>
                  <span className="font-bold text-secondary">18 siswa</span>
                </div>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-secondary"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">Konsisten (7+ hari)</span>
                  <span className="font-bold text-accent-success">24 siswa</span>
                </div>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-accent-success"></div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4">Rekomendasi untuk Guru</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="p-3 bg-bg-surface rounded-lg border border-primary/30">
                <p className="text-sm font-semibold text-primary mb-1">📍 Awal Hari Optimal</p>
                <p className="text-xs text-text-secondary">Jadwalkan materi kompleks jam 08:30-10:30 untuk hasil maksimal</p>
              </div>

              <div className="p-3 bg-bg-surface rounded-lg border border-accent-warning/30">
                <p className="text-sm font-semibold text-accent-warning mb-1">⚠️ Perhatian Khusus</p>
                <p className="text-xs text-text-secondary">3 siswa menunjukkan tanda kelelahan. Aplikasikan Pomodoro 45/10</p>
              </div>

              <div className="p-3 bg-bg-surface rounded-lg border border-accent-success/30">
                <p className="text-sm font-semibold text-accent-success mb-1">✓ Pencapaian</p>
                <p className="text-xs text-text-secondary">12 siswa mencapai target fokus minggu ini. Pertahankan momentum!</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
