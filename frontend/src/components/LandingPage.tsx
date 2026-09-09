'use client';

import React from 'react';
import { ArrowRight, Brain, Zap, BarChart3, Users, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-neutral-900">NERA</span>
            <span className="text-xs text-neutral-600">Neuro-Adaptive Learning</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900">
              Fitur
            </a>
            <a href="#benefits" className="text-sm text-neutral-600 hover:text-neutral-900">
              Manfaat
            </a>
            <a href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900">
              Pricing
            </a>
            <Button variant="primary" size="sm">
              Mulai Sekarang
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="primary" size="sm" className="mb-4">
              🧠 Teknologi EEG Terdepan
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
              Membaca Gelombang Otak, Memaksimalkan Potensi Siswa
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Platform pembelajaran adaptif berbasis real-time EEG. Tingkatkan fokus, optimaliskan retensi memori,
              dan ciptakan pembelajaran yang truly personal dengan kecerdasan buatan.
            </p>
            <div className="flex gap-4">
              <Button variant="primary" size="lg">
                Jelajahi Sekarang
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                Pelajari Lebih
              </Button>
            </div>
            <p className="text-sm text-neutral-500 mt-6">✓ Gratis 30 hari • ✓ Tidak perlu kartu kredit • ✓ Akses penuh</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 via-teal-50 to-blue-100 rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-6xl">👩‍🎓</div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-4 mt-20 py-8 border-t border-neutral-200">
          {[
            { value: '89%', label: 'Peningkatan Fokus' },
            { value: '+30%', label: 'Retensi Lebih Baik' },
            { value: '48 Menit', label: 'Rata-rata Sesi' },
            { value: '1.000+', label: 'Siswa Aktif' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl font-bold text-green-600">{stat.value}</p>
              <p className="text-xs text-neutral-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-neutral-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-neutral-900 mb-4 text-center">Teknologi yang Membedakan</h2>
          <p className="text-lg text-neutral-600 text-center mb-16 max-w-2xl mx-auto">
            NERA menggunakan biofeedback real-time untuk menciptakan pembelajaran yang truly adaptive
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Deteksi Gelombang Otak Real-Time',
                desc: 'Monitor alpha, beta, theta waves dengan akurasi medis-grade untuk memahami state kognitif sesaat',
              },
              {
                icon: Zap,
                title: 'Adaptasi Otomatis Konten',
                desc: 'Sistem ML menyesuaikan kecepatan, kesulitan, dan gaya pembelajaran berdasarkan data EEG live',
              },
              {
                icon: BarChart3,
                title: 'Analytics Mendalam',
                desc: 'Dashboard komprehensif untuk tracking progress, pattern recognition, dan actionable insights',
              },
              {
                icon: Users,
                title: 'Kolaborasi Guru-Murid',
                desc: 'Guru dapat monitor kelas real-time dan berikan intervensi personalisasi untuk setiap siswa',
              },
              {
                icon: Shield,
                title: 'Privacy & Edge Computing',
                desc: 'Semua data terenkripsi AES-256 dan diproses lokal di headband, tidak ada cloud transfer',
              },
              {
                icon: Sparkles,
                title: 'AI Neuro-Diagnostics',
                desc: 'Insight berbasis AI tentang optimal learning times, fatigue detection, dan protocol reset',
              },
            ].map((feature, idx) => (
              <Card key={idx} variant="elevated">
                <CardBody className="space-y-3">
                  <feature.icon className="w-8 h-8 text-green-600" />
                  <h3 className="font-bold text-neutral-900">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <h2 className="text-4xl font-bold text-neutral-900 mb-4 text-center">Manfaat untuk Siswa & Guru</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          {/* For Students */}
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Untuk Siswa 👨‍🎓</h3>
            <div className="space-y-4">
              {[
                'Belajar saat gelombang otak Anda optimal',
                'Deteksi kelelahan sebelum terjadi penurunan performa',
                'Personalisasi konten sesuai learning style Anda',
                'Gamification & achievement system yang motivasi',
                'Akses AI coach yang tersedia 24/7',
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-neutral-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* For Teachers */}
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Untuk Guru 👨‍🏫</h3>
            <div className="space-y-4">
              {[
                'Monitor fokus siswa dalam real-time di kelas',
                'Identifikasi siswa yang butuh bantuan khusus',
                'Dapatkan insights tentang pola belajar kelas',
                'Buat intervensi personalisasi yang data-driven',
                'Tingkatkan engagement dan hasil belajar',
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-neutral-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-900 text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-16 text-center">Bagaimana NERA Bekerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Pasang Headband', desc: 'Setup 2 menit dengan EEG sensors ultra-ringan' },
              { step: '2', title: 'AI Analisis Real-Time', desc: 'Machine learning memproses gelombang otak Anda' },
              {
                step: '3',
                title: 'Adaptasi Konten',
                desc: 'Platform menyesuaikan difficulty & kecepatan live',
              },
              { step: '4', title: 'Track Progress', desc: 'Dashboard lengkap untuk monitoring dan insights' },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-5xl font-bold text-green-500 mb-4">{item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-sm">{item.desc}</p>
                {idx < 3 && (
                  <ArrowRight className="absolute -right-4 top-8 text-green-500 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <h2 className="text-4xl font-bold text-neutral-900 mb-16 text-center">Apa Kata Pengguna</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Ayu Nuraida Putri',
              role: 'Siswa SMA',
              text: 'Fokus saya meningkat drastis! Sekarang tahu kapan waktu terbaik belajar. Belajar jadi lebih efisien dan enjoy.',
              rating: 5,
            },
            {
              name: 'Dr. Bambang',
              role: 'Guru Fisika',
              text: 'Tools ini game-changer untuk kelas saya. Bisa lihat siswa mana yang struggling dan bantu lebih targeted.',
              rating: 5,
            },
            {
              name: 'Rini Kusuma',
              role: 'Parent',
              text: 'Anak saya jadi lebih konsisten belajar. Lihat data fokusnya membuat dia motivated untuk improve.',
              rating: 5,
            },
          ].map((testimonial, idx) => (
            <Card key={idx} variant="elevated">
              <CardBody>
                <div className="flex gap-1 mb-3">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className="text-yellow-500">
                        ⭐
                      </span>
                    ))}
                </div>
                <p className="text-neutral-700 mb-4">"{testimonial.text}"</p>
                <p className="font-bold text-neutral-900">{testimonial.name}</p>
                <p className="text-xs text-neutral-600">{testimonial.role}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20 md:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Siap Membuka Potensi Maksimal?</h2>
          <p className="text-lg mb-8 text-green-50">
            Bergabunglah dengan 1000+ siswa yang sudah rasakan transformasi pembelajaran dengan NERA
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button variant="primary" size="lg" className="bg-white text-green-600 hover:bg-neutral-100">
              Mulai Gratis 30 Hari
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Hubungi Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-white mb-4">NERA</p>
              <p className="text-sm">Neuro-Adaptive Learning Platform</p>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Platform</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Fitur
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Perusahaan</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Tentang
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Legal</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>© 2024 NERA • Neuro-Adaptive Platform • Hak Cipta Dilindungi</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
