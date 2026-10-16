import React from 'react';

export default function ImportQuestionsSkeleton() {
  const bar = (width = '100%') => <div className="h-3 rounded bg-line" style={{ width }} />;
  return <section data-import-skeleton aria-label="Đang chuẩn bị câu hỏi" className="space-y-6" aria-hidden="true">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[0, 1, 2, 3].map(n => <div key={n} className="min-h-[120px] p-4 bg-white border-2 border-line rounded-lg space-y-3">{bar('65%')}{bar('30%')}{bar('85%')}</div>)}</div>
    <div className="min-h-[96px] p-4 bg-canvas border border-line rounded-lg">{bar('65%')}</div>
    <div className="flex gap-3 h-[56px] overflow-hidden">{[0, 1, 2].map(n => <div key={n} className="h-10 w-36 rounded-full bg-line" />)}</div>
    <div className="bg-white border-2 border-line rounded-lg p-5 space-y-4">
      <div className="h-[82px] space-y-3 border-b border-line">{bar('40%')}{bar('65%')}</div>
      <div className="space-y-3">{Array.from({ length: 10 }, (_, n) => <div key={n} data-skeleton-question className="min-h-[320px] p-4 rounded-md border-2 border-line space-y-5" style={{ contentVisibility: 'auto', containIntrinsicSize: '320px' }}>
        {bar('20%')}{bar('85%')}
        <div className="grid sm:grid-cols-2 gap-2">{[0, 1, 2, 3].map(i => <div key={i} className="h-10 bg-canvas border border-line rounded p-3">{bar('75%')}</div>)}</div>
        <div className="bg-canvas rounded border border-line p-3 space-y-3">{bar('30%')}{bar('90%')}{bar('65%')}</div>
      </div>)}</div>
    </div>
  </section>;
}
