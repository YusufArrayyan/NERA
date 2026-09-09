'use client';

import React from 'react';

interface HeatmapProps {
  data: number[][];
  labels?: {
    rows?: string[];
    cols?: string[];
  };
  title?: string;
}

export function Heatmap({ data, labels, title }: HeatmapProps) {
  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-600';
    if (value >= 60) return 'bg-green-400';
    if (value >= 40) return 'bg-yellow-400';
    if (value >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const maxValue = Math.max(...data.flat());

  return (
    <div className="w-full">
      {title && <p className="text-sm font-semibold text-neutral-700 mb-3">{title}</p>}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Column labels */}
          {labels?.cols && (
            <div className="flex gap-1">
              <div className="w-16" /> {/* Spacer for row labels */}
              {labels.cols.map((col, idx) => (
                <div
                  key={idx}
                  className="w-12 h-10 flex items-center justify-center text-xs font-semibold text-neutral-700"
                >
                  {col}
                </div>
              ))}
            </div>
          )}

          {/* Heatmap rows */}
          {data.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {/* Row label */}
              {labels?.rows && (
                <div className="w-16 h-12 flex items-center justify-center text-xs font-medium text-neutral-600 border-r border-neutral-200">
                  {labels.rows[rowIdx]}
                </div>
              )}

              {/* Cells */}
              {row.map((value, colIdx) => (
                <div
                  key={colIdx}
                  className={`w-12 h-12 flex items-center justify-center text-xs font-bold text-white rounded transition-all hover:scale-110 cursor-pointer ${getColor(value)}`}
                  title={`${value}%`}
                >
                  {value}
                </div>
              ))}
            </div>
          ))}

          {/* Legend */}
          <div className="flex gap-2 items-center mt-4 text-xs">
            <span className="font-semibold text-neutral-700 mr-2">Range:</span>
            {[
              { color: 'bg-red-400', label: '0-20%' },
              { color: 'bg-orange-400', label: '20-40%' },
              { color: 'bg-yellow-400', label: '40-60%' },
              { color: 'bg-green-400', label: '60-80%' },
              { color: 'bg-green-600', label: '80-100%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="text-neutral-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
