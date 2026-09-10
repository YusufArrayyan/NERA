/**
 * Real-time EEG Data Panel
 * Displays live brainwave data streaming via WebSocket
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useEEGWebSocket } from '@/hooks/useEEGWebSocket';

interface RealTimeEEGPanelProps {
  sessionId?: string;
  autoStart?: boolean;
}

export function RealTimeEEGPanel({ sessionId, autoStart = false }: RealTimeEEGPanelProps) {
  const [dataHistory, setDataHistory] = useState<any[]>([]);
  const { isConnected, latestData, error, startStreaming, stopStreaming } = useEEGWebSocket({
    autoConnect: true,
    onData: (data) => {
      setDataHistory((prev) => [...prev.slice(-29), data]); // Keep last 30 data points
    },
  });

  useEffect(() => {
    if (autoStart && isConnected) {
      startStreaming(sessionId, 'MODERATE_FOCUS');
    }

    return () => {
      stopStreaming();
    };
  }, [autoStart, isConnected, sessionId, startStreaming, stopStreaming]);

  const getWaveColor = (value: number) => {
    if (value >= 70) return 'text-green-600 bg-green-100';
    if (value >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWaveBarWidth = (value: number) => {
    return `${Math.min(value, 100)}%`;
  };

  // Calculate display metrics from processed data
  const focusLevel = latestData?.processed?.focusIndex || 0;
  const stressLevel = latestData?.processed?.stressIndex || 0;
  const attentionScore = latestData?.processed?.attentionScore || 0;
  const qualityScore = latestData?.processed?.qualityScore || 0;

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#F5F3EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-[#9CA3AF] text-3xl">signal_wifi_off</span>
          </div>
          <p className="text-[#4B5563] font-semibold mb-2">WebSocket Disconnected</p>
          <p className="text-xs text-[#9CA3AF]">
            {error ? error.message : 'Menghubungkan ke server streaming...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-lg font-bold text-[#1F2937]">Real-Time EEG Streaming</h3>
            <p className="text-xs text-[#9CA3AF]">WebSocket Live • {dataHistory.length} data points</p>
          </div>
        </div>
        <div className="bg-[#5B7B5A]/10 text-[#5B7B5A] text-xs font-bold px-3 py-1 rounded-lg">
          LIVE
        </div>
      </div>

      {/* Cognitive Metrics */}
      {latestData && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5F3EE] rounded-xl">
              <p className="text-xs text-[#4B5563] mb-2">Focus Level</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-[#5B7B5A]">
                  {Math.round(focusLevel)}%
                </span>
                <span className="text-xs text-[#9CA3AF] mb-1">real-time</span>
              </div>
              <p className="text-[10px] text-[#4B5563] mt-1">{latestData.processed.focusCategory}</p>
            </div>

            <div className="p-4 bg-[#F5F3EE] rounded-xl">
              <p className="text-xs text-[#4B5563] mb-2">Stress Level</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-[#f59e0b]">
                  {Math.round(stressLevel)}%
                </span>
                <span className="text-xs text-[#9CA3AF] mb-1">real-time</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F5F3EE] rounded-xl">
              <p className="text-xs text-[#4B5563] mb-2">Attention</p>
              <span className="text-2xl font-black text-[#10dcc8]">
                {Math.round(attentionScore)}%
              </span>
            </div>

            <div className="p-4 bg-[#F5F3EE] rounded-xl">
              <p className="text-xs text-[#4B5563] mb-2">Signal Quality</p>
              <span className="text-2xl font-black text-[#8b5cf6]">
                {Math.round(qualityScore)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Brainwave Bands */}
      {latestData?.raw && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-[#1F2937]">Brainwave Activity</h4>
          
          {Object.entries({
            alpha: latestData.raw.alpha,
            beta: latestData.raw.beta,
            theta: latestData.raw.theta,
            gamma: latestData.raw.gamma,
          }).map(([band, value]: [string, any]) => {
            const normalized = Math.round((value / 100) * 100); // Normalize to 0-100
            return (
              <div key={band} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4B5563] capitalize font-semibold">{band} Wave</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${getWaveColor(normalized)}`}>
                    {normalized}%
                  </span>
                </div>
                <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5B7B5A] to-[#10dcc8] rounded-full transition-all duration-300"
                    style={{ width: getWaveBarWidth(normalized) }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Signal Quality & Meditation */}
      {latestData?.raw && (
        <div>
          <h4 className="text-sm font-semibold text-[#1F2937] mb-3">Signal Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-[#F5F3EE] rounded-lg text-center">
              <p className="text-xs font-bold text-[#4B5563] mb-1">Attention</p>
              <p className="text-sm font-black text-[#1F2937]">{Math.round(latestData.raw.attention)}</p>
              <p className="text-[10px] text-[#9CA3AF]">/ 100</p>
            </div>
            <div className="p-3 bg-[#F5F3EE] rounded-lg text-center">
              <p className="text-xs font-bold text-[#4B5563] mb-1">Meditation</p>
              <p className="text-sm font-black text-[#1F2937]">{Math.round(latestData.raw.meditation)}</p>
              <p className="text-[10px] text-[#9CA3AF]">/ 100</p>
            </div>
            <div className="p-3 bg-[#F5F3EE] rounded-lg text-center">
              <p className="text-xs font-bold text-[#4B5563] mb-1">Quality</p>
              <p className="text-sm font-black text-[#1F2937]">{Math.round(latestData.raw.signalQuality)}</p>
              <p className="text-[10px] text-[#9CA3AF]">/ 100</p>
            </div>
            <div className="p-3 bg-[#F5F3EE] rounded-lg text-center">
              <p className="text-xs font-bold text-[#4B5563] mb-1">F-Ratio</p>
              <p className="text-sm font-black text-[#1F2937]">{latestData.processed.fRatio.toFixed(2)}</p>
              <p className="text-[10px] text-[#9CA3AF]">index</p>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp */}
      {latestData && (
        <div className="mt-4 pt-4 border-t border-[#E5E7EB] text-center">
          <p className="text-xs text-[#9CA3AF]">
            Last update: {new Date(latestData.processed.timestamp).toLocaleTimeString('id-ID')}
          </p>
          <p className="text-[10px] text-[#4B5563] mt-1">
            Mode: {latestData.processed.recommendedMode}
          </p>
        </div>
      )}
    </div>
  );
}
