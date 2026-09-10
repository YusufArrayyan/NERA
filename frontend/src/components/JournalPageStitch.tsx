'use client';

import React, { useState } from 'react';
import { BookOpen, Brain, Smile, AlertCircle, TrendingUp, ChevronRight, Plus, Filter } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function JournalPageStitch() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const emotions = [
    { icon: '😄', label: 'Sorgat Lelah', value: 'happy', count: 2 },
    { icon: '😐', label: 'Agak Cemas', value: 'neutral', count: 3 },
    { icon: '😟', label: 'Tenang & Siap', value: 'sad', count: 1 },
    { icon: '😌', label: 'Fokus Tinggi', value: 'focused', count: 4 },
  ];

  const journalEntries = [
    {
      date: '2 Juli 2026',
      mood: 'Fokus Tinggi',
      subject: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
      duration: '1 jam 45 mnt',
      insights: 'Memahami konsep superposisi dengan visualisasi interaktif yang disediakan NERA',
    },
    {
      date: '1 Juli 2026',
      mood: 'Tenang & Siap',
      subject: 'Matematika: Persamaan Diferensial Lanjut',
      duration: '2 jam 20 mnt',
      insights: 'Pemecahan masalah integral lipat dua dengan metode transformasi koordinat',
    },
    {
      date: '28 Juni 2026',
      mood: 'Fokus Tinggi',
      subject: 'Kimia Organik: Reaksi Substitusi Nukleofilik',
      duration: '1 jam 50 mnt',
      insights: 'Perbandingan mekanisme SN1 vs SN2 dengan diagram reaksi terperinci',
    },
  ];

  return (
    <div className="bg-bg-default text-text-default min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-elevated/95 border-b border-border-color backdrop-blur-md">
        <div className="container-max py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="badge-primary mb-3">
                <BookOpen className="w-3 h-3" />
                JURNAL REFLEKSI
              </Badge>
              <h1 className="text-h2 mt-2">Refleksi Kognitif & Korelasi Emosi Belajar</h1>
            </div>
            <Button className="button-primary button-sm">
              <Plus className="w-4 h-4" />
              Jurnal Baru
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button className="button-ghost button-sm">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      <main className="container-max py-8">
        {/* Emotion Selector */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <h2 className="text-h4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-secondary" />
              Emosi Saat Belajar
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setSelectedMood(emotion.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedMood === emotion.value
                      ? 'bg-primary/20 border-primary'
                      : 'bg-bg-surface border-border-color hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-2">{emotion.icon}</div>
                  <p className="text-sm font-semibold text-text-default mb-1">{emotion.label}</p>
                  <p className="text-xs text-text-muted">{emotion.count} jurnal</p>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* AI Synthesis & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="card-elevated lg:col-span-2">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Sintesis AI NERA
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="p-4 bg-bg-surface rounded-lg border border-primary/30">
                <p className="text-sm font-semibold text-primary mb-2">📍 AI/Metacognition Realtime</p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Pola gelombang Alpha menunjukkan konsentrasi stabil tinggi. Deep Asimilation: Ringkasan visual diagram konsep materi kuantum telah otomatis didaftarkan di layer pemahaman intuitif.
                </p>
              </div>

              <div className="p-4 bg-bg-surface rounded-lg border border-accent-warning/30">
                <p className="text-sm font-semibold text-accent-warning mb-2">⚠️ Rekomendasi Spesifik</p>
                <p className="text-sm text-text-secondary">
                  Alihkan pembelajaran ke modul Audio Noise Cancellation untuk meningkatkan ketahanan fokus di sesi berikutnya.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4">Statistik Jurnal</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-label text-text-muted mb-2">Total Entri</p>
                <p className="text-3xl font-bold text-primary">28</p>
              </div>
              <div className="h-px bg-border-color"></div>
              <div>
                <p className="text-label text-text-muted mb-2">Rata-rata Waktu</p>
                <p className="text-2xl font-bold text-secondary">1h 50m</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Journal Entries Timeline */}
        <Card className="card-elevated">
          <CardHeader>
            <h2 className="text-h4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Riwayat Jurnal Kognitif
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {journalEntries.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-border-color rounded-lg hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-text-default">{entry.subject}</div>
                      <p className="text-xs text-text-muted mt-1">{entry.date}</p>
                    </div>
                    <Badge className="badge-primary">{entry.mood}</Badge>
                  </div>

                  <p className="text-sm text-text-secondary mb-3">{entry.insights}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">⏱ {entry.duration}</span>
                    <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Study Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {[
            { icon: '📍', title: 'Konteks Lingkungan', items: ['Ruang Belajar', 'Outdoor Learning', 'Perpustakaan'] },
            { icon: '🎵', title: 'Stimulus Auditori', items: ['Silence', 'Binaural Beats 40Hz', 'Music - Lo-Fi'] },
            { icon: '📊', title: 'Tipe Konten', items: ['Video Interaktif', 'Teks & Diagram', 'Praktik Soal'] },
          ].map((context, idx) => (
            <Card key={idx} className="card">
              <p className="text-lg mb-4">{context.icon}</p>
              <p className="text-sm font-semibold text-text-default mb-3">{context.title}</p>
              <ul className="space-y-2">
                {context.items.map((item, iidx) => (
                  <li key={iidx} className="text-xs text-text-secondary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
