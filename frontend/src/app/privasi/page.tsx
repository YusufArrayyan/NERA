import Link from 'next/link';

export default function PrivasiPage() {
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
      <section className="py-20 text-center bg-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-sage-900 mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-sage-600">Terakhir diperbarui: 13 September 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-100 space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">1. Informasi yang Kami Kumpulkan</h2>
              <p className="text-sage-700 mb-4">
                Kami mengumpulkan informasi berikut untuk memberikan layanan terbaik:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sage-700 ml-4">
                <li><strong>Data Akun:</strong> Email, nama, role (siswa/guru/admin)</li>
                <li><strong>Data EEG:</strong> Gelombang otak (alpha, beta, theta, gamma), fokus, stres</li>
                <li><strong>Data Pembelajaran:</strong> Progress, sesi belajar, performa</li>
                <li><strong>Data Interaksi:</strong> Klik, navigasi, waktu penggunaan</li>
                <li><strong>Data Perangkat:</strong> IP address, browser, sistem operasi</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">2. Bagaimana Kami Menggunakan Data</h2>
              <ul className="list-disc list-inside space-y-2 text-sage-700 ml-4">
                <li>Menyediakan dan meningkatkan layanan pembelajaran adaptif</li>
                <li>Menganalisis pola belajar untuk rekomendasi yang lebih baik</li>
                <li>Memberikan insight kepada guru dan orang tua (dengan izin)</li>
                <li>Riset dan pengembangan fitur baru (data dianonimkan)</li>
                <li>Komunikasi terkait layanan dan update</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">3. Pembagian Data</h2>
              <p className="text-sage-700 mb-4">
                Kami <strong>TIDAK</strong> menjual data Anda ke pihak ketiga. Data hanya dibagikan dalam kondisi:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sage-700 ml-4">
                <li>Dengan izin eksplisit dari pengguna</li>
                <li>Kepada guru/sekolah (untuk siswa di bawah institusi)</li>
                <li>Service provider yang membantu operasional (dengan NDA)</li>
                <li>Jika diwajibkan oleh hukum atau proses legal</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">4. Keamanan Data</h2>
              <p className="text-sage-700">
                Data Anda dilindungi dengan enkripsi AES-256, TLS 1.3, dan infrastruktur cloud 
                yang memenuhi standar ISO 27001 dan SOC 2. Lihat halaman{' '}
                <Link href="/security" className="text-sage-700 underline font-semibold">
                  Security
                </Link>{' '}
                untuk detail lengkap.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">5. Hak Pengguna</h2>
              <p className="text-sage-700 mb-4">Anda memiliki hak untuk:</p>
              <ul className="list-disc list-inside space-y-2 text-sage-700 ml-4">
                <li><strong>Akses:</strong> Melihat data apa saja yang kami simpan tentang Anda</li>
                <li><strong>Koreksi:</strong> Memperbaiki data yang tidak akurat</li>
                <li><strong>Penghapusan:</strong> Meminta penghapusan data (right to be forgotten)</li>
                <li><strong>Export:</strong> Mendapatkan copy data dalam format portable</li>
                <li><strong>Opt-out:</strong> Menolak penggunaan data untuk riset</li>
              </ul>
              <p className="text-sage-700 mt-4">
                Untuk menggunakan hak ini, hubungi{' '}
                <a href="mailto:privacy@nera.ai" className="text-sage-700 underline font-semibold">
                  privacy@nera.ai
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">6. Cookies</h2>
              <p className="text-sage-700">
                Kami menggunakan cookies untuk autentikasi, preferensi, dan analitik. 
                Anda dapat menonaktifkan cookies di browser, tapi beberapa fitur mungkin tidak berfungsi.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">7. Privasi Anak</h2>
              <p className="text-sage-700">
                Untuk pengguna di bawah 13 tahun, kami memerlukan persetujuan orang tua atau sekolah 
                sesuai dengan COPPA (Children's Online Privacy Protection Act).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">8. Perubahan Kebijakan</h2>
              <p className="text-sage-700">
                Kebijakan ini dapat diperbarui sewaktu-waktu. Kami akan memberitahu melalui email 
                atau notifikasi di platform untuk perubahan signifikan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">9. Kontak</h2>
              <p className="text-sage-700">
                Pertanyaan tentang privasi? Hubungi Data Protection Officer kami:
                <br />
                <a href="mailto:privacy@nera.ai" className="text-sage-700 underline font-semibold">
                  privacy@nera.ai
                </a>
              </p>
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
