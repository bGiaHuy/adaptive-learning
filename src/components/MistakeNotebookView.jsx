import React from 'react';
import { BookX, CheckCircle, RefreshCw } from 'lucide-react';
import MathRenderer from './MathRenderer';

export default function MistakeNotebookView({
  mistakes = [],
  onStartPractice
}) {
  if (!mistakes || mistakes.length === 0) {
    return (
      <div className="empty-state-view-wrapper animate-fade-in">
        <div className="empty-state-card">
          <div className="empty-state-icon-box purple-tint">
            <BookX size={32} className="empty-icon text-purple" />
          </div>
          <h2 className="empty-state-title">Sổ tay còn trống</h2>
          <p className="empty-state-desc">
            Mỗi câu trả lời sai trong lúc luyện tập sẽ được ghi lại kèm đáp án đúng, để bạn xem lại và luyện tới khi sửa được.
          </p>
          <button
            className="btn-empty-action"
            onClick={onStartPractice}
          >
            Bắt đầu luyện tập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mistakes-page animate-fade-in">
      <div className="mistakes-header">
        <h2>Sổ tay lỗi sai ({mistakes.length} câu)</h2>
        <p>Xem lại các câu hỏi chưa làm đúng và luyện lại ngay khi sẵn sàng.</p>
      </div>

      <div className="mistakes-list">
        {mistakes.map((item, idx) => (
          <div key={idx} className="mistake-item-card">
            <div className="mistake-card-top">
              <span className="mistake-topic-tag">{item.question?.topic}</span>
              <span className="mistake-level-tag">{item.question?.level}</span>
            </div>
            <div className="mistake-question-content">
              <MathRenderer text={item.question?.content} />
            </div>
            <div className="mistake-answers-row">
              <div className="answer-badge wrong">
                Bạn đã chọn: {item.selected}
              </div>
              <div className="answer-badge correct">
                Đáp án đúng: {item.question?.correctAnswer}
              </div>
            </div>
            {item.question?.explanation && (
              <div className="mistake-explanation-box">
                <strong>Lời giải: </strong>
                <MathRenderer text={item.question.explanation} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
