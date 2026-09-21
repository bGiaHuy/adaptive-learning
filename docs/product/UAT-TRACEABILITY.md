# AdaptiveMath — PRD Traceability & UAT Pack

**Tài liệu:** Comprehensive Requirements Traceability Matrix and User Acceptance Test Pack  
**Phiên bản:** 1.0  
**Tác giả:** Antigravity (Product Discovery & UX Lead)  
**Phê duyệt:** QA Lead & Lead Architect (Codex)  
**Tài liệu liên quan:**
- `docs/PRD-AdaptiveMath.md`
- `docs/IMPLEMENTATION-AGENT-PROMPT.md` (Acceptance criteria)
- `docs/product/GATE-0-DECISION-PACK.md`

---

## 1. Định dạng Kiểm thử Nghiệm thu (UAT Format Standard)

Mỗi kịch bản kiểm thử (Test Case) được chuẩn hóa theo cấu trúc bắt buộc:
`Requirement ID → Role → Flow → Precondition → Test Data → Action → Expected Result → Negative Case → Evidence Cần Lưu → Status`

Trạng thái kiểm thử (`Status`):
- `DRAFT`: Đã thiết kế test case, chờ code hoàn thiện.
- `PASSED`: Đã kiểm thử tự động hoặc thủ công đạt kết quả mong đợi.
- `FAILED`: Chưa đạt hoặc có sai lệch so với đặc tả.
- `BLOCKED`: Bị chặn bởi một dependency chưa sẵn sàng.

---

## 2. Ma trận Kiểm thử Nghiệm thu Chi tiết (Traceability Matrix)

