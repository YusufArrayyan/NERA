'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from './Card';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartContainer({ title, description, children, action }: ChartContainerProps) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
            {description && <p className="text-sm text-neutral-600 mt-1">{description}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto">{children}</CardBody>
    </Card>
  );
}
