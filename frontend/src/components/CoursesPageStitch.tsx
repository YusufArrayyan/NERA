'use client';

import React, { useState } from 'react';
import { Search, Filter, BookOpen, Zap, Clock, Users, CheckCircle, Lock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function CoursesPageStitch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua', icon: '📚' },
    { id: 'science', label: 'Sains & Fisika', icon: '🔬' },
    { id: 'math', label: 'Matematika Terapan', icon: '📐' },
    { id: 'biology', label: 'Biologi', icon: '🧬' },
    { id: 'logic', label: 'Logika & Kode', icon: '💻' },
  ];

  const courses = [
    {
      id: 1,
      category: 'science',
      categoryLabel: 'SAINS & FISIKA',
      title: 'Fisika Kuantum: Dualitas Gelombang-Partikel',
      description: 'Eksplor eksperimen celah ganda adaptif dengan visualisasi partikel real-time.',
      eegState: 'Alpha Stabil',
      duration: '45m',
      level: '3',
      progress: 65,
      students: '1.4k',
      status: 'in-progress',
      badge: '▶️ Lanjut',
    },
    {
      id: 2,
      category: 'math',
      categoryLabel: 'MATEMATIKA TERAPAN',
      title: 'Kalkulus Diferensial Lanjut',
      description: 'Optimasi turunan parsial multivariabel dengan representasi topologi 3D.',
      eegState: 'Beta-rendah',
      duration: '45m',
      level: '3',
      progress: 85,
      students: '0.8k',
      status: 'in-progress',
      badge: '▶️ Lanjut',
    },
    {
      id: 3,
      category: 'biology',
      categoryLabel: 'BIOLOGI & NEUROSAINS',
      title: 'Biologi Sel & Neurotransmiter',
      description: 'Mekanisme transmisi vesikel sinaptik dengan simulasi mikroskopis.',
      eegState: 'Theta Dalam',
      duration: '28m',
      level: '2',
      progress: 45,
      students: '0.6k',
      status: 'in-progress',
      badge: '▶️ Lanjut',
    },
    {
      id: 4,
      category: 'science',
      categoryLabel: 'SAINS TERAPAN',
      title: 'Kimia Organik: Reaksi Nukleofilik',
      description: 'Analisis sterik substitusi SN1 vs SN2 dengan visualisasi orbit molekul.',
      eegState: 'Alpha Stabil',
      duration: '40m',
      level: '3',
      progress: 72,
      students: '0.9k',
      status: 'in-progress',
      badge: '▶️ Lanjut',
    },
    {
      id: 5,
      category: 'logic',
      categoryLabel: 'KOMPUTASI & LOGIKA',
      title: 'Struktur Data & Graf Lanjut',
      description: 'Traversing Dijkstra dan A* Search dengan visualisasi heuristik langsung.',
      eegState: 'Theta Dalam',
      duration: '50m',
      level: '4',
      progress: 0,
      students: '1.2k',
      status: 'locked',
      badge: '🔒 Terkunci',
    },
    {
      id: 6,
      category: 'math',
      categoryLabel: 'MATEMATIKA TERAPAN',
      title: 'Aljabar Linear & Eigenvalue',
      description: 'Dekomposisi matriks dan aplikasi machine learning dengan visualisasi 3D.',
      eegState: 'Beta Stabil',
      duration: '55m',
      level: '4',
      progress: 0,
      students: '0.7k',
      status: 'locked',
      badge: '🔒 Terkunci',
    },
  ];

  const filteredCourses =
    selectedCategory === 'all'
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  const getEEGColor = (state: string) => {
    if (state.includes('Alpha')) return 'bg-green-100 text-green-700';
    if (state.includes('Beta')) return 'bg-blue-100 text-blue-700';
    if (state.includes('Theta')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs md:text-sm text-green-600 font-semibold tracking-wide">
                KURIKULUM BERBASIS NEUROBIOTRIK
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
                Pilih Materi & Siapkan Gelombang Fokus
              </h1>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari topik, misal: apa topik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 flex items-center gap-2 text-neutral-700 font-medium">
                  <Filter className="w-4 h-4" />
                  Filter Layanan
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-green-300'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} variant="elevated">
              <CardBody className="space-y-4">
                {/* Header */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-600 tracking-wide">
                    {course.categoryLabel}
                  </p>
                  <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                    {course.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {course.description}
                </p>

                {/* EEG State Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEEGColor(course.eegState)}`}>
                    {course.eegState}
                  </span>
                </div>

                {/* Progress Bar (if in progress) */}
                {course.status === 'in-progress' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-600">Progres Pembelajaran</span>
                      <span className="font-semibold text-neutral-900">{course.progress}%</span>
                    </div>
                    <ProgressBar value={course.progress} />
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-600">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-600">Tingkat {course.level}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-600">{course.students}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant={course.status === 'locked' ? 'outline' : 'primary'}
                  className="w-full"
                  disabled={course.status === 'locked'}
                >
                  {course.status === 'in-progress' ? (
                    <>
                      ▶️ Mulai Sesi dengan Headband
                    </>
                  ) : (
                    <>
                      🔒 Selesaikan Prerequisite
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">Tidak ada modul ditemukan</p>
          </div>
        )}
      </main>
    </div>
  );
}
