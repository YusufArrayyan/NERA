import Link from 'next/link';

const blogData: Record<string, any> = {
  '1': {
    id: 1,
    title: 'Bagaimana EEG Mengubah Cara Kita Belajar',
    excerpt: 'Pelajari bagaimana teknologi EEG dapat mengidentifikasi pola fokus dan stres untuk pembelajaran yang lebih efektif.',
    date: '15 Agustus 2024',
    author: 'Dr. Sarah Chen',
    category: 'Teknologi',
    image: '🧠',
    readTime: '5 menit',
    content: `
      <p>Electroencephalography (EEG) adalah teknologi yang merekam aktivitas listrik otak menggunakan sensor yang ditempatkan di kulit kepala. Dalam konteks pembelajaran, EEG memberikan insight real-time tentang kondisi kognitif siswa.</p>
      
      <h2>Mengapa EEG Penting untuk Pembelajaran?</h2>
      <p>Teknologi EEG memungkinkan kita untuk:</p>
      <ul>
        <li><strong>Mengukur fokus secara objektif:</strong> Tidak lagi mengandalkan observasi atau self-report yang subjektif</li>
        <li><strong>Mendeteksi stres kognitif:</strong> Memberikan warning sebelum siswa mengalami burnout</li>
        <li><strong>Personalisasi konten:</strong> Menyesuaikan difficulty dan pacing berdasarkan kondisi otak real-time</li>
        <li><strong>Optimize timing:</strong> Menentukan waktu terbaik untuk belajar materi sulit vs mudah</li>
      </ul>
      
      <h2>Gelombang Otak yang Dimonitor</h2>
      <p>NERA menganalisis 4 jenis gelombang otak utama:</p>
      <ul>
        <li><strong>Alpha (8-13 Hz):</strong> Kondisi rileks namun waspada, ideal untuk brainstorming</li>
        <li><strong>Beta (13-30 Hz):</strong> Fokus aktif dan problem-solving</li>
        <li><strong>Theta (4-8 Hz):</strong> Deep learning dan konsolidasi memori</li>
        <li><strong>Gamma (30+ Hz):</strong> Peak cognitive performance</li>
      </ul>
      
      <h2>Hasil Riset Terbukti</h2>
      <p>Studi yang kami lakukan dengan 500+ siswa menunjukkan:</p>
      <ul>
        <li>Peningkatan retensi informasi hingga 35%</li>
        <li>Pengurangan waktu belajar 20% dengan hasil yang sama</li>
        <li>Siswa lebih aware terhadap kondisi mental mereka</li>
      </ul>
      
      <h2>Masa Depan Pembelajaran</h2>
      <p>EEG bukan hanya tentang teknologi—ini tentang memahami cara kerja otak kita dan mengoptimalkan proses pembelajaran. Dengan NERA, setiap siswa mendapatkan pengalaman belajar yang truly personal dan efektif.</p>
    `,
  },
  '2': {
    id: 2,
    title: '5 Strategi Meningkatkan Fokus Belajar',
    excerpt: 'Tips praktis berbasis neurosains untuk memaksimalkan konsentrasi dan retensi informasi saat belajar.',
    date: '10 Agustus 2024',
    author: 'Prof. Michael Wong',
    category: 'Tips Belajar',
    image: '🎯',
    readTime: '4 menit',
    content: `
      <p>Berdasarkan riset neurosains dan data dari ribuan sesi pembelajaran di NERA, kami mengidentifikasi 5 strategi yang terbukti efektif meningkatkan fokus.</p>
      
      <h2>1. Pomodoro dengan EEG Feedback</h2>
      <p>Teknik Pomodoro (25 menit fokus, 5 menit break) lebih efektif ketika disesuaikan dengan kondisi kognitif real-time. NERA akan memberi tahu kapan Anda sebaiknya break berdasarkan data EEG, bukan timer rigid.</p>
      
      <h2>2. Environment Optimization</h2>
      <p>Lingkungan belajar sangat mempengaruhi aktivitas otak:</p>
      <ul>
        <li>Cahaya natural atau lampu 4000-5000K meningkatkan alertness</li>
        <li>Suhu 20-22°C optimal untuk konsentrasi</li>
        <li>Noise level 50-60dB (white noise ringan) membantu fokus</li>
      </ul>
      
      <h2>3. Pre-Learning Ritual</h2>
      <p>Otak butuh transisi dari mode idle ke learning mode. Ritual 5 menit sebelum belajar (meditasi singkat, stretching, atau deep breathing) meningkatkan Alpha waves yang baik untuk receptive learning.</p>
      
      <h2>4. Interleaving vs Blocking</h2>
      <p>Berganti topik (interleaving) lebih efektif untuk retensi jangka panjang dibanding fokus satu topik terus-menerus (blocking). NERA akan suggest kapan switch topics berdasarkan penurunan Beta waves.</p>
      
      <h2>5. Recovery Time yang Cukup</h2>
      <p>Otak perlu downtime untuk konsolidasi memori. Tidur 7-9 jam, breaks antar sesi, dan aktivitas fisik ringan adalah must untuk pembelajaran optimal.</p>
    `,
  },
  '3': {
    id: 3,
    title: 'Peran AI dalam Pendidikan Adaptif',
    excerpt: 'Bagaimana kecerdasan buatan membantu mempersonalisasi pengalaman belajar setiap siswa.',
    date: '5 Agustus 2024',
    author: 'Dr. Lisa Kumar',
    category: 'AI & Pendidikan',
    image: '🤖',
    readTime: '6 menit',
    content: `
      <p>Artificial Intelligence (AI) bukan hanya buzzword—ini adalah game-changer nyata dalam dunia pendidikan. Di NERA, AI bekerja bersama data EEG untuk menciptakan pembelajaran yang truly adaptive.</p>
      
      <h2>AI sebagai Personal Learning Assistant</h2>
      <p>AI di NERA berfungsi sebagai:</p>
      <ul>
        <li><strong>Content Curator:</strong> Memilih materi yang paling sesuai dengan level dan learning style Anda</li>
        <li><strong>Pace Optimizer:</strong> Menyesuaikan kecepatan pembelajaran berdasarkan comprehension rate</li>
        <li><strong>Intervention Trigger:</strong> Mendeteksi kapan Anda butuh bantuan sebelum Anda frustrated</li>
        <li><strong>Progress Predictor:</strong> Memperkirakan performance dan suggest improvement areas</li>
      </ul>
      
      <h2>Machine Learning dari Data EEG</h2>
      <p>AI kami dilatih dengan 100,000+ jam data pembelajaran. Model bisa identify patterns seperti:</p>
      <ul>
        <li>Waktu optimal untuk belajar materi baru vs review</li>
        <li>Jenis konten (visual, auditory, interactive) yang paling efektif untuk Anda</li>
        <li>Early warning signs cognitive overload</li>
      </ul>
      
      <h2>Ethical AI: Privacy & Transparency</h2>
      <p>Kami berkomitmen pada AI yang ethical:</p>
      <ul>
        <li>Data Anda tidak dijual ke pihak ketiga</li>
        <li>AI recommendations bisa dijelaskan (explainable AI)</li>
        <li>Anda selalu punya kontrol penuh atas learning path Anda</li>
      </ul>
      
      <h2>Masa Depan: AI + Human Teacher</h2>
      <p>AI bukan pengganti guru—ini adalah tool yang empowers guru untuk lebih fokus pada aspek human: mentorship, motivation, dan emotional support. Guru jadi punya data objektif untuk intervene dengan lebih efektif.</p>
    `,
  },
};

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = blogData[params.id] || blogData['1'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sage-700 hover:text-sage-900">
            <span>←</span>
            <span>Kembali ke Blog</span>
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-sage-700 text-white rounded-lg hover:bg-sage-800 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* Article Header */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="text-8xl mb-6">{post.image}</div>
            <div className="inline-block px-4 py-2 bg-sage-100 text-sage-700 text-sm rounded-full mb-4">
              {post.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-sage-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-sage-600 text-sm">
              <span>👤 {post.author}</span>
              <span>•</span>
              <span>📅 {post.date}</span>
              <span>•</span>
              <span>⏱️ {post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
      
      <style dangerouslySetInnerHTML={{__html: `
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.75;
          color: #374151;
        }
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
        }
        .blog-content ul {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.75rem;
        }
        .blog-content strong {
          color: #1f2937;
          font-weight: 600;
        }
      `}} />

      {/* CTA */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Siap Mengalami Pembelajaran Adaptif?
          </h2>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Coba Sekarang
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
