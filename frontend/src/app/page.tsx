"use client";

import { ArrowRight, Brain, Cpu, LineChart, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background font-sans overflow-x-hidden selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-secondary">NERA</span>
          </div>
          
          {/* Center Links */}
          <div className="hidden md:flex items-center justify-center gap-8 text-sm font-bold text-muted-foreground flex-1">
            <a href="#how-it-works" className="hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#features" className="hover:text-primary transition-colors">Fitur Utama</a>
            <a href="#research" className="hover:text-primary transition-colors">Riset</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-4 flex-1">
            <Link href="/auth/login" className="text-sm font-bold text-secondary hover:text-primary transition-colors hidden md:block">
              Masuk
            </Link>
            <Link href="/auth/register" className="organic-button-primary px-6 py-2.5 text-sm shadow-md shadow-primary/20 hidden sm:flex">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Organic Background Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] bg-primary/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-8 border border-primary/20">
            Revolusi EdTech 2026
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-secondary tracking-tight mb-6 leading-tight px-2">
            Membaca Pikiran, Memaksimalkan Potensi
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-10 font-regular leading-relaxed text-center px-4">
            Platform pembelajaran adaptif pertama di Indonesia yang menggunakan teknologi EEG untuk mendeteksi fokus dan stres siswa secara real-time
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
            <Link href="/auth/register" className="organic-button-primary text-base md:text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-105 transition-transform duration-200">
              Mulai Sekarang <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a href="#how-it-works" className="bg-white text-secondary border-2 border-primary hover:bg-primary hover:text-white text-base md:text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center rounded-full font-bold transition-all duration-200 shadow-md">
              <PlayCircle className="w-5 h-5 mr-2" /> Lihat Demo
            </a>
          </div>
        </div>
      </section>

      {/* How it Works / Panduan */}
      <section id="how-it-works" className="py-24 bg-card border-y border-border/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <p className="text-sm font-bold text-primary">Bagaimana Cara Kerjanya</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4">3 Langkah Sederhana</h2>
            <p className="text-lg text-muted-foreground font-regular max-w-2xl mx-auto">Dari headband hingga adaptasi pembelajaran otomatis</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-background rounded-[2rem] p-8 border border-border/40 shadow-sm hover:shadow-[0_4px_16px_rgba(127,160,94,0.12)] transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Pakai Headband</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sensor EEG membaca aktivitas gelombang otak siswa dengan presisi tinggi tanpa perlu gel konduktif.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-background rounded-[2rem] p-8 border border-border/40 shadow-sm hover:shadow-[0_4px_16px_rgba(127,160,94,0.12)] transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">AI Menganalisis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Algoritma ML menganalisis pola gelombang untuk mengidentifikasi fokus, stres, dan kelelahan secara akurat.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-background rounded-[2rem] p-8 border border-border/40 shadow-sm hover:shadow-[0_4px_16px_rgba(127,160,94,0.12)] transition-all duration-300 hover:-translate-y-2 group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Adaptasi Otomatis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistem menyesuaikan konten pembelajaran dan guru menerima insight real-time untuk optimasi pembelajaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <p className="text-sm font-bold text-primary">Fitur Unggulan</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-secondary mb-4">Inovasi Pembelajaran Adaptif</h2>
            <p className="text-lg text-muted-foreground font-regular max-w-2xl mx-auto">Dirancang untuk semua stakeholder pendidikan dengan teknologi terdepan</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Feature 1 */}
            <div className="organic-card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">Pemantauan EEG Real-Time</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Headband NERA mengukur aktivitas gelombang otak siswa dengan akurasi tinggi untuk mendeteksi tingkat fokus, stres, dan kelelahan dalam waktu nyata.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="organic-card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <LineChart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">Analisis AI Cerdas</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Algoritma machine learning menganalisis data EEG untuk mengidentifikasi pola pembelajaran dan memberikan insights yang dapat ditindaklanjuti.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="organic-card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">Pembelajaran Adaptif</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Materi pembelajaran otomatis menyesuaikan tingkat kesulitan, format konten, dan kecepatan penyajian berdasarkan keadaan kognitif siswa.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="organic-card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">Dashboard untuk Guru</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Guru dapat memantau fokus kelas secara real-time, menerima peringatan ketika siswa mulai kehilangan konsentrasi, dan menyesuaikan strategi mengajar.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="organic-card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">Gamifikasi & Reward</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sistem poin, badge, dan level mendorong siswa untuk tetap termotivasi dan konsisten dalam belajar dengan progress yang terukur.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="organic-card p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-2">Analytics & Laporan</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Laporan terperinci tentang pola pembelajaran siswa, progress akademik, dan rekomendasi untuk meningkatkan efektivitas belajar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 border border-border/40 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-secondary mb-3">Dukungan untuk Semua Peran</h3>
                <p className="text-muted-foreground mb-4">
                  NERA dirancang untuk siswa, guru, konselor, dan orang tua dengan dashboard khusus untuk setiap peran dengan insight yang relevan.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Siswa: Belajar dengan adaptif dan tracking progress</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Guru: Monitoring kelas dan personalisasi pembelajaran</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Orang Tua: Laporan perkembangan anak yang terperinci</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="py-24 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-secondary mb-4">Riset dan Teknologi</h2>
            <p className="text-muted-foreground font-regular text-base max-w-2xl mx-auto">
              NERA dibangun atas dasar penelitian neuroscience terkini dan teknologi EEG yang telah terbukti secara ilmiah
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Left: Research Background */}
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">Dasar Ilmiah</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-secondary mb-2">Neuroscience Pembelajaran</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Penelitian menunjukkan bahwa tingkat fokus dan stres siswa secara langsung mempengaruhi efektivitas pembelajaran. NERA memanfaatkan teknologi EEG untuk mengukur kedua metrik ini secara real-time.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-secondary mb-2">Gelombang Otak dan Fokus</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Gelombang Beta (13-30 Hz) menunjukkan perhatian aktif, sementara gelombang Alpha (8-12 Hz) menunjukkan relaksasi. Rasio Beta/Alpha yang optimal mengindikasikan fokus yang sehat tanpa stres berlebihan.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-secondary mb-2">Personalisasi Berbasis Data</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Setiap siswa memiliki pola gelombang otak yang unik. NERA menggunakan machine learning untuk memahami profil kognitif individual dan mengadaptasi pembelajaran secara personal.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-secondary mb-2">Intervensi Preventif</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Dengan mendeteksi penurunan fokus lebih awal, guru dapat memberikan intervensi sebelum siswa kehilangan konsentrasi sepenuhnya, meningkatkan efektivitas pembelajaran hingga 30%.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Technology Details */}
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">Teknologi EEG</h3>

              <div className="space-y-6">
                <div className="organic-card p-6">
                  <h4 className="font-bold text-secondary mb-2">Sensor Berkualitas Tinggi</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    NERA Headband menggunakan sensor kapasitif dengan resolusi tinggi yang dapat membaca aktivitas otak tanpa perlu gel konduktif, membuat pengalaman pengguna nyaman dan praktis.
                  </p>
                </div>

                <div className="organic-card p-6">
                  <h4 className="font-bold text-secondary mb-2">Wireless & Low-Latency</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Koneksi wireless real-time dengan latency di bawah 100ms memastikan feedback yang responsif untuk adaptasi pembelajaran yang seamless.
                  </p>
                </div>

                <div className="organic-card p-6">
                  <h4 className="font-bold text-secondary mb-2">Machine Learning Pipeline</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Raw EEG signals diproses melalui pipeline ML untuk menghilangkan noise, mengekstrak features, dan mengklasifikasi state kognitif dengan akurasi 92%.
                  </p>
                </div>

                <div className="organic-card p-6">
                  <h4 className="font-bold text-secondary mb-2">Privacy by Design</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Data EEG dienkripsi end-to-end dan tidak pernah disimpan di perangkat cloud. Hanya metric agregat (fokus, stres) yang dikirim ke server.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Research Metrics */}
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12 border border-border/40">
            <h3 className="text-2xl font-bold text-secondary mb-8 text-center">Hasil Penelitian Awal</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">92%</div>
                <p className="text-sm text-muted-foreground font-medium">Akurasi Deteksi Fokus</p>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">30%</div>
                <p className="text-sm text-muted-foreground font-medium">Peningkatan Retensi</p>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">45min</div>
                <p className="text-sm text-muted-foreground font-medium">Optimal Focus Window</p>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2">1000+</div>
                <p className="text-sm text-muted-foreground font-medium">Siswa Dalam Pilot</p>
              </div>
            </div>
          </div>

          {/* References */}
          <div className="mt-16 pt-12 border-t border-border/40">
            <h4 className="text-lg font-bold text-secondary mb-6">Referensi Ilmiah</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">1</span>
                <p>Klimesch, W. (1999). EEG alpha and theta oscillations reflect cognitive and memory performance.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">2</span>
                <p>Gruzelier, J. H. (2014). EEG-neurofeedback for optimizing performance and flow in neurofeedback.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">3</span>
                <p>Roy, R. N., et al. (2013). Mental fatigue and working memory load. Neurocomputing, 144.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold">4</span>
                <p>Kroupin, E., et al. (2018). Real-time EEG-based cognitive workload assessment in complex environments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Registration Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5 -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-secondary mb-6">Sudah Memiliki NERA Headband</h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10 font-regular text-center px-2">
            Aktivasi perangkat Anda menggunakan Kode Lisensi yang tersedia di kemasan untuk membuat akun dan mulai belajar.
          </p>
          <Link href="/auth/register" className="organic-button-primary text-base md:text-lg px-8 md:px-10 py-4 md:py-5 shadow-2xl shadow-primary/30 inline-flex items-center w-full sm:w-auto justify-center">
            Mulai Aktivasi Perangkat <ArrowRight className="w-5 h-5 md:w-6 md:h-6 ml-3" />
          </Link>
          <p className="mt-8 text-sm text-muted-foreground font-regular">
            Dari institusi pendidikan? <Link href="/auth/login" className="text-primary font-bold hover:underline">Masuk sebagai sekolah</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 border-t border-secondary-foreground/10">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-extrabold text-xl tracking-tight">NERA Platform</span>
          </div>
          <div className="text-sm font-medium text-secondary-foreground/60">
            &copy; 2026 Neuro-Adaptive Learning. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
