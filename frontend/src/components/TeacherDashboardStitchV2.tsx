'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Brain, AlertCircle, BarChart3, Filter, Download } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApiClient } from '@/lib/api-client';
import { useEEGWebSocket } from '@/hooks/useEEGWebSocket';

export function TeacherDashboardStitchV2() {
  const [filterRole, setFilterRole] = useState<'all' | 'top' | 'need-help'>('all');
  const [classAnalytics, setClassAnalytics] = useState<any[]>([]);
  const [realtimeData, setRealtimeData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);

  // WebSocket for real-time class monitoring
  const { isConnected, connect } = useEEGWebSocket({
    autoConnect: false,
    onData: (data) => {
      // Update realtime data for specific student
      // This would be enhanced with proper student ID mapping
      console.log('Real-time EEG data:', data);
    },
  });

  useEffect(() => {
    loadClassData();
    // Connect WebSocket for real-time monitoring
    connect();
  }, []);

  const loadClassData = async () => {
    try {
      setLoading(true);
      // Mock teacher ID - in production, get from auth context
      const teacherId = 'teacher-001';
      const analytics = await ApiClient.getClassAnalytics().catch(() => mockStudents);
      setClassAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load class data:', error);
      setClassAnalytics(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const mockStudents = [
    { studentId: 'STU-001', name: 'Alya Juwita Putri', avgFocus: 79, totalSessions: 12, lastActive: new Date() },
    { studentId: 'STU-002', name: 'Budi Santoso', avgFocus: 72, totalSessions: 10, lastActive: new Date() },
    { studentId: 'STU-003', name: 'Citra Dewi', avgFocus: 85, totalSessions: 15, lastActive: new Date() },
    { studentId: 'STU-004', name: 'Doni Wicaksono', avgFocus: 62, totalSessions: 8, lastActive: new Date() },
    { studentId: 'STU-005', name: 'Eka Sari', avgFocus: 91, totalSessions: 18, lastActive: new Date() },
    { studentId: 'STU-006', name: 'Farah Amalia', avgFocus: 88, totalSessions: 14, lastActive: new Date() },
  ];

  const students = classAnalytics.length > 0 ? classAnalytics : mockStudents;

  const filteredStudents = students.filter(s => {
    if (filterRole === 'all') return true;
    if (filterRole === 'top') return s.avgFocus >= 85;
    if (filterRole === 'need-help') return s.avgFocus < 70;
    return true;
  });

  // Calculate class statistics
  const totalStudents = students.length;
  const avgClassFocus = Math.round(students.reduce((sum, s) => sum + s.avgFocus, 0) / students.length);
  const activeToday = students.filter(s => {
    const lastActive = new Date(s.lastActive);
    const today = new Date();
    return lastActive.toDateString() === today.toDateString();
  }).length;
  const needHelp = students.filter(s => s.avgFocus < 70).length;

  const handleExportReport = () => {
    // Generate CSV report
    const csv = [
      ['Student ID', 'Name', 'Avg Focus', 'Total Sessions', 'Last Active'],
      ...students.map(s => [
        s.studentId,
        s.name,
        s.avgFocus,
        s.totalSessions,
        new Date(s.lastActive).toLocaleDateString(),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-text-muted">
                  {isConnected ? 'Live Monitoring' : 'Offline'}
                </span>
              </div>
            </div>
            <Button onClick={handleExportReport} className="button-primary button-sm">
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
            { label: 'Total Siswa', value: totalStudents.toString(), icon: Users, color: 'text-primary' },
            { label: 'Rata-rata Fokus', value: `${avgClassFocus}%`, icon: Brain, color: 'text-secondary' },
            { label: 'Aktif Hari Ini', value: activeToday.toString(), icon: TrendingUp, color: 'text-accent-success' },
            { label: 'Perlu Bantuan', value: needHelp.toString(), icon: AlertCircle, color: 'text-accent-error' },
          ].map((stat, idx) => (
            <Card key={idx} className="card">
              <stat.icon className={`w-6 h-6 ${stat.color} mb-4`} />
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
            {loading ? (
              <div className="text-center py-8 text-text-muted">Memuat data siswa...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student, idx) => {
                  const status = student.avgFocus >= 85 ? 'top' : student.avgFocus < 70 ? 'need-help' : 'active';
                  
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-bg-surface rounded-lg border border-border-color hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-text-default">{student.name}</p>
                          <p className="text-xs text-text-muted">{student.studentId}</p>
                        </div>
                        <Badge className={
                          status === 'top' ? 'badge-success' :
                          status === 'need-help' ? 'badge-error' :
                          'badge-primary'
                        }>
                          {status === 'top' ? '⭐ Top' : status === 'need-help' ? '⚠️ Help' : '✓ Active'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div>
                          <p className="text-xs text-text-muted mb-1">Fokus</p>
                          <p className="text-lg font-bold text-primary">{student.avgFocus}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">Sesi</p>
                          <p className="text-lg font-bold text-secondary">{student.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1">Aktif</p>
                          <p className="text-xs font-bold text-accent-success">
                            {new Date(student.lastActive).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      <div className="h-2 bg-bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${student.avgFocus}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                  <span className="text-sm text-text-secondary">Fokus {'>='} 80%</span>
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
