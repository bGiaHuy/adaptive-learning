# 18 - State Machines Specification

## Goal
Quy định danh mục toàn diện các máy trạng thái (State Machines) chuẩn hóa cho các thực thể nghiệp vụ cốt lõi trong toàn bộ hệ thống AELP, bao gồm điều kiện chuyển trạng thái và các quy tắc nghiệp vụ ràng buộc.

---

## 1. User Account State Machine

```
[PENDING_ACTIVATION] (Được tạo bởi Admin / Nhận email kích hoạt)
  │
  ▼ [User verifies email & sets password]
[ACTIVE] (Có thể đăng nhập và thực hiện thao tác bình thường)
  │
  ├───────────────────────────────┬───────────────────────────────┐
  ▼ [Admin blocks / Violation]     ▼ [Inactivity > 180 days]       ▼ [User requests account deletion]
[SUSPENDED]                     [DORMANT]                       [PENDING_DELETION]
  │                               │                               │
  ▼ [Admin restores]              ▼ [User logs in & OTP verify]   ▼ [Grace period 30 days expires]
[ACTIVE]                        [ACTIVE]                        [SOFT_DELETED]
```

---

## 2. Enrollment State Machine (Ghi Danh Lớp Học)

```
[INVITED] (Nhận mã lớp hoặc email mời)
  │
  ▼ [Student accepts invite]
[ENROLLED] (Học sinh chính thức thuộc lớp, nhìn thấy bài tập của lớp)
  │
  ├───────────────────────────────┬───────────────────────────────┐
  ▼ [Student drops / Teacher removes]                             ▼ [Course / Term completes]
[WITHDRAWN]                                                     [COMPLETED]
  │                                                               │
  ▼ [Re-enrolled by admin]                                        ▼ [Class archived]
[ENROLLED]                                                      [ARCHIVED]
```

---

## 3. Assignment Lifecycle State Machine

```
[DRAFT] (Giáo viên đang soạn hoặc AI Copilot đang sinh nội dung)
  │
  ▼ [Teacher approves content & sets schedule / due date]
[SCHEDULED] (Bài tập đã duyệt, chờ đến ngày giờ phát hành)
  │
  ▼ [Release time reached]
[PUBLISHED] (Học sinh nhìn thấy trên Classroom và Today's Plan)
  │
  ├───────────────────────────────────────────────────────────────┐
  ▼ [Due date passes]                                             ▼ [Teacher manually closes early]
[CLOSED] (Không nhận thêm bài nộp mới trừ bài nộp muộn)           [CLOSED]
  │
  ▼ [All submissions evaluated & returned]
[ARCHIVED] (Lưu trữ lịch sử lớp học)
```

---

## 4. Submission & Grading State Machine

```
[ASSIGNED] (Bài tập đã giao, học sinh chưa bắt đầu làm)
  │
  ▼ [Student opens & answers at least 1 question]
[IN_PROGRESS] (Lưu bản nháp cục bộ)
  │
  ├───────────────────────────────┬───────────────────────────────┐
  ▼ [Student submits before deadline]                             ▼ [Student submits after deadline]
[SUBMITTED]                                                     [SUBMITTED_LATE]
  │                                                               │
  └───────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼ [System runs auto-grading or AI draft evaluation]
                          [AI_PRE_GRADED] (Đối với bài luận / nói)
                                  │
                                  ▼ [Teacher modifies scores and adds feedback]
                          [GRADED]
                                  │
                                  ▼ [Teacher returns to student]
                          [RETURNED]
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼ [Teacher requests rewrite]                 ▼ [Student accepts grade]
    [REVISION_REQUIRED]                                [FINALIZED]
            │                                           (Đã đồng bộ sang Profile)
            ▼ [Student resubmits]
    [RESUBMITTED] ──► [GRADED] ──► [RETURNED]
```

---

## 5. Vocabulary Item Memory State Machine (SRS Engine)

