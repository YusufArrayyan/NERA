"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F3EE] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB] hover:bg-[#F5F3EE] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-[#1F2937]">Hubungi Kami</h1>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <Mail className="w-8 h-8 text-[#5B7B5A] mb-4" />
            <h3 className="font-bold text-[#1F2937] mb-2">Email</h3>
            <p className="text-sm text-[#4B5563]">support@nera.id</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <Phone className="w-8 h-8 text-[#5B7B5A] mb-4" />
            <h3 className="font-bold text-[#1F2937] mb-2">Telepon</h3>
            <p className="text-sm text-[#4B5563]">+62 21 1234 5678</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <MapPin className="w-8 h-8 text-[#5B7B5A] mb-4" />
            <h3 className="font-bold text-[#1F2937] mb-2">Alamat</h3>
            <p className="text-sm text-[#4B5563]">Jakarta, Indonesia</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Kirim Pesan</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Nama</label>
              <input 
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#5B7B5A] focus:outline-none"
                placeholder="Nama lengkap"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Email</label>
              <input 
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#5B7B5A] focus:outline-none"
                placeholder="email@contoh.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Pesan</label>
              <textarea 
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#5B7B5A] focus:outline-none"
                placeholder="Tulis pesan Anda..."
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-[#5B7B5A] text-white font-bold py-4 rounded-xl hover:bg-[#4A6349] transition-colors"
            >
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
