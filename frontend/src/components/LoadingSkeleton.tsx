'use client';

import React from 'react';

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F3EE] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg p-6 space-y-4">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-4 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 space-y-3">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-8 w-16" />
              <LoadingSkeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white rounded-lg p-6 space-y-4">
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 space-y-3">
          <LoadingSkeleton className="h-40 w-full" />
          <LoadingSkeleton className="h-6 w-3/4" />
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <LoadingSkeleton className="h-6 w-48" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <LoadingSkeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-1/3" />
              <LoadingSkeleton className="h-3 w-1/2" />
            </div>
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
