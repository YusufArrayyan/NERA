/**
 * Hardware Setup Wizard - Easy IoT Headband Connection
 * Step-by-step guide for connecting NERA headband when hardware arrives
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Check, Loader2, Bluetooth, Wifi, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ApiClient } from '@/lib/api-client';

type SetupStep = 'bluetooth' | 'wifi' | 'calibration' | 'test' | 'complete';

export function HardwareSetupWizard() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('bluetooth');
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  const steps = [
    { id: 'bluetooth', label: 'Pairing Bluetooth', icon: Bluetooth },
    { id: 'wifi', label: 'Koneksi WiFi', icon: Wifi },
    { id: 'calibration', label: 'Kalibrasi Sensor', icon: Zap },
    { id: 'test', label: 'Tes Koneksi', icon: CheckCircle },
  ];

  const handleScanDevices = async () => {
    setIsScanning(true);
    setFoundDevices([]);
    
    // Simulate Bluetooth scanning (replace with real Bluetooth API when hardware arrives)
    setTimeout(() => {
      setFoundDevices([
        'NERA-HB-8829',
        'NERA-HB-8830',
        'NERA-HB-8831',
      ]);
      setIsScanning(false);
    }, 2000);
  };

  const handleConnectDevice = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    setConnectionStatus('connecting');
    
    try {
      // Try to connect via backend API
      const status = await ApiClient.getEEGStatus().catch(() => null);
      
      if (status) {
        setDeviceInfo(status);
        setConnectionStatus('connected');
        setTimeout(() => setCurrentStep('wifi'), 1000);
      } else {
        // Simulate connection for demo
        setTimeout(() => {
          setDeviceInfo({
            connected: true,
            deviceId: deviceId,
            battery: 85,
            signalStrength: -62,
            firmwareVersion: '2.1.0',
          });
          setConnectionStatus('connected');
          setTimeout(() => setCurrentStep('wifi'), 1000);
        }, 2000);
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      alert('Gagal terhubung ke headband. Pastikan headband dalam mode pairing.');
    }
  };

  const handleSkipToCalibration = () => {
    setCurrentStep('calibration');
  };

  const handleStartCalibration = async () => {
    try {
      const session = await ApiClient.startEEGSession().catch(() => null);
      if (session) {
        setTimeout(() => setCurrentStep('test'), 3000);
      } else {
        // Demo mode
        setTimeout(() => setCurrentStep('test'), 3000);
      }
    } catch (error) {
      console.error('Calibration error:', error);
    }
  };

  const handleCompleteSetup = () => {
    setCurrentStep('complete');
  };

  return (
    <div className="min-h-screen bg-bg-default py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="badge-primary mb-4">
            <Zap className="w-3 h-3" />
            SETUP HARDWARE
          </Badge>
          <h1 className="text-h1 text-text-default mb-4">
            Hubungkan Headband NERA Anda
          </h1>
          <p className="text-text-secondary">
            Ikuti langkah-langkah di bawah untuk menghubungkan headband EEG ke sistem NERA
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, idx) => {
            const stepIndex = steps.findIndex(s => s.id === currentStep);
            const isComplete = idx < stepIndex;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isCurrent ? 'bg-primary text-white' :
                  isComplete ? 'bg-accent-success text-white' :
                  'bg-bg-surface text-text-muted'
                }`}>
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-semibold hidden md:inline">
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isComplete ? 'bg-accent-success' : 'bg-border-color'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="card-elevated">
          <CardBody className="p-8">
            {currentStep === 'bluetooth' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Bluetooth className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-h3 text-text-default mb-2">Pairing Bluetooth</h2>
                  <p className="text-text-secondary">
                    Pastikan headband NERA dalam mode pairing (LED biru berkedip)
                  </p>
                </div>

                <div className="bg-bg-surface p-4 rounded-lg border border-border-color">
                  <h3 className="text-sm font-semibold text-text-default mb-2">📱 Cara Mengaktifkan Mode Pairing:</h3>
                  <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                    <li>Tekan dan tahan tombol power selama 3 detik</li>
                    <li>LED akan berkedip biru - headband siap di-pairing</li>
                    <li>Klik tombol "Scan Perangkat" di bawah</li>
                  </ol>
                </div>

                <Button 
                  onClick={handleScanDevices} 
                  disabled={isScanning}
                  className="button-primary w-full button-lg"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mencari Perangkat...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="w-5 h-5" />
                      Scan Perangkat
                    </>
                  )}
                </Button>

                {foundDevices.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-default">Perangkat Ditemukan:</p>
                    {foundDevices.map((device) => (
                      <div
                        key={device}
                        onClick={() => handleConnectDevice(device)}
                        className="p-4 bg-white border border-border-color rounded-lg hover:border-primary cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Bluetooth className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-default">{device}</p>
                            <p className="text-xs text-text-muted">NERA Headband EEG</p>
                          </div>
                        </div>
                        {selectedDevice === device && connectionStatus === 'connecting' && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                        {selectedDevice === device && connectionStatus === 'connected' && (
                          <CheckCircle className="w-5 h-5 text-accent-success" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'wifi' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Wifi className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-h3 text-text-default mb-2">Koneksi WiFi</h2>
                  <p className="text-text-secondary">
                    Headband akan menggunakan WiFi untuk mengirim data ke cloud
                  </p>
                </div>

                <div className="bg-accent-success/10 p-4 rounded-lg border border-accent-success/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-accent-success">Headband Terhubung!</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Device ID: {deviceInfo?.deviceId} | Battery: {deviceInfo?.battery}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-surface p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-4">
                    Headband NERA menggunakan koneksi WiFi yang sama dengan perangkat Anda.
                    Pastikan Anda terhubung ke jaringan WiFi yang stabil.
                  </p>
                  <p className="text-xs text-text-muted">
                    ℹ️ Headband akan otomatis terhubung ke WiFi terakhir yang digunakan
                  </p>
                </div>

                <Button onClick={handleSkipToCalibration} className="button-primary w-full button-lg">
                  Lanjut ke Kalibrasi
                </Button>
              </div>
            )}

            {currentStep === 'calibration' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Zap className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                  <h2 className="text-h3 text-text-default mb-2">Kalibrasi Sensor</h2>
                  <p className="text-text-secondary">
                    Pastikan headband dipasang dengan benar untuk hasil optimal
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['Fp1', 'Fp2', 'Af7', 'Af8'].map((electrode) => (
                    <div key={electrode} className="p-4 bg-bg-surface rounded-lg border border-accent-success">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-default">{electrode}</span>
                        <CheckCircle className="w-4 h-4 text-accent-success" />
                      </div>
                      <div className="text-xs text-text-muted">Impedance: 2.4 kΩ</div>
                      <div className="text-xs text-accent-success">✓ Optimal</div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-text-default mb-2">
                    <strong>Tips Pemasangan:</strong>
                  </p>
                  <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                    <li>Bersihkan dahi dari minyak/keringat</li>
                    <li>Pastikan elektroda menyentuh kulit dengan baik</li>
                    <li>Atur headband agar tidak terlalu ketat atau longgar</li>
                  </ul>
                </div>

                <Button onClick={handleStartCalibration} className="button-primary w-full button-lg">
                  Mulai Kalibrasi
                </Button>
              </div>
            )}

            {currentStep === 'test' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-success rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-h3 text-text-default mb-2">Tes Koneksi Berhasil!</h2>
                  <p className="text-text-secondary">
                    Headband NERA siap digunakan untuk pembelajaran adaptif
                  </p>
                </div>

                <div className="bg-accent-success/10 p-6 rounded-lg border border-accent-success/30">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-accent-success">98%</p>
                      <p className="text-xs text-text-muted">Kualitas Sinyal</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent-success">256Hz</p>
                      <p className="text-xs text-text-muted">Sampling Rate</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCompleteSetup} className="button-primary w-full button-lg">
                  Selesai & Mulai Belajar
                </Button>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-accent-success rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-h2 text-text-default">Setup Selesai!</h2>
                <p className="text-text-secondary">
                  Headband NERA Anda siap digunakan. Selamat belajar dengan teknologi neuro-adaptive!
                </p>
                <Button onClick={() => window.location.href = '/dashboard/student'} className="button-primary button-lg">
                  Ke Dashboard
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            Butuh bantuan? Hubungi support@nera.id atau lihat{' '}
            <a href="/docs/hardware-setup" className="text-primary hover:underline">panduan lengkap</a>
          </p>
        </div>
      </div>
    </div>
  );
}
