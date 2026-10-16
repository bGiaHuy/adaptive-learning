# Overall Product Flow Diagram

Sơ đồ thể hiện kiến trúc sản phẩm mới: **Tự học là luồng chính**, **Classroom là phần bổ trợ**, và **Admin là phần quản trị vận hành cơ bản**. Mọi hoạt động từ lớp học và tự học đều phục vụ việc học cá nhân.

```mermaid
flowchart TD
    subgraph ADMIN_TIER["ADMIN CONSOLE (Vận hành cơ bản)"]
        AdminAcc["Quản lý Tài khoản & Phân quyền"]
        AdminOps["Quản lý Danh mục Khóa học & Lớp học"]
    end

    subgraph CLASSROOM_EXTENSION["CLASSROOM EXTENSION (Lớp học bổ trợ)"]
        TeacherAssign["Giáo viên giao bài tập Custom"]
        StudentSub["Học sinh nộp bài tập lớp"]
        TeacherFeed["Giáo viên chấm điểm & Gửi nhận xét"]
        ClassroomMistakes["Trích xuất từ mới & lỗi từ bài tập lớp"]
    end

    subgraph PERSONAL_ASSETS["BỘ DỮ LIỆU & TỦ TỪ VỰNG CÁ NHÂN (The Core Brain)"]
        IndependentProfile[("Hồ sơ Năng lực Độc lập từng Kỹ năng")]
        AnkiDeck["Bộ từ vựng cá nhân kiểu Anki
        (Active Recall + Lật thẻ + Đánh giá trí nhớ)"]
        WeaknessList["Danh mục Lỗi thường gặp cần củng cố"]
    end

    subgraph SELF_LEARNING_MAIN["SELF-LEARNING (Luồng Tự Học Chính - 4 Tabs)"]
        TabLearn["Tab 1: HỌC
        • Học theo kế hoạch (1 hành động rõ ràng)
        • Tự chọn kỹ năng (Listening / Reading / Writing / Speaking)"]
        
        TabVocab["Tab 2: ÔN TỪ
        • Luyện Flashcard kiểu Anki
        • Tự nhớ nghĩa trong đầu trước khi lật thẻ"]
        
        TabClass["Tab 3: LỚP HỌC
        • Nhận bài của giáo viên & Nộp bài"]
        
        TabProgress["Tab 4: TIẾN ĐỘ
        • Theo dõi từng kỹ năng độc lập
        • Gợi ý bài học tiếp theo"]
    end

    %% Dòng chảy dữ liệu từ Lớp học vào Bộ cá nhân
    TeacherAssign --> StudentSub
    StudentSub --> TeacherFeed
    TeacherFeed --> ClassroomMistakes
    ClassroomMistakes --> AnkiDeck
    ClassroomMistakes --> WeaknessList

    %% Dòng chảy từ Tự học vào Bộ cá nhân
    TabLearn -- "Gặp từ mới hoặc sai ngữ pháp" --> AnkiDeck
    TabLearn -- "Gặp từ mới hoặc sai ngữ pháp" --> WeaknessList
    TabLearn -- "Cập nhật bằng chứng năng lực" --> IndependentProfile

    %% Tủ từ vựng & Hồ sơ nuôi dưỡng Tự học
    AnkiDeck ==> TabVocab
    WeaknessList ==> TabLearn
    IndependentProfile ==> TabLearn
    IndependentProfile ==> TabProgress

    %% Kết nối Classroom với Tab Lớp học
    TabClass <==> StudentSub
    AdminOps -. "Quản lý" .-> TeacherAssign
```
