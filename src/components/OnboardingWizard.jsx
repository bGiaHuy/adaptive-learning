import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Calendar, Trash2, Loader2 } from 'lucide-react';
import Navbar from './Navbar';
import {
  GRADES_DATA,
  GOALS_DATA,
  DAILY_TIMES_DATA,
  SELF_EVALUATIONS_DATA,
  GRADE_9_CHAPTERS
} from '../data/curriculumData';
import { curriculumApi, studentApi } from '../lib/apiClient';

export default function OnboardingWizard({
  currentUser,
  onComplete,
  onCancel,
  onStepChange
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Curriculum Options
  const [grades, setGrades] = useState(GRADES_DATA);
  const [goals, setGoals] = useState(GOALS_DATA);
  const [dailyTimes, setDailyTimes] = useState(DAILY_TIMES_DATA);
  const [selfEvals, setSelfEvals] = useState(SELF_EVALUATIONS_DATA);

  // Form State initialized to match the video flow defaults
  const [selectedGrade, setSelectedGrade] = useState('grade9');
  const [selectedGoal, setSelectedGoal] = useState('entrance10');
  const [selectedDailyTime, setSelectedDailyTime] = useState('45m');
  const [examDate, setExamDate] = useState('05/06/2027');
  const [selfEval, setSelfEval] = useState('good');
  const [weakTopics, setWeakTopics] = useState(['t1', 't2']);

  const totalSteps = 8;

  useEffect(() => {
    const loadCurriculumOptions = async () => {
      try {
        const [gradesData, optionsData] = await Promise.all([
          curriculumApi.getGrades(),
          curriculumApi.getOptions()
        ]);
        if (Array.isArray(gradesData) && gradesData.length > 0) {
          setGrades(gradesData.map((g) => ({ id: `grade${g.id}`, rawId: g.id, label: g.label, desc: g.desc })));
        }
        if (optionsData?.goals) {
          setGoals(optionsData.goals);
        }
        if (optionsData?.dailyTimes) {
          setDailyTimes(optionsData.dailyTimes);
        }
        if (optionsData?.selfAssessments) {
          setSelfEvals(optionsData.selfAssessments);
        }
      } catch {
        // Safe fallback to default data
      }
    };
    loadCurriculumOptions();
  }, []);

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep, totalSteps);
    } else {
      // Step 8 completed -> sync to backend via PATCH /student/onboarding
      setIsSubmitting(true);
      const chosenGoal = goals.find((g) => g.id === selectedGoal)?.title || 'Ôn thi vào lớp 10';
      const chosenTimeObj = dailyTimes.find((t) => t.id === selectedDailyTime);
      const chosenMinutes = chosenTimeObj?.minutes || (selectedDailyTime === '30m' ? 30 : selectedDailyTime === '60m' ? 60 : selectedDailyTime === '90m' ? 90 : 45);
      const chosenSelfEval = selfEvals.find((e) => e.id === selfEval)?.title || 'Khá';

      const setupProfile = {
        grade: 9,
        targetGoal: chosenGoal,
        dailyMinutes: chosenMinutes,
        examDate: examDate || null,
        selfAssessment: chosenSelfEval
      };

      try {
        await studentApi.updateOnboarding(setupProfile);
      } catch (err) {
        console.warn('Could not sync onboarding to API, continuing with local state:', err);
      } finally {
        setIsSubmitting(false);
        onComplete({
          ...setupProfile,
          gradeLabel: 'Lớp 9',
          weakTopicsList: weakTopics,
          weakTopicsCount: weakTopics.length
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep, totalSteps);
    } else {
      onCancel();
    }
  };

  const toggleTopic = (topicId) => {
    if (weakTopics.includes(topicId)) {
      setWeakTopics(weakTopics.filter((id) => id !== topicId));
    } else {
      setWeakTopics([...weakTopics, topicId]);
    }
  };

  // Helper to calculate days remaining from date string DD/MM/YYYY
  const getDaysRemaining = (dateStr) => {
    if (!dateStr || dateStr.length < 8) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const target = new Date(year, month, day);
      const now = new Date();
      const diffTime = target - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 264; // fallback to 264 as shown in video
    }
    return 264;
  };

  return (
    <div className="wizard-content-wrapper">
      <div className="wizard-card-box animate-fade-in" key={currentStep}>
          <div className="wizard-step-tag">Bước {currentStep} / {totalSteps}</div>

          {/* STEP 1: Introduction */}
          {currentStep === 1 && (
            <div className="step-body">
              <h2 className="step-title">Chào bạn!</h2>
              <p className="step-desc-lead">
                AdaptiveMath xây lộ trình học Toán riêng cho học sinh lớp 6, 7, 8, 9 theo Chương trình GDPT 2018 và SGK Kết nối tri thức với cuộc sống đang dùng thống nhất toàn quốc. Trả lời 6 câu hỏi ngắn, rồi làm bài kiểm tra đầu vào để hệ thống biết bạn đang ở đâu.
              </p>

              <div className="step-bullets-list">
                <div className="bullet-row">
                  <div className="bullet-dot"></div>
                  <span>Tiến trình học được lưu trên máy bạn và đồng bộ với tài khoản.</span>
                </div>
                <div className="bullet-row">
                  <div className="bullet-dot"></div>
                  <span>1.472 câu hỏi và lý thuyết 92 bài, biên soạn theo Chương trình GDPT 2018.</span>
                </div>
                <div className="bullet-row">
                  <div className="bullet-dot"></div>
                  <span>Bạn có thể sửa lại thiết lập bất cứ lúc nào.</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Grade Selection */}
          {currentStep === 2 && (
            <div className="step-body">
              <h2 className="step-title">Bạn đang học lớp mấy?</h2>
              <p className="step-subtitle">
                Ngân hàng câu hỏi và lộ trình sẽ bám theo lớp bạn chọn.
              </p>

              <div className="options-grid-2col">
                {GRADES_DATA.map((grade) => {
                  const isSelected = selectedGrade === grade.id;
                  return (
                    <div
                      key={grade.id}
                      className={`selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedGrade(grade.id)}
                    >
                      <div className="radio-circle">
                        {isSelected && <div className="radio-inner-dot" />}
                      </div>
                      <div className="selection-card-text">
                        <div className="card-label-main">{grade.label}</div>
                        <div className="card-label-sub">{grade.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Goal Selection */}
          {currentStep === 3 && (
            <div className="step-body">
              <h2 className="step-title">Mục tiêu của bạn là gì?</h2>
              <p className="step-subtitle">
                Mục tiêu quyết định mức thành thạo mà lộ trình hướng tới cho mỗi chủ đề.
              </p>

              <div className="options-list-vertical">
                {GOALS_DATA.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <div
                      key={goal.id}
                      className={`selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedGoal(goal.id)}
                    >
                      <div className="radio-circle">
                        {isSelected && <div className="radio-inner-dot" />}
                      </div>
                      <div className="selection-card-text">
                        <div className="card-label-main">{goal.title}</div>
                        <div className="card-label-sub">{goal.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedGoal && (
                <div className="step-info-notice">
                  <span>Mức thành thạo mục tiêu: <strong>85%</strong> cho mỗi chủ đề.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Daily Learning Time */}
          {currentStep === 4 && (
            <div className="step-body">
              <h2 className="step-title">Mỗi ngày bạn học được bao lâu?</h2>
              <p className="step-subtitle">
                Lộ trình sẽ xếp bài vào đúng quỹ thời gian này.
              </p>

              <div className="options-grid-2col">
                {DAILY_TIMES_DATA.map((item) => {
                  const isSelected = selectedDailyTime === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDailyTime(item.id)}
                    >
                      <div className="radio-circle">
                        {isSelected && <div className="radio-inner-dot" />}
                      </div>
                      <div className="selection-card-text">
                        <div className="card-label-main">{item.title}</div>
                        <div className="card-label-sub">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Exam Milestone Date */}
          {currentStep === 5 && (
            <div className="step-body">
              <h2 className="step-title">Bạn có mốc thi nào không?</h2>
              <p className="step-subtitle">
                Không bắt buộc. Nếu có, hệ thống sẽ tự động ưu tiên cho các chủ đề còn yếu khi ngày thi đến gần.
              </p>

              <div className="exam-date-box">
                <label className="input-group-label">Ngày thi (ngày/tháng/năm)</label>
                <div className="date-input-wrapper">
                  <input
                    type="text"
                    className="form-input date-input"
                    placeholder="dd/mm/yyyy"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                  <Calendar size={18} className="date-input-icon" />
                </div>

                {examDate && (
                  <div className="exam-date-status-row">
                    <span className="exam-days-tag">Còn {getDaysRemaining(examDate)} ngày</span>
                    <span className="exam-date-confirm">Ngày thi: {examDate}</span>
                    <button
                      type="button"
                      className="btn-clear-date"
                      onClick={() => setExamDate('')}
                    >
                      Xoá ngày
                    </button>
                  </div>
                )}

                <p className="date-helper-note">
                  Bỏ trống nếu bạn học đều, không theo mốc thi cụ thể.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: Self Assessment */}
          {currentStep === 6 && (
            <div className="step-body">
              <h2 className="step-title">Bạn tự đánh giá mình thế nào?</h2>
              <p className="step-subtitle">
                Chỉ dùng để chọn câu hỏi đầu tiên cho phù hợp — bài kiểm tra sẽ tự điều chỉnh sau đó.
              </p>

              <div className="options-list-vertical">
                {SELF_EVALUATIONS_DATA.map((evalItem) => {
                  const isSelected = selfEval === evalItem.id;
                  return (
                    <div
                      key={evalItem.id}
                      className={`selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelfEval(evalItem.id)}
                    >
                      <div className="radio-circle">
                        {isSelected && <div className="radio-inner-dot" />}
                      </div>
                      <div className="selection-card-text">
                        <div className="card-label-main">{evalItem.title}</div>
                        <div className="card-label-sub">{evalItem.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Weak Topics Selection */}
          {currentStep === 7 && (
            <div className="step-body">
              <h2 className="step-title">Chủ đề nào bạn thấy khó?</h2>
              <p className="step-subtitle">
                Không bắt buộc — chọn bao nhiêu tuỳ bạn. Những chủ đề này được cộng thêm độ ưu tiên trong lộ trình.
              </p>

              <div className="topics-category-container">
                {GRADE_9_CHAPTERS.map((chapter) => (
                  <div key={chapter.id} className="chapter-group">
                    <h4 className="chapter-heading">{chapter.name}</h4>
                    <div className="topic-chips-grid">
                      {chapter.topics.map((topic) => {
                        const isChecked = weakTopics.includes(topic.id);
                        return (
                          <div
                            key={topic.id}
                            className={`topic-chip ${isChecked ? 'active' : ''}`}
                            onClick={() => toggleTopic(topic.id)}
                          >
                            {isChecked && <Check size={14} className="chip-check-icon" />}
                            <span>{topic.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: Review & Confirm */}
          {currentStep === 8 && (
            <div className="step-body">
              <h2 className="step-title">Kiểm tra lại thông tin</h2>
              <p className="step-subtitle">
                Xác nhận xong, bạn sẽ vào thẳng bài kiểm tra đầu vào.
              </p>

              <div className="summary-review-table">
                <div className="summary-row">
                  <span className="summary-col-label">Lớp</span>
                  <span className="summary-col-value">
                    {GRADES_DATA.find((g) => g.id === selectedGrade)?.label || 'Lớp 9'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-col-label">Mục tiêu</span>
                  <span className="summary-col-value">
                    {GOALS_DATA.find((g) => g.id === selectedGoal)?.title || 'Ôn thi vào lớp 10'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-col-label">Thời gian mỗi ngày</span>
                  <span className="summary-col-value">
                    {DAILY_TIMES_DATA.find((t) => t.id === selectedDailyTime)?.title || '45 phút'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-col-label">Ngày thi</span>
                  <span className="summary-col-value">{examDate || 'Chưa đặt'}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-col-label">Tự đánh giá</span>
                  <span className="summary-col-value">
                    {SELF_EVALUATIONS_DATA.find((e) => e.id === selfEval)?.title || 'Khá'}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-col-label">Chủ đề tự thấy yếu</span>
                  <span className="summary-col-value highlight">
                    {weakTopics.length} chủ đề
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="wizard-card-footer">
            <button
              type="button"
              className="btn-wizard-back"
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>

            <button
              type="button"
              className="btn-wizard-next"
              onClick={handleNext}
            >
              <span>{currentStep === 8 ? 'Bắt đầu kiểm tra' : 'Tiếp tục'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
  );
}
