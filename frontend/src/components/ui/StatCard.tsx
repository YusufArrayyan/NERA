'use client';

import React from 'react';
import { Card, CardBody } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight';
}

export function StatCard({
  title,
  value,
  unit,
  change,
  description,
  icon,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card
      variant="elevated"
      className={`${
        variant === 'highlight'
          ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
          : ''
      }`}
    >
      <CardBody className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-neutral-900">{value}</span>
            {unit && <span className="text-lg text-neutral-500">{unit}</span>}
          </div>
          {description && <p className="text-xs text-neutral-500 mt-2">{description}</p>}
          {change && (
            <div
              className={`flex items-center gap-1 mt-3 text-sm font-semibold ${
                change.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.direction === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>
                {change.value}% {change.period}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="flex-shrink-0 text-3xl">{icon}</div>}
      </CardBody>
    </Card>
  );
}
