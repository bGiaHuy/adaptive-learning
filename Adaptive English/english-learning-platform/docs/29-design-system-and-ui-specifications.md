# 29 - Design System & UI/UX Motion Specifications

## Goal
Tài liệu này chuẩn hóa toàn diện ngôn ngữ thiết kế (Design System), nhận diện thị giác, nhân vật đại diện (Mascot Chú Ếch Quàng Khăn Xanh & AI Tutor Avatar), hệ thống chuyển động (Motion System), và cấu trúc bố cục giao diện (Screen Layout Framework) cho toàn bộ nền tảng Adaptive English Learning Platform (AELP).

---

## 1. ĐỊNH HƯỚNG THỊ GIÁC: "SẠCH, MỀM, CÓ CÁ TÍNH" (CLEAN, SOFT & CHARISMATIC)

Hệ thống kết hợp hài hòa hai nguồn cảm hứng thiết kế cốt lõi:
1. **Reference Thị Giác Chính (Abode-Inspired Minimalism)**:
   - **Khoảng trắng áp đảo (Airy Whitespace)**: Ít đóng khung card, phân nhóm thông tin bằng khoảng cách thị giác tự nhiên; nền sáng sạch sẽ, thư thái.
   - **Xanh dương tươi nổi bật (`#2563EB`)**: Màu nhận diện thương hiệu dẫn hướng hành động, tạo điểm nhấn dứt khoát trên nền trắng.
   - **Typography có cá tính**: Tiêu đề đậm tròn, thân thiện, giàu cảm xúc; phần nội dung học thuật vẫn giữ độ thoáng đãng, dễ đọc lâu.
   - **Mảng nền mềm phía dưới (Soft Undulating Wave)**: Dải màu xanh phấn siêu nhạt (`#F0F5FF`) uốn lượn nhẹ ở chân trang Onboarding và Celebration, tạo bệ đỡ êm ái nâng đỡ typography và nút bấm.
   - **Nút phụ dạng viên thuốc (Pill Button)**: Bo tròn hoàn toàn (`border-radius: 9999px`), nền xanh nhạt `#EFF6FF`, chữ `#2563EB`, kích thước gọn gàng, không tranh chấp sự chú ý với CTA chính.
2. **Reference Tương Tác (Duolingo-Inspired Tactility)**:
   - Cảm giác bấm nút đàn hồi dứt khoát (lún xuống rồi nảy lại), chọn đáp án đổi màu ngay tức thì, feedback rõ ràng, không làm người học bối rối.

---

## 2. BẢNG MÃ MÀU & THIẾT KẾ PHẦN TỬ (DESIGN TOKENS & SYSTEM COMPONENTS)

| Thành Phần | Mã Màu / Token | Đặc Tính Thị Giác & Ứng Dụng |
| :--- | :--- | :--- |
| **Màu thương hiệu chính (Primary Blue)** | `#2563EB` | Dẫn hướng chính: Nút CTA chính, trạng thái đang chọn (Selected/Active), tiến độ học tập, viền tiêu điểm. |
| **Nền Canvas (Background)** | Trắng & Xanh rất nhạt `#F5F8FF` | Tạo ánh sáng nền dịu mát, loại bỏ độ chói của màn hình trắng tinh, thư thái khi học lâu. |
| **Màu chữ chính (Body & Headings)** | Xanh đen `#172B4D` | Tương phản hoàn hảo, chiều sâu trang nhã; **hạn chế dùng chữ xám quá nhạt** gây mỏi mắt. |
| **Mảng nền uốn lượn (Bottom Soft Wave)** | Xanh phấn cực nhạt `#F0F5FF` | Mảng chân trang mềm mại ở Onboarding và Màn hoàn thành phiên. |
| **Nền nút phụ (Pill Background)** | Xanh nhạt dịu `#EFF6FF` | Dùng cho nút phụ dạng viên thuốc (Login, Bỏ qua, Bộ lọc phụ). |
| **Màu linh vật (Mascot Green)** | Xanh lá tươi `#22C55E` / `#16A34A` | Màu thân của Chú Ếch Mascot, dùng phẳng, tinh gọn. |
| **Màu má hồng linh vật (Cheek Pink)** | Hồng đào `#FB7185` / `#F472B6` | Đôi má ửng hồng thân thiện của chú ếch. |
| **Màu khăn quàng (Neckerchief Blue)** | `#2563EB` (đồng bộ Primary) | Điểm kết nối trực quan hoàn hảo giữa Mascot và nhận diện thương hiệu. |
| **Màu bụng (Belly Cream)** | Kem trắng ngà `#FDFBF7` | Vùng bụng phẳng mềm mại của chú ếch. |
| **Phản hồi Đúng (Success)** | Xanh lục `#16A34A` | Kèm icon Checkmark (✓) và nhãn chữ "Chính xác". |
| **Phản hồi Sai (Error)** | Đỏ thẫm `#DC2626` | Kèm icon Cross (✗) và nhãn chữ "Chưa chính xác" + giải thích. |
| **Đường viền (Borders)** | Xám nhạt `#E2E8F0` / 1px solid | Đường nét thanh mảnh, chỉ dùng khi cần tách biệt ranh giới. |

