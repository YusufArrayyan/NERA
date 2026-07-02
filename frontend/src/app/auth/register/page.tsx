"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Key, User, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    licenseKey: '',
    name: '',
    email: '',
    password: '',
    role: 'PARENT' // Default role for B2C registration
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulasi verifikasi kode lisensi dan pendaftaran
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background relative overflow-hidden py-10">
      {/* Organic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-[#E8F0DF] rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FDF1E6] rounded-full blur-[80px]" />

      <div className="z-10 w-full max-w-md px-6 sm:px-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-secondary mb-2">Aktivasi Perangkat</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Masukkan Kode Lisensi dari kemasan Headband NERA Anda.
          </p>
        </div>

        <div className="organic-card p-8 bg-white/90 backdrop-blur-sm shadow-xl">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Aktivasi Berhasil!</h3>
              <p className="text-sm text-muted-foreground">Akun Orang Tua dan Siswa telah dibuat. Mengarahkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary ml-1">Kode Lisensi (Serial Number)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Key className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={formData.licenseKey}
                    onChange={(e) => setFormData({...formData, licenseKey: e.target.value.toUpperCase()})}
                    placeholder="NERA-XXXX-XXXX"
                    className="flex h-12 w-full rounded-2xl border border-primary/50 bg-primary/5 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-secondary uppercase placeholder:normal-case"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 mt-4">
                <label className="text-xs font-bold text-secondary ml-1">Nama Lengkap Orang Tua</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><User className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Budi Sudarsono"
                    className="flex h-12 w-full rounded-2xl border border-border/50 bg-muted/60 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-secondary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary ml-1">Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Mail className="w-4 h-4" /></div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@contoh.com"
                    className="flex h-12 w-full rounded-2xl border border-border/50 bg-muted/60 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-secondary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary ml-1">Password Baru</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="w-4 h-4" /></div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Minimal 8 karakter"
                    className="flex h-12 w-full rounded-2xl border border-border/50 bg-muted/60 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium text-secondary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="organic-button w-full h-12 mt-6 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Daftar & Aktivasi <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 text-center text-sm">
              <a href="/auth/login" className="text-muted-foreground hover:text-primary font-medium transition-colors">
                Sudah punya akun? Masuk di sini
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
