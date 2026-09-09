'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface ProgressStepProps {
  steps: {
    number: number;
    label: string;
    status: 'completed' | 'active' | 'pending';
    description?: string;
  }[];
  currentStep: number;
}

export function ProgressStep({ steps, currentStep }: ProgressStepProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Step Circle */}
          <div className="flex flex-col items-center flex-1 max-w-xs">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all ${
                step.status === 'completed'
                  ? 'bg-green-600 text-white'
                  : step.status === 'active'
                  ? 'bg-green-100 text-green-600 ring-4 ring-green-200'
                  : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : step.status === 'active' ? (
                <Clock className="w-6 h-6 animate-pulse" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-neutral-900 text-center">{step.label}</p>
            {step.description && (
              <p className="mt-1 text-xs text-neutral-500 text-center">{step.description}</p>
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                step.status === 'completed' ? 'bg-green-600' : 'bg-neutral-200'
              }`}
              style={{ minWidth: '40px' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