### 2.1. Hình Khối, Độ Nổi & Tương Tác Xúc Giác (Geometry & Tactile Components):
* **Nền trắng thoáng & Phân nhóm bằng khoảng cách (Spacing-based Grouping)**:
  - Giảm thiểu việc đóng khung card hộp kín. Các nhóm nội dung trên trang chủ và onboarding được phân tách tự nhiên bằng khoảng trống (margin/padding 24–32px).
* **Nút bấm chính (Tactile Push Button)**:
  - Bo góc `10–12px`, có cạnh dưới (bottom bevel) tạo độ nổi (`border-bottom: 3px solid #1D4ED8` trên nền nút `#2563EB`).
  - Khi bấm (`:active`), nút **lún xuống rõ rệt** (`translateY(2-3px)`); thả tay ra thì nảy nhẹ trở lại vị trí ban đầu (Elastic spring feedback).
* **Nút phụ dạng viên thuốc (Pill Button)**:
  - Bo tròn tuyệt đối (`border-radius: 9999px`), nền xanh nhạt `#EFF6FF`, chữ xanh dương `#2563EB`, viền không hoặc cực mảnh; dùng cho nút phụ (Login ở góc trên, nút Skip, nút tag lọc).
* **Thẻ đáp án (Answer Option Cards)**:
  - Bo góc `12–16px`, nền trắng `#FFFFFF`, viền mỏng vừa phải (`border: 2px solid #E2E8F0`).
  - Khi click/tap: Đổi ngay lập tức sang viền **Xanh `#2563EB`** và nền **Xanh nhạt `#EFF6FF`**.
* **Thanh chỉ số trang (Pagination Pill Indicator)**:
  - Dạng viên thuốc/chấm ngang ở đầu màn hình (như mẫu reference); trang hiện tại kéo dài thành viên thuốc xanh `#2563EB`, các trang khác là chấm xám nhạt `#E2E8F0`.

### 2.2. Typography Chuẩn:
* **Font chữ tuyển chọn**: **Be Vietnam Pro** (hoặc Plus Jakarta Sans).
* **Hai tầng typographic rõ nét**:
  - **Tầng Tiêu Đề (Bold Display)**: Đậm, tròn trịa, nét dày có cá tính (ExtraBold / SemiBold) — dùng ở Onboarding (*"Bắt đầu hành trình"*, *"Học có chủ đích"*), chào mừng trang chủ, và tiêu đề lớn.
  - **Tầng Nội Dung (Study & Passage Content)**: Regular / Medium, line-height rộng rãi 1.6 — tối ưu cho việc đọc văn bản dài, bài luận Writing và giải thích chi tiết mà không gây mỏi mắt.

---

## 3. MASCOT & AVATAR AI TUTOR: TIẾN HÓA THÀNH BẢN PHẲNG TINH GỌN (ULTRA-FLAT FROG)

