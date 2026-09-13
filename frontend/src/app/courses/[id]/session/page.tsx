'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brain, Zap, Activity, CheckCircle, Lock } from 'lucide-react';

export default function CourseSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    // Simulate headband connection
    const timer = setTimeout(() => {
      setConnecting(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (connecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-4 border-sage-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-sage-600 rounded-full border-t-transparent animate-spin"></div>
            <Brain className="absolute inset-0 m-auto w-16 h-16 text-sage-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-sage-900 mb-2">
              Menghubungkan Headband...
            </h2>
            <p className="text-sage-600">
              Pastikan headband Anda sudah terpasang dengan benar
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/courses/${params.id}`)}
              className="text-sage-700 hover:text-sage-900 font-medium"
            >
              ← Kembali ke Course
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Headband Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: EEG Monitoring */}
          <div className="lg:col-span-1 space-y-6">
            {/* EEG Status */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                Status EEG Real-Time
              </h3>
              
              {/* Focus Level */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600">Tingkat Fokus</span>
                    <span className="text-lg font-bold text-green-600">87%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                      style={{ width: '87%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600">Tingkat Stres</span>
                    <span className="text-lg font-bold text-blue-600">23%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                      style={{ width: '23%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600">Kondisi Optimal</span>
                    <span className="text-lg font-bold text-purple-600">92%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Brain Wave */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">
                  Gelombang Otak Aktif
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Alpha (8-13 Hz)</span>
                    <span className="text-sm font-medium text-green-600">Dominan</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Beta (13-30 Hz)</span>
                    <span className="text-sm font-medium text-neutral-400">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Theta (4-8 Hz)</span>
                    <span className="text-sm font-medium text-neutral-400">Rendah</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-sage-50 to-sage-100 rounded-2xl p-6 border border-sage-200">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-sage-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-sage-900 mb-2">
                    AI Recommendation
                  </h4>
                  <p className="text-sm text-sage-700">
                    Kondisi kognitif Anda optimal! Ini waktu terbaik untuk materi kompleks seperti problem solving.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-neutral-900">
                  Progress Pembelajaran
                </h3>
                <span className="text-sm text-neutral-600">3 dari 8 modul</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full transition-all"
                  style={{ width: '37.5%' }}
                ></div>
              </div>
            </div>

            {/* Module List */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">
                Modul Pembelajaran
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: 1, title: 'Pengenalan Konsep Dasar', completed: true, duration: 15 },
                  { id: 2, title: 'Teori dan Prinsip Fundamental', completed: true, duration: 20 },
                  { id: 3, title: 'Aplikasi Praktis', completed: true, duration: 18 },
                  { id: 4, title: 'Studi Kasus Real-World', completed: false, active: true, duration: 25 },
                  { id: 5, title: 'Problem Solving Advanced', completed: false, duration: 22 },
                  { id: 6, title: 'Simulasi dan Eksperimen', completed: false, duration: 20 },
                  { id: 7, title: 'Evaluasi Komprehensif', completed: false, duration: 30 },
                  { id: 8, title: 'Proyek Akhir', completed: false, locked: true, duration: 40 },
                ].map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      module.active
                        ? 'border-sage-600 bg-sage-50'
                        : module.completed
                        ? 'border-green-200 bg-green-50'
                        : module.locked
                        ? 'border-neutral-100 bg-neutral-50 opacity-60'
                        : 'border-neutral-200 bg-white hover:border-sage-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {module.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : module.locked ? (
                          <Lock className="w-5 h-5 text-neutral-400" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            module.active ? 'border-sage-600' : 'border-neutral-300'
                          }`}></div>
                        )}
                        <div>
                          <h4 className={`font-semibold ${
                            module.active ? 'text-sage-900' : 'text-neutral-900'
                          }`}>
                            Modul {module.id}: {module.title}
                          </h4>
                          <span className="text-sm text-neutral-600">{module.duration} menit</span>
                        </div>
                      </div>
                      {module.active && (
                        <button className="px-4 py-2 bg-sage-600 text-white rounded-lg font-medium hover:bg-sage-700 transition-colors">
                          Lanjutkan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
