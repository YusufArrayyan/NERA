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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-secondary">NERA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
            <a href="#how-it-works" className="hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#features" className="hover:text-primary transition-colors">Fitur Utama</a>
            <a href="#research" className="hover:text-primary transition-colors">Riset</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-secondary hover:text-primary transition-colors hidden sm:block">
              Masuk
            </Link>
            <Link href="/auth/register" className="organic-button px-6 py-2.5 text-sm shadow-md shadow-primary/20">
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
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Revolusi EdTech 2026
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-secondary tracking-tight mb-8 leading-[1.1]">
            Membaca Pikiran,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Memaksimalkan Potensi.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            NERA (Neuro-Adaptive Cloud Learning) adalah platform pendidikan pertama di Indonesia yang mendeteksi tingkat fokus dan stres siswa secara real-time melalui gelombang otak (EEG).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="organic-button text-lg px-8 py-4 w-full sm:w-auto shadow-xl shadow-primary/20 flex items-center justify-center">
              Mulai Sekarang <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a href="#how-it-works" className="organic-button-secondary text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center bg-white border border-border/50 text-secondary hover:bg-muted">
              <PlayCircle className="w-5 h-5 mr-2 text-primary" /> Lihat Cara Kerja
            </a>
          </div>
        </div>
      </section>

      {/* How it Works / Panduan */}
      <section id="how-it-works" className="py-24 bg-card border-y border-border/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-secondary mb-4">Bagaimana NERA Bekerja?</h2>
            <p className="text-muted-foreground font-medium">Tiga langkah sederhana menuju pembelajaran yang disesuaikan dengan kapasitas otak Anda.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-background rounded-[2rem] p-8 border border-border/50 shadow-sm relative z-10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="absolute top-8 right-8 text-6xl font-black text-muted/30 -z-10">1</div>
              <h3 className="text-xl font-bold text-secondary mb-3">Pakai Headband</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Siswa menggunakan NERA Headband (sensor EEG) yang ringan dan nyaman. Perangkat ini akan membaca aktivitas gelombang otak secara nirkabel.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-background rounded-[2rem] p-8 border border-border/50 shadow-sm relative z-10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 text-accent">
                <LineChart className="w-8 h-8" />
              </div>
              <div className="absolute top-8 right-8 text-6xl font-black text-muted/30 -z-10">2</div>
              <h3 className="text-xl font-bold text-secondary mb-3">AI Menganalisis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Data dikirim ke server NERA. Algoritma AI kami menganalisis rasio gelombang Beta/Alpha untuk menentukan tingkat fokus dan stres seketika (real-time).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-background rounded-[2rem] p-8 border border-border/50 shadow-sm relative z-10 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-6 text-green-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="absolute top-8 right-8 text-6xl font-black text-muted/30 -z-10">3</div>
              <h3 className="text-xl font-bold text-secondary mb-3">Adaptasi Otomatis</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Guru menerima peringatan jika kelas mulai kehilangan fokus, dan aplikasi siswa otomatis menyesuaikan materi (teks/audio) agar otak tidak kelebihan beban.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Registration Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5 -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-secondary mb-6">Sudah Memiliki NERA Headband?</h2>
          <p className="text-lg text-muted-foreground mb-10 font-medium">
            Aktivasi perangkat Anda menggunakan Kode Lisensi (Serial Number) yang terdapat di dalam kemasan untuk membuat akun Orang Tua dan Siswa.
          </p>
          <Link href="/auth/register" className="organic-button text-lg px-10 py-5 shadow-2xl shadow-primary/30 inline-flex items-center">
            Mulai Aktivasi Perangkat <ArrowRight className="w-6 h-6 ml-3" />
          </Link>
          <p className="mt-8 text-sm text-muted-foreground font-bold">
            Atau jika Anda dari Pihak Sekolah, silakan <Link href="/auth/login" className="text-primary hover:underline">Masuk di sini</Link>.
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