### 3.1. Thiết Kế Nhân Vật Tinh Gọn Phẳng (Minimalist Flat Evolution)
Để đồng bộ hoàn hảo với reference thị giác tối giản mới, thiết kế của Chú Ếch được **tối giản hóa đường nét (Ultra-flat vector)**:
* **Lược bỏ**: Bỏ các đường viền đen dày cộp và các mảng shading/gradient phức tạp. Thân hình là mảng màu phẳng sạch sẽ, hiện đại.
* **Giữ trọn 3 dấu ấn nhận diện độc quyền**:
  1. **Chiếc mầm lá xanh trên đầu (Leaf Sprout)**: Vẫn là điểm nhấn chuyển động vật lý trễ nhịp (Follow-through trait).
  2. **Đôi má hồng đào tròn xoe (`#FB7185`)**: Nổi bật trên nền da xanh lá tươi mát, tạo nét mặt thân thiện và ấm áp.
  3. **Chiếc khăn quàng xanh dương (`#2563EB`)**: Thắt nút nhỏ gọn phía trước, kết nối trực tiếp với màu nhận diện thương hiệu của ứng dụng.
* **Đôi mắt tinh anh**: Mắt dạng chấm đen tròn tối giản (hoặc dạng viên thuốc trắng tinh tế trên nền avatar nhỏ), tạo biểu cảm trong sáng, không quá nhiều chi tiết rối rắm.
* **Kiến trúc tách lớp (Layered Vector)**: Thân (`body`), Mầm lá (`leaf`), Đôi mắt (`eyes`), Khăn quàng (`scarf`), Má hồng (`cheeks`) sẵn sàng cho animation chuyển động nhẹ.

### 3.2. Bộ Chuyển Động Của Mascot (Mascot Motion Matrix)

| Trạng Thái | Chuyển Động Chi Tiết (Motion Behavior) | Chi Tiết Nhận Diện Đặc Trưng | Bối Cảnh Xuất Hiện |
| :--- | :--- | :--- | :--- |
| **1. Chào (Greeting)** | Nhún chân, vẫy tay trái, lá trên đầu rung rinh nhẹ. | Thân dừng trước, lá đung đưa 1 nhịp rồi dừng. | Onboarding khởi đầu, góc chào hỏi trang chủ. |
| **2. Nghỉ (Idle)** | Thả lỏng, thở nhẹ rất khẽ, chớp mắt thưa (3–5s/lần). | Lá đứng yên; dừng hoàn toàn hoạt họa khi không cần. | Avatar lớn trên bảng điều khiển. |
| **3. Suy nghĩ (Thinking)** | Nghiêng đầu sang một bên, mắt nhìn chếch lên; kèm chữ `"Đang xử lý"` hoặc `"Đang phân tích..."`. | Khăn quàng hơi rủ nhẹ theo hướng nghiêng đầu. | Khi AI Tutor đang đánh giá bài hoặc phân tích lỗi. |
| **4. Hướng dẫn (Guiding)** | Gật đầu nhẹ, đưa tay chỉ về phía khu vực thao tác. | Nét mặt chăm chú, thân thiện. | Giới thiệu tính năng mới, gợi ý phương pháp giải. |
| **5. Khích lệ (Encouraging)** | Mỉm cười ấm áp, gật đầu kiên nhẫn. | **Tuyệt đối không buồn bã, khóc lóc hay trách móc người học.** | Sau khi học sinh làm sai hoặc khi bấm nút "Thử lại". |
| **6. Hoàn thành (Celebration)** | Nhún chân $\rightarrow$ Nhảy bật lên cao $\rightarrow$ Tiếp đất êm ái. | **Thân tiếp đất trước, chiếc lá và khăn nảy trễ một nhịp**; celebration ngắn (600–900ms). | Kết thúc phiên học hoặc hoàn thành mục tiêu ngày. |

> **Nguyên tắc Sư phạm Bất biến của Linh vật**: Chú ếch là người bạn đồng hành tích cực (Supportive Companion). Dù học sinh sai liên tục 5 câu, chú ếch vẫn giữ nét mặt bình tĩnh khích lệ. Khi người dùng bật chế độ `prefers-reduced-motion: reduce`, toàn bộ hoạt họa chuyển sang hình ảnh vector biểu cảm tĩnh.

---

