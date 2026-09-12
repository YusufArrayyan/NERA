"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Brain, Target, Users } from "lucide-react";

export default function AboutPage() {
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
          <h1 className="text-3xl font-bold text-[#1F2937]">Tentang NERA</h1>
        </div>

        {/* About Content */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Visi Kami</h2>
            <p className="text-[#4B5563] leading-relaxed">
              NERA (Neuro-Adaptive Learning) adalah platform pembelajaran berbasis teknologi EEG yang merevolusi cara siswa belajar. Kami percaya bahwa setiap otak unik, dan pembelajaran harus disesuaikan dengan pola kognitif masing-masing individu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <Brain className="w-12 h-12 text-[#5B7B5A] mb-4" />
              <h3 className="font-bold text-[#1F2937] mb-2">Innovation</h3>
              <p className="text-sm text-[#4B5563]">Menggunakan teknologi EEG terdepan untuk memahami pembelajaran</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <Target className="w-12 h-12 text-[#5B7B5A] mb-4" />
              <h3 className="font-bold text-[#1F2937] mb-2">Personalization</h3>
              <p className="text-sm text-[#4B5563]">Pembelajaran yang disesuaikan untuk setiap siswa</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
              <Users className="w-12 h-12 text-[#5B7B5A] mb-4" />
              <h3 className="font-bold text-[#1F2937] mb-2">Impact</h3>
              <p className="text-sm text-[#4B5563]">Meningkatkan hasil belajar secara signifikan</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB]">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">Misi Kami</h2>
            <ul className="space-y-3 text-[#4B5563]">
              <li className="flex items-start gap-2">
                <span className="text-[#5B7B5A] font-bold">•</span>
                <span>Membuat pembelajaran lebih efektif dengan teknologi neuroscience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5B7B5A] font-bold">•</span>
                <span>Membantu setiap siswa mencapai potensi maksimal mereka</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#5B7B5A] font-bold">•</span>
                <span>Memberikan insights yang actionable untuk guru dan orang tua</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
