import Link from 'next/link';

export default function TermsPage() {
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
            Syarat & Ketentuan
          </h1>
          <p className="text-sage-600">Terakhir diperbarui: 13 September 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-100 space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">1. Penerimaan Ketentuan</h2>
              <p className="text-sage-700">
                Dengan mengakses dan menggunakan platform NERA, Anda setuju untuk terikat dengan 
                syarat dan ketentuan ini. Jika Anda tidak setuju, harap jangan gunakan layanan kami.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">2. Penggunaan Layanan</h2>
              <p className="text-sage-700 mb-4">Anda setuju untuk:</p>
              <ul className="list-disc list-inside space-y-2 text-sage-700 ml-4">
                <li>Memberikan informasi yang akurat saat registrasi</li>
                <li>Menjaga kerahasiaan password dan akun Anda</li>
                <li>Tidak membagikan akun dengan orang lain</li>
                <li>Menggunakan layanan hanya untuk tujuan legal dan edukatif</li>
                <li>Tidak melakukan reverse engineering atau hacking</li>
                <li>Tidak mengunggah konten yang ilegal, berbahaya, atau melanggar hak cipta</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">3. Akun Pengguna</h2>
              <p className="text-sage-700">
                Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda. 
                Segera laporkan ke kami jika Anda mencurigai akses tidak sah. 
                Kami berhak menonaktifkan akun yang melanggar ketentuan ini.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">4. Pembayaran & Refund</h2>
              <p className="text-sage-700 mb-4">
                <strong>Subscription:</strong> Langganan diperpanjang otomatis setiap bulan/tahun. 
                Anda dapat membatalkan kapan saja dari dashboard.
              </p>
              <p className="text-sage-700 mb-4">
                <strong>Refund:</strong> Kami menawarkan refund penuh dalam 14 hari pertama jika 
                Anda tidak puas. Setelah itu, tidak ada refund untuk periode billing yang sedang berjalan.
              </p>
              <p className="text-sage-700">
                <strong>Free Trial:</strong> Trial 14 hari gratis hanya untuk pengguna baru. 
                Kartu kredit diperlukan dan akan dicharge setelah trial berakhir kecuali Anda membatalkan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">5. Hak Kekayaan Intelektual</h2>
              <p className="text-sage-700">
                Semua konten, fitur, dan fungsionalitas platform NERA (termasuk tapi tidak terbatas pada 
                teks, grafik, logo, icon, gambar, audio, video, dan software) adalah milik NERA dan 
                dilindungi oleh hak cipta, trademark, dan hukum kekayaan intelektual lainnya.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">6. Data & Privasi</h2>
              <p className="text-sage-700">
                Penggunaan data Anda diatur dalam{' '}
                <Link href="/privasi" className="text-sage-700 underline font-semibold">
                  Kebijakan Privasi
                </Link>
                . Dengan menggunakan layanan, Anda setuju dengan pengumpulan dan penggunaan data 
                sesuai kebijakan tersebut.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">7. Disclaimer</h2>
              <p className="text-sage-700 mb-4">
                Platform NERA disediakan "as is" tanpa garansi apapun. Kami tidak menjamin bahwa:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sage-700 ml-4">
                <li>Layanan akan selalu tersedia atau bebas dari error</li>
                <li>Hasil pembelajaran akan sesuai ekspektasi Anda</li>
                <li>Data EEG 100% akurat (tergantung kualitas perangkat)</li>
              </ul>
              <p className="text-sage-700 mt-4">
                NERA adalah <strong>alat bantu pembelajaran</strong>, bukan pengganti guru, 
                profesional medis, atau psikolog.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">8. Batasan Tanggung Jawab</h2>
              <p className="text-sage-700">
                NERA tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, 
                atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">9. Perubahan Ketentuan</h2>
              <p className="text-sage-700">
                Kami berhak mengubah ketentuan ini kapan saja. Perubahan signifikan akan diberitahu 
                melalui email atau notifikasi platform. Penggunaan berkelanjutan setelah perubahan 
                dianggap sebagai penerimaan terhadap ketentuan baru.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">10. Hukum yang Berlaku</h2>
              <p className="text-sage-700">
                Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan 
                melalui Pengadilan Negeri Jakarta Selatan.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-sage-900 mb-4">11. Kontak</h2>
              <p className="text-sage-700">
                Pertanyaan tentang syarat & ketentuan? Hubungi:
                <br />
                <a href="mailto:legal@nera.ai" className="text-sage-700 underline font-semibold">
                  legal@nera.ai
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
