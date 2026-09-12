import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl font-bold text-[#5B7B5A] mb-4">404</div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mb-6">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#5B7B5A] text-white rounded-lg hover:bg-[#4A6A49] transition-colors font-semibold"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
