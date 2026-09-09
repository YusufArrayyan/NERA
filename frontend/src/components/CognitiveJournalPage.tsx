'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  Smile,
  TrendingUp,
  Filter,
  Plus,
  Share2,
  Download,
  MessageSquare,
  Zap,
  Calendar,
  Clock,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChartContainer } from '@/components/ui/ChartContainer';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function CognitiveJournalPage() {
  const [selectedTab, setSelectedTab] = useState<'reflection' | 'analysis' | 'ai-insights'>('reflection');

  // Mock EEG data visualization
  const eegData = [
    { time: '09:00', alpha: 8, beta: 12, theta: 5 },
    { time: '09:15', alpha: 12, beta: 15, theta: 4 },
    { time: '09:30', alpha: 18, beta: 14, theta: 3 },
    { time: '09:45', alpha: 15, beta: 18, theta: 5 },
    { time: '10:00', alpha: 12, beta: 16, theta: 6 },
    { time: '10:15', alpha: 10, beta: 14, theta: 8 },
  ];

  const journalEntries = [
    {
      date: '2 Juli 2026',
      emotion: 'Fokus Tinggi 😊',
      sentiment: 'positive',
      duration: '45 menit',
      topic: 'Fisika Kuantum - Dualitas Gelombang-Partikel',
      notes:
        'Materi hari ini sangat menarik. Rasio gelombang Beta/Theta saya optimal sepanjang sesi. Kondisi eksternal sempurna: ruang tenang, tidak ada distraksi.',
      eegMetrics: {
        avgAlpha: 12.5,
        avgBeta: 14.8,
        avgTheta: 5.2,
        focusScore: 85,
      },
      aiSynthesis:
        'Harinya sangat produktif! Gelombang otak Anda menunjukkan sinkronisasi optimal. Direkomendasikan untuk refresh 5 menit lalu lanjut dengan materi kompleks berikutnya.',
      recommendations: [
        'Pertahankan lingkungan belajar ini',
        'Tingkatkan durasi sesi menjadi 60 menit next time',
        'Terapkan teknik Pomodoro untuk sustain fokus',
      ],
    },
    {
      date: '1 Juli 2026',
      emotion: 'Tenang & Siap 🧘',
      sentiment: 'calm',
      duration: '32 menit',
      topic: 'Biologi Sel & Neurotransmitter',
      notes:
        'Sesi singkat tapi impactful. Ada lonjakan Theta di menit ke-15 yang menunjukkan micro-fatigue, tapi berhasil recover dengan teknik breathing.',
      eegMetrics: {
        avgAlpha: 9.2,
        avgBeta: 11.3,
        avgTheta: 7.8,
        focusScore: 62,
      },
      aiSynthesis:
        'Kondisi mental Anda menunjukkan relaksasi tinggi. Theta melonjak mungkin karena kurang istirahat malam sebelumnya. Ambil istirahat lebih lama next session.',
    },
    {
      date: '28 Juni 2026',
      emotion: 'Agak Cemas 😰',
      sentiment: 'anxious',
      duration: '28 menit',
      topic: 'Kalkulus Diferensial',
      notes:
        'Materi cukup challenging. Terasa kurang confident dengan topik ini. Perlu review fundamental sebelum lanjut ke aplikasi lebih kompleks.',
      eegMetrics: {
        avgAlpha: 6.1,
        avgBeta: 16.2,
        avgTheta: 9.5,
        focusScore: 52,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">
                METACOGNISI SIWA - NEURO-CORRELATION ENGINE
              </Badge>
              <h1 className="text-4xl font-bold text-neutral-900">Refleksi Kognitif & Korelasi Emosi Belajar</h1>
              <p className="text-neutral-600 mt-2 max-w-2xl">
                Tafsikan pengalaman emosional subjektif Anda dengan data gelombang EEG objektif. Mengungkapkan keasadaran
                diri metacognitif dengan fakta neurofisiologi.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4" />
                Unduh Laporan Kognitif
              </Button>
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
                Entry Baru
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-neutral-200">
            {['reflection', 'analysis', 'ai-insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                  selectedTab === tab
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {tab === 'reflection' && '📝 Refleksi Harian'}
                {tab === 'analysis' && '📊 Analisis EEG'}
                {tab === 'ai-insights' && '🤖 AI Insights'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {selectedTab === 'reflection' && (
          <div className="space-y-6">
            {/* Current Session Highlight */}
            <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
              <CardHeader>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Sesi Hari Ini
                </h2>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Emosi Dominan</p>
                  <p className="text-3xl font-bold">😊</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">Fokus Tinggi</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Durasi Sesi</p>
                  <p className="text-3xl font-bold">45m</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">Fisika Kuantum</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-2">Focus Score</p>
                  <ProgressBar value={85} label="" variant="success" size="lg" showLabel={false} />
                  <p className="text-sm font-bold text-neutral-900 mt-2">85/100</p>
                </div>
              </CardBody>
            </Card>

            {/* Journal Entries */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Riwayat Refleksi Kognitif
              </h2>
              <div className="space-y-4">
                {journalEntries.map((entry, idx) => (
                  <Card key={idx} variant="elevated">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl">{entry.emotion.split(' ')[1] || '📝'}</p>
                            <div>
                              <p className="font-bold text-neutral-900">{entry.emotion}</p>
                              <p className="text-xs text-neutral-600">{entry.date}</p>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            entry.sentiment === 'positive'
                              ? 'success'
                              : entry.sentiment === 'calm'
                              ? 'info'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {entry.sentiment === 'positive'
                            ? '✨ Positif'
                            : entry.sentiment === 'calm'
                            ? '🧘 Tenang'
                            : '⚠️ Cemas'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardBody className="space-y-4">
                      {/* Topic & Duration */}
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
                        <div>
                          <p className="text-xs text-neutral-600">Topik Pembelajaran</p>
                          <p className="font-semibold text-neutral-900">{entry.topic}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-600">Durasi Sesi</p>
                          <p className="font-semibold text-neutral-900 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {entry.duration}
                          </p>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 mb-2">Catatan Subjektif</p>
                        <p className="text-sm text-neutral-700">{entry.notes}</p>
                      </div>

                      {/* EEG Metrics */}
                      {entry.eegMetrics && (
                        <div className="bg-neutral-50 rounded p-4">
                          <p className="text-sm font-semibold text-neutral-900 mb-3">Metrik EEG</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: 'Alpha Avg', value: entry.eegMetrics.avgAlpha, unit: 'Hz' },
                              { label: 'Beta Avg', value: entry.eegMetrics.avgBeta, unit: 'Hz' },
                              { label: 'Theta Avg', value: entry.eegMetrics.avgTheta, unit: 'Hz' },
                              { label: 'Focus Score', value: entry.eegMetrics.focusScore, unit: '/100' },
                            ].map((metric, i) => (
                              <div key={i} className="bg-white rounded p-2 border border-neutral-200">
                                <p className="text-xs text-neutral-600">{metric.label}</p>
                                <p className="text-lg font-bold text-neutral-900">
                                  {metric.value}
                                  <span className="text-xs text-neutral-500 font-normal">{metric.unit}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Synthesis */}
                      {entry.aiSynthesis && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                          <p className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4" />
                            Sintesis AI NERA
                          </p>
                          <p className="text-sm text-blue-800">{entry.aiSynthesis}</p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {entry.recommendations && (
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 mb-2">📋 Rekomendasi Pembelajaran</p>
                          <ul className="space-y-2">
                            {entry.recommendations.map((rec, i) => (
                              <li key={i} className="flex gap-2 text-sm text-neutral-700">
                                <span className="text-green-600 font-bold">✓</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardBody>

                    <CardFooter>
                      <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="w-4 h-4" />
                          Edit Refleksi
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1">
                          <Share2 className="w-4 h-4" />
                          Bagikan
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'analysis' && (
          <div className="space-y-6">
            {/* EEG Waveform Chart */}
            <ChartContainer
              title="Gelombang EEG Real-Time Sesi Hari Ini"
              description="Kurva Alpha, Beta, Theta 1 Hz sampling - Neural Lojik Engine"
            >
              <div className="h-64 flex items-end justify-between gap-2 px-4 py-8 bg-neutral-50 rounded-lg">
                {eegData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full h-40 flex items-end justify-around gap-1">
                      {[
                        { value: data.alpha, color: 'from-blue-500', label: 'α' },
                        { value: data.beta, color: 'from-green-500', label: 'β' },
                        { value: data.theta, color: 'from-yellow-500', label: 'θ' },
                      ].map((wave, wIdx) => (
                        <div
                          key={wIdx}
                          className={`flex-1 bg-gradient-to-t ${wave.color} to-neutral-200 rounded-t transition-all hover:shadow-lg`}
                          style={{ height: `${(wave.value / 20) * 100}px` }}
                          title={`${wave.label}: ${wave.value}Hz`}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-neutral-900">{data.time}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-6 justify-center text-xs">
                {[
                  { label: 'Alpha (8-12 Hz)', color: 'bg-blue-500' },
                  { label: 'Beta (12-30 Hz)', color: 'bg-green-500' },
                  { label: 'Theta (4-8 Hz)', color: 'bg-yellow-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${item.color} rounded`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>

            {/* Konteks Pembelajaran */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-teal-600" />
                  Konteks Lingkungan & Stimulan Eksternal
                </h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { tag: '#TidakAdaDistraksi', status: 'verified' },
                    { tag: '#RuangTenang', status: 'verified' },
                    { tag: '#AromaterapiLavender', status: 'unverified' },
                    { tag: '#MuzikAmbien', status: 'verified' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded border ${
                        item.status === 'verified'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      {item.status === 'verified' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-semibold text-neutral-900">{item.tag}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {selectedTab === 'ai-insights' && (
          <div className="space-y-6">
            <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  🤖 AI Meta-Cognition Realtime
                </h2>
                <p className="text-xs text-neutral-600 mt-1">v2.8 Neural Lojik • Adaptive Learning Engine</p>
              </CardHeader>
              <CardBody className="space-y-4">
                {[
                  {
                    icon: '📈',
                    title: 'Tren Kognitif Positif',
                    desc: 'Focus score Anda meningkat 12% dalam 7 hari. Pola konsistensi pagi hari semakin stabil.',
                  },
                  {
                    icon: '🧠',
                    title: 'Pattern Recognition',
                    desc: 'Gelombang Beta/Theta ratio menunjukkan optimal learning window: 08:30-11:30 WIB setiap hari.',
                  },
                  {
                    icon: '⚡',
                    title: 'Anomali Terdeteksi',
                    desc: 'Micro-fatigue spike pada 28 Juni mungkin karena sleep deprivation. Rekomendasi: sleep hygiene improvement.',
                  },
                  {
                    icon: '💡',
                    title: 'Personalized Protocol',
                    desc: 'Mulai Teknik Pomodoro dengan interval 45 menit + 5 menit reset breathing untuk sustain Peak Performance.',
                  },
                ].map((insight, idx) => (
                  <div key={idx} className="border-l-4 border-purple-500 bg-white rounded p-4">
                    <p className="text-lg mb-2">{insight.icon}</p>
                    <p className="font-bold text-neutral-900">{insight.title}</p>
                    <p className="text-sm text-neutral-700 mt-1">{insight.desc}</p>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Study Comparison Card */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900">Studi Komparasi Sensorik - Adaptasi Lingkungan NERA</h3>
              </CardHeader>
              <CardBody>
                <div className="bg-neutral-100 rounded p-6">
                  <p className="text-sm text-neutral-700 text-center">
                    📊 Comparative study showing learning outcomes improvement ketika menggunakan NERA vs traditional
                    methods
                  </p>
                  <div className="mt-6 space-y-4">
                    {[
                      { metric: 'Focus Duration', nera: 85, traditional: 52, unit: '%' },
                      { metric: 'Retention Rate', nera: 78, traditional: 61, unit: '%' },
                      { metric: 'Learning Enjoyment', nera: 88, traditional: 64, unit: '%' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-neutral-900">{item.metric}</span>
                          <span className="text-sm font-bold text-neutral-900">
                            NERA: {item.nera}{item.unit} vs Traditional: {item.traditional}
                            {item.unit}
                          </span>
                        </div>
                        <div className="flex gap-2 h-6">
                          <div
                            className="bg-green-600 rounded flex items-center justify-center text-xs font-bold text-white"
                            style={{ width: `${item.nera}%` }}
                          >
                            {item.nera > 60 && item.nera}
                          </div>
                          <div
                            className="bg-neutral-400 rounded flex items-center justify-center text-xs font-bold text-white"
                            style={{ width: `${item.traditional}%` }}
                          >
                            {item.traditional > 60 && item.traditional}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
