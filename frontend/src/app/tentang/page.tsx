import Link from 'next/link';

export default function TentangPage() {
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
            Tentang NERA
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto">
            Platform pembelajaran adaptif berbasis EEG untuk masa depan pendidikan
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-sage-900 mb-8 text-center">
            Cerita Kami
          </h2>
          <div className="space-y-6 text-sage-700 text-lg leading-relaxed">
            <p>
              NERA (Neuro-Adaptive Platform) lahir dari visi untuk merevolusi cara kita belajar
              dengan memanfaatkan teknologi EEG (Electroencephalography) dan kecerdasan buatan.
            </p>
            <p>
              Kami percaya bahwa setiap siswa memiliki pola belajar yang unik. Dengan memahami
              aktivitas otak secara real-time, NERA dapat menyesuaikan konten pembelajaran,
              memberikan intervensi tepat waktu, dan membantu siswa mencapai potensi maksimal mereka.
            </p>
            <p>
              Platform ini dikembangkan melalui riset mendalam di bidang neurosains, pendidikan,
              dan teknologi. Tim kami terdiri dari peneliti, pendidik, dan engineer yang berdedikasi
              untuk menciptakan masa depan pendidikan yang lebih personal dan efektif.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-100">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-sage-900 mb-4">Misi Kami</h3>
              <p className="text-sage-700 leading-relaxed">
                Memberdayakan setiap siswa dengan teknologi pembelajaran adaptif yang
                memahami kondisi kognitif mereka secara real-time, sehingga pembelajaran
                menjadi lebih efektif, personal, dan menyenangkan.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-100">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-sage-900 mb-4">Visi Kami</h3>
              <p className="text-sage-700 leading-relaxed">
                Menjadi platform pembelajaran berbasis neurosains terdepan di dunia yang
                mengubah cara jutaan siswa belajar dan berkembang, dengan fokus pada
                kesejahteraan mental dan hasil pembelajaran yang optimal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-sage-900 mb-12 text-center">
            Nilai-Nilai Kami
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">🧬</div>
              <h3 className="text-xl font-bold text-sage-900 mb-2">Berbasis Sains</h3>
              <p className="text-sage-700">
                Setiap fitur didukung oleh riset neurosains dan pendidikan terkini
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-sage-900 mb-2">Empati</h3>
              <p className="text-sage-700">
                Mengutamakan kesejahteraan mental dan emosional setiap siswa
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-sage-900 mb-2">Privasi</h3>
              <p className="text-sage-700">
                Data EEG dan pembelajaran siswa dilindungi dengan keamanan tingkat enterprise
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Siap Bergabung dengan Revolusi Pembelajaran?
          </h2>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Mulai Sekarang
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
