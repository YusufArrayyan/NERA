import Link from 'next/link';

const features = [
  {
    category: 'Monitoring EEG Real-time',
    icon: '🧠',
    items: [
      'Tracking gelombang otak (Alpha, Beta, Theta, Gamma) secara real-time',
      'Analisis fokus, stres, dan perhatian otomatis',
      'Visualisasi data EEG yang mudah dipahami',
      'Deteksi pola belajar optimal setiap siswa',
    ],
  },
  {
    category: 'Pembelajaran Adaptif',
    icon: '🎯',
    items: [
      'Konten yang menyesuaikan dengan kondisi kognitif siswa',
      'Rekomendasi materi berdasarkan tingkat fokus',
      'Mode pembelajaran: Visual, Auditory, Interactive',
      'Penyesuaian tingkat kesulitan secara dinamis',
    ],
  },
  {
    category: 'Sistem Gamifikasi',
    icon: '🎮',
    items: [
      'XP, level, dan sistem reward yang engaging',
      'Badge dan achievement untuk milestone pembelajaran',
      'Leaderboard dan kompetisi sehat antar siswa',
      'Streak tracker untuk konsistensi belajar',
    ],
  },
  {
    category: 'Dashboard Analytics',
    icon: '📊',
    items: [
      'Laporan performa harian, mingguan, dan bulanan',
      'Insight mendalam tentang pola belajar',
      'Progress tracking untuk setiap mata pelajaran',
      'Perbandingan performa dengan periode sebelumnya',
    ],
  },
  {
    category: 'Intervensi Cerdas',
    icon: '🚨',
    items: [
      'Deteksi otomatis siswa yang membutuhkan bantuan',
      'Notifikasi ke guru dan konselor',
      'Rekomendasi strategi pembelajaran alternatif',
      'Break reminder ketika stres tinggi',
    ],
  },
  {
    category: 'AI Assistant',
    icon: '🤖',
    items: [
      'Rekomendasi konten pembelajaran personalized',
      'Chat assistant untuk bantuan belajar',
      'Prediksi performa dan area yang perlu diperbaiki',
      'Auto-generated study plan optimal',
    ],
  },
  {
    category: 'Jurnal Refleksi',
    icon: '📝',
    items: [
      'Journaling digital dengan prompt AI',
      'Tracking mood dan kondisi emosional',
      'Insight dari data EEG harian',
      'Ekspor dan review refleksi pembelajaran',
    ],
  },
  {
    category: 'Kolaborasi Multi-role',
    icon: '👥',
    items: [
      'Dashboard khusus untuk siswa, guru, orang tua, admin',
      'Komunikasi langsung antar stakeholder',
      'Notifikasi real-time untuk semua pihak',
      'Export laporan untuk review bersama',
    ],
  },
];

export default function FiturPage() {
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
            Fitur Lengkap untuk Pembelajaran Adaptif
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto">
            Platform all-in-one yang menggabungkan teknologi EEG, AI, dan gamifikasi untuk pembelajaran yang lebih efektif
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-sage-100"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-sage-900 flex-1">
                    {feature.category}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sage-700">
                      <span className="text-sage-600 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Siap Merasakan Pembelajaran yang Berbeda?
          </h2>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Coba Gratis Sekarang
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