```
[DISCOVERED] (Từ vựng xuất hiện trong bài đọc/viết/lớp học, chờ thêm vào kho)
  │
  ▼ [System / User inserts into learning queue]
[NEW] (Học sinh chưa học bài giới thiệu ban đầu)
  │
  ▼ [Student completes 5-step introductory pedagogy]
[LEARNING] (Học sinh đang trong chuỗi luyện tập nhận diện và điền từ)
  │
  ▼ [Initial retention threshold achieved]
[REVIEWING] (Từ vựng nằm trong chu kỳ lặp lại ngắt quãng - chờ đến hạn ôn tập)
  │
  ├───────────────────────────────┬───────────────────────────────┐
  ▼ [User passes review test]     ▼ [User fails review / forgets] ▼ [Student marks "I know this"]
[REVIEWING]                     [WEAK_WORD]                     [MASTERED]
(Interval mở rộng: 3d, 7d, 14d) (Interval rút về 1 ngày)         │
  │                               │                               │
  ▼ [Passes 5 consecutive reviews]▼ [Passes remedial drill]       │
[MASTERED] ◄──────────────────── [LEARNING]                       │
  │                                                               │
  ▼ [Fails in comprehensive diagnostic test after long interval]  │
[REVIEWING] ◄─────────────────────────────────────────────────────┘
```

---

## 6. Learning Session State Machine (Phiên Học Hàng Ngày)

```
[INITIALIZED] (Hệ thống tổng hợp Today's Plan: Vocab + Grammar + Skill)
  │
  ▼ [Student clicks "Start Session"]
[ACTIVE] (Đang trong tiến trình học, tính toán thời lượng thực tế)
  │
  ├───────────────────────────────┬───────────────────────────────┐
  ▼ [Student finishes all items]   ▼ [Student pauses or exits]     ▼ [Student idle > 30 minutes]
[COMPLETED]                     [PAUSED]                        [ABANDONED]
  │                               │                               │
  ▼ [Background job runs]         ▼ [Student clicks Resume]       ▼ [Partial answers recorded]
[SYNCED_TO_PROFILE]             [ACTIVE]                        [PARTIALLY_SYNCED]
```

---

## 7. AI-Generated Question State Machine (Question Bank Pipeline)

```
[PROMPTED] (Giáo viên hoặc Hệ thống gửi yêu cầu sinh câu hỏi)
  │
  ▼ [LLM completes generation]
[AI_DRAFT] (Lưu vào không gian xem xét của giáo viên)
  │
  ├───────────────────────────────┬───────────────────────────────┐
  ▼ [Teacher edits & clicks Save]  ▼ [Teacher clicks Regenerate]   ▼ [Teacher rejects]
[TEACHER_APPROVED]              [REGENERATING] ──► [AI_DRAFT]   [DISCARDED]
  │
  ├───────────────────────────────┐
  ▼ [Assigned to class directly]  ▼ [Saved to System Question Bank]
[ASSIGNED]                      [PENDING_ADMIN_AUDIT]
                                  │
                                  ▼ [Admin verifies CEFR & Rubric]
                                [GLOBAL_VERIFIED]
```

---

## 8. Assessment & Placement State Machine

```
[NOT_STARTED]
  │
  ▼ [User begins diagnostic test]
[TESTING_IN_PROGRESS] (Adaptive difficulty adjusts per question)
  │
  ▼ [User finishes all sections]
[EVALUATING] (Scoring engine computes raw score & criteria ratings)
  │
  ▼ [Scores mapped to CEFR/IELTS standards]
[COMPLETED] (Estimated Band & Initial Profile generated)
  │
  ▼ [Confidence calculation]
[ESTIMATED_CONFIRMED]
```

---

## 9. OPEN QUESTIONS VỀ MÁY TRẠNG THÁI
* **OPEN QUESTION**: Khi học sinh nộp bài ở trạng thái `SUBMITTED_LATE`, có tự động áp dụng chính sách trừ điểm theo bậc thang thời gian không, hay do giáo viên quyết định bằng tay? (Xem chi tiết tại [`docs/20-open-questions.md`](20-open-questions.md) mục `Classroom` - Q-007).