## 4. HỆ THỐNG CHUYỂN ĐỘNG ĐÀN HỒI NHẸ (ELASTIC SPRING MOTION SYSTEM)

```
                            HỆ THỐNG CHUYỂN ĐỘNG AELP
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           ▼                                                       ▼
[LỚP 1: UI MOTION - ĐÀN HỒI NHẸ & DỨT KHOÁT]     [LỚP 2: MASCOT MOTION - CẢM XÚC & ĐIỂM VUI]
• Timing: 120ms – 300ms                           • Timing: 600ms – 900ms
• Bấm nút lún xuống, chọn đáp án đổi ngay,       • Chào mừng, suy nghĩ, khích lệ, celebration
  feedback pop-in nhẹ, tiến độ tăng mượt          nhảy bật một nhịp có lá và khăn đung đưa
```

### 4.1. Quy Tắc Motion Theo Từng Hành Vi Tương Tác:
1. **Bấm nút**: Nút lún xuống ngay khi chạm ngón tay/click chuột, nhả ra thì nảy trở lại vị trí ban đầu (Spring bounce).
2. **Chọn đáp án**: Viền và nền đổi ngay lập tức không có độ trễ (Zero lag feedback).
3. **Làm đúng**: Hộp phản hồi bật nhẹ lên (Pop-in scale 0.95 $\rightarrow$ 1.0); thanh tiến độ co giãn tăng mượt mà.
4. **Làm sai**: Chỉ vùng đáp án phản hồi ngắn (viền đỏ nhạt, icon ✗); **tuyệt đối không rung lắc cả màn hình (no screen shake)**; chú ếch gật đầu khích lệ bình tĩnh.
5. **Chuyển câu hỏi**: Dùng hiệu ứng **fade và dịch nhẹ cùng một hướng** (từ phải sang trái); giữ cố định hoàn toàn vị trí của các nút bấm chính ở đáy màn hình.
6. **Lật Flashcard**: Lật nhẹ hoặc crossfade; đáp án đọc được ngay khi chuyển xong.
7. **AI xử lý**: Ếch nghiêng đầu suy nghĩ, kèm nhãn chữ trạng thái cụ thể ("Đang phân tích bài viết...", "Đang chấm điểm...").
8. **Hoàn thành**: Ếch nhảy một nhịp, mầm lá và khăn đung đưa theo; cho phép bấm nút "Tiếp tục" ngay lập tức (không bắt chờ).

### 4.2. Phân Tầng Mức Độ Sinh Động Theo Loại Hoạt Động (Delight Spectrum):
Hệ thống duy trì tính nhất quán về component (nút, font, màu), nhưng phân tầng mức độ hiệu ứng vui vẻ theo tính chất từng màn hình:

| Nhóm Hoạt Động | Mức Độ Sinh Động (Delight Level) | Đặc Tính Thị Giác & Tương Tác |
| :--- | :--- | :--- |
| **Vui hơn, giàu năng lượng** | Cao (High Delight) | **Trang chủ Student**, **Bài học ngắn (Micro-drills)**, **Luyện Flashcard từ vựng**, **Onboarding**. Chú ếch tương tác nhiều hơn, feedback sinh động, celebration nảy nhịp. |
| **Tiết chế, tập trung sâu** | Tối giản (Deep Focus & Neutral) | **Bài đọc Reading dài**, **Màn soạn luận Writing**, **Màn ghi âm Speaking**, **Màn chấm bài của Teacher**, **Admin Console**. Không có chuyển động nền lặp lại, giữ tĩnh để giảm tải nhận thức và tối đa hóa sự tập trung. |

---

## 5. RANH GIỚI SẢN PHẨM: ĐỘC LẬP VỚI CÁC TÍNH NĂNG GAMIFICATION NGOẠI LAI