| Req ID | Role | Flow | Precondition | Test Data | Action | Expected Result | Negative Case | Evidence Cần Lưu | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UAT-AUTH-01** | All | Authentication & Session Cookie | Người dùng đã đăng ký tài khoản hợp lệ | Email: `student@test.vn`, Pass: `P@ssword123` | Gọi `POST /api/v1/auth/login` | Nhận phản hồi `200 OK`, cookie `__Host-am_session` được gán với flags: `HttpOnly`, `Secure`, `SameSite=Lax`. Không có token/secret trả về trong JSON body. | Sai mật khẩu ➔ Trả về `401 Unauthorized`, không cấp cookie. | Trích xuất response headers và cookie flags từ Playwright test. | `DRAFT` |
| **UAT-AUTH-02** | All | Session Revocation & Permission SLA | User đang đăng nhập 2 thiết bị A và B | 2 phiên làm việc `session_A`, `session_B` | Đổi mật khẩu tại thiết bị A | Thiết bị A nhận session mới; `session_B` tại thiết bị B bị hủy ngay lập tức. Mọi request tiếp theo từ B bị `401 Unauthorized`. | Cố tình gửi request mang `session_B` cũ ➔ Bị từ chối `401`. | DB query `SELECT * FROM Session WHERE userId = ...` trước và sau đổi pass. | `DRAFT` |
| **UAT-RBAC-01** | Student | Role Isolation & Route Guard | User có role `STUDENT` | Session hợp lệ của Học sinh | Học sinh gửi request `POST /api/v1/teacher/classes` (tạo lớp) | Server trả về mã lỗi HTTP `403 Forbidden` (`FORBIDDEN_ROLE_ACCESS`). Không có lớp nào được tạo trong DB. | Client giả mạo sửa trường role trong payload body ➔ Server vẫn chặn vì lấy role từ DB session. | Network log hiển thị status code 403 và error response body chuẩn. | `DRAFT` |
| **UAT-RBAC-02** | Teacher Applicant | Teacher Approval Gate | User có role `TEACHER_APPLICANT`, chưa duyệt | `verificationStatus = 'PENDING_REVIEW'` | Bấm *"Tạo lớp mới"* hoặc gọi `POST /api/v1/classes` | Giao diện hiển thị nút disabled kèm tooltip. Nếu bypass qua cURL/Postman: Server trả về `403 Forbidden` (`TEACHER_NOT_VERIFIED`). | Người dùng nộp hồ sơ giả mạo ➔ Vẫn giữ nguyên trạng thái chờ duyệt. | API response log và screenshot giao diện modal bị chặn. | `DRAFT` |
| **UAT-CLASS-01** | Teacher | Multi-tenant Scoping | 2 Giáo viên: GV_A (Lớp 9A) và GV_B (Lớp 9B) | `class_A_id`, `class_B_id` | GV_A gọi API `GET /api/v1/teacher/classes/{class_B_id}` | Server trả về mã lỗi `403 Forbidden` hoặc `404 Not Found` (Data isolation). GV_A không thể xem danh sách học sinh của GV_B. | GV_A cố tình can thiệp bài tập của lớp B ➔ Bị chặn `403`. | Integration test log kiểm tra truy vấn chéo dữ liệu tenant. | `DRAFT` |
| **UAT-CLASS-02** | Student | Crockford Invite Code & Rate Limit | Lớp học đã tạo mã `KTR2QX79` | Mã code: `KTR2QX79` | Học sinh nhập mã vào ô tìm lớp và bấm Tham gia | Hệ thống tìm đúng lớp, hiển thị thông tin trường lớp và thêm học sinh vào lớp học an toàn. | - Nhập mã hết hạn ➔ Báo lỗi `CODE_EXPIRED`.<br>- Nhập sai quá 5 lần ➔ Bị khóa IP 15 phút (`RATE_LIMIT_EXCEEDED`). | Log rate limit của Redis/Memory store và thông báo lỗi trên UI. | `DRAFT` |
| **UAT-DIAG-01** | Student | Diagnostic Autosave & Resume | Học sinh đang làm bài chẩn đoán đến câu 3 | Câu 1, 2 đã trả lời; Câu 3 chưa nộp | Học sinh tắt trình duyệt, sau đó đăng nhập lại và mở `/student/diagnostic` | Hệ thống khôi phục trạng thái làm bài tại câu 3, đồng hồ đếm ngược được tính toán lại chính xác. Dữ liệu câu 1 và 2 vẫn nguyên vẹn. | Mạng bị mất khi bấm nộp câu ➔ Client cache offline và sync lại khi có mạng. | Kiểm tra bảng `AttemptAnswer` lưu đủ bản ghi các câu đã trả lời. | `DRAFT` |
| **UAT-DIAG-02** | Student | Question Timeout & Skip Integrity | Học sinh đang ở câu hỏi số 4 (thời gian 90s) | Timer đếm ngược về `00:00` | Để nguyên màn hình cho hết giờ | Hệ thống không reset đồng hồ âm thầm; ghi nhận câu 4 là `TIMEOUT` vào DB và tự động chuyển câu 5. | Bấm nút *"Bỏ qua"* ➔ Ghi nhận trạng thái `SKIPPED`. | Query DB kiểm tra trường `isTimedOut = true` hoặc `isSkipped = true`. | `DRAFT` |
| **UAT-DIAG-03** | Student | Final Question Inclusion (Sửa lỗi Prototype) | Đang ở câu hỏi cuối cùng của bài thi (Câu N) | Chọn đáp án B và bấm *"Hoàn thành"* | Gửi request hoàn thành bài thi | Báo cáo kết quả tổng kết bắt buộc phải chứa đầy đủ câu trả lời của câu N (Không bị rớt câu cuối như prototype). | Bấm nộp 2 lần liên tiếp ➔ Server xử lý Idempotent, không tạo 2 kết quả. | JSON response của kết quả thi chứa `totalAnswered == N` và câu cuối được tính điểm. | `DRAFT` |
| **UAT-MIST-01** | Student | Mistake Notebook Auto-sync | Học sinh làm sai câu hỏi rút gọn căn thức | Câu hỏi ID `q_radical_01`, đáp án sai: A | Hoàn thành bài chẩn đoán hoặc bài luyện tập | Mở trang *"Sổ tay lỗi sai"*: Câu hỏi `q_radical_01` tự động xuất hiện trong sổ, hiển thị câu trả lời của học sinh, đáp án đúng và lời giải chi tiết. | Câu làm đúng ➔ Tuyệt đối không xuất hiện trong sổ tay lỗi sai. | UI screenshot Sổ tay lỗi sai có chứa câu hỏi sai từ bài thi vừa làm. | `DRAFT` |
| **UAT-CONT-01** | Content Admin | Content Maker-Checker Enforcement | User_1 là `CONTENT_AUTHOR`, User_2 là `CONTENT_REVIEWER` | Câu hỏi ID `q_99` do User_1 tạo (`status = IN_REVIEW`) | User_1 cố gắng tự gọi API `POST /admin/questions/q_99/approve` | Hệ thống trả về `403 Forbidden` (`CANNOT_APPROVE_OWN_CONTENT`). Khi User_2 bấm duyệt ➔ Thành công chuyển sang `PUBLISHED`. | User chưa có quyền reviewer bấm duyệt ➔ Bị chặn `403`. | Audit log ghi nhận hành động phê duyệt kèm `authorId != reviewerId`. | `DRAFT` |
| **UAT-CONT-02** | Content Admin | Immutable Question Versioning | Câu hỏi `q_geo_05` phiên bản v1 đã được dùng trong 1 lượt thi | Đã có bản ghi trong bảng `AttemptAnswer` | Content Admin vào sửa nội dung câu hỏi `q_geo_05` | Hệ thống không cho phép sửa đè lên v1. Tự động sinh bản ghi mới `versionNumber = 2` ở trạng thái Draft. Phiên bản v1 vẫn giữ nguyên trong bài thi cũ. | Cố tình update trực tiếp v1 qua API ➔ Server từ chối `409 Conflict`. | Query DB xác nhận tồn tại 2 version và bản ghi v1 không đổi `hash`. | `DRAFT` |
| **UAT-AUDT-01** | Admin | Sensitive Actions Audit Logging | Admin thực hiện thao tác nhạy cảm | User ID `target_user_01` | Admin bấm *"Khóa tài khoản (Suspend User)"* | Tài khoản bị khóa; bảng `AuditLog` tạo bản ghi mới gồm: `adminId`, `targetUserId`, `action: 'USER_SUSPENDED'`, `ipAddress`, `timestamp`. | Thao tác không có quyền ➔ Bị chặn và ghi log cảnh báo bảo mật. | Query DB `SELECT * FROM AuditLog ORDER BY createdAt DESC LIMIT 1`. | `DRAFT` |
| **UAT-A11Y-01** | Student | Keyboard Navigation & Math A11y | Người dùng không dùng chuột | Giao diện bài kiểm tra trắc nghiệm KaTeX | Dùng phím `Tab` để di chuyển, dùng phím `A, B, C, D` hoặc phím mũi tên để chọn đáp án, nhấn `Enter` để submit | Toàn bộ các phần tử tương tác hiển thị vòng focus xanh ngọc rõ ràng; công thức toán có thẻ `aria-label` đọc được trên Screen Reader. | Focus bị kẹt trong thẻ Math ➔ Lỗi accessibility (Failed). | Video quay thao tác điều hướng hoàn toàn bằng bàn phím. | `DRAFT` |

---

## 3. Quy trình Báo cáo Lỗi & Tiêu chuẩn Nghiệm thu (Sign-off Criteria)

1. **Điều kiện thông qua Gate Nghiệm thu (UAT Gate Acceptance):**
   - 100% các Test Case loại Bảo mật & Phân quyền (Auth, RBAC, Multi-tenant, Maker-Checker) phải đạt `PASSED`.
   - 0 lỗi nghiêm trọng (Critical / Blocker bugs): Không có lỗi rớt dữ liệu, không có lỗi lọt quyền, không có lỗi crash KaTeX.
2. **Ký biên bản nghiệm thu:**
   - QA Lead và Product Owner cùng ký xác nhận trên Bảng ma trận nghiệm thu trước khi cấp phép mở cho học sinh Pilot.
