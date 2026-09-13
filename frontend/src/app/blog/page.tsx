import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'Bagaimana EEG Mengubah Cara Kita Belajar',
    excerpt: 'Pelajari bagaimana teknologi EEG dapat mengidentifikasi pola fokus dan stres untuk pembelajaran yang lebih efektif.',
    date: '15 Agustus 2024',
    category: 'Teknologi',
    image: '🧠',
  },
  {
    id: 2,
    title: '5 Strategi Meningkatkan Fokus Belajar',
    excerpt: 'Tips praktis berbasis neurosains untuk memaksimalkan konsentrasi dan retensi informasi saat belajar.',
    date: '10 Agustus 2024',
    category: 'Tips Belajar',
    image: '🎯',
  },
  {
    id: 3,
    title: 'Peran AI dalam Pendidikan Adaptif',
    excerpt: 'Bagaimana kecerdasan buatan membantu mempersonalisasi pengalaman belajar setiap siswa.',
    date: '5 Agustus 2024',
    category: 'AI & Pendidikan',
    image: '🤖',
  },
  {
    id: 4,
    title: 'Mengenal Gelombang Otak: Alpha, Beta, Theta',
    excerpt: 'Penjelasan lengkap tentang berbagai jenis gelombang otak dan pengaruhnya terhadap pembelajaran.',
    date: '1 Agustus 2024',
    category: 'Neurosains',
    image: '🌊',
  },
  {
    id: 5,
    title: 'Gamifikasi: Meningkatkan Motivasi Belajar',
    excerpt: 'Bagaimana elemen game dalam pembelajaran dapat meningkatkan engagement dan hasil belajar.',
    date: '28 Juli 2024',
    category: 'Gamifikasi',
    image: '🎮',
  },
  {
    id: 6,
    title: 'Kesehatan Mental Siswa di Era Digital',
    excerpt: 'Pentingnya monitoring stres dan kesejahteraan mental dalam proses pembelajaran modern.',
    date: '20 Juli 2024',
    category: 'Kesehatan Mental',
    image: '💚',
  },
];

export default function BlogPage() {
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
            Blog NERA
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto">
            Artikel, tips, dan insight tentang pembelajaran adaptif, neurosains, dan teknologi pendidikan
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-sage-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="text-6xl mb-4 text-center">{post.image}</div>
                  <div className="inline-block px-3 py-1 bg-sage-100 text-sage-700 text-sm rounded-full mb-3">
                    {post.category}
                  </div>
                  <h2 className="text-xl font-bold text-sage-900 mb-3 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-sage-700 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-sage-600">
                    <span>{post.date}</span>
                    <button className="text-sage-700 font-semibold hover:text-sage-900">
                      Baca Selengkapnya →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-20 bg-sage-800 text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">
            Dapatkan Update Terbaru
          </h2>
          <p className="text-sage-200 mb-8">
            Berlangganan newsletter kami untuk mendapatkan artikel, tips, dan update terbaru seputar pembelajaran adaptif
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-sage-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
            <button className="px-6 py-3 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors">
              Berlangganan
            </button>
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