> [!IMPORTANT]
> **Xác lập ranh giới sản phẩm**: 
> AELP lấy cảm hứng từ Duolingo về **cảm giác tương tác UI vui vẻ, dễ hiểu, phản hồi dứt khoát và nhân vật đồng hành**, nhưng **TUYỆT ĐỐI CHƯA ĐƯA CÁC TÍNH NĂNG GAMIFICATION** như Chuỗi ngày (Streak), Điểm kinh nghiệm (XP), Bảng xếp hạng (Leaderboard) hay Mạng sống/Tim (Lives/Hearts) vào phạm vi hiện tại.
> 
> Bản sắc cốt lõi của nền tảng vẫn là **Adaptive English Platform** với hoạt động học thuật lấy cảm hứng từ IELTS, thuật toán FSRS cho từ vựng, và không gian kết nối Classroom với Giáo viên. Mọi cơ chế gamification nếu có sẽ chỉ được xem xét ở các phiên bản mở rộng sau này khi có yêu cầu cụ thể.

---

## 6. MẬT ĐỘ THÔNG TIN PHÂN THEO ROLE VÀ CÔNG VIỆC

| Không Gian | Mật Độ Giao Diện (Density) | Nguyên Tắc Bố Cục Cụ Thể |
| :--- | :--- | :--- |
| **Trang chủ Student** | Thoáng đãng, tập trung | **Một hành động chính nổi bật nhất**: "Học tiếp bài dở" hoặc "Bài đề xuất hôm nay". Mascot ếch nhỏ xuất hiện cạnh lời chào hoặc gợi ý. Các thẻ phụ (Ôn từ, Lớp học, Kỹ năng) xếp tầng rõ ràng, không tranh giành spotlight. |
| **Màn học (Study Focus)** | Tối giản, ưu tiên nội dung | Không trang trí thừa. Reading ưu tiên diện tích văn bản; Writing ưu tiên ô soạn thảo; Speaking ưu tiên sóng âm và nút ghi âm lớn. |
| **Teacher Portal** | Gọn gàng, mật độ trung bình-cao | Dùng chung màu xanh `#2563EB`, font *Be Vietnam Pro* và bo góc chuẩn, nhưng dùng các bảng dữ liệu (Data Table), bộ lọc đa tiêu chí gọn gàng để giáo viên quản trị hàng chục học sinh cùng lúc. |
| **AI Tutor Panel** | Ngăn nắp, dễ đọc | Avatar ếch đặt ở đầu panel; tin nhắn giải thích hiển thị rõ ràng từng đoạn, **không làm animation nhảy nhót cho từng tin nhắn** để người học đọc lời giải nhanh nhất. |

---

## 6. KHUNG ĐIỀU HƯỚNG & BỐ CỤC CHUẨN CỦA STUDENT

### 6.1. Thanh Điều Hướng 4 Hub:
* **Desktop**: Sidebar cố định bên trái gồm 4 mục:
  1. `Học (Learn)`
  2. `Ôn từ (Vocab)`
  3. `Lớp học (Classroom)`
  4. `Tiến độ (Progress)`
* **Mobile**: Bottom Navigation Bar ở đáy màn hình với đúng 4 tab tương ứng.

### 6.2. Cấu Trúc Màn Hình Làm Bài Tập Trung (Focus Mode):
```
┌────────────────────────────────────────────────────────────────────────┐
│ [✕] Thoát & Lưu Nháp       [Tên Hoạt Động / Unit]        [━━━ 60% ━━━] │ Top Bar (Cố định)
├────────────────────────────────────────┬───────────────────────────────┤
│ [VÙNG NỘI DUNG CHÍNH (ĐỀ / AUDIO)]     │ [AI TUTOR PANEL (DESKTOP)]    │
│                                        │ [Avatar Ếch] "Cậu lưu ý thì   │
│ Question 3: Fill in the missing word...│ quá khứ hoàn thành ở vế đầu   │
│ [ Option A ]                           │ nhé!"                         │ Vùng Nội Dung
│ [ Option B ]                           │                               │
│                                        │ [Đóng Panel]                  │
├────────────────────────────────────────┴───────────────────────────────┤
│ [HÀNG ĐỘNG CHÍNH ĐÁY]:            [ Gợi Ý AI ]      [ TIẾP TỤC / KIỂM TRA ] │ Bottom Bar (Cố định)
└────────────────────────────────────────────────────────────────────────┘
```
* Trên Mobile: AI Tutor mở dưới dạng **Bottom Sheet vuốt lên**, không che lấp nút bấm chính và không làm mất nội dung đang làm dở.
