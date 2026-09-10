'use client';

import React, { useState } from 'react';
import { Zap, Battery, Bluetooth, Settings, AlertCircle, CheckCircle, Radio, Smartphone } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function HardwareCalibrationStitchV2() {
  const [isCalibrating, setIsCalibrating] = useState(false);

  return (
    <div className="bg-bg-default text-text-default min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-elevated/95 border-b border-border-color backdrop-blur-md">
        <div className="container-max py-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="badge-primary mb-3">
                <Smartphone className="w-3 h-3" />
                HARDWARE CENTER
              </Badge>
              <h1 className="text-h2 mt-2">Manajemen Perangkat IoT & Kalibrasi</h1>
              <p className="text-text-secondary text-base mt-2">Pantau kesehatan biosensor secara real-time dengan transmisi edge-computing headband NERA Anda.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-max py-8">
        {/* Device Status */}
        <div className="grid_2 mb-8">
          {/* Device Info */}
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Status Headband Aktif
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="p-4 bg-bg-surface rounded-lg border border-primary/30">
                <p className="text-sm font-semibold text-text-default mb-1">BLE 5.2 - NERA-HB-8829</p>
                <p className="text-xs text-text-muted">TERSAMBUNG | Latensi: 3.8ms | HQ STREAM</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-bg-surface rounded-lg text-center">
                  <Battery className="w-5 h-5 text-accent-success mx-auto mb-1" />
                  <p className="text-2xl font-bold text-accent-success">84%</p>
                  <p className="text-xs text-text-muted">Daya</p>
                </div>
                <div className="p-3 bg-bg-surface rounded-lg text-center">
                  <Signal className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-primary">-56</p>
                  <p className="text-xs text-text-muted">dBm RSSI</p>
                </div>
                <div className="p-3 bg-bg-surface rounded-lg text-center">
                  <Zap className="w-5 h-5 text-accent-warning mx-auto mb-1" />
                  <p className="text-2xl font-bold text-accent-warning">98%</p>
                  <p className="text-xs text-text-muted">Data Paket</p>
                </div>
              </div>

              <Button className="button-primary w-full button-sm">
                {isCalibrating ? 'Kalibrasi Berlangsung...' : 'Mulai Kalibrasi'}
              </Button>
            </CardBody>
          </Card>

          {/* Impedance Diagnostic */}
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="text-h4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Impedance Diagnostic
              </h2>
              <Badge className="badge-success mt-2">4/4 OPTIMAL</Badge>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Fp1', impedance: '2.8 kΩ', status: 'optimal' },
                  { name: 'Fp2', impedance: '2.4 kΩ', status: 'optimal' },
                  { name: 'Af7', impedance: '3.1 kΩ', status: 'optimal' },
                  { name: 'Af8', impedance: '4.2 kΩ', status: 'optimal' },
                ].map((electrode, idx) => (
                  <div key={idx} className="p-3 bg-bg-surface rounded-lg border border-accent-success/30">
                    <p className="text-sm font-semibold text-text-default">{electrode.name}</p>
                    <p className="text-xs text-accent-success mt-1">{electrode.impedance}</p>
                    <p className="text-xs text-text-muted">Kontak Optimal</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Device Settings */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <h2 className="text-h4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-secondary" />
              Pengaturan Perangkat & Mode Operasi
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {[
              { 
                title: 'Auto-Binaural Beats (40Hz Alpha)', 
                description: 'Stimulasi gelombang otak untuk relaksasi & konsentrasi',
                enabled: true 
              },
              { 
                title: 'Haptic Gentle Reminder', 
                description: 'Getaran halus saat perlu istirahat mikro',
                enabled: true 
              },
              { 
                title: 'Edge-Computing AI-2-256', 
                description: 'Enkripsi E-2-E data transfer NERA headband 2024 onboard',
                enabled: true 
              },
            ].map((setting, idx) => (
              <div key={idx} className="p-4 bg-bg-surface rounded-lg border border-border-color flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-default">{setting.title}</p>
                  <p className="text-xs text-text-muted mt-1">{setting.description}</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full cursor-pointer relative flex items-center">
                  <div className="w-5 h-5 bg-white rounded-full shadow-md absolute right-0.5"></div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Calibration Status & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="card">
            <div className="flex items-start justify-between mb-4">
              <CheckCircle className="w-6 h-6 text-accent-success" />
              <Badge className="badge-success">AKTIF</Badge>
            </div>
            <p className="text-label text-text-muted mb-1">Status Singgel Perangkat IoT</p>
            <p className="text-sm text-text-default font-semibold">Tersinkronisasi dengan Server NERA Cloud</p>
            <p className="text-xs text-text-muted mt-4">Last Sync: 12 menit yang lalu</p>
          </Card>

          <Card className="card">
            <div className="flex items-start justify-between mb-4">
              <Battery className="w-6 h-6 text-accent-warning" />
              <span className="text-xs font-semibold text-accent-warning">WARNING</span>
            </div>
            <p className="text-label text-text-muted mb-1">Perkiraan Kalibrasi Alat</p>
            <p className="text-sm text-text-default font-semibold">Rekomendasi Update Firmware</p>
            <p className="text-xs text-text-muted mt-4">Sebelum tiga hari (backup data otomatis)</p>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Helper component
function Signal() {
  return <Radio className="w-5 h-5" />;
}
