'use client';

import React from 'react';
import { Card } from './Card';

interface TableProps {
  columns: {
    key: string;
    label: string;
    width?: string;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  data: Record<string, any>[];
  striped?: boolean;
}

export function Table({ columns, data, striped = true }: TableProps) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-neutral-700 ${col.width || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`border-b border-neutral-100 ${
                  striped && rowIdx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
                } hover:bg-neutral-100 transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 text-sm text-neutral-900 ${col.width || ''}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
