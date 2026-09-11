'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
}

const badgeVariants: Record<string, string> = {
  default: 'bg-neutral-100 text-neutral-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-green-100 text-green-700',
  secondary: 'bg-green-100 text-green-700',
};

const badgeSizes: Record<string, string> = {
  sm: 'px-2 py-1 text-xs font-medium rounded',
  md: 'px-3 py-1.5 text-sm font-medium rounded-md',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span className={`inline-flex items-center ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}>
      {children}
    </span>
  );
}
