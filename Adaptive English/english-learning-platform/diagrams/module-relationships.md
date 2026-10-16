# Module Relationships & Data Flow Diagram

Sơ đồ thể hiện 8 phân hệ cốt lõi của nền tảng AELP và các luồng trao đổi dữ liệu tương tác giữa các phân hệ.

```mermaid
flowchart TD
    subgraph ACADEMIC_CONTENT["KHỐI HỌC THUẬT & NỘI DUNG"]
        M2["[M2] ACADEMIC HIERARCHY
        Course → Unit → Lesson
        CEFR & Skill Tags"]
        
        M3["[M3] CONTENT & QUESTION LIBRARY
        Curated Global Bank
        Unverified Drafts Staging
        Provenance & Licenses"]
        
        M2 --> M3
    end

    subgraph ADAPTIVE_CORE["BỘ NÃO ĐIỀU PHỐI THÍCH ỨNG"]
        M4["[M4] ADAPTIVE ENGINE
        • Elo / IRT Challenge Matcher
        • Skill Graph & Mastery (BKT)
        • FSRS Memory Scheduler
        • Scaffolded Attempt Logger
        • Anti-Smurf Fast Confirmation"]
        
        M5["[M5] VOCABULARY BANK (3 TIERS)
        • Tier 1: Đã lưu (Shelf)
        • Tier 2: Đang học (Active: Max 30-50)
        • Tier 3: Đã nhớ (Mastered)
        • Active Recall Flashcard Engine"]
        
        M4 <==> M5
    end

    subgraph CLASSROOM_SUITE["KHÔNG GIAN LỚP HỌC (TEACHER SUITE)"]
        M6["[M6] CLASSROOM & ASSIGNMENT
        • Lớp học & Mã mời
        • Giao bài Custom
        • Chấm bài 2 lớp: Điểm Teacher vs AI Pre-grade
        • Toàn quyền xem dữ liệu học sinh lớp"]
        
        M7_Teacher["[M7-B] TEACHER AI COPILOT
        • Soạn đề theo lỗi của lớp
        • DOCX Ingestion (Luồng A & Luồng B)"]
        
        M7_Teacher --> M6
        M6 --> M3
    end

    subgraph STUDENT_INTERACTION["TRẢI NGHIỆM HỌC SINH (STUDENT SUITE)"]
        M7_Tutor["[M7-A] CONTEXT-AWARE AI TUTOR
        • Ràng buộc máy trạng thái bài tập
        • Chưa làm: Scaffolding Only (Khóa đáp án)
        • Đã trả lời: Giải thích chi tiết"]
        
        M8["[M8] PROGRESS & DATA GOVERNANCE
        • Trục Nỗ lực (Streak, Thẻ đã lật)
        • Trục Năng lực CEFR độc lập từng kỹ năng
        • Quản trị Dữ liệu & AI Training Consent"]
    end

    subgraph IDENTITY_LAYER["LỚP ĐỊNH DANH"]
        M1["[M1] IDENTITY & ACCESS
        • 1 Role duy nhất / tài khoản (Student / Teacher / Admin)
        • Phân quyền lớp học"]
    end

    %% Liên kết giữa Lớp học và Bộ não thích ứng
    M6 -- "1. Tín hiệu điểm cao (Anti-Smurf)" ==> M4
    M6 -- "2. Từ mới & lỗi bài lớp" ==> M5
    M6 -- "3. Bài tập nộp đồng bộ" ==> M8

    %% Liên kết giữa Thích ứng và Tự học
    M4 ==> M8
    M4 -- "Đề xuất bài vừa sức" --> M2
    M5 -- "Lên lịch ôn thẻ hôm nay" --> M8

    %% Liên kết giữa AI Tutor và Trình ghi nhận
    M7_Tutor -- "Gửi mức độ hỗ trợ (Scaffold Level)" ==> M4

    %% Lớp định danh bao phủ
    M1 -.-> M6
    M1 -.-> M8
```
