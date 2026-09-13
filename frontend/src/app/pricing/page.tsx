import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: '/bulan',
    description: 'Untuk siswa individual yang ingin mencoba',
    features: [
      'Akses dasar ke platform',
      'Simulator EEG (tanpa headband)',
      '5 sesi pembelajaran per bulan',
      'Basic analytics',
      'Gamifikasi terbatas',
    ],
    cta: 'Mulai Gratis',
    popular: false,
  },
  {
    name: 'Student',
    price: 'Rp 99.000',
    period: '/bulan',
    description: 'Untuk siswa yang serius dengan pembelajaran',
    features: [
      'Semua fitur Free',
      'Unlimited sesi pembelajaran',
      'Full analytics & insights',
      'AI recommendations',
      'Full gamifikasi (XP, badges, leaderboard)',
      'Jurnal refleksi unlimited',
      'Priority support',
    ],
    cta: 'Pilih Student',
    popular: true,
  },
  {
    name: 'School',
    price: 'Custom',
    period: '',
    description: 'Untuk sekolah dan institusi pendidikan',
    features: [
      'Semua fitur Student',
      'Multi-user (siswa, guru, admin)',
      'EEG headband support',
      'Teacher dashboard & monitoring',
      'Intervention system',
      'Custom branding',
      'Dedicated account manager',
      'Training & onboarding',
    ],
    cta: 'Hubungi Sales',
    popular: false,
  },
];

export default function PricingPage() {
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
            Harga yang Transparan dan Terjangkau
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto mb-8">
            Pilih paket yang sesuai dengan kebutuhan pembelajaran kamu
          </p>
          <div className="inline-block px-4 py-2 bg-sage-100 text-sage-700 rounded-full text-sm">
            🎉 Gratis 14 hari trial untuk semua paket berbayar
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-sm border-2 p-8 relative ${
                  plan.popular
                    ? 'border-sage-600 scale-105'
                    : 'border-sage-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-sage-600 text-white text-sm font-semibold rounded-full">
                    Paling Populer
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-sage-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sage-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-4xl font-bold text-sage-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sage-600 mb-1">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sage-700">
                      <span className="text-sage-600 mt-0.5">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-sage-700 text-white hover:bg-sage-800'
                      : 'bg-sage-100 text-sage-800 hover:bg-sage-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-sage-900 mb-12 text-center">
            Pertanyaan Umum
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-sage-900 mb-2">
                Apakah saya perlu membeli EEG headband?
              </h3>
              <p className="text-sage-700">
                Tidak wajib! Paket Free dan Student bisa menggunakan simulator EEG. 
                Headband fisik hanya tersedia untuk paket School dengan integrasi penuh.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-sage-900 mb-2">
                Bagaimana cara membatalkan subscription?
              </h3>
              <p className="text-sage-700">
                Kamu bisa batalkan kapan saja dari dashboard. Tidak ada biaya pembatalan dan 
                akses akan tetap aktif sampai akhir periode billing.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-sage-900 mb-2">
                Apakah ada diskon untuk sekolah?
              </h3>
              <p className="text-sage-700">
                Ya! Kami menawarkan diskon volume untuk sekolah dengan 50+ siswa. 
                Hubungi sales@nera.ai untuk penawaran khusus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Masih Ada Pertanyaan?
          </h2>
          <p className="text-sage-200 mb-8 max-w-2xl mx-auto">
            Tim kami siap membantu kamu memilih paket yang tepat
          </p>
          <a
            href="mailto:sales@nera.ai"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Hubungi Sales
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
