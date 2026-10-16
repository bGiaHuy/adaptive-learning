"use client";

import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getSkillProgressChartData } from '@/lib/skillChart';

const rings = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
function point(index: number, distance: number) {
  const angle = (index * 60 - 90) * Math.PI / 180;
  return { x: 210 + Math.cos(angle) * distance, y: 190 + Math.sin(angle) * distance };
}
function polygon(distance: number) {
  return Array.from({ length: 6 }, (_, index) => { const p = point(index, distance); return `${p.x},${p.y}`; }).join(' ');
}

export function SkillRadar() {
  const { skillEstimates } = useApp();
  const skills = getSkillProgressChartData(skillEstimates);
  const [selected, setSelected] = useState(0);
  const current = skills[selected];
  const measured = skills.filter(skill => skill.level !== null).length;
  const chartId = useId();
  const measuredPoints = skills.flatMap((skill, index) => skill.radius === null ? [] : [point(index, skill.radius * 20)]);

  return (
    <section aria-labelledby={`${chartId}-heading`} className="bg-[#EEE8FF] border-2 border-[#15131D] rounded-[28px] p-5 md:p-7 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1"><h2 id={`${chartId}-heading`} className="text-lg font-black text-ink flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Bản đồ năng lực của bạn</h2><p className="text-sm text-ink-muted">Một góc nhìn về từng kỹ năng, từ kết quả bạn đã làm.</p></div>
        <span className="px-3 py-2 rounded-pill border-2 border-[#15131D] text-xs font-bold bg-white text-[#15131D]">{measured} / 6 kỹ năng đã đánh giá</span>
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 md:gap-8 items-center">
        <div className="space-y-2">
          <svg viewBox="0 0 420 395" role="img" aria-labelledby={`${chartId}-title ${chartId}-desc`} className="w-full max-w-xl mx-auto">
            <title id={`${chartId}-title`}>Biểu đồ radar năng lực tiếng Anh theo kỹ năng</title>
            <desc id={`${chartId}-desc`}>{skills.map(skill => `${skill.label}: ${skill.level || (skill.evidenceCount ? `${skill.evidenceCount} lượt, chưa có mức CEFR` : 'chưa có dữ liệu')}`).join('; ')}. Các vòng biểu thị thứ bậc CEFR, không phải khoảng điểm bằng nhau. Điểm trống không có nghĩa là điểm 0.</desc>
            <polygon points={polygon(120)} fill="white" />
            {rings.map((ring, index) => <g key={ring}>
              <polygon points={polygon((index + 1) * 20)} fill="none" stroke="#15131D" strokeWidth={index === 5 ? 4 : 1.5} opacity={index === 5 ? 1 : 0.22} strokeLinejoin="round" />
            </g>)}
            {skills.map((skill, index) => {
              const edge = point(index, 120);
              const label = index === 0 ? { x: 210, y: 32 } : index === 3 ? { x: 210, y: 352 } : { x: index < 3 ? 365 : 55, y: index === 1 || index === 5 ? 127 : 251 };
              return <g key={skill.key}>
                <line x1="210" y1="190" x2={edge.x} y2={edge.y} stroke="#15131D" strokeWidth="3" />
                <rect x={label.x - 51} y={label.y - 17} width="102" height="32" rx="16" fill={index === selected ? '#F9E66C' : 'white'} stroke="#15131D" strokeWidth="2.5" />
                <text x={label.x} y={label.y + 4} textAnchor="middle" fontSize="15" fontWeight="800" fill="#15131D">{skill.label}</text>
                <text x={label.x} y={label.y + 33} textAnchor="middle" fontSize="13" fontWeight={skill.level ? '700' : '400'} fill="#514861">{skill.level || 'Chưa đánh giá'}</text>
              </g>;
            })}
            {measuredPoints.length >= 3 && <polygon points={measuredPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="#FB923C" fillOpacity="0.35" stroke="#EA580C" strokeWidth="2.5" strokeLinejoin="round" />}
            {measuredPoints.length === 2 && <line x1={measuredPoints[0].x} y1={measuredPoints[0].y} x2={measuredPoints[1].x} y2={measuredPoints[1].y} stroke="#EA580C" strokeWidth="2.5" />}
            {skills.map((skill, index) => {
              if (skill.radius === null) return null;
              const p = point(index, skill.radius * 20);
              return <g key={`point-${skill.key}`}><title>{skill.label}: {skill.level}, {skill.scoreDisplay}</title>{selected === index && <circle cx={p.x} cy={p.y} r="10" fill="#F9E66C" />}<circle cx={p.x} cy={p.y} r="4.5" fill="#15131D" stroke="white" strokeWidth="1.5" /></g>;
            })}
          </svg>
          <p className="text-xs text-center text-ink-muted">Vòng trong → ngoài: A1 · A2 · B1 · B2 · C1 · C2</p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2" aria-label="Chọn kỹ năng để xem chi tiết">
            {skills.map((skill, index) => <button key={skill.key} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)} className={`min-h-14 px-3 py-3 rounded-2xl border-2 border-[#15131D] text-left flex items-center justify-between gap-2 transition-colors text-[#15131D] ${selected === index ? 'bg-[#F9E66C]' : 'bg-white hover:bg-[#F7F3FF]'}`}><span className="text-sm font-bold">{skill.label}</span><span className={`text-xs ${skill.level ? 'font-extrabold' : 'text-ink-muted'}`}>{skill.level || (skill.evidenceCount ? `${skill.evidenceCount} lượt` : 'Chưa có dữ liệu')}</span></button>)}
          </div>
          <div aria-live="polite" className="bg-white border-2 border-[#15131D] rounded-2xl p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-3"><h3 className="font-extrabold text-ink">{current.label}</h3><span className="text-xl font-black text-primary">{current.level || '—'}</span></div>
            <p className="text-sm text-ink-muted leading-relaxed">{current.scoreDisplay}</p>
            <Link href={current.href} className="inline-flex items-center gap-2 min-h-11 text-sm font-bold text-primary">Luyện kỹ năng này<ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
