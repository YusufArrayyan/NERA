'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, Zap, BarChart3, Users, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function LandingPageStitch() {
  const router = useRouter();

  const handleStartNow = () => {
    router.push('/auth/login');
  };

  const handleDemo = () => {
    router.push('/demo');
  };

  const handleCourses = () => {
    router.push('/courses');
  };

  return (
    <div className="bg-bg-default text-text-default min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-bg-elevated/95 backdrop-blur-md border-b border-border-color">
        <div className="container-max py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-text-default">NERA</div>
              <div className="text-xs text-text-muted hidden md:block">Neuro-Adaptive Learning</div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-primary transition-colors">
              Fitur
            </a>
            <a href="#benefits" className="text-sm text-text-secondary hover:text-primary transition-colors">
              Manfaat
            </a>
            <button onClick={handleCourses} className="text-sm text-text-secondary hover:text-primary transition-colors">
              Pelajaran
            </button>
            <Button onClick={handleStartNow} className="button-primary button-sm">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="md:hidden">
            <Button className="button-ghost button-sm">☰</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-max py-16 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="badge-primary">
                <Zap className="w-3 h-3" />
                Teknologi EEG Terdepan
              </Badge>
            </div>
            
            <h1 className="text-h1 text-text-default mb-6 leading-tight">
              Membaca Gelombang Otak, <span className="text-gradient">Memaksimalkan Potensi</span>
            </h1>
            
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              Platform pembelajaran adaptif berbasis real-time EEG. Tingkatkan fokus, optimaliskan retensi memori, dan ciptakan pembelajaran yang truly personal dengan AI.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={handleStartNow} className="button-primary button-lg">
                Coba Gratis Sekarang
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button onClick={handleDemo} className="button-outline button-lg">
                Lihat Demo
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-border-color">
              <div className="text-sm text-text-muted mb-4">Dipercaya oleh sekolah di seluruh Indonesia</div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-bg-surface rounded-full flex items-center justify-center text-xs font-semibold text-primary">SMA</div>
                <div className="w-10 h-10 bg-bg-surface rounded-full flex items-center justify-center text-xs font-semibold text-primary">MTs</div>
                <div className="w-10 h-10 bg-bg-surface rounded-full flex items-center justify-center text-xs font-semibold text-primary">SD</div>
                <span className="text-sm text-text-muted">+5000 siswa aktif</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-slide-up">
            <div className="card-elevated p-8">
              <div className="aspect-square bg-gradient-dark rounded-xl flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/50 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                  {/* Circular Progress with Brain Icon */}
                  <div className="relative w-40 h-40">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-neutral-700/30"
                      />
                      {/* Animated Progress Circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="440"
                        strokeDashoffset="22"
                        className="transition-all duration-1000 ease-out"
                        style={{
                          animation: 'draw-circle 2s ease-out forwards'
                        }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Brain className="w-10 h-10 text-primary mb-2 animate-pulse" />
                      <div className="text-3xl font-bold text-primary">98%</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-text-default mb-1">Akurasi Deteksi Fokus</div>
                    <div className="text-sm text-text-muted">Berdasarkan 10,000+ sesi pembelajaran</div>
                  </div>

                  <div className="flex gap-6 pt-4 border-t border-border-color w-full justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary flex items-center justify-center gap-1">
                        <Zap className="w-5 h-5" />
                        15+
                      </div>
                      <div className="text-xs text-text-muted">Parameter EEG</div>
                    </div>
                    <div className="w-px bg-border-color"></div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-success flex items-center justify-center gap-1">
                        <BarChart3 className="w-5 h-5" />
                        24/7
                      </div>
                      <div className="text-xs text-text-muted">Real-time Monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-bg-elevated/50 py-20 md:py-32 border-y border-border-color">
        <div className="container-max">
          <div className="text-center mb-16">
            <Badge className="badge-primary mb-4">
              <Sparkles className="w-3 h-3" />
              Fitur Unggulan
            </Badge>
            <h2 className="text-h2 mb-6">Teknologi yang Mengubah Pembelajaran</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Menggunakan sensor EEG terbaru untuk memahami pola kognitif siswa secara real-time.
            </p>
          </div>

          <div className="grid-3">
            {[
              {
                icon: Brain,
                title: 'Real-Time EEG Monitoring',
                description: 'Pantau gelombang otak siswa secara langsung untuk mendeteksi fokus, kelelahan, dan kesiapan kognitif.',
                color: 'text-primary',
              },
              {
                icon: Zap,
                title: 'Pembelajaran Adaptif',
                description: 'Sistem menyesuaikan konten pembelajaran berdasarkan pola EEG unik setiap siswa.',
                color: 'text-secondary',
              },
              {
                icon: BarChart3,
                title: 'Analytics Mendalam',
                description: 'Dapatkan insights komprehensif tentang pola pembelajaran dan progres siswa.',
                color: 'text-accent-success',
              },
              {
                icon: Users,
                title: 'Kolaborasi Guru & Orang Tua',
                description: 'Berbagi data dan insights untuk dukungan pembelajaran yang holistik.',
                color: 'text-accent-info',
              },
              {
                icon: Shield,
                title: 'Privasi & Keamanan',
                description: 'Data tersensifikasi dengan enkripsi end-to-end dan compliance GDPR.',
                color: 'text-accent-warning',
              },
              {
                icon: Sparkles,
                title: 'AI Recommendations',
                description: 'Rekomendasi personalized untuk optimalisasi waktu belajar dan performa.',
                color: 'text-accent-error',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="card hover:border-primary/50 group">
                <div className={`w-12 h-12 bg-bg-surface rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-h4 mb-2 text-text-default">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 md:py-32">
        <div className="container-max">
          <div className="text-center mb-16">
            <h2 className="text-h2 mb-6">Manfaat Nyata untuk Semua</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Setiap pengguna mendapatkan pengalaman yang disesuaikan untuk kesuksesan maksimal.
            </p>
          </div>

          <div className="grid-2">
            {[
              {
                role: 'Untuk Siswa',
                benefits: [
                  'Pembelajaran yang dipersonalisasi sesuai gaya kognitif unik',
                  'Deteksi kelelahan otomatis dengan rekomendasi istirahat',
                  'Gamifikasi dan achievement badges untuk motivasi',
                  'Progress tracking real-time dengan AI insights',
                ],
              },
              {
                role: 'Untuk Guru',
                benefits: [
                  'Dashboard monitoring kelas untuk deteksi kesulitan belajar',
                  'Rekomendasi strategi pengajaran yang efektif',
                  'Laporan komprehensif untuk setiap siswa',
                  'Tools untuk personalisasi pembelajaran di kelas',
                ],
              },
              {
                role: 'Untuk Orang Tua',
                benefits: [
                  'Transparansi penuh tentang progres belajar anak',
                  'Insights tentang pola dan kesulitan belajar',
                  'Rekomendasi dukungan di rumah',
                  'Real-time notifications untuk milestone achievements',
                ],
              },
              {
                role: 'Untuk Sekolah',
                benefits: [
                  'Peningkatan rata-rata nilai siswa 25-35%',
                  'Pengurangan tingkat drop-out hingga 40%',
                  'Data-driven decision making untuk curriculum',
                  'Competitive advantage dalam aksreditasi sekolah',
                ],
              },
            ].map((item, idx) => (
              <Card key={idx} className="card p-8">
                <h3 className="text-h4 mb-6 text-primary">{item.role}</h3>
                <ul className="space-y-3">
                  {item.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-dark border-t border-border-color py-16 md:py-24">
        <div className="container-max text-center">
          <h2 className="text-h2 mb-6">Siap Mengubah Pembelajaran?</h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan siswa yang sudah merasakan transformasi pembelajaran dengan NERA.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button onClick={handleStartNow} className="button-primary button-lg">
              Mulai Gratis 30 Hari
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button onClick={() => router.push('/contact')} className="button-outline button-lg">
              Hubungi Sales
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-border-color text-text-muted text-sm">
            Tidak perlu kartu kredit. Setup dalam 5 menit.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-elevated border-t border-border-color py-12">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-bold text-text-default">NERA</span>
              </div>
              <p className="text-sm text-text-muted">Platform pembelajaran adaptif berbasis EEG untuk masa depan pendidikan.</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-text-default mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><button onClick={() => router.push('/#features')} className="hover:text-primary transition-colors">Fitur</button></li>
                <li><button onClick={() => router.push('/pricing')} className="hover:text-primary transition-colors">Pricing</button></li>
                <li><button onClick={() => router.push('/security')} className="hover:text-primary transition-colors">Security</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-default mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><button onClick={() => router.push('/about')} className="hover:text-primary transition-colors">Tentang</button></li>
                <li><button onClick={() => router.push('/blog')} className="hover:text-primary transition-colors">Blog</button></li>
                <li><button onClick={() => router.push('/careers')} className="hover:text-primary transition-colors">Karir</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-default mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><button onClick={() => router.push('/privacy')} className="hover:text-primary transition-colors">Privasi</button></li>
                <li><button onClick={() => router.push('/terms')} className="hover:text-primary transition-colors">Terms</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-primary transition-colors">Contact</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border-color pt-8 text-center text-sm text-text-muted">
            <p>&copy; 2024 NERA Neuro-Adaptive Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
