'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [focus, setFocus] = useState(75);
  const [stress, setStress] = useState(30);

  const startDemo = () => {
    setIsRunning(true);
    // Simulate EEG data changes
    const interval = setInterval(() => {
      setFocus(Math.floor(Math.random() * 40) + 60);
      setStress(Math.floor(Math.random() * 40) + 10);
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      setIsRunning(false);
    }, 15000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-sage-800">NERA</span>
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-sage-700 text-white rounded-lg hover:bg-sage-800 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-sage-900 mb-6">
            Demo Simulator EEG
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto mb-8">
            Lihat bagaimana NERA menganalisis data EEG secara real-time untuk pembelajaran adaptif
          </p>
          <div className="inline-block px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm">
            ⚡ Simulator - Tidak memerlukan headband fisik
          </div>
        </div>
      </section>

      {/* Demo Interface */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-lg border border-sage-100 p-8">
            
            {/* Control Panel */}
            <div className="text-center mb-12">
              <button
                onClick={startDemo}
                disabled={isRunning}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                  isRunning
                    ? 'bg-sage-300 text-sage-600 cursor-not-allowed'
                    : 'bg-sage-700 text-white hover:bg-sage-800 hover:scale-105'
                }`}
              >
                {isRunning ? '⏳ Simulasi Berjalan...' : '▶️ Mulai Demo 15 Detik'}
              </button>
            </div>

            {/* Metrics Display */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Focus Index */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <h3 className="text-lg font-bold text-sage-900">Indeks Fokus</h3>
                    <p className="text-sm text-sage-600">Tingkat konsentrasi saat ini</p>
                  </div>
                </div>
                <div className="text-5xl font-bold text-green-700 mb-2">{focus}%</div>
                <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${focus}%` }}
                  ></div>
                </div>
                <p className="text-sm text-sage-600 mt-2">
                  {focus > 70 ? '✅ Fokus Tinggi' : focus > 50 ? '⚠️ Fokus Sedang' : '❌ Fokus Rendah'}
                </p>
              </div>

              {/* Stress Index */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">😰</span>
                  <div>
                    <h3 className="text-lg font-bold text-sage-900">Indeks Stres</h3>
                    <p className="text-sm text-sage-600">Tingkat stres kognitif</p>
                  </div>
                </div>
                <div className="text-5xl font-bold text-orange-700 mb-2">{stress}%</div>
                <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                    style={{ width: `${stress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-sage-600 mt-2">
                  {stress < 30 ? '✅ Stres Rendah' : stress < 50 ? '⚠️ Stres Sedang' : '❌ Stres Tinggi'}
                </p>
              </div>
            </div>

            {/* Brain Waves Visualization */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-sage-900 mb-4 flex items-center gap-2">
                <span>🧠</span>
                Gelombang Otak Real-time
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Alpha (8-13 Hz)', value: 65, color: 'bg-blue-500' },
                  { name: 'Beta (13-30 Hz)', value: 80, color: 'bg-purple-500' },
                  { name: 'Theta (4-8 Hz)', value: 40, color: 'bg-green-500' },
                  { name: 'Gamma (30+ Hz)', value: 55, color: 'bg-pink-500' },
                ].map((wave) => (
                  <div key={wave.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-sage-700 font-medium">{wave.name}</span>
                      <span className="text-sage-600">{wave.value}%</span>
                    </div>
                    <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${wave.color} transition-all duration-500`}
                        style={{ width: `${wave.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            {isRunning && (
              <div className="mt-8 bg-gradient-to-r from-sage-700 to-sage-800 text-white p-6 rounded-xl">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <span>🤖</span>
                  Rekomendasi AI
                </h3>
                <p className="text-sage-100">
                  {focus > 70 && stress < 40
                    ? '✨ Kondisi optimal! Waktu yang tepat untuk materi sulit.'
                    : focus < 50
                    ? '💡 Fokus menurun. Disarankan istirahat 5 menit atau gunakan teknik Pomodoro.'
                    : stress > 50
                    ? '🧘 Stres tinggi terdeteksi. Coba latihan pernapasan atau break sejenak.'
                    : '📚 Kondisi baik untuk belajar. Lanjutkan dengan materi saat ini.'}
                </p>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl border border-sage-100 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-sage-900 mb-2">Real-time Analysis</h3>
              <p className="text-sm text-sage-700">
                Data EEG dianalisis setiap detik untuk insight akurat
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sage-100 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-sage-900 mb-2">Adaptive Content</h3>
              <p className="text-sm text-sage-700">
                Konten menyesuaikan dengan kondisi kognitif Anda
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sage-100 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-sage-900 mb-2">AI Recommendations</h3>
              <p className="text-sm text-sage-700">
                Saran belajar personalized berdasarkan data otak
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Tertarik Mencoba dengan Akun Anda?
          </h2>
          <p className="text-sage-200 mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan rasakan pembelajaran adaptif dengan teknologi EEG
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Mulai Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sage-900 text-sage-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 NERA Neuro-Adaptive Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
