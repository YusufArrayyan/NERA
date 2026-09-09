'use client';

import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
  animated?: boolean;
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  default: 'bg-gradient-to-r from-neutral-300 to-neutral-400',
  gradient: 'bg-gradient-to-r from-green-400 to-teal-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showLabel = true,
  animated = true,
  variant = 'gradient',
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
          {showLabel && (
            <span className="text-sm font-semibold text-neutral-900">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full transition-all ${
            animated ? 'duration-300' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
