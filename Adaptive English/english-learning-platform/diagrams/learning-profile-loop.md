# Learning Profile Closed Loop Diagram

Sơ đồ thể hiện chi tiết dòng chảy dữ liệu của **Vòng lặp học tập khép kín (The Closed Learning Loop)**: Dữ liệu đa nguồn hội tụ về Student Learning Profile và phân phối thành các hành động can thiệp cụ thể.

```mermaid
flowchart TD
    subgraph SOURCES["CÁC NGUỒN DỮ LIỆU ĐẦU VÀO"]
        InClass["Bài tập & Điểm số từ Lớp học (Classroom)"]
        InSelf["Kết quả thực hành trong Không gian Tự học (Self-Study)"]
        InMock["Bài thi thử & Placement Test (Diagnostic Exams)"]
        InMistakes["Bóc tách Lỗi sai theo Taxonomy (Granular Errors)"]
        InVocab["Tần suất gặp từ mới & Tỷ lệ quên (Exposure & Forgetfulness)"]
    end

    subgraph ENGINE["BỘ NÃO TRUNG TÂM: UNIFIED STUDENT LEARNING PROFILE"]
        ProfileCore[("LIVE COMPETENCY PROFILE")]
        
        ProfileCore --- SkillGraph["1. Cây năng lực đa tầng (Skill Mastery Scores)"]
        ProfileCore --- SRSQueue["2. Kho trí nhớ Spaced Repetition (Vocabulary SRS)"]
        ProfileCore --- WeaknessList["3. Danh mục Điểm yếu Đang hoạt động (Active Weaknesses)"]
        ProfileCore --- IELTSEst["4. Điểm ước lượng Estimated IELTS & Độ tin cậy (Confidence)"]
        ProfileCore --- Velocity["5. Vận tốc học tập, Độ mệt mỏi & Chuỗi ngày học (Streak)"]
    end

    subgraph OUTPUTS["CÁC ĐẦU RA THÍCH ỨNG & TÁC ĐỘNG SƯ PHẠM"]
        OutToday["HÀNH ĐỘNG HỌC HÀNG NGÀY (Today's Plan)
        • Điều phối thời lượng phiên học
        • Ưu tiên từ vựng đến hạn và điểm yếu cấp bách"]
        
        OutTutor["TRỢ GIẢNG AI TUTOR (Context Injection)
        • Nắm rõ bài đang làm & lỗi hay mắc
        • Kích hoạt Socratic mode khi làm bài tập lớp"]
        
        OutTeacher["GIÁO VIÊN & AI COPILOT (Intervention Insights)
        • Báo cáo ma trận điểm yếu chung của lớp
        • Sinh bài tập can thiệp trúng đích cho cả lớp hoặc từng nhóm"]
    end

    %% Dòng chảy thu nhận
    InClass --> ProfileCore
    InSelf --> ProfileCore
    InMock --> ProfileCore
    InMistakes --> ProfileCore
    InVocab --> ProfileCore

    %% Dòng chảy kích hoạt
    ProfileCore ==> OutToday
    ProfileCore ==> OutTutor
    ProfileCore ==> OutTeacher

    %% Vòng lặp tái sinh
    OutToday -. "Học sinh thực hiện bài học mới" .-> InSelf
    OutTeacher -. "Giáo viên giao bài can thiệp mới" .-> InClass
```
