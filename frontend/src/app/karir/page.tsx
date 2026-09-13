import Link from 'next/link';

const openPositions = [
  {
    id: 1,
    title: 'Senior Neuroscience Researcher',
    department: 'Research & Development',
    location: 'Jakarta / Remote',
    type: 'Full-time',
    icon: '🧬',
  },
  {
    id: 2,
    title: 'Full-Stack Engineer',
    department: 'Engineering',
    location: 'Jakarta / Hybrid',
    type: 'Full-time',
    icon: '💻',
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Jakarta / Remote',
    type: 'Full-time',
    icon: '🎨',
  },
  {
    id: 4,
    title: 'Machine Learning Engineer',
    department: 'AI & Data Science',
    location: 'Jakarta / Hybrid',
    type: 'Full-time',
    icon: '🤖',
  },
  {
    id: 5,
    title: 'Content Strategist',
    department: 'Marketing',
    location: 'Jakarta / Remote',
    type: 'Full-time',
    icon: '✍️',
  },
  {
    id: 6,
    title: 'Customer Success Manager',
    department: 'Customer Experience',
    location: 'Jakarta',
    type: 'Full-time',
    icon: '🤝',
  },
];

const benefits = [
  { icon: '💰', title: 'Gaji Kompetitif', description: 'Kompensasi yang setara dengan industri tech terbaik' },
  { icon: '🏥', title: 'Asuransi Kesehatan', description: 'Asuransi kesehatan premium untuk kamu dan keluarga' },
  { icon: '🏖️', title: 'Flexible Work', description: 'Work from home, hybrid, atau dari kantor - pilihan ada di tanganmu' },
  { icon: '📚', title: 'Learning Budget', description: 'Budget tahunan untuk kursus, konferensi, dan pengembangan diri' },
  { icon: '🚀', title: 'Growth Opportunity', description: 'Kesempatan berkembang di startup edtech yang fast-growing' },
  { icon: '🎉', title: 'Team Events', description: 'Team building, offsites, dan acara seru lainnya' },
];

export default function KarirPage() {
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

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-sage-900 mb-6">
            Bergabung dengan Tim NERA
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto mb-8">
            Bantu kami merevolusi pendidikan dengan teknologi neurosains dan AI
          </p>
          <div className="flex gap-4 justify-center text-sage-600">
            <div className="text-center">
              <div className="text-3xl font-bold text-sage-900">50+</div>
              <div className="text-sm">Tim Passionate</div>
            </div>
            <div className="w-px bg-sage-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sage-900">15+</div>
              <div className="text-sm">Negara</div>
            </div>
            <div className="w-px bg-sage-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sage-900">4.9/5</div>
              <div className="text-sm">Employee Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-sage-900 mb-12 text-center">
            Kenapa Bergabung dengan Kami?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-sage-900 mb-2">{benefit.title}</h3>
                <p className="text-sage-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-sage-900 mb-12 text-center">
            Posisi Terbuka
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position) => (
              <div
                key={position.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{position.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-sage-900 mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-sage-600 mb-4">
                      <span className="flex items-center gap-1">
                        <span>📂</span> {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📍</span> {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⏰</span> {position.type}
                      </span>
                    </div>
                    <button className="px-6 py-2 bg-sage-700 text-white rounded-lg hover:bg-sage-800 transition-colors text-sm font-semibold">
                      Lihat Detail & Lamar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Tidak Menemukan Posisi yang Cocok?
          </h2>
          <p className="text-sage-200 mb-8 max-w-2xl mx-auto">
            Kami selalu mencari talenta luar biasa! Kirim CV dan portofolio kamu ke team@nera.ai
          </p>
          <a
            href="mailto:team@nera.ai"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Kirim Lamaran Umum
          </a>
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
