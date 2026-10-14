import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  HelpCircle,
  Check,
  X,
  ArrowRight,
  Pause
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import { diagnosticApi } from '../lib/apiClient';

export default function DiagnosticTest({
  onFinishTest,
  onPauseTest
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOptionKey, setSelectedOptionKey] = useState(null);
  const [currentTheta, setCurrentTheta] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(24);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  // Timing & states
  const [timeLeft, setTimeLeft] = useState(90); // 90s countdown per question
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [lastExplanation, setLastExplanation] = useState(null);

  const timerRef = useRef(null);
  const submissionLockRef = useRef(false);

  // Start or resume diagnostic attempt
  const handleStartAttempt = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await diagnosticApi.startAttempt();
      setAttemptId(data.attemptId);
      setCurrentTheta(data.currentTheta ?? 0);
      setAnsweredCount(data.answeredCount || 0);
      setTotalQuestions(data.totalQuestions || 24);
      setIsReadyToSubmit(data.isReadyToSubmit || false);
      setCurrentQuestion(data.currentQuestion || null);
      setSelectedOptionKey(null);
      setTimeLeft(data.questionTimeRemainingSeconds ?? 90);
      setHasStarted(true);

      if (data.isResumed) {
        setFeedbackNotice('Đã khôi phục phiên làm bài dở dang trước đó của bạn.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Không thể khởi tạo bài kiểm tra chẩn đoán.');
    } finally {
      setIsLoading(false);
    }
  };

  // Timer countdown: strictly no silent loop!
  useEffect(() => {
    if (!hasStarted || isReadyToSubmit || !currentQuestion || isSubmittingAnswer || isFinalizing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, currentQuestion?.id, isReadyToSubmit, isSubmittingAnswer, isFinalizing]);

  useEffect(() => {
    if (timeLeft === 0 && currentQuestion && !submissionLockRef.current) {
      handleTimeout();
    }
  }, [timeLeft, currentQuestion?.id]);

  // Keyboard navigation: A, B, C, D to pick, Enter to submit
  useEffect(() => {
    if (!hasStarted || !currentQuestion || isSubmittingAnswer || isFinalizing) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      let key = e.key.toUpperCase();
      const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      if (numMap[key]) {
        key = numMap[key];
      }
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const optionExists = (currentQuestion.options || []).some((o) => o.key === key);
        if (optionExists) {
          setSelectedOptionKey(key);
        }
      } else if (e.key === 'Enter') {
        if (selectedOptionKey) {
          e.preventDefault();
          handleAnswerSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, currentQuestion, selectedOptionKey, isSubmittingAnswer, isFinalizing]);

  // Submit Answer (with double-submit prevention & idempotent API)
  const handleAnswerSubmit = async () => {
    if (!selectedOptionKey || !currentQuestion || !attemptId || submissionLockRef.current) return;

    submissionLockRef.current = true;
    setIsSubmittingAnswer(true);
    setErrorMessage('');
    setFeedbackNotice('');

    const timeSpent = Math.max(1, 90 - timeLeft);

    try {
      const res = await diagnosticApi.answerQuestion({
        attemptId,
        questionId: currentQuestion.id,
        selectedOptionKey,
        timeSpentSeconds: timeSpent,
        isSkipped: false,
        isTimeout: false
      });

      setCurrentTheta(res.currentTheta);
      setAnsweredCount(res.answeredCount);
      setIsReadyToSubmit(res.isReadyToSubmit);

      if (res.explanation) {
        setLastExplanation({
          isCorrect: res.isCorrect,
          explanation: res.explanation
        });
      }

      if (res.isReadyToSubmit || !res.nextQuestion) {
        setIsReadyToSubmit(true);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(res.nextQuestion);
        setSelectedOptionKey(null);
        setTimeLeft(90);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Không thể gửi câu trả lời. Vui lòng thử lại.');
    } finally {
      submissionLockRef.current = false;
      setIsSubmittingAnswer(false);
    }
  };

  // Skip question
  const handleSkip = async () => {
    if (!currentQuestion || !attemptId || submissionLockRef.current) return;

    submissionLockRef.current = true;
    setIsSubmittingAnswer(true);
    setErrorMessage('');

    const timeSpent = Math.max(1, 90 - timeLeft);

    try {
      const res = await diagnosticApi.answerQuestion({
        attemptId,
        questionId: currentQuestion.id,
        selectedOptionKey: null,
        timeSpentSeconds: timeSpent,
        isSkipped: true,
        isTimeout: false
      });

      setCurrentTheta(res.currentTheta);
      setAnsweredCount(res.answeredCount);
      setIsReadyToSubmit(res.isReadyToSubmit);

      if (res.isReadyToSubmit || !res.nextQuestion) {
        setIsReadyToSubmit(true);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(res.nextQuestion);
        setSelectedOptionKey(null);
        setTimeLeft(90);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Không thể bỏ qua câu hỏi.');
    } finally {
      submissionLockRef.current = false;
      setIsSubmittingAnswer(false);
    }
  };

  // Timeout handler: records TIMEOUT in DB
  const handleTimeout = async () => {
    if (!currentQuestion || !attemptId || submissionLockRef.current) return;

    submissionLockRef.current = true;
    setIsSubmittingAnswer(true);
    setFeedbackNotice('Đã hết 90 giây cho câu này. Hệ thống đã ghi nhận và chuyển câu kế tiếp.');

    try {
      const res = await diagnosticApi.answerQuestion({
        attemptId,
        questionId: currentQuestion.id,
        selectedOptionKey: null,
        timeSpentSeconds: 90,
        isSkipped: false,
        isTimeout: true
      });

      setCurrentTheta(res.currentTheta);
      setAnsweredCount(res.answeredCount);
      setIsReadyToSubmit(res.isReadyToSubmit);

      if (res.isReadyToSubmit || !res.nextQuestion) {
        setIsReadyToSubmit(true);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(res.nextQuestion);
        setSelectedOptionKey(null);
        setTimeLeft(90);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi ghi nhận hết giờ.');
    } finally {
      submissionLockRef.current = false;
      setIsSubmittingAnswer(false);
    }
  };

  // Final Submit Attempt
  const handleFinalSubmit = async () => {
    if (!attemptId || isFinalizing) return;
    setIsFinalizing(true);
    setErrorMessage('');

    try {
      await diagnosticApi.submitAttempt(attemptId);
      const results = await diagnosticApi.getAttemptResult(attemptId);
      onFinishTest(results);
    } catch (err) {
      setErrorMessage(err.message || 'Không thể nộp bài kiểm tra. Vui lòng thử lại.');
      setIsFinalizing(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCognitiveLevelLabel = (level) => {
    switch (level) {
      case 'REMEMBERING':
        return 'Nhận biết';
      case 'UNDERSTANDING':
        return 'Thông hiểu';
      case 'APPLYING':
        return 'Vận dụng';
      case 'ADVANCED_APPLYING':
        return 'Vận dụng cao';
      default:
        return 'Thông hiểu';
    }
  };

  // Intro Screen
  if (!hasStarted) {
    return (
      <div className="diagnostic-landing-view animate-fade-in">
        <div className="diagnostic-intro-card">
          <h1 className="intro-card-heading">Bài kiểm tra đầu vào (CAT / IRT)</h1>
          <p className="intro-card-description">
            Mỗi chủ đề bắt đầu từ mức dễ nhất có học liệu đã duyệt. Khi trả lời sai, hệ thống tìm thêm câu cùng mức để xác minh. Năng lực được ước lượng bằng IRT 3PL/MAP; tham số hiện còn tạm tính, chưa hiệu chỉnh bằng dữ liệu học sinh thật.
          </p>

          <div className="diagnostic-metrics-row">
            <div className="metric-box">
              <div className="metric-number">≤ 8</div>
              <div className="metric-sublabel">CHỦ ĐỀ / PHIÊN</div>
            </div>

            <div className="metric-box">
              <div className="metric-number">≤ 24</div>
              <div className="metric-sublabel">CÂU HỎI TỐI ĐA</div>
            </div>

            <div className="metric-box">
              <div className="metric-number">90s</div>
              <div className="metric-sublabel">THỜI GIAN / CÂU</div>
            </div>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#b91c1c',
                fontSize: '0.88rem',
                margin: '18px 0'
              }}
            >
              {errorMessage}
            </div>
          )}

          <div className="intro-card-action">
            <button
              type="button"
              className="btn-start-diagnostic"
              onClick={handleStartAttempt}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang kết nối thuật toán...</span>
                </>
              ) : (
                <span>Bắt đầu làm bài</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ready to Submit Screen
  if (isReadyToSubmit && !currentQuestion) {
    return (
      <div className="diagnostic-view-root animate-fade-in">
        <div
          style={{
            maxWidth: '680px',
            margin: '40px auto',
            backgroundColor: '#fffdf7',
            border: '2px solid #131a2a',
            borderRadius: '8px',
            padding: '36px 30px',
            boxShadow: '10px 10px 0 rgba(19, 26, 42, 0.18)',
            textAlign: 'center'
          }}
        >
          <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Bạn Đã Hoàn Thành Toàn Bộ Câu Hỏi Chẩn Đoán!
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Phiên đã đạt giới hạn câu hoặc hết câu phù hợp. Hãy nộp bài để lưu hồ sơ; chủ đề ít câu vẫn được ghi là chưa đủ dữ liệu.
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '24px',
              padding: '14px 28px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              marginBottom: '28px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>SỐ CÂU ĐÃ LÀM</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065f46' }}>{answeredCount}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: '#a7f3d0' }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>NĂNG LỰC ƯỚC TÍNH</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#065f46' }}>θ = {currentTheta.toFixed(2)}</div>
            </div>
          </div>

          {errorMessage && (
            <div style={{ padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '16px' }}>
              {errorMessage}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isFinalizing}
              style={{
                padding: '12px 32px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)'
              }}
            >
              {isFinalizing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang tổng hợp báo cáo năng lực...</span>
                </>
              ) : (
                <>
                  <span>Xem Báo Cáo Năng Lực & Lộ Trình</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="diagnostic-view-root animate-fade-in">
      {/* Top Banner Status Bar */}
      <div className="diagnostic-status-bar">
        <div className="status-item-group">
          <div className="status-label">TIẾN TRÌNH CÂU HỎI</div>
          <div className="status-value highlight">
            Câu {answeredCount + 1}
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>
              {' '}/ tối đa {totalQuestions}
            </span>
          </div>
        </div>

        <div className="status-item-group">
          <div className="status-label">NĂNG LỰC ƯỚC TÍNH (CAT)</div>
          <div className="status-value highlight-orange">
            θ = {currentTheta.toFixed(2)}
          </div>
        </div>

        <div className="status-item-group timer-group">
          <div className="status-label">THỜI GIAN CÒN LẠI</div>
          <div className={`status-value timer-display ${timeLeft <= 15 ? 'timer-warning' : ''}`}>
            <Clock size={16} />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPauseTest}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
          title="Tiến trình được lưu tự động trên máy chủ. Bạn có thể quay lại sau."
        >
          <Pause size={14} />
          <span>Dừng bài</span>
        </button>
      </div>

      {/* Notifications & Error Banners */}
      {feedbackNotice && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            color: '#1e40af',
            fontSize: '0.85rem',
            margin: '12px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#b91c1c',
            fontSize: '0.85rem',
            margin: '12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="diagnostic-card-wrapper">
          <div className="diagnostic-card">
            {/* Question Meta Header */}
            <div className="question-meta-row">
              <span className="question-category-tag">
                {currentQuestion.chapter || 'CĂN BẬC HAI VÀ CĂN BẬC BA'}
              </span>
              <span className="meta-separator">•</span>
              <span className="question-subcategory-tag">
                {currentQuestion.skillTitle || 'Biến đổi và phép tính với căn thức'}
              </span>
              <span className="question-type-badge">
                [{getCognitiveLevelLabel(currentQuestion.cognitiveLevel)}]
              </span>
            </div>

            {/* LaTeX Math Question Content */}
            <div className="question-text-box question-content-box">
              <MathRenderer content={currentQuestion.content} />
            </div>

            {/* Multiple Choice Options */}
            <div className="options-selection-grid options-choices-group">
              {(currentQuestion.options || []).map((option, optIdx) => {
                const optKey = option.key || option.id || option.optionKey || String.fromCharCode(65 + optIdx);
                const optContent = option.content || option.text || '';
                const isSelected = selectedOptionKey === optKey;
                return (
                  <div
                    key={optKey}
                    className={`quiz-option-card choice-option-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isSubmittingAnswer && setSelectedOptionKey(optKey)}
                    role="button"
                    tabIndex={0}
                    data-testid={`option-${optKey}`}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        setSelectedOptionKey(optKey);
                      }
                    }}
                  >
                    <div className="option-label-circle choice-key-box">{optKey}</div>
                    <div className="option-content-text choice-math-content">
                      <MathRenderer content={optContent} />
                    </div>
                    <div className="option-select-radio">
                      {isSelected && <div className="radio-dot" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions Bar */}
            <div className="question-actions-bar">
              <div className="left-meta-actions">
                <button
                  type="button"
                  className="btn-why-selected"
                  onClick={() => setIsReasonOpen(!isReasonOpen)}
                >
                  <ChevronRight
                    size={15}
                    className={`chevron-icon ${isReasonOpen ? 'open' : ''}`}
                  />
                  <span>Vì sao câu này được chọn?</span>
                </button>
              </div>

              <div className="right-submit-actions">
                <button
                  type="button"
                  className="btn-quiz-skip"
                  onClick={handleSkip}
                  disabled={isSubmittingAnswer}
                >
                  Bỏ qua
                </button>

                <button
                  type="button"
                  className="btn-quiz-submit"
                  disabled={!selectedOptionKey || isSubmittingAnswer}
                  onClick={handleAnswerSubmit}
                >
                  {isSubmittingAnswer ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang nộp...</span>
                    </>
                  ) : (
                    <span>Trả lời (Enter)</span>
                  )}
                </button>
              </div>
            </div>

            {/* Accordion: Explainability IRT / CAT reason */}
            {isReasonOpen && (
              <div className="selection-reason-accordion animate-fade-in">
                <div className="reason-header">
                  <Info size={16} className="reason-info-icon" />
                  <span className="reason-title">
                    Giai đoạn thích ứng CAT dựa trên ước lượng năng lực θ = {currentTheta.toFixed(2)}
                  </span>
                </div>
                <p className="reason-description">
                  Thuật toán CAT ước lượng năng lực hiện tại của bạn là θ = {currentTheta.toFixed(2)}. Câu hỏi mức [{getCognitiveLevelLabel(currentQuestion.cognitiveLevel)}] được lựa chọn nhằm tối đa hóa hàm thông tin Fisher quanh giá trị năng lực này.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
