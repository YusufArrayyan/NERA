'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Bluetooth,
  Settings,
  Power,
  RefreshCw,
  Trash2,
  Plus,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  Vibrate,
  Shield,
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { DeviceStatus } from '@/components/ui/DeviceStatus';

export function DeviceManagementPage() {
  const [bioFeedback, setBioFeedback] = useState({
    autoBinauralBeats: true,
    hapticReminders: true,
    privacyMode: false,
  });

  const [expandedDevice, setExpandedDevice] = useState<string | null>('device-1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-green-50 to-teal-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              MANAJEMEN PERANGKAT IOT
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
            Pengelolaan Perangkat & Bio-Feedback
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Kelola konektivitas headband NERA, impedansi elektroda, dan preferensi stimulasi audio-haptic.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device List Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                Perangkat Terdaftar
              </h2>
              <Button size="sm" variant="secondary">
                <Plus className="w-4 h-4" />
                Tambah Perangkat
              </Button>
            </div>

            {/* Primary Device */}
            <DeviceStatus
              name="NERA Headband #1"
              model="NERA-HB-8829"
              uuid="8F21-C99A-4527-E8B2"
              isConnected={true}
              batteryLevel={84}
              signalStrength={-42}
              lastSync="2 menit lalu"
              status="active"
              impedance={{ fp1: 0.8, fp2: 1.1, af7: 1.4, af8: 1.2 }}
            />

            {/* Secondary Device */}
            <DeviceStatus
              name="NERA Headband #2 (Backup)"
              model="NERA-HB-7741"
              uuid="7D15-B88C-3462-D7A1"
              isConnected={false}
              batteryLevel={42}
              signalStrength={-85}
              lastSync="5 hari lalu"
              status="idle"
              impedance={{ fp1: 2.1, fp2: 2.3, af7: 1.9, af8: 2.0 }}
            />

            {/* Device Pairing Card */}
            <Card variant="elevated" className="border-dashed border-2 border-neutral-300">
              <CardBody className="flex flex-col items-center justify-center py-12 gap-4">
                <Bluetooth className="w-12 h-12 text-neutral-400" />
                <div className="text-center">
                  <p className="font-semibold text-neutral-900">Pasangkan Perangkat Baru</p>
                  <p className="text-sm text-neutral-600 mt-1">
                    Aktifkan Bluetooth di headband dan tekan tombol pairing selama 5 detik
                  </p>
                </div>
                <Button variant="primary">Mulai Penggalian</Button>
              </CardBody>
            </Card>

            {/* Device Identity Card */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  Identitas Perangkat
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'MAC Address', value: '3C:61:05:8A:2C:B1', icon: '🔐' },
                    { label: 'Firmware Version', value: 'v2.4.1', icon: '📦' },
                    { label: 'Hardware Rev', value: 'Rev C (2024)', icon: '⚙️' },
                    { label: 'Serial Number', value: 'NHB-2024-089234', icon: '🏷️' },
                    { label: 'Manufacture Date', value: '2024-04-15', icon: '📅' },
                    { label: 'Warranty Until', value: '2026-04-15', icon: '🛡️' },
                  ].map((info, idx) => (
                    <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">{info.icon}</span>
                        <p className="text-xs font-medium text-neutral-600">{info.label}</p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-neutral-900">{info.value}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="w-4 h-4" />
                    Perbarui Firmware
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Settings className="w-4 h-4" />
                    Reset Pabrik
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Bio-Feedback Controls */}
            <Card variant="elevated" className="bg-gradient-to-br from-teal-50 to-green-50 border-teal-200">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  🧠 Kontrol Bio-Feedback
                </h3>
                <p className="text-xs text-neutral-600 mt-1">Kustomisasi stimulasi neurofeedback</p>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Auto Binaural Beats */}
                <div>
                  <Toggle
                    checked={bioFeedback.autoBinauralBeats}
                    onChange={(checked) =>
                      setBioFeedback({ ...bioFeedback, autoBinauralBeats: checked })
                    }
                    label="Auto-Binaural Beats"
                    description="Sinkronisasi otomatis frekuensi audio dengan pola EEG"
                  />
                </div>

                {/* Haptic Reminders */}
                <div className="pt-4 border-t border-green-200">
                  <Toggle
                    checked={bioFeedback.hapticReminders}
                    onChange={(checked) =>
                      setBioFeedback({ ...bioFeedback, hapticReminders: checked })
                    }
                    label="Pengingat Haptic"
                    description="Getaran sensitif saat fokus mulai menurun"
                  />
                </div>

                {/* Privacy Mode */}
                <div className="pt-4 border-t border-green-200">
                  <Toggle
                    checked={bioFeedback.privacyMode}
                    onChange={(checked) =>
                      setBioFeedback({ ...bioFeedback, privacyMode: checked })
                    }
                    label="Mode Privasi & Edge"
                    description="Komputasi lokal, tidak ada data ke cloud"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Audio Settings */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  Pengaturan Audio
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-2">
                    Volume Binaural (80%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="80"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-2">
                    Frekuensi Sinkronisasi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Theta 6Hz', 'Alpha 10Hz', 'Gamma 40Hz'].map((freq) => (
                      <button
                        key={freq}
                        className="text-xs font-medium px-3 py-2 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Haptic Settings */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Vibrate className="w-5 h-5 text-orange-600" />
                  Pengaturan Haptic
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-2">
                    Intensitas Getaran (60%)
                  </label>
                  <input type="range" min="0" max="100" defaultValue="60" className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 block mb-2">
                    Pola Getaran
                  </label>
                  <div className="space-y-2">
                    {['Fokus Tajam', 'Relaksasi Lembut', 'Alarm Mendesak'].map((pattern) => (
                      <label key={pattern} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="haptic-pattern"
                          defaultChecked={pattern === 'Fokus Tajam'}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-neutral-700">{pattern}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Security Settings */}
            <Card variant="elevated">
              <CardHeader>
                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Keamanan
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 transition-colors flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">Ubah PIN Perangkat</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 transition-colors flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">Lihat Riwayat Koneksi</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>
                <button className="w-full text-left px-3 py-2 rounded hover:bg-red-50 transition-colors flex items-center justify-between">
                  <span className="text-sm font-medium text-red-700">Lupakan Perangkat</span>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '📡',
              title: 'Jangkauan Optimal',
              desc: 'Headband bekerja terbaik dalam radius 10 meter dari smartphone Anda',
            },
            {
              icon: '🔋',
              title: 'Umur Baterai',
              desc: '8-10 jam penggunaan berkelanjutan, 30 jam standby',
            },
            {
              icon: '🌐',
              title: 'Sinkronisasi Cloud',
              desc: 'Data terenkripsi sinkronisasi ke semua perangkat Anda',
            },
          ].map((info, idx) => (
            <Card key={idx} variant="elevated">
              <CardBody className="flex gap-4 items-start">
                <span className="text-3xl flex-shrink-0">{info.icon}</span>
                <div>
                  <p className="font-semibold text-neutral-900 mb-1">{info.title}</p>
                  <p className="text-sm text-neutral-600">{info.desc}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-neutral-500 text-xs">
          <p>
            🔒 Semua pengaturan bio-feedback disimpan secara lokal di headband • Sinkronisasi end-to-end terenkripsi •
            © 2024 NERA Neuro-Adaptive Platform
          </p>
        </div>
      </div>
    </div>
  );
}
