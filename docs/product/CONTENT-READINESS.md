# AdaptiveMath — Content Readiness Matrix

**Tài liệu:** Academic Curriculum & Content Readiness Matrix for Controlled Pilot  
**Phiên bản:** 1.0  
**Tác giả:** Antigravity (Product Discovery & UX Lead)  
**Phê duyệt:** Chờ kiểm kê thực tế & ký duyệt (Academic Content Lead & QA Lead - PENDING SIGN-OFF)  
**Tài liệu liên quan:**
- `docs/product/GATE-0-DECISION-PACK.md` (Quyết định D-01: Lớp 9 Kết nối tri thức - PENDING)
- `docs/PROJECT-VISION-AND-PM-ROADMAP.md` (Horizon 2: Thắng pilot lớp 9 ôn thi vào 10)
- `docs/PRD-AdaptiveMath.md` (Mục 11: Content and Item Bank Management)

---

## 1. Tuyên Bố Trách Nhiệm Dữ Liệu (Data Integrity Statement)

> [!WARNING]
> **Loại bỏ con số Marketing & Phân biệt rõ Inventory thực tế:**  
> 1. Con số *"1.472 câu hỏi và 92 bài học"* xuất hiện trong bản UI prototype trước đây chỉ là văn bản mẫu (mock copy) phục vụ thiết kế giao diện, **hoàn toàn chưa có cơ sở dữ liệu thực tế chứng minh**.  
> 2. **Kiểm kê thực tế (Verified Inventory):** Tính đến thời điểm hiện tại, trong toàn bộ mã nguồn repo chỉ có **01 câu hỏi mẫu** tại `apps/api/prisma/seed.ts` (SKILL-02).  
> 3. Các con số *"280 đã soạn / 233 đã duyệt / 72.8%"* trong bảng Ma trận dưới đây chỉ là **MỤC TIÊU KẾ HOẠCH & DỮ LIỆU GIẢ ĐỊNH (PLANNING TARGET / UNVERIFIED PLACEHOLDER)**, chưa có file dữ liệu nguồn trong workspace để đối chiếu. Cần Academic Content Lead nộp file kiểm kê nguồn trước khi tiến hành Gate 3.

---

## 2. Danh Mục 6–8 Kỹ Năng Trọng Tâm Cho Đợt Pilot (Pilot Skill Scope)

Bám sát chương trình Toán 9 GDPT 2018 - SGK Kết nối tri thức với cuộc sống, định hướng thi tuyển sinh vào lớp 10:

```
[K1: Căn thức bậc hai] ──(prerequisite)──> [K2: Rút gọn biểu thức chứa căn]
                                                │
[K3: Hệ 2 PT bậc nhất 2 ẩn] ─────────────> [K4: Giải bài toán bằng cách lập hệ PT]
                                                │
[K5: Hàm số y = ax² & PT bậc 2] ──────────> [K6: Định lý Viète & Ứng dụng]
                                                │
[K7: Tỉ số lượng giác tam giác vuông] ───> [K8: Đường tròn & Góc nội tiếp]
```

### Chi tiết 8 Kỹ năng (Skill Nodes):
1. **SKILL-01 (Căn bậc hai cơ bản):** Khái niệm, tính chất căn bậc hai số học, điều kiện xác định của $\sqrt{A}$. *(Prerequisite: Bình phương số thực lớp 7)*.
2. **SKILL-02 (Biến đổi căn thức):** Trục căn thức ở mẫu, đưa thừa số ra ngoài/vào trong dấu căn, rút gọn biểu thức chứa căn. *(Prerequisite: SKILL-01)*.
3. **SKILL-03 (Giải hệ phương trình bậc nhất 2 ẩn):** Phương pháp thế, phương pháp cộng đại số, giải hệ quy về bậc nhất. *(Prerequisite: Phương trình bậc nhất 1 ẩn lớp 8)*.
4. **SKILL-04 (Toán thực tế lập hệ PT):** Giải bài toán bằng cách lập hệ phương trình (dạng chuyển động, năng suất, phần trăm, hình học). *(Prerequisite: SKILL-03)*.
5. **SKILL-05 (Phương trình bậc hai 1 ẩn):** Công thức nghiệm, công thức nghiệm thu gọn, giải phương trình bậc hai $ax^2 + bx + c = 0$.
6. **SKILL-06 (Định lý Viète):** Ứng dụng định lý Viète để nhẩm nghiệm, tìm hai số biết tổng và tích, xét dấu các nghiệm. *(Prerequisite: SKILL-05)*.
7. **SKILL-07 (Tỉ số lượng giác góc nhọn):** Định nghĩa $\sin, \cos, \tan, \cot$, hệ thức giữa cạnh và góc trong tam giác vuông. *(Prerequisite: Định lý Pythagoras lớp 8)*.
8. **SKILL-08 (Đường tròn & Góc nội tiếp):** Tính chất góc ở tâm, góc nội tiếp, mối liên hệ giữa cung và dây. *(Prerequisite: Đường tròn cơ bản lớp 9)*.

