import React, { useState } from 'react';
import './competency-chart.css';

export default function CompetencyChart({ data }) {
  const [chapter, setChapter] = useState('');
  const [order, setOrder] = useState('curriculum');
  const skills = data.catalog || data.skills || [];
  const chapters = [...new Set(skills.map(skill => skill.chapter).filter(Boolean))];
  const rows = skills.filter(skill => !chapter || skill.chapter === chapter);
  if (order === 'priority') rows.sort((a, b) => (a.masteryScore ?? 101) - (b.masteryScore ?? 101));
  return <section className="competency-chart" aria-labelledby="competency-chart-title">
    <header><div><p className="competency-chart-kicker">BẢN ĐỒ KỸ NĂNG</p><h3 id="competency-chart-title">Bạn đang vững ở đâu?</h3></div><strong>Mục tiêu {data.targetMastery}%</strong></header>
    <p>Điểm là ước tính hiện tại. Cần ít nhất 5 câu làm bằng chứng để xác nhận mức thành thạo; kỹ năng chưa đánh giá không được tính là 0 điểm.</p>
    <div className="competency-chart-filters"><label>Chương<select value={chapter} onChange={event => setChapter(event.target.value)}><option value="">Tất cả chương</option>{chapters.map(value => <option key={value}>{value}</option>)}</select></label><label>Thứ tự<select value={order} onChange={event => setOrder(event.target.value)}><option value="curriculum">Theo chương trình</option><option value="priority">Điểm thấp trước</option></select></label></div>
    <div className="competency-chart-axis" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
    <ul className="competency-chart-rows">{rows.map(skill => {
      const assessed = Number.isFinite(skill.masteryScore);
      const score = assessed ? Math.min(100, Math.max(0, skill.masteryScore)) : null;
      const enough = (skill.evidenceCount || 0) >= 5;
      const status = !assessed ? 'Chưa đánh giá' : !enough ? 'Chưa đủ bằng chứng' : score >= data.targetMastery ? 'Thành thạo' : score >= 50 ? 'Đang củng cố' : 'Cần luyện tập';
      const updated = skill.lastAssessedAt && new Date(skill.lastAssessedAt);
      return <li key={skill.skillId}><div className="competency-chart-label"><strong>{skill.title}</strong><span>{status}</span></div><div className="competency-chart-track" role="img" aria-label={`${skill.title}: ${assessed ? `${score}% ước tính` : status}; ${skill.evidenceCount || 0} câu bằng chứng`}><span className={`competency-chart-bar ${!enough ? 'provisional' : ''}`} style={{ width: `${score ?? 0}%` }}/><i style={{ left: `${data.targetMastery}%` }} aria-hidden="true"/>{!assessed && <em>Chưa có dữ liệu</em>}</div><div className="competency-chart-detail"><span>{assessed ? `${score}% · ` : ''}{skill.evidenceCount || 0} câu bằng chứng</span><span>{updated && Number.isFinite(updated.getTime()) ? `Cập nhật ${updated.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}` : 'Chưa có ngày đánh giá'}</span></div></li>;
    })}</ul>
    <p className="competency-chart-note">Vạch đứng là mục tiêu của bạn. Thanh gạch chéo là kết quả tạm tính. Số bằng chứng không phải khoảng tin cậy thống kê.</p>
  </section>;
}
