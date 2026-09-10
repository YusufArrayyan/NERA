'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ApiClient } from '@/lib/api-client';

export function JournalPageStitch() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    mood: '',
    subject: '',
    insights: '',
  });

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      const entries = await ApiClient.getJournalEntries(20).catch(() => mockEntries);
      setJournalEntries(entries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
      setJournalEntries(mockEntries);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!newEntry.mood || !newEntry.subject || !newEntry.insights) {
      alert('Mohon lengkapi semua field');
      return;
    }

    try {
      await ApiClient.createJournalEntry(newEntry);
      setShowNewEntryForm(false);
      setNewEntry({ mood: '', subject: '', insights: '' });
      await loadJournalEntries();
    } catch (error) {
      console.error('Failed to create journal entry:', error);
      alert('Gagal membuat jurnal. Silakan coba lagi.');
    }
  };

  const mockEntries = [
    {
      id: 1,
      createdAt: '2026-07-02T10:00:00Z',
      mood: 'Fokus Tinggi',
      subject: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
      insights: 'Memahami konsep superposisi dengan visualisasi interaktif yang disediakan NERA',
      duration: 105,
    },
    {
      id: 2,
      createdAt: '2026-07-01T14:00:00Z',
      mood: 'Tenang & Siap',
      subject: 'Matematika: Persamaan Diferensial Lanjut',
      insights: 'Pemecahan masalah integral lipat dua dengan metode transformasi koordinat',
      duration: 140,
    },
    {
      id: 3,
      createdAt: '2026-06-28T09:00:00Z',
      mood: 'Fokus Tinggi',
      subject: 'Kimia Organik: Reaksi Substitusi Nukleofilik',
      insights: 'Perbandingan mekanisme SN1 vs SN2 dengan diagram reaksi terperinci',
      duration: 110,
    },
  ];

  const emotions = [
    { icon: '😄', label: 'Sangat Lelah', value: 'exhausted', count: 2 },
    { icon: '😐', label: 'Agak Cemas', value: 'anxious', count: 3 },
    { icon: '😌', label: 'Tenang & Siap', value: 'calm', count: 4 },
    { icon: '🎯', label: 'Fokus Tinggi', value: 'focused', count: 5 },
  ];

  const entries = journalEntries.length > 0 ? journalEntries : mockEntries;

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Image 
                  src="/nera-logo.svg" 
                  alt="NERA Logo" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <div className="font-bold text-lg text-[#1F2937]">NERA</div>
                  <div className="text-[10px] text-[#9CA3AF] -mt-1">NEURO-ADAPTIVE LEARNING</div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                <a href="/" className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors">
                  Beranda
                </a>
                <a href="/analytics" className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors">
                  Statistik & Analisis
                </a>
                <a href="/journal" className="px-4 py-2 text-sm font-medium bg-[#5B7B5A] text-white rounded-full">
                  Jurnal Refleksi
                </a>
                <a href="/hardware/calibration" className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#5B7B5A] transition-colors">
                  Hardware Headband
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F3EE] rounded-lg transition-colors">
                <span className="material-icons text-[#4B5563] text-lg">notifications</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F3EE] rounded-lg transition-colors">
                <span className="material-icons text-[#4B5563] text-lg">settings</span>
              </button>

              <div className="flex items-center gap-3 ml-2">
                <div className="text-right">
                  <div className="text-sm font-bold text-[#1F2937]">Alya Juwita Putri</div>
                  <div className="text-xs text-[#9CA3AF]">SISWA AKTIF</div>
                </div>
                <div className="w-10 h-10 bg-[#5B7B5A] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-2">
                  <span className="material-icons text-sm">menu_book</span>
                  JURNAL REFLEKSI
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#1F2937] mb-2">
                Refleksi Kognitif & Korelasi Emosi Belajar
              </h1>
              <p className="text-[#4B5563]">
                Tautkan pengalaman emosional subjektif Anda dengan data gelombang EEG headband NERA. 
                Menyejajarkan kesadaran metakognitif dengan fakta neurobiologi.
              </p>
            </div>
            
            <button
              onClick={() => setShowNewEntryForm(!showNewEntryForm)}
              className="bg-[#5B7B5A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4A6349] transition-colors flex items-center gap-2"
            >
              <span className="material-icons">add</span>
              Jurnal Baru
            </button>
          </div>
        </div>

        {/* New Entry Form */}
        {showNewEntryForm && (
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] mb-8">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Buat Jurnal Baru</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#4B5563] mb-2 block">Mood</label>
                <select
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B7B5A]"
                >
                  <option value="">Pilih mood...</option>
                  {emotions.map((emotion) => (
                    <option key={emotion.value} value={emotion.value}>
                      {emotion.icon} {emotion.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#4B5563] mb-2 block">Subjek/Topik</label>
                <input
                  type="text"
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  placeholder="Contoh: Matematika - Kalkulus Integral"
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B7B5A]"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#4B5563] mb-2 block">Refleksi & Insights</label>
                <textarea
                  value={newEntry.insights}
                  onChange={(e) => setNewEntry({ ...newEntry, insights: e.target.value })}
                  placeholder="Tuliskan pengalaman belajar dan pemahaman yang Anda dapatkan..."
                  rows={4}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B7B5A] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateEntry}
                  className="flex-1 bg-[#5B7B5A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4A6349] transition-colors"
                >
                  Simpan Jurnal
                </button>
                <button
                  onClick={() => setShowNewEntryForm(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-[#4B5563] hover:bg-[#F5F3EE] transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Selector */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#10dcc8] text-2xl">mood</span>
            <h3 className="text-lg font-bold text-[#1F2937]">Emosi Saat Belajar</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                onClick={() => setSelectedMood(emotion.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMood === emotion.value
                    ? 'bg-[#5B7B5A]/10 border-[#5B7B5A]'
                    : 'bg-white border-[#E5E7EB] hover:border-[#5B7B5A]/50'
                }`}
              >
                <div className="text-4xl mb-2">{emotion.icon}</div>
                <p className="text-sm font-semibold text-[#1F2937] mb-1">{emotion.label}</p>
                <p className="text-xs text-[#9CA3AF]">{emotion.count} jurnal</p>
              </button>
            ))}
          </div>
        </div>

        {/* Journal Entries Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#5B7B5A] text-2xl">history_edu</span>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Riwayat Jurnal Kognitif</h3>
              <p className="text-xs text-[#9CA3AF]">{entries.length} entri tercatat</p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-[#9CA3AF]">Memuat jurnal...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                Belum ada jurnal. Klik "Jurnal Baru" untuk mulai mencatat.
              </div>
            ) : (
              entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="p-4 border border-[#E5E7EB] rounded-xl hover:border-[#5B7B5A]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-[#1F2937]">{entry.subject}</div>
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        {new Date(entry.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-xs font-bold px-3 py-1 rounded-lg">
                      {entry.mood}
                    </div>
                  </div>

                  <p className="text-sm text-[#4B5563] mb-3 line-clamp-2">{entry.insights}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">
                      ⏱ {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                    </span>
                    <span className="material-icons text-[#5B7B5A] opacity-0 group-hover:opacity-100 transition-opacity">
                      chevron_right
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Synthesis */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-[#5B7B5A] text-2xl">psychology</span>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Sintesis AI NERA</h3>
              <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1">
                AI/METACOGNITION REALTIME
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5F3EE] rounded-xl border border-[#5B7B5A]/20">
              <p className="text-sm font-semibold text-[#5B7B5A] mb-2">📍 Deep Assimilation</p>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Pola gelombang Alpha menunjukkan konsentrasi stabil tinggi. Ringkasan visual diagram 
                konsep materi telah otomatis didaftarkan di layer pemahaman intuitif.
              </p>
            </div>

            <div className="p-4 bg-[#F5F3EE] rounded-xl border border-[#f59e0b]/20">
              <p className="text-sm font-semibold text-[#f59e0b] mb-2">⚠️ Rekomendasi Spesifik</p>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Alihkan pembelajaran ke modul Audio Noise Cancellation untuk meningkatkan 
                ketahanan fokus di sesi berikutnya.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-sm text-[#9CA3AF] mb-2">
            <span className="font-bold text-[#1F2937]">NERA</span> © 2024 NERA Neuro-Adaptive Platform.
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-[#4B5563]">
            <a href="#" className="hover:text-[#5B7B5A]">Headband IoT</a>
            <a href="#" className="hover:text-[#5B7B5A]">Privasi</a>
            <a href="#" className="hover:text-[#5B7B5A]">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