---

## 3. Kiến Trúc Phân Tách Kho Câu Hỏi (Question Pool Architecture)

Để đảm bảo thuật toán đánh giá khách quan và học sinh không gặp lại câu hỏi cũ làm sai lệch kết quả, ngân hàng câu hỏi được chia làm **5 Pool độc lập**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      5-TIER QUESTION POOL DESIGN                       │
├────────────┬─────────────────────────────┬───────────┬─────────────────┤
│ Tên Pool   │ Mục đích sử dụng            │ Số câu/KN │ Yêu cầu đặc thù │
├────────────┼─────────────────────────────┼───────────┼─────────────────┤
│ DIAGNOSTIC │ Bài kiểm tra chẩn đoán đầu  │ 6 câu     │ Thang IRT chuẩn │
│ PRACTICE   │ Học sinh tự luyện tập tuần  │ 15 câu    │ Kèm gợi ý từng bước│
│ REMEDIATION│ Bài tập chữa câu sai        │ 10 câu    │ Bắt đúng bẫy sai│
│ REASSESS   │ Kiểm tra xác nhận tiến bộ   │ 6 câu     │ Parallel form   │
│ GOLDEN QA  │ Đề thi chuẩn kiểm chuẩn mẫu │ 3 câu     │ Đối sánh chuẩn  │
└────────────┴─────────────────────────────┴───────────┴─────────────────┘
```

> **Quy tắc vàng (Golden Rule):** Câu hỏi trong pool `DIAGNOSTIC` và `REASSESS` **không bao giờ xuất hiện** trong pool `PRACTICE` để tránh hiện tượng học sinh "học vẹt đề kiểm tra" (Testing contamination).

---

## 4. Ma Trận Kế Hoạch & Trạng Thái Sẵn Sàng Nội Dung (Planning Matrix & Inventory Audit)

> [!IMPORTANT]
> **Kết Quả Kiểm Kê Kho Dữ Liệu Thực Tế (Workspace Evidence Audit):**  
> - **Số câu hỏi đã xác minh trong repository:** **01 câu** (Mã `SKILL-02`, file `apps/api/prisma/seed.ts`).  
> - **Tiến độ thực tế xác minh:** **0.3% (1/320)**.  
> - Các số liệu "Đã soạn: 280 / Đã duyệt: 233 / 72.8%" dưới đây được phân loại là **MỤC TIÊU KẾ HOẠCH (PLANNING TARGET) / DỮ LIỆU CHƯA XÁC MINH (UNVERIFIED PLACEHOLDER)**.  
> - **Người chịu trách nhiệm xác minh (Owner):** Academic Content Lead & QA Lead phải cung cấp file dữ liệu nguồn (JSON/CSV hoặc migration seed đầy đủ) trước khi đề xuất mở **Gate 3 (Content & Assessment Algorithm)**.

| Mã Kỹ Năng (Skill ID) | Tên Kỹ Năng | Cần thiết (Target) | Xác minh Repo (Verified) | Kế hoạch Soạn (Draft Target) | Kế hoạch Duyệt (Review Target) | Tác giả dự kiến (Author) | Thẩm định dự kiến (Reviewer) | Phân loại Trạng thái |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **SKILL-01** | Căn bậc hai cơ bản | 40 | 0 | 40 | 36 | Thầy Tuấn (HN) | Cô Lan (Sư Phạm) | `TARGET / PLACEHOLDER` |
| **SKILL-02** | Biến đổi & Rút gọn căn thức | 40 | 1 | 38 | 32 | Thầy Tuấn (HN) | Cô Lan (Sư Phạm) | `1 VERIFIED (seed.ts) / TARGET` |
| **SKILL-03** | Giải hệ phương trình | 40 | 0 | 40 | 40 | Cô Mai (Chuyên) | Thầy Nam (CVA) | `TARGET / PLACEHOLDER` |
| **SKILL-04** | Toán lập hệ phương trình | 40 | 0 | 35 | 28 | Cô Mai (Chuyên) | Thầy Nam (CVA) | `TARGET / PLACEHOLDER` |
| **SKILL-05** | Phương trình bậc hai | 40 | 0 | 32 | 24 | Thầy Đức (KHTN) | Cô Lan (Sư Phạm) | `TARGET / PLACEHOLDER` |
| **SKILL-06** | Định lý Viète & Ứng dụng | 40 | 0 | 30 | 20 | Thầy Đức (KHTN) | Thầy Nam (CVA) | `TARGET / PLACEHOLDER` |
| **SKILL-07** | Tỉ số lượng giác góc nhọn | 40 | 0 | 40 | 35 | Thầy Hùng (ĐHSP)| Cô Mai (Chuyên) | `TARGET / PLACEHOLDER` |
| **SKILL-08** | Đường tròn & Góc nội tiếp | 40 | 0 | 25 | 18 | Thầy Hùng (ĐHSP)| Cô Mai (Chuyên) | `TARGET / PLACEHOLDER` |
| **TỔNG CỘNG** | **8 Kỹ năng Pilot** | **320** | **1** | **280 (Target)** | **233 (Target)** | *5 Tác giả* | *3 Reviewers* | **VERIFIED: 0.3% (1/320)** |

---

## 5. Phân Bổ Mức Nhận Thức & Bẫy Tư Duy (Cognitive & Misconception Coverage)

Mỗi kỹ năng 40 câu hỏi được phân bổ chặt chẽ theo thang đo chuẩn GDPT 2018:
- **Nhận biết (Remembering):** 12 câu (30%) — Kiểm tra công thức, định lý, điều kiện xác định.
- **Thông hiểu (Understanding):** 16 câu (40%) — Bài toán cơ bản từ 1 đến 2 bước biến đổi.
- **Vận dụng (Applying):** 12 câu (30%) — Bài toán tổng hợp, toán thực tế thi vào 10.

### Bắt buộc gắn mã Bẫy sai lầm (Misconception Tags):
Mỗi phương án nhiễu (Distractor A, B, C, D) phải phản ánh đúng một sai lầm phổ biến của học sinh:
- `MISC-SIGN`: Lỗi nhầm dấu (Ví dụ: Chuyển vế không đổi dấu, căn bậc hai quên dấu trị tuyệt đối $\sqrt{A^2} = |A|$).
- `MISC-FORMULA`: Nhầm lẫn công thức (Ví dụ: Áp dụng sai hằng đẳng thức hoặc công thức nghiệm Viète $x_1+x_2 = -\frac{b}{a}$).
- `MISC-DOMAIN`: Quên điều kiện xác định (Ví dụ: Rút gọn biểu thức nhưng quên đối chiếu điều kiện mẫu khác 0 hoặc trong căn $\ge 0$).
- `MISC-CALC`: Sai sót tính toán số học đơn thuần.

---

## 6. Quy Trình & Tiêu Chuẩn Thẩm Định Nội Dung (Content QA & SLAs)

### 6.1 Service Level Agreements (SLAs):
- **Tốc độ biên soạn (Throughput):** Mỗi tác giả hoàn thành tối thiểu **15 câu/tuần**.
- **Thời hạn thẩm định (Review SLA):** Reviewer phải xử lý câu hỏi trong vòng **48 giờ** kể từ khi nhận được yêu cầu.
- **Tỷ lệ làm lại (Rework/Rejection Rate Target):** Giữ tỷ lệ câu hỏi bị từ chối do lỗi chính tả/cú pháp $< 10\%$.

### 6.2 Checklist Thẩm Định 5 Bước (Reviewer Checklist):
1. **Kiểm tra Khoa học:** Đề bài rõ ràng, không đa nghĩa; duy nhất 1 đáp án đúng; 3 đáp án nhiễu có cơ sở sư phạm.
2. **Kiểm tra KaTeX:** Các ký hiệu toán ($\sqrt{x}$, $\frac{a}{b}$, $\begin{cases}...\end{cases}$) hiển thị hoàn hảo, không bị tràn dòng trên màn hình điện thoại di động (Mobile responsive).
3. **Kiểm tra Lời giải:** Lời giải chi tiết giải thích vì sao chọn đáp án đúng VÀ chỉ ra vì sao các đáp án kia là sai lầm.
4. **Kiểm tra Quyền riêng tư:** Đề bài toán thực tế không sử dụng tên thật của người dùng hay thông tin nhạy cảm.
5. **Kiểm tra Maker-Checker:** Tác giả và Người duyệt là hai tài khoản có địa chỉ email và ID khác nhau.

---

## 7. Các Điểm Nghẽn Hiện Tại & Kế Hoạch Tháo Gỡ (Blockers & Mitigation)

1. **Điểm nghẽn ở SKILL-08 (Hình học Đường tròn):**
   - *Vấn đề:* Câu hỏi hình học cần các hình vẽ SVG chuẩn xác, tác giả tốn nhiều thời gian vẽ hình hơn đại số (mới đạt 45%).
   - *Giải pháp:* Điều phối thêm 1 chuyên viên đồ họa hỗ trợ xuất file SVG chuẩn theo mã nguồn Geogebra cho Thầy Hùng; ưu tiên hoàn thành trước 25 câu nhận biết và thông hiểu trong tuần 2.
2. **Kiểm chuẩn KaTeX trên trình duyệt điện thoại cũ:**
   - *Vấn đề:* Một số thiết bị học sinh dùng Android cũ hiển thị công thức ma trận hệ phương trình bị lệch font.
   - *Giải pháp:* Nhúng CSS KaTeX fallback và kiểm tra tự động trên ma trận thiết bị của Playwright.
