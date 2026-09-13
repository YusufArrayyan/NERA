import Link from 'next/link';

const securityFeatures = [
  {
    icon: '🔒',
    title: 'Enkripsi End-to-End',
    description: 'Semua data EEG dan pembelajaran dienkripsi dengan AES-256 saat transit dan saat disimpan',
  },
  {
    icon: '🛡️',
    title: 'ISO 27001 Certified',
    description: 'Sistem keamanan informasi kami tersertifikasi standar internasional',
  },
  {
    icon: '🔐',
    title: 'Two-Factor Authentication',
    description: 'Lapisan keamanan tambahan untuk melindungi akun dari akses tidak sah',
  },
  {
    icon: '👁️',
    title: 'Privacy by Design',
    description: 'Data pribadi dilindungi sejak tahap desain sistem dan arsitektur',
  },
  {
    icon: '🔍',
    title: 'Regular Security Audits',
    description: 'Audit keamanan rutin oleh pihak ketiga independen',
  },
  {
    icon: '📊',
    title: 'Data Minimization',
    description: 'Kami hanya mengumpulkan data yang benar-benar diperlukan',
  },
];

const compliance = [
  { name: 'GDPR Compliant', icon: '🇪🇺' },
  { name: 'COPPA Certified', icon: '👶' },
  { name: 'ISO 27001', icon: '🏆' },
  { name: 'SOC 2 Type II', icon: '✅' },
];

export default function SecurityPage() {
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
            Keamanan & Privasi adalah Prioritas Kami
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto">
            Data EEG dan pembelajaran siswa dilindungi dengan standar keamanan enterprise-grade
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-sage-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sage-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-sage-900 mb-12">
            Compliance & Sertifikasi
          </h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
            {compliance.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-sage-50 px-6 py-4 rounded-xl"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="font-semibold text-sage-900">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-sage-900 mb-8 text-center">
            Bagaimana Kami Melindungi Data Anda
          </h2>
          <div className="space-y-6 text-sage-700">
            <div className="bg-white p-6 rounded-xl border border-sage-100">
              <h3 className="text-xl font-bold text-sage-900 mb-3">
                1. Enkripsi Multi-Layer
              </h3>
              <p>
                Data EEG dan pembelajaran dienkripsi saat transit (TLS 1.3) dan saat disimpan (AES-256). 
                Bahkan tim NERA tidak bisa mengakses data mentah tanpa izin eksplisit.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sage-100">
              <h3 className="text-xl font-bold text-sage-900 mb-3">
                2. Access Control Ketat
              </h3>
              <p>
                Sistem role-based access control (RBAC) memastikan hanya pihak yang berwenang 
                yang dapat mengakses data sensitif. Setiap akses dicatat dan diaudit.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sage-100">
              <h3 className="text-xl font-bold text-sage-900 mb-3">
                3. Data Retention Policy
              </h3>
              <p>
                Data EEG hanya disimpan selama diperlukan untuk analisis pembelajaran. 
                Siswa atau sekolah dapat meminta penghapusan data kapan saja.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-sage-100">
              <h3 className="text-xl font-bold text-sage-900 mb-3">
                4. Incident Response Plan
              </h3>
              <p>
                Tim keamanan kami siap 24/7 dengan prosedur incident response yang teruji. 
                Notifikasi breach dalam 72 jam sesuai regulasi GDPR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bug Bounty */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Security Researcher? Join Our Bug Bounty Program
          </h2>
          <p className="text-sage-200 mb-8 max-w-2xl mx-auto">
            Kami menghargai kontribusi security researcher dengan reward hingga $5,000 
            untuk temuan vulnerability yang valid
          </p>
          <a
            href="mailto:security@nera.ai"
            className="inline-block px-8 py-4 bg-white text-sage-800 rounded-lg font-semibold hover:bg-sage-50 transition-colors"
          >
            Report a Vulnerability
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
