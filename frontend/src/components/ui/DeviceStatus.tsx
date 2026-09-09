'use client';

import React from 'react';
import { Card, CardBody } from './Card';
import { Badge } from './Badge';
import { Bluetooth, Wifi, Signal, Battery, AlertCircle } from 'lucide-react';

interface DeviceStatusProps {
  name: string;
  model: string;
  uuid: string;
  isConnected: boolean;
  batteryLevel: number;
  signalStrength: number; // -100 to 0 dBm
  lastSync?: string;
  status?: 'active' | 'idle' | 'error' | 'updating';
  impedance?: {
    fp1: number;
    fp2: number;
    af7: number;
    af8: number;
  };
}

export function DeviceStatus({
  name,
  model,
  uuid,
  isConnected,
  batteryLevel,
  signalStrength,
  lastSync,
  status = 'idle',
  impedance,
}: DeviceStatusProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge variant="success">🟢 Aktif</Badge>;
      case 'idle':
        return <Badge variant="info">🔵 Siaga</Badge>;
      case 'updating':
        return <Badge variant="warning">🟡 Update</Badge>;
      case 'error':
        return <Badge variant="error">🔴 Error</Badge>;
    }
  };

  const getSignalQuality = (dbm: number) => {
    if (dbm > -50) return { level: 'Sempurna', color: 'text-green-600' };
    if (dbm > -60) return { level: 'Sangat Baik', color: 'text-green-500' };
    if (dbm > -70) return { level: 'Baik', color: 'text-yellow-500' };
    return { level: 'Lemah', color: 'text-orange-500' };
  };

  const signalQuality = getSignalQuality(signalStrength);

  return (
    <Card variant="elevated" className="border-l-4 border-teal-500">
      <CardBody className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Bluetooth className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-neutral-900">{name}</h3>
            </div>
            <p className="text-sm text-neutral-600">{model}</p>
            <p className="text-xs text-neutral-500 font-mono mt-1">{uuid}</p>
          </div>
          <div className="flex-shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Battery */}
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Battery className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-medium text-neutral-600">Baterai</p>
            </div>
            <p className="text-lg font-bold text-neutral-900">{batteryLevel}%</p>
            <p className="text-xs text-neutral-500 mt-1">
              ~{Math.round((batteryLevel / 100) * 10)} jam
            </p>
          </div>

          {/* Signal */}
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Signal className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-neutral-600">Signal</p>
            </div>
            <p className="text-lg font-bold text-neutral-900">{signalStrength} dBm</p>
            <p className={`text-xs font-medium mt-1 ${signalQuality.color}`}>
              {signalQuality.level}
            </p>
          </div>

          {/* Connection */}
          <div className="bg-neutral-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-neutral-600">Koneksi</p>
            </div>
            <p className="text-lg font-bold text-neutral-900">
              {isConnected ? 'BLE 5.2' : 'Putus'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isConnected ? 'Tersambung' : 'Tidak aktif'}
            </p>
          </div>

          {/* Last Sync */}
          <div className="bg-neutral-50 rounded-lg p-3">
            <p className="text-xs font-medium text-neutral-600 mb-1">Sinkronisasi</p>
            <p className="text-sm font-bold text-neutral-900">{lastSync || 'Baru saja'}</p>
            <p className="text-xs text-neutral-500 mt-1">Terakhir diperbarui</p>
          </div>
        </div>

        {/* Impedance Status (if available) */}
        {impedance && (
          <div className="pt-3 border-t border-neutral-200">
            <p className="text-xs font-semibold text-neutral-700 mb-2">Status Impedansi Elektroda</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'FP1', value: impedance.fp1 },
                { label: 'FP2', value: impedance.fp2 },
                { label: 'AF7', value: impedance.af7 },
                { label: 'AF8', value: impedance.af8 },
              ].map((electrode) => {
                const status =
                  electrode.value < 2
                    ? 'bg-green-100 text-green-700'
                    : electrode.value < 5
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700';
                return (
                  <div key={electrode.label} className={`${status} rounded p-2 text-center`}>
                    <p className="text-xs font-bold">{electrode.label}</p>
                    <p className="text-xs font-semibold">{electrode.value}kΩ</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <p className="font-semibold">Peringatan Koneksi</p>
              <p className="text-xs">Coba hubungkan ulang perangkat</p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
