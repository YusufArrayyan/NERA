import Link from 'next/link';

const contactChannels = [
  {
    icon: '📧',
    title: 'Email',
    description: 'Tim support kami siap membantu',
    contact: 'support@nera.ai',
    link: 'mailto:support@nera.ai',
  },
  {
    icon: '💬',
    title: 'Live Chat',
    description: 'Chat langsung dengan tim kami',
    contact: 'Senin - Jumat, 09:00 - 18:00 WIB',
    link: '#',
  },
  {
    icon: '📞',
    title: 'Phone',
    description: 'Hubungi kami langsung',
    contact: '+62 21 5555 1234',
    link: 'tel:+622155551234',
  },
  {
    icon: '📍',
    title: 'Office',
    description: 'Kunjungi kantor kami',
    contact: 'Jakarta Selatan, Indonesia',
    link: '#',
  },
];

const departments = [
  { name: 'Sales & Partnership', email: 'sales@nera.ai', icon: '💼' },
  { name: 'Technical Support', email: 'support@nera.ai', icon: '🛠️' },
  { name: 'Privacy & Data', email: 'privacy@nera.ai', icon: '🔒' },
  { name: 'Security', email: 'security@nera.ai', icon: '🛡️' },
  { name: 'Press & Media', email: 'press@nera.ai', icon: '📰' },
  { name: 'Careers', email: 'careers@nera.ai', icon: '👥' },
];

export default function ContactPage() {
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
            Hubungi Kami
          </h1>
          <p className="text-xl text-sage-700 max-w-3xl mx-auto">
            Punya pertanyaan? Butuh bantuan? Tim kami siap membantu Anda
          </p>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactChannels.map((channel, index) => (
              <a
                key={index}
                href={channel.link}
                className="bg-white p-6 rounded-2xl shadow-sm border border-sage-100 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-5xl mb-4">{channel.icon}</div>
                <h3 className="text-xl font-bold text-sage-900 mb-2">
                  {channel.title}
                </h3>
                <p className="text-sm text-sage-600 mb-3">{channel.description}</p>
                <p className="text-sage-700 font-semibold">{channel.contact}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-sage-900 mb-8 text-center">
            Kirim Pesan
          </h2>
          <form className="space-y-6 bg-sage-50 p-8 rounded-2xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-sage-900 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-sage-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-sage-900 mb-2">
                Subjek *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="Pertanyaan tentang..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sage-900 mb-2">
                Kategori *
              </label>
              <select
                required
                className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value="">Pilih kategori...</option>
                <option value="sales">Sales & Partnership</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing & Subscription</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-sage-900 mb-2">
                Pesan *
              </label>
              <textarea
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-sage-200 focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
                placeholder="Tuliskan pesan Anda di sini..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-sage-700 text-white rounded-lg font-semibold hover:bg-sage-800 transition-colors"
            >
              Kirim Pesan
            </button>

            <p className="text-sm text-sage-600 text-center">
              Kami akan membalas dalam 1-2 hari kerja
            </p>
          </form>
        </div>
      </section>

      {/* Departments */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-sage-900 mb-8 text-center">
            Departemen Spesifik
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {departments.map((dept, index) => (
              <a
                key={index}
                href={`mailto:${dept.email}`}
                className="flex items-center gap-4 bg-white p-4 rounded-xl border border-sage-100 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl">{dept.icon}</span>
                <div>
                  <h3 className="font-bold text-sage-900">{dept.name}</h3>
                  <p className="text-sm text-sage-600">{dept.email}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-20 bg-sage-800 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ikuti Kami di Social Media
          </h2>
          <div className="flex justify-center gap-6 text-4xl">
            <a href="#" className="hover:scale-110 transition-transform">
              📘
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              🐦
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              📷
            </a>
            <a href="#" className="hover:scale-110 transition-transform">
              💼
            </a>
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
