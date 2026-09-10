'use client';

import React from 'react';
import { ArrowRight, Brain, Zap, BarChart3, Users, Shield, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function LandingPageStitch() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-600" />
            <span className="text-lg font-bold text-neutral-900">NERA</span>
            <span className="text-xs text-neutral-600 hidden md:inline">Neuro-Adaptive Learning</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-neutral-600 hover:text-neutral-900 font-medium">
              Fitur
            </a>
            <a href="#benefits" className="text-sm text-neutral-600 hover:text-neutral-900 font-medium">
              Manfaat
            </a>
            <a href="#pricing" className="text-sm text-neutral-600 hover:text-neutral-900 font-medium">
              Pricing
            </a>
            <Button variant="primary" size="sm">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="primary" size="sm" className="mb-4">
              🧠 Teknologi EEG Terdepan
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Membaca Gelombang Otak, Memaksimalkan Potensi Siswa
            </h1>
            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              Platform pembelajaran adaptif berbasis real-time EEG. Tingkatkan fokus, optimaliskan retensi memori, dan
              ciptakan pembelajaran yang truly personal dengan kecerdasan buatan.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="primary" size="lg">
                Coba Gratis
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center">
              <div className="text-6xl">🧠</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-neutral-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <p className="text-sm text-green-600 font-semibold tracking-wide mb-2">FITUR UNGGULAN</p>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Teknologi yang Mengubah Pembelajaran
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Menggunakan sensor EEG terbaru untuk memahami pola kognitif siswa secara real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'Real-Time EEG Monitoring',
                description:
                  'Pantau gelombang otak siswa secara langsung untuk mendeteksi tingkat fokus, kelelahan, dan kesiapan kognitif.',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Pembelajaran Adaptif Personal',
                description:
                  'Sistem menyesuaikan konten pembelajaran berdasarkan pola EEG unik setiap siswa untuk hasil optimal.',
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Analytics & Insights',
                description:
                  'Dashboard komprehensif untuk tracking progress, pattern recognition, dan actionable insights pembelajaran.',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Kolaborasi Guru-Siswa',
                description:
                  'Tools untuk guru memantau fokus kelas secara real-time dan memberikan intervensi personal yang tepat.',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Aman & Terpercaya',
                description:
                  'Data siswa dilindungi dengan enkripsi end-to-end dan mematuhi standar privasi internasional.',
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'AI-Powered Recommendations',
                description:
                  'Algoritma pembelajaran mesin memberikan rekomendasi konten yang dipersonalisasi untuk setiap siswa.',
              },
            ].map((feature, idx) => (
              <Card key={idx} variant="elevated">
                <CardBody className="space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-neutral-600">{feature.description}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="text-center mb-16">
          <p className="text-sm text-green-600 font-semibold tracking-wide mb-2">MANFAAT TERBUKTI</p>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Hasil yang Terukur dan Nyata
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              stat: '+45%',
              label: 'Peningkatan Fokus',
              desc: 'Siswa mengalami peningkatan rata-rata fokus hingga 45% dalam 30 hari pertama.',
            },
            {
              stat: '+30%',
              label: 'Retensi Memori',
              desc: 'Pembelajaran adaptif meningkatkan retensi informasi hingga 30% lebih baik.',
            },
            {
              stat: '+50%',
              label: 'Engagement',
              desc: 'Interaktivitas tingkat tinggi meningkatkan keterlibatan siswa hingga 50%.',
            },
          ].map((benefit, idx) => (
            <div key={idx} className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{benefit.stat}</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{benefit.label}</h3>
              <p className="text-neutral-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 py-20 md:py-32 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Siap Mengoptimalkan Pembelajaran?</h2>
          <p className="text-lg text-green-100 mb-8">
            Bergabunglah dengan ribuan sekolah yang telah merasakan transformasi pembelajaran dengan NERA.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" className="bg-white text-green-600 hover:bg-neutral-50">
              Mulai Demo Gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Hubungi Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-green-500" />
                <span className="font-bold text-white">NERA</span>
              </div>
              <p className="text-sm">Neuro-Adaptive Learning Platform</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Produk</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Fitur</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Keamanan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Tentang</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Karir</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2026 NERA Neuro-Adaptive Platform. Hak Cipta Dilindungi.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
