"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: "Student",
      price: "Gratis",
      period: "",
      features: [
        "1 akun siswa",
        "Basic EEG monitoring",
        "Progress tracking",
        "Mobile app access",
      ],
      cta: "Mulai Gratis",
      highlighted: false,
    },
    {
      name: "School",
      price: "Rp 500K",
      period: "/bulan",
      features: [
        "Hingga 100 siswa",
        "Advanced analytics",
        "Teacher dashboard",
        "Parent portal",
        "Priority support",
        "Custom reporting",
      ],
      cta: "Hubungi Sales",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Unlimited siswa",
        "Custom integration",
        "Dedicated support",
        "On-premise deployment",
        "Advanced security",
        "Custom features",
      ],
      cta: "Hubungi Kami",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EE] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#E5E7EB] hover:bg-[#F5F3EE] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937]">Pricing Plans</h1>
            <p className="text-[#4B5563] mt-1">Pilih paket yang sesuai dengan kebutuhan Anda</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`bg-white rounded-2xl p-8 border-2 transition-all ${
                plan.highlighted 
                  ? 'border-[#5B7B5A] shadow-lg scale-105' 
                  : 'border-[#E5E7EB]'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-[#5B7B5A] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                  POPULAR
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-[#1F2937] mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-[#5B7B5A]">{plan.price}</span>
                <span className="text-[#4B5563]">{plan.period}</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#5B7B5A] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#4B5563]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => router.push('/contact')}
                className={`w-full font-bold py-3 rounded-xl transition-colors ${
                  plan.highlighted
                    ? 'bg-[#5B7B5A] text-white hover:bg-[#4A6349]'
                    : 'bg-[#F5F3EE] text-[#5B7B5A] hover:bg-[#E5E7EB]'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
