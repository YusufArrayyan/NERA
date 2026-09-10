'use client';

import React, { useState } from 'react';
import {
  Bluetooth,
  Battery,
  Signal,
  AlertCircle,
  CheckCircle,
  Zap,
  Volume2,
  Eye,
  Settings,
  Info,
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function HardwareCalibrationStitch() {
  const [calibrationStep, setCalibrationStep] = useState(1);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <p className="text-xs md:text-sm text-green-600 font-semibold tracking-wide">
            ASISTEN INISIASI PERANGKAT EEG
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mt-2">
            Kalibrasi & Penyelarasan Headband NERA
          </h1>
          <p className="text-neutral-600 text-sm mt-1 max-w-2xl">
            Hitung biosensor neuro-adaptif tersimpan timggi untuk membacakan ritme gelombang otak secara aman dan non-invasif.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Hardware Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card variant="elevated">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600 font-semibold">ISB Signal</p>
                <Signal className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">-42 dBm</p>
              <Badge variant="success" size="sm">
                Strong
              </Badge>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600 font-semibold">Data Baterai</p>
                <Battery className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">84%</p>
              <Badge variant="success" size="sm">
                Optimal
              </Badge>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600 font-semibold">Firmware</p>
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">v2.4.1</p>
              <Badge variant="primary" size="sm">
                Vers Terbaru
              </Badge>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600 font-semibold">Headband ID</p>
                <Info className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-sm font-mono text-neutral-900">NERA-HB-8829</p>
              <p className="text-xs text-neutral-600">Terangkung</p>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left - Calibration Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Connection Status */}
            <Card variant="elevated">
              <CardHeader>
                <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Bluetooth className="w-5 h-5 text-blue-600" />
                  NERA-HB-8829 - Terangkung
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">Posisi Headband Ideal</p>
                    <div className="bg-gradient-to-r from-green-100 to-green-50 border border-green-300 rounded-lg p-4 flex items-center justify-center">
                      <img
                        src="https://via.placeholder.com/120x120?text=Headband"
                        alt="Headband Position"
                        className="h-24 w-24 object-cover"
                      />
                    </div>
                    <p className="text-xs text-neutral-600 mt-2">
                      <span className="font-semibold">Kulit Bersih</span> | <span className="font-semibold">Posisi Simetris</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-neutral-600 mb-2">Panduan Fisik</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-neutral-700">Kulit Bersih sedikit lembap</span>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-neutral-700">Posisi Simetris di sekitar telinga</span>
                        </div>
                        <div className="flex gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-neutral-700">Kontak electrode mantap</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Diagnostik Impedansi */}
            <Card variant="elevated">
              <CardHeader>
                <h2 className="font-bold text-neutral-900">Diagnostik Impedansi 4 Titik</h2>
                <p className="text-sm text-neutral-600">Ambang batas kontak aman (&lt; 5 kΩ) untuk resolusi EEG optimal</p>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'FP1', value: '0.8 kΩ', status: 'optimal' },
                    { label: 'FP2', value: '1.1 kΩ', status: 'optimal' },
                    { label: 'AF7', value: '3.1 kΩ', status: 'optimal' },
                    { label: 'AF8', value: '4.2 kΩ', status: 'optimal' },
                  ].map((electrode, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg p-4 text-center"
                    >
                      <p className="text-sm font-bold text-neutral-900">{electrode.label}</p>
                      <p className="text-xs text-neutral-600 mt-1">{electrode.value}</p>
                      <p className="text-xs font-semibold text-green-700 mt-2">✓ Optimal</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* EEG Stream */}
            <Card variant="elevated">
              <CardHeader>
                <h2 className="font-bold text-neutral-900">Raw EEG Stream (Ch 1-4)</h2>
              </CardHeader>
              <CardBody>
                <div className="bg-neutral-900 rounded-lg p-4 h-32 flex items-center justify-center">
                  <svg viewBox="0 0 400 100" className="w-full h-full">
                    <polyline
                      points="0,50 10,45 20,40 30,45 40,50 50,55 60,50 70,45 80,40 90,35 100,40 110,45 120,50 130,48 140,46 150,48 160,50 170,52 180,50 190,48 200,50 210,52 220,50 230,48 240,50 250,52 260,55 270,58 280,60 290,58 300,55 310,50 320,48 330,50 340,52 350,50 360,48 370,45 380,42 390,40 400,42"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <p className="text-xs text-neutral-600 mt-3">
                  🧠 <span className="font-semibold">Alpha:</span> 10.2 Hz (Optimal) | <span className="font-semibold">Beta:</span> 14.8 Hz (Stabil) |{' '}
                  <span className="font-semibold">Theta:</span> 5.6 Hz (Normal)
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Right - Sidebar */}
          <div className="space-y-6">
            {/* Calibration Progress */}
            <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300">
              <CardBody className="space-y-4">
                <h3 className="font-bold text-neutral-900">Progres Kalibrasi</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-900">Langkah {step}</span>
                        {step <= calibrationStep ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-neutral-300 rounded-full" />
                        )}
                      </div>
                      <ProgressBar value={step <= calibrationStep ? 100 : 0} />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Audio Calibration */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  Uji Audio Kalibrasi Binural
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <p className="text-sm text-neutral-700">
                  Dengarkan frekuensi ISOCHRONIC (40 Hz Gamma) untuk menyelaraskan gelombang otak Anda
                </p>
                <Button variant="primary" className="w-full">
                  ▶ Putar Uji Sinyal Otak (5 Detik)
                </Button>
              </CardBody>
            </Card>

            {/* Start Learning */}
            <Button variant="primary" className="w-full py-3">
              ✓ Selesaikan Pairing & Masuk Pelajar
              <Zap className="w-4 h-4" />
            </Button>

            {/* Troubleshooting */}
            <Card variant="outlined">
              <CardHeader>
                <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Butuh Kalibrasi Khusus?
                </h2>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-neutral-700 mb-3">
                  Jika impedansi tinggi, coba ulang pemasangan atau hubungi support
                </p>
                <Button variant="outline" className="w-full">
                  Bantuan
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
