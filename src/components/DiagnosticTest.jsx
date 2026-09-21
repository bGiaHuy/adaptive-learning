import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import { DIAGNOSTIC_QUESTIONS } from '../data/questionBank';

export default function DiagnosticTest({
  onFinishTest,
  onPauseTest
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('B'); // Preset or selectable
  const [theta, setTheta] = useState(0.50);
  const [timeLeft, setTimeLeft] = useState(90); // 1:30 countdown
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [completedTopicsCount, setCompletedTopicsCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 90; // reset or loop for next question
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, currentQuestionIndex]);

  const currentQ = DIAGNOSTIC_QUESTIONS[currentQuestionIndex] || DIAGNOSTIC_QUESTIONS[0];

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    const newTheta = isCorrect
      ? Number((theta + currentQ.thetaChange).toFixed(2))
      : Number(Math.max(0.1, theta - 0.1).toFixed(2));

    setTheta(newTheta);
    setUserAnswers([
      ...userAnswers,
      {
        questionId: currentQ.id,
        selected: selectedOption,
        isCorrect,
        question: currentQ
      }
    ]);

    if (currentQuestionIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setTimeLeft(90);
      setCompletedTopicsCount(completedTopicsCount + 1);
    } else {
      // Completed all mock diagnostic questions
      onFinishTest({
        finalTheta: newTheta,
        totalAnswered: userAnswers.length + 1,
        completedTopics: 24,
        answers: userAnswers
      });
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setTimeLeft(90);
    } else {
      onFinishTest({
        finalTheta: theta,
        totalAnswered: userAnswers.length,
        completedTopics: completedTopicsCount,
        answers: userAnswers
      });
    }
  };

  if (!hasStarted) {
    // Intro Screen (Matching 01:27 - 01:33)
    return (
      <div className="diagnostic-landing-view animate-fade-in">
        <div className="diagnostic-intro-card">
          <h1 className="intro-card-heading">Bài kiểm tra đầu vào</h1>
          <p className="intro-card-description">
            Bài kiểm tra đi qua từng chủ đề theo thang nhận thức: Nhận biết – Thông hiểu – Vận dụng. Trả lời đúng thì lên mức khó hơn; trả lời sai thì có một câu xác minh trước khi chuyển chủ đề. Không có điểm số — mục tiêu là vẽ đúng bản đồ năng lực của bạn.
          </p>

          <div className="diagnostic-metrics-row">
            <div className="metric-box">
              <div className="metric-number">24</div>
              <div className="metric-sublabel">CHỦ ĐỀ SẼ QUÉT</div>
            </div>

            <div className="metric-box">
              <div className="metric-number">≤ 50</div>
              <div className="metric-sublabel">CÂU HỎI TỐI ĐA</div>
            </div>

            <div className="metric-box">
              <div className="metric-number">90–180s</div>
              <div className="metric-sublabel">MỖI CÂU</div>
            </div>
          </div>

          <div className="diagnostic-alert-banner">
            <Info size={18} className="alert-banner-icon" />
            <span className="alert-banner-text">
              Bạn có thể dừng giữa chừng — tiến trình được lưu lại và có thể học tiếp sau.
            </span>
          </div>

          <button
            className="btn-start-diagnostic"
            onClick={() => setHasStarted(true)}
          >
            <span>Bắt đầu</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Active Quiz Screen (Matching 01:34 - 01:45)
  return (
    <div className="diagnostic-quiz-view animate-fade-in">
      <div className="quiz-main-card">
        {/* Status Bar */}
        <div className="quiz-status-bar">
          <div className="quiz-status-left">
            <div className="quiz-tag-pill tag-question-number">
              <CheckCircle size={14} className="tag-icon-check" />
              <span>Câu {currentQuestionIndex + 1}</span>
            </div>

            <div className="quiz-tag-pill tag-topics-count">
              <span>Chủ đề xong: {completedTopicsCount}/24</span>
            </div>

            <div className="quiz-tag-pill tag-theta-value">
              <span>θ = {theta.toFixed(2)}</span>
            </div>
          </div>

          <div className="quiz-status-timer">
            <Clock size={16} className="timer-clock-icon" />
            <span className="timer-text">{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* Question Topic Path */}
        <div className="question-topic-breadcrumb">
          <span>{currentQ.chapter}</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-current">{currentQ.topic}</span>
        </div>

        {/* Cognitive Level & Meta Badges */}
        <div className="question-meta-row">
          <span className="cognitive-badge level-know">{currentQ.level}</span>
          <span className="question-type-badge">{currentQ.type}</span>
          <span className="question-source-text">{currentQ.source}</span>
        </div>

        {/* Question Content */}
        <div className="question-content-box">
          <h2 className="question-text">
            <MathRenderer text={currentQ.content} />
          </h2>
        </div>

        {/* Options List */}
        <div className="options-choices-group">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <div
                key={opt.id}
                className={`choice-option-row ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedOption(opt.id)}
              >
                <div className="choice-key-box">{opt.id}</div>
                <div className="choice-math-content">
                  <MathRenderer text={opt.text} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action Buttons */}
        <div className="quiz-card-footer">
          <button
            type="button"
            className="btn-pause-quiz"
            onClick={onPauseTest}
          >
            Dừng bài
          </button>

          <div className="quiz-footer-right-actions">
            <button
              type="button"
              className="btn-skip-quiz"
              onClick={handleSkip}
            >
              Bỏ qua
            </button>
            <button
              type="button"
              className="btn-submit-quiz"
              onClick={handleAnswerSubmit}
              disabled={!selectedOption}
            >
              Trả lời
            </button>
          </div>
        </div>

        {/* Accordion: Vì sao câu này được chọn? */}
        <div className="quiz-reason-accordion">
          <button
            type="button"
            className="accordion-toggle-btn"
            onClick={() => setIsReasonOpen(!isReasonOpen)}
          >
            {isReasonOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>Vì sao câu này được chọn?</span>
          </button>

          {isReasonOpen && (
            <div className="accordion-content-panel animate-fade-in">
              <p className="accordion-lead-title">{currentQ.selectionReason.title}</p>
              <p className="accordion-desc">{currentQ.selectionReason.description}</p>

              <div className="accordion-diagnostic-table">
                {currentQ.selectionReason.table.map((row, idx) => (
                  <div key={idx} className="diagnostic-table-row">
                    <span className="row-topic-title">{row.topic}</span>
                    <div className="row-meta-tags">
                      <span className="row-badge-count">{row.count}</span>
                      <span className="row-badge-level">{row.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
