"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background relative overflow-hidden">
      
      {/* Organic Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-[#E8F0DF] rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[60%] bg-[#FDF1E6] rounded-full blur-[80px]" />

      <div className="z-10 w-full max-w-md px-6 sm:px-0">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-secondary mb-2">NERA</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Neuro-Adaptive Cloud Learning
          </p>
        </div>

        <div className="organic-card p-8 bg-white/90 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary ml-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="siswa@neuroadaptive.com"
                className="flex h-14 w-full rounded-2xl border border-border/50 bg-muted/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground font-medium text-secondary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-secondary ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex h-14 w-full rounded-2xl border border-border/50 bg-muted/60 pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground font-medium text-secondary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="organic-button-secondary w-full h-14 mt-6 shadow-lg shadow-secondary/20"
            >
              {isLoggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Masuk ke NERA <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
            Gunakan akun demo: <br/>
            <span className="text-secondary">siswa@neuroadaptive.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
