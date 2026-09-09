'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Zap,
  Radio,
  AlertCircle,
  Smartphone,
  Bluetooth,
  Battery,
  Signal,
  Microscope,
  Music,
  Volume2,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressStep } from '@/components/ui/ProgressStep';
import { MetricCard } from '@/components/ui/MetricCard';

const STEPS = [
  { number: 1, label: 'Aktivasi & Serial', status: 'completed' as const },
  { number: 2, label: 'Bluetooth BLE 5.2', status: 'completed' as const },
  { number: 3, label: 'Posisi Sensor', status: 'active' as const },
  { number: 4, label: 'Tes Impedansi', status: 'pending' as const },
];

export function HeadbandCalibration() {
  const [activeTab, setActiveTab] = useState<'setup' | 'diagnostics' | 'audio'>('setup');
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleStartCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => setIsCalibrating(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50 p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              ASISTEN INISIASI PERANGKAT EEG
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
            Kalibrasi & Penyelarasan Headband NERA
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Hubungkan biosensor neuro-adaptif berpresisi tinggi untuk membaca ritme gelombang otak secara aman dan
            non-invasif.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
          <ProgressStep steps={STEPS} currentStep={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Status Card */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <Bluetooth className="w-5 h-5 text-teal-600" />
                    Status Perangkat
                  </h2>
                  <Badge variant="success">Tersambung</Badge>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-neutral-600 mb-1">Model</p>
                    <p className="text-sm font-bold text-neutral-900">NERA-HB-8829</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-neutral-600 mb-1">UUID</p>
                    <p className="text-sm font-bold text-neutral-900 font-mono">8F21-C99A</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-neutral-600 mb-1">Protokol</p>
                    <p className="text-sm font-bold text-neutral-900">BLE 5.2</p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-neutral-600 mb-1">Status</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                      <p className="text-sm font-bold text-green-600">Aktif</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-neutral-200">
              {(['setup', 'diagnostics', 'audio'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-all ${
                    activeTab === tab
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab === 'setup' && '🎯 Posisi'}
                  {tab === 'diagnostics' && '📊 Diagnostik'}
                  {tab === 'audio' && '🎵 Audio'}
                </button>
              ))}
            </div>

            {/* Setup Tab */}
            {activeTab === 'setup' && (
              <Card variant="elevated">
                <CardHeader>
                  <h3 className="text-lg font-bold text-neutral-900">Panduan Fisik - Posisi Headband Ideal</h3>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg p-8 text-center border-2 border-dashed border-neutral-300">
                    <p className="text-neutral-600 mb-4 text-sm font-medium">VISUALISASI HEADBAND</p>
                    <div className="bg-white rounded-lg p-6 inline-block">
                      <div className="text-5xl">👤</div>
                      <p className="text-xs text-neutral-500 mt-2 font-mono">10-20 EEG Standard</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">Regangkan pita silikon</p>
                        <p className="text-neutral-600 text-xs mt-1">
                          Secara perlahan dan posisikan modul depan tepat di dahi tengah Anda
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">Pastikan kontak elektroda</p>
                        <p className="text-neutral-600 text-xs mt-1">
                          4 elektroda kering polimer menyentuh kulit tanpa helai rambut terperangkap
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">Kencangkan pengait magnetik</p>
                        <p className="text-neutral-600 text-xs mt-1">
                          Hingga pas dan nyaman, tanpa tekanan berlebih pada pelipis
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                        ✓
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">Kalibrasi Siap</p>
                        <p className="text-neutral-600 text-xs mt-1">Posisi sempurna - lanjutkan ke langkah berikutnya</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Tip Penting</p>
                      <p>Cuci wajah sebelum memakai headband. Kulit yang bersih dari minyak dan kosmetik tebal meningkatkan kualitas sinyal EEG.</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Diagnostics Tab */}
            {activeTab === 'diagnostics' && (
              <Card variant="elevated">
                <CardHeader>
                  <h3 className="text-lg font-bold text-neutral-900">Diagnostik Impedansi 4 Titik</h3>
                  <p className="text-neutral-600 text-sm mt-1">
                    Ambang batas kontak aman (&lt; 5.0 kΩ) untuk resolusi EEG optimal
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'FP1 (Kiri Depan)', value: '0.8 kΩ', status: 'good' },
                      { label: 'FP2 (Kanan Depan)', value: '1.1 kΩ', status: 'good' },
                      { label: 'AF7 (Temporal L)', value: '1.4 kΩ', status: 'good' },
                      { label: 'AF8 (Temporal R)', value: '1.2 kΩ', status: 'good' },
                    ].map((electrode) => (
                      <div
                        key={electrode.label}
                        className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 text-center"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full mx-auto mb-2">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium text-neutral-600 mb-1">{electrode.label}</p>
                        <p className="text-lg font-bold text-green-700">{electrode.value}</p>
                        <p className="text-xs text-green-600 mt-1 font-semibold">• Optimal</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-neutral-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-neutral-600 mb-3">RAW MICROVOLT TELEMETRY (EEG Ch 1-4)</p>
                    <div className="bg-neutral-900 rounded p-3 font-mono text-xs text-teal-400 h-20 overflow-hidden">
                      <div className="text-green-400">▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ ▂▃▄▅▆▇█ ▇▆▅▄▃▂ ▃▄▅▆▇█▇▆▅</div>
                      <div className="text-teal-400 mt-1">256 SPS | 0.5-45 Hz | SNR: +28.4 dB</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Audio Tab */}
            {activeTab === 'audio' && (
              <Card variant="elevated">
                <CardHeader>
                  <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Music className="w-5 h-5 text-teal-600" />
                    Uji Audio Kalibrasi Binaural
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="text-neutral-600 text-sm">
                    Frekuensi sinkronisasi 40Hz Gamma untuk mempersiapkan gelombang fokus optimal
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="secondary" size="lg">
                      <Volume2 className="w-5 h-5" />
                      Putar Audio Kalibrasi (30 detik)
                    </Button>
                    <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-teal-600 rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-neutral-600">10s / 30s</span>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Signal className="w-5 h-5 text-teal-600" />
                  Kualitas Sinyal
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <MetricCard
                  icon={Signal}
                  label="Sinyal RSSI"
                  value="-42"
                  unit="dBm"
                  status="good"
                  description="Sangat Kuat"
                />
                <MetricCard
                  icon={Battery}
                  label="Daya Baterai"
                  value="84"
                  unit="%"
                  status="good"
                  description="Estimasi 6.5 Jam"
                />
                <MetricCard icon={Zap} label="Firmware" value="v2.4.1" status="good" description="Versi Terbaru" />
              </CardBody>
            </Card>

            {/* Checklist */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900">✓ Kulit Bersih</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">Bebas minyak berlebih</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">Posisi Simetris tepat 1 cm</span>
                </div>
              </CardBody>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartCalibration}
                isLoading={isCalibrating}
              >
                <Radio className="w-5 h-5" />
                Uji Sinyal Otak (5 Detik)
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                ← Kembali ke Pengaturan
              </Button>
            </div>

            {/* Help Section */}
            <Card variant="outlined">
              <CardBody className="space-y-3">
                <p className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Butuh Kalibrasi Khusus?
                </p>
                <p className="text-xs text-neutral-600">
                  Buka panduan sensitivitas untuk kulit sensitif
                </p>
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Buka Panduan →
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-neutral-500 text-xs">
          <p>
            🔒 Data mentah EEG terenkripsi AES-256 lokal pada memori headband • © 2024 NERA Neuro-Adaptive
            Platform
          </p>
        </div>
      </div>
    </div>
  );
}
