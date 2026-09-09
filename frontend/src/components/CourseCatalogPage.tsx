'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  TrendingUp,
  Star,
  Play,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function CourseCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'semua', label: 'Semua' },
    { id: 'sains', label: 'Sains & Fisika' },
    { id: 'matematika', label: 'Matematika Terapan' },
    { id: 'biologi', label: 'Biologi & Neurosains' },
    { id: 'bahasa', label: 'Bahasa & Linguistik' },
    { id: 'teknologi', label: 'Teknologi & Data' },
  ];

  const courses = [
    {
      id: 1,
      title: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
      category: 'sains',
      description: 'Pelajari konsep dasar fisika kuantum dengan fokus pada sifat dual partikel.',
      instructor: 'Prof. Bambang Sutrisno',
      duration: '8 minggu',
      difficulty: 'Menengah',
      students: 342,
      rating: 4.8,
      progress: 65,
      status: 'in-progress',
      modules: 12,
      completedModules: 8,
      nextLesson: 'Superposisi & Entanglement',
      icon: '⚛️',
    },
    {
      id: 2,
      title: 'Kalkulus Diferensial Lanjut',
      category: 'matematika',
      description: 'Optimasi menggunakan kalkulus multivariabel dan aplikasi real-world.',
      instructor: 'Dr. Siti Nurhaliza',
      duration: '6 minggu',
      difficulty: 'Lanjut',
      students: 189,
      rating: 4.9,
      progress: 0,
      status: 'locked',
      modules: 10,
      completedModules: 0,
      prerequisites: 'Kalkulus Dasar & Linear Algebra',
      icon: '∫',
    },
    {
      id: 3,
      title: 'Biologi Sel & Neurotransmitter',
      category: 'biologi',
      description: 'Mekanisme replikasi DNA, mitosis, dan peran neurotransmitter dalam pembelajaran.',
      instructor: 'Dr. Hendra Wijaya',
      duration: '7 minggu',
      difficulty: 'Menengah',
      students: 256,
      rating: 4.7,
      progress: 0,
      status: 'available',
      modules: 11,
      completedModules: 0,
      icon: '🧬',
    },
    {
      id: 4,
      title: 'Kimia Organik: Reaksi & Redoks',
      category: 'sains',
      description: 'Strategi sintesis, reaksi organik penting, dan mekanisme transformasi molekul.',
      instructor: 'Prof. Rini Kusuma',
      duration: '8 minggu',
      difficulty: 'Lanjut',
      students: 145,
      rating: 4.6,
      progress: 45,
      status: 'in-progress',
      modules: 12,
      completedModules: 5,
      icon: '🧪',
    },
    {
      id: 5,
      title: 'Struktur Data & Pemrograman Web',
      category: 'teknologi',
      description: 'Implementasi grafis, algoritma traversal, dan aplikasi struktur data dalam web development.',
      instructor: 'Dev. Aji Prasetyo',
      duration: '10 minggu',
      difficulty: 'Lanjut',
      students: 523,
      rating: 4.9,
      progress: 0,
      status: 'available',
      modules: 15,
      completedModules: 0,
      icon: '💻',
    },
    {
      id: 6,
      title: 'Bahasa Inggris: Academic Reading Comprehension',
      category: 'bahasa',
      description: 'Analisis kritis artikel jurnal, advanced reading techniques, dan vocabulary expansion.',
      instructor: 'Native Speaker Prof. James',
      duration: '6 minggu',
      difficulty: 'Menengah',
      students: 401,
      rating: 4.8,
      progress: 0,
      status: 'available',
      modules: 9,
      completedModules: 0,
      icon: '📖',
    },
  ];

  const filteredCourses = courses.filter(
    (course) =>
      (selectedCategory === 'semua' || course.category === selectedCategory) &&
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge variant="primary" size="sm" className="mb-2">
                KATALOG MODUL
              </Badge>
              <h1 className="text-4xl font-bold text-neutral-900">Pilih Materi & Siapkan Gelombang Fokus</h1>
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filter Lanjut
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari topik, instruktur, atau modul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200">
          <p className="text-neutral-600">
            <span className="font-bold text-neutral-900">{filteredCourses.length}</span> kursus tersedia
          </p>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort" className="w-4 h-4" defaultChecked />
              <span className="text-neutral-700">Populer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort" className="w-4 h-4" />
              <span className="text-neutral-700">Rating Tertinggi</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="sort" className="w-4 h-4" />
              <span className="text-neutral-700">Terbaru</span>
            </label>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              variant="elevated"
              className={course.status === 'locked' ? 'opacity-60' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{course.icon}</div>
                  <Badge
                    variant={
                      course.status === 'in-progress'
                        ? 'success'
                        : course.status === 'available'
                        ? 'info'
                        : 'default'
                    }
                    size="sm"
                  >
                    {course.status === 'in-progress'
                      ? '📖 Sedang Berjalan'
                      : course.status === 'available'
                      ? '▶️ Tersedia'
                      : '🔒 Terkunci'}
                  </Badge>
                </div>
                <h3 className="font-bold text-neutral-900 text-lg">{course.title}</h3>
                <p className="text-xs text-neutral-600 mt-2">{course.description}</p>
              </CardHeader>

              <CardBody className="space-y-4">
                {/* Instructor */}
                <div className="text-sm">
                  <p className="text-neutral-600">
                    Oleh <span className="font-semibold text-neutral-900">{course.instructor}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-3 border-y border-neutral-200">
                  <div className="text-center">
                    <Clock className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-neutral-900">{course.duration}</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-4 h-4 text-neutral-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-neutral-900">{course.modules} modul</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-semibold">{course.rating}</span>
                    </div>
                    <p className="text-xs text-neutral-600">({course.students})</p>
                  </div>
                </div>

                {/* Difficulty */}
                <Badge
                  variant={course.difficulty === 'Lanjut' ? 'error' : 'warning'}
                  size="sm"
                >
                  {course.difficulty === 'Lanjut' ? '🔴 Lanjut' : '🟡 Menengah'}
                </Badge>

                {/* Progress or Prerequisites */}
                {course.status === 'in-progress' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-neutral-700">Progress</p>
                      <p className="text-xs font-bold text-neutral-900">
                        {course.completedModules}/{course.modules}
                      </p>
                    </div>
                    <ProgressBar value={course.progress} label="" variant="success" size="sm" showLabel={false} />
                    {course.nextLesson && (
                      <p className="text-xs text-neutral-600 mt-2">
                        Lanjut: <span className="font-semibold">{course.nextLesson}</span>
                      </p>
                    )}
                  </div>
                )}

                {course.status === 'locked' && course.prerequisites && (
                  <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">Prasyarat:</p>
                    <p className="text-xs text-yellow-800">{course.prerequisites}</p>
                  </div>
                )}
              </CardBody>

              <CardFooter>
                <Button
                  variant={
                    course.status === 'in-progress'
                      ? 'primary'
                      : course.status === 'available'
                      ? 'secondary'
                      : 'ghost'
                  }
                  size="sm"
                  className="w-full"
                  disabled={course.status === 'locked'}
                >
                  {course.status === 'in-progress' && (
                    <>
                      <Play className="w-4 h-4" />
                      Lanjutkan
                    </>
                  )}
                  {course.status === 'available' && (
                    <>
                      <Play className="w-4 h-4" />
                      Mulai Kursus
                    </>
                  )}
                  {course.status === 'locked' && (
                    <>
                      <Lock className="w-4 h-4" />
                      Terkunci
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: '🎯 Kurikulum Terintegrasi',
                  desc: 'Modul didesain berdasarkan kurikulum nasional + adaptasi neuroscience',
                },
                {
                  title: '🧠 Biofeedback Real-Time',
                  desc: 'Konten menyesuaikan dengan gelombang otak Anda selama pembelajaran',
                },
                {
                  title: '📊 Progress Tracking',
                  desc: 'Dashboard detail untuk monitor learning journey Anda vs rekomendasi',
                },
              ].map((info, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-neutral-900 mb-2">{info.title}</p>
                  <p className="text-sm text-neutral-600">{info.desc}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
