'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { Badge } from '@/components/ui/Badge';

export interface TrueFalseRow {
  id: string;
  order: number;
  statement: string;
  correctAnswer?: 'T' | 'F';
}

export interface TrueFalseTableProps {
  rows: TrueFalseRow[];
  initialValues?: Record<string, 'T' | 'F'>;
  readOnly?: boolean;
  showAnswers?: boolean;
  onSelectionChange?: (values: Record<string, 'T' | 'F'>) => void;
}

export function TrueFalseTable({
  rows,
  initialValues = {},
  readOnly = false,
  showAnswers = false,
  onSelectionChange,
}: TrueFalseTableProps) {
  const [selected, setSelected] = useState<Record<string, 'T' | 'F'>>(initialValues);

  const handleSelect = (rowId: string, value: 'T' | 'F') => {
    if (readOnly) return;
    const next = { ...selected, [rowId]: value };
    setSelected(next);
    if (onSelectionChange) {
      onSelectionChange(next);
    }
  };

  return (
    <div className="overflow-hidden border-2 border-line rounded-lg bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F6F9FF] border-b-2 border-line text-xs font-black uppercase text-ink tracking-wider">
              <th className="py-3 px-4 w-12 text-center">No.</th>
              <th className="py-3 px-4">Statements</th>
              <th className="py-3 px-4 w-24 text-center">True (T)</th>
              <th className="py-3 px-4 w-24 text-center">False (F)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm md:text-base">
            {rows.map((row) => {
              const userVal = selected[row.id];
              const isCorrectT = showAnswers && row.correctAnswer === 'T';
              const isCorrectF = showAnswers && row.correctAnswer === 'F';

              return (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-center text-ink-muted">
                    {row.order}.
                  </td>
                  <td className="py-3.5 px-4 text-ink font-medium leading-relaxed">
                    {row.statement}
                  </td>
                  <td
                    onClick={() => handleSelect(row.id, 'T')}
                    className={clsx(
                      'py-3.5 px-4 text-center border-l border-line font-black cursor-pointer select-none transition-all',
                      userVal === 'T'
                        ? 'bg-primary-light/40 text-primary'
                        : 'hover:bg-blue-50/30 text-gray-300',
                      isCorrectT && 'bg-success-soft text-success'
                    )}
                  >
                    <div className="w-8 h-8 mx-auto rounded-lg border-2 flex items-center justify-center text-base transition-transform active:scale-95 border-current">
                      {userVal === 'T' ? 'X' : ''}
                    </div>
                  </td>
                  <td
                    onClick={() => handleSelect(row.id, 'F')}
                    className={clsx(
                      'py-3.5 px-4 text-center border-l border-line font-black cursor-pointer select-none transition-all',
                      userVal === 'F'
                        ? 'bg-error-soft/60 text-error'
                        : 'hover:bg-red-50/30 text-gray-300',
                      isCorrectF && 'bg-success-soft text-success'
                    )}
                  >
                    <div className="w-8 h-8 mx-auto rounded-lg border-2 flex items-center justify-center text-base transition-transform active:scale-95 border-current">
                      {userVal === 'F' ? 'X' : ''}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-gray-50 border-t border-line flex flex-wrap items-center justify-between text-xs text-ink-muted">
        <span>Bảng chuẩn hóa cấu trúc dạng Table từ tệp DOCX (giữ nguyên cột T/F có dấu X).</span>
        <span>{Object.keys(selected).length} / {rows.length} câu đã trả lời</span>
      </div>
    </div>
  );
}

export default TrueFalseTable;
