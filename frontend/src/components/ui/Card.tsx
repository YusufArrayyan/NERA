'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

const cardVariants: Record<string, string> = {
  default: 'bg-white border border-neutral-200 rounded-lg',
  elevated: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow',
  outlined: 'bg-white border-2 border-neutral-300 rounded-lg',
};

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  return (
    <div className={`${cardVariants[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`px-6 py-4 border-b border-neutral-100 ${className}`}>{children}</div>;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`px-6 py-4 border-t border-neutral-100 bg-neutral-50 rounded-b-lg ${className}`}>{children}</div>;
}
