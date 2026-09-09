'use client';

import React from 'react';
import { Card, CardBody } from './Card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'error' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
}

const statusColors = {
  good: 'bg-green-50 border-green-200 text-green-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  neutral: 'bg-neutral-50 border-neutral-200 text-neutral-700',
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  status = 'neutral',
  trend,
  trendValue,
  description,
}: MetricCardProps) {
  return (
    <Card variant="elevated" className={`border-l-4 ${statusColors[status]}`}>
      <CardBody className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${status === 'good' ? 'bg-green-100' : status === 'warning' ? 'bg-yellow-100' : status === 'error' ? 'bg-red-100' : 'bg-neutral-200'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-neutral-900">{value}</span>
            {unit && <span className="text-sm text-neutral-600">{unit}</span>}
          </div>
          {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-600'}`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
