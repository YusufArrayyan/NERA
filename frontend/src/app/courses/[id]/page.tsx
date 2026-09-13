'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const courseId = params.id;

  // Mock course data
  const course = {
    id: courseId,
    title: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
    category: 'SAINS & FISIKA',
    description: 'Eksplor eksperimen celah ganda adaptif dengan visualisasi partikel real-time.',
    duration: 45,
    level: 3,
    students: 1400,
    objectives: [
      'Memahami konsep dualitas gelombang-partikel',
      'Menganalisis eksperimen celah ganda',
      'Menerapkan prinsip ketidakpastian Heisenberg',
      'Memvisualisasikan fungsi gelombang kuantum',
    ],
    modules: [
      { id: 1, title: 'Pengenalan Mekanika Kuantum', duration: 10, completed: true },
      { id: 2, title: 'Eksperimen Celah Ganda', duration: 15, completed: true },
      { id: 3, title: 'Fungsi Gelombang & Probabilitas', duration: 12, completed: false },
      { id: 4, title: 'Prinsip Ketidakpastian', duration: 8, completed: false },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2 text-sage-700 hover:text-sage-900">
            <span>←</span>
            <span>Kembali ke Courses</span>
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-sage-700 text-white rounded-lg hover:bg-sage-800 transition-colors"
          >
            Login untuk Akses Penuh
          </Link>
        </div>
      </header>

      {/* Course Header */}
      <section className="py-12 bg-gradient-to-r from-sage-700 to-sage-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold text-sage-200 mb-2">{course.category}</p>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-sage-100 text-lg mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{course.duration} menit</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>Level {course.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>{course.students.toLocaleString()} siswa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Learning Objectives */}
              <div className="bg-white p-6 rounded-xl border border-sage-100">
                <h2 className="text-2xl font-bold text-sage-900 mb-4">
                  Yang Akan Kamu Pelajari
                </h2>
                <ul className="space-y-3">
                  {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-sage-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modules */}
              <div className="bg-white p-6 rounded-xl border border-sage-100">
                <h2 className="text-2xl font-bold text-sage-900 mb-6">
                  Modul Pembelajaran
                </h2>
                <div className="space-y-3">
                  {course.modules.map((module) => (
                    <div
                      key={module.id}
                      className={`p-4 rounded-lg border transition-all ${
                        module.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-sage-50 border-sage-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl ${module.completed ? '✅' : '📘'}`} />
                          <div>
                            <h3 className="font-semibold text-sage-900">{module.title}</h3>
                            <p className="text-sm text-sage-600">{module.duration} menit</p>
                          </div>
                        </div>
                        {module.completed && (
                          <span className="text-sm text-green-600 font-semibold">Selesai</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Start Learning Card */}
              <div className="bg-white p-6 rounded-xl border border-sage-100 sticky top-24">
                <h3 className="text-xl font-bold text-sage-900 mb-4">
                  Siap Memulai?
                </h3>
                <p className="text-sage-700 mb-6 text-sm">
                  Login untuk mengakses materi lengkap dan tracking progress dengan teknologi EEG.
                </p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-3 bg-sage-700 text-white rounded-lg font-semibold hover:bg-sage-800 transition-colors mb-3"
                >
                  Login & Mulai Belajar
                </button>
                <Link
                  href="/demo"
                  className="block w-full py-3 bg-sage-100 text-sage-800 rounded-lg font-semibold hover:bg-sage-200 transition-colors text-center"
                >
                  Lihat Demo
                </Link>
              </div>

              {/* Requirements */}
              <div className="bg-white p-6 rounded-xl border border-sage-100">
                <h3 className="text-lg font-bold text-sage-900 mb-4">
                  Persyaratan
                </h3>
                <ul className="space-y-2 text-sm text-sage-700">
                  <li className="flex items-start gap-2">
                    <span>📚</span>
                    <span>Pengetahuan dasar fisika</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🧮</span>
                    <span>Matematika SMA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🧠</span>
                    <span>EEG headband (opsional)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
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
