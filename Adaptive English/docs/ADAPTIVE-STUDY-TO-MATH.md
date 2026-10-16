# Hệ thống Adaptive Study và bản thiết kế chuyển sang Math

Ngày đối chiếu: 13/10/2026, Asia/Saigon. Phạm vi: mã nguồn local và nhật ký trong workspace. Đây là tài liệu kiến trúc và kế hoạch chuyển đổi, chưa phải bản Math đã triển khai. Không kiểm tra production hoặc hiệu quả học tập trong phiên này.

## 1. Quyết định kiến trúc

Giữ Adaptive English làm sản phẩm đang hoạt động; xây Math trên lõi dùng chung có ranh giới theo môn học. Không đổi tên sáu kỹ năng English thành sáu chủ đề Toán rồi giữ nguyên thuật toán. Math cần hồ sơ theo khái niệm, quan hệ tiên quyết và bằng chứng giải bài.

Hướng triển khai: trước hết tách các hợp đồng dữ liệu và dịch vụ, thử một chương Math trên môi trường riêng, sau đó mới mở rộng. Chưa cần tách thành nhiều dịch vụ mạng. Có thể giữ Next.js và Prisma, tổ chức thành các module trong cùng ứng dụng; triển khai Math riêng khi cần bảo vệ sản phẩm English.

## 2. Bản đồ toàn hệ thống hiện có

| Tầng | Chức năng | Nguồn đối chiếu chính | Khi sang Math |
|---|---|---|---|
| Giao diện học sinh | Onboarding, đầu vào, trang chủ, danh sách bài, workspace, tổng kết, tiến độ, lớp, thông báo, cài đặt | `english-learning-platform/src/app/student/` | Giữ khung, thay nội dung và cách biểu diễn năng lực |
| Giao diện giáo viên | Lớp, tạo/import/sửa đề, phiên bản, danh sách bài nộp, chấm và công bố | `src/app/teacher/` | Tái sử dụng luồng, thay bộ soạn và rubric |
| Quản trị | Người dùng, thống kê, nội dung | `src/app/admin/`, `src/app/api/admin/` | Bổ sung phạm vi môn/chương trình |
| Danh tính và quyền | Tài khoản, phiên, vai trò, quyền theo lớp, khôi phục mật khẩu | `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/` | Giữ nguyên nguyên tắc; kiểm tra quyền theo môn/lớp |
| Trạng thái phía trình duyệt | Store React, nháp, lưu cục bộ, đồng bộ đầu vào và tiến độ | `src/lib/store.tsx`, `placementSync.ts`, `useLocalDraft.ts` | Tách khóa cache theo người dùng/môn/phiên bản |
| Học liệu | Course → Unit → Lesson; gói chuyên đề và bài tập JSON; học liệu còn ở module TypeScript | `prisma/schema.prisma`, `src/types/index.ts`, `mockData.ts`, `thematicPackUnit2.ts` | Chuẩn hóa nguồn nội dung trước khi thêm Math |
| Chấm bài | Chấm câu đóng, bài viết/nói chờ đánh giá, AI và giáo viên | `src/lib/learning.ts`, `assignmentGrading.ts`, API grading/submissions | Cần bộ chấm Toán độc lập |
| Thích ứng | Đầu vào, tổng hợp hồ sơ kỹ năng, điểm năng lực bài lớp, ôn từ | `src/app/api/placement/`, `student/progress/`, `assignmentAbility.ts`, `fsrs.ts` | Thay bằng hồ sơ khái niệm và bộ chọn hoạt động |
| Trợ lý AI | Tutor, đánh giá, chat, truy xuất học liệu và bộ nhớ | `aiEngine.ts`, `leafKnowledge.ts`, `leafRetrieval.ts`, `leafMemory.ts`, API ai | Giữ đường gọi máy chủ, thay prompt/ngữ cảnh/rubric |
| Nhập tài liệu | DOCX/PDF có text/MD/HTML/TXT, giữ đề hoặc sinh bài, duyệt trước xuất bản | `documentImport.ts`, `docxParser.ts`, `importAssessment.ts` | Thêm công thức, hình học, cấu trúc đáp án Math |
| Lưu trữ/vận hành | Prisma SQLite local, schema PostgreSQL riêng, build/release và nhật ký minh chứng | `schema.prisma`, `schema.vercel.prisma`, `scripts/`, `docs/research-journal/` | Database thử riêng, migration bổ sung, giữ dữ liệu cũ |

Trong bảng, đường dẫn `src/` và `prisma/` tính từ `english-learning-platform/`. Package khai báo Next 14, React 18, Prisma 5.21.1 và ts-fsrs 5.x; đây là khai báo dependency, không phải xác minh phiên bản runtime đang chạy.

## 3. Luồng nghiệp vụ và nguồn dữ liệu

### Học sinh tự học

Đăng nhập → onboarding/đầu vào → xem kết quả → chọn bài → làm bài và nhận hỗ trợ → chấm hoặc chờ duyệt → lưu lượt làm → tổng hợp tiến độ. Đầu vào có bản ghi máy chủ `PlacementAttempt`, đồng thời có nháp/cache trình duyệt. Không coi localStorage là nguồn điểm chính thức.

`LessonAttempt` lưu tổng điểm, tổng câu, phần trăm, tỷ lệ độc lập và trạng thái đánh giá. Schema hiện chưa có bảng quan hệ riêng cho từng đáp án trong lượt tự học; kiểu dữ liệu giao diện có chi tiết câu trả lời nhưng bản ghi DB tổng hợp không tương đương toàn bộ chi tiết đó. Math cần lưu bằng chứng từng câu để chẩn đoán lỗi.

### Giáo viên giao bài

Tạo lớp → học sinh vào bằng mã/link → tạo hoặc nhập đề → duyệt → xuất bản phiên bản → làm/lưu nháp/nộp → AI gợi ý hoặc giáo viên chấm → công bố → thông báo và cập nhật năng lực. Thu bài và công bố là thao tác nghiệp vụ riêng; không đồng nhất nháp điểm với điểm đã công bố.

`AssignmentVersion` giữ phiên bản đề; `Submission.versionId` xác định phiên bản đã làm; `AssignmentAttachment` giữ tệp theo phiên bản. Phải bảo toàn quan hệ này khi chuyển môn, để sửa đề không làm thay đáp án/rubric của bài đã nộp.

### Ôn tập và AI

Từ được lưu → kích hoạt → đánh giá Again/Hard/Good/Easy → FSRS tính lịch → lưu lịch sử. Chat và tutor có ngữ cảnh/bộ nhớ riêng; phản hồi AI không tự trở thành điểm chính thức chỉ vì đã được tạo.

## 4. Adaptive hiện tại thực sự làm gì?

| Cơ chế | Hành vi thấy trong mã | Giới hạn khi chuyển Math |
|---|---|---|
| Đầu vào | Ngân hàng câu và trạng thái theo các phần English; lưu trên máy chủ | Chưa có bằng chứng trong phần đã rà soát về CAT chọn câu theo thông tin từng khái niệm |
| Hồ sơ cũ | Trung bình phần trăm nguồn có điểm; dưới 50 → A1, 50–79 → A2, từ 80 → B1 | Đây là quy tắc nội bộ, không đủ biểu diễn năng lực Toán hoặc chứng nhận CEFR |
| Điểm bài lớp | AI ước lượng mức bài 100–2400; điểm lượt = tỷ lệ đạt × mức bài; cập nhật 80% cũ + 20% mới | Không phải Elo/IRT chuẩn; chưa có hiệu chỉnh độ khó từ thực nghiệm |
| Tính lại điểm | Snapshot theo bài nộp/phiên bản; bỏ trùng submission; giữ thứ tự công bố đầu tiên | Nên giữ nguyên tính truy vết và chống cộng lặp |
| Tự làm | Lưu `independentRate`; tiến độ tổng hợp tỷ lệ này | Tài liệu cũ ghi trọng số 100/70/40/0; không coi toàn hệ thống đã áp đầy đủ nếu chưa kiểm chứng từng luồng |
| Trí nhớ | FSRS lên lịch; `reviewWord` yêu cầu ít nhất 3 ngày nhớ thành công và interval đạt ngưỡng, mặc định 21 ngày | Nhớ công thức không đồng nghĩa biết giải hoặc chứng minh |
| Độ tin cậy | API tiến độ tăng confidence theo số nguồn và có trần | Là heuristic trong mã, không phải xác suất thống kê đã hiệu chuẩn |

Điểm yếu của công thức điểm bài lớp khi dùng cho Math: học sinh đạt tuyệt đối bài dễ vẫn có thể bị giảm điểm năng lực nếu mức bài thấp hơn hồ sơ cũ. Cần phân biệt luyện củng cố với bài đo năng lực; chưa nên mang nguyên công thức này sang Math.

Tài liệu `PRODUCT-SPEC.md` là nguồn lịch sử: mô tả đầu vào chỉ lưu local và mức Speaking tạm thời không nên được dùng làm kết luận hiện trạng. `assignment-ability.md` còn ghi chưa deploy, trong khi WORKLOG phiên EN-20261012-33 ghi đã phát hành các cột cần thiết. Phiên này không xác minh production; không âm thầm sửa các ghi chép lịch sử.

## 5. Phân ranh giới lõi chung và module môn học

```text
Giao diện học sinh / giáo viên / quản trị
                ↓
Lõi: tài khoản · lớp · bài giao · phiên bản · bài nộp · công bố · thông báo
                ↓
Hợp đồng môn học: chương trình · câu hỏi · chấm · năng lực · chọn bài · tutor
          ↙                                  ↘
English                                   Math
CEFR / 6 kỹ năng                          Khái niệm / tiên quyết
Ngôn ngữ / audio / từ điển                Công thức / hình / đơn vị
Chấm ngôn ngữ / FSRS từ                   Chấm số-biểu thức / rubric giải
                ↓
Kho dữ liệu và minh chứng có subjectId, version, nguồn và quyền truy cập
```

Đề xuất hợp đồng, chưa có trong mã:

- `CurriculumProvider`: trả chương trình, khái niệm và quan hệ tiên quyết.
- `AssessmentEvaluator`: nhận câu hỏi phiên bản cố định và đáp án; trả điểm, trạng thái, lỗi và minh chứng chấm.
- `LearnerModel`: cập nhật hồ sơ từ bằng chứng đã được chấp nhận; tính lại được từ lịch sử.
- `ActivitySelector`: chọn hoạt động tiếp theo và ghi lý do lựa chọn.
- `TutorPolicy`: quyết định mức gợi ý, quyền xem lời giải và ngữ cảnh được gửi AI.
- `ReviewScheduler`: lên lịch ôn kiến thức cần ghi nhớ; không thay bộ đánh giá năng lực giải bài.

Không cần tạo tất cả abstraction ngay. Tách đầu tiên bộ chấm, hồ sơ năng lực và hợp đồng câu hỏi vì ba phần này khác môn nhiều nhất.

## 6. Mô hình dữ liệu Math đề xuất

| Thực thể | Trường cốt lõi và trách nhiệm |
|---|---|
| Subject / Curriculum | Môn, lớp, chương trình, phiên bản; không gắn môn học cố định vào tài khoản |
| Concept | Mã ổn định, tên, mục tiêu quan sát được, chương/chủ đề; ví dụ cộng phân số khác mẫu |
| ConceptPrerequisite | concept, prerequisite, mức bắt buộc; kiểm tra vòng lặp trước xuất bản |
| ItemVersion | Loại câu, đề, công thức/hình, đáp án máy chủ, rubric, thang điểm, độ khó và nguồn độ khó |
| ItemConcept | Câu hỏi ↔ khái niệm, trọng số, vai trò chính/phụ; tránh phân bổ một điểm toàn bài cho mọi khái niệm |
| Attempt / AttemptResponse | Người học, phiên bản, thời gian, đáp án, từng bước nếu có, gợi ý, lời giải đã xem, kết quả chấm |
| AssessmentEvidence | Điểm được duyệt, người/nguồn chấm, confidence, phiên bản bộ chấm, supersedes khi sửa điểm |
| LearnerConceptState | Trạng thái chưa đánh giá/đang học/cần củng cố/đạt, số bằng chứng độc lập, lỗi gần đây, lần ôn tới |
| Misconception | Mã lỗi, diễn giải, điều kiện phát hiện; tách lỗi đã xác nhận khỏi suy đoán của AI |
| RecommendationDecision | Hoạt động được chọn, chính sách/phiên bản, lý do, dữ liệu đầu vào; phục vụ giải thích và điều tra |

Thêm phạm vi môn vào lớp/bài/nội dung/hồ sơ/cache và các truy vấn quyền. Unique key hồ sơ phải bao gồm môn hoặc concept; chỉ `userId + skill` như hiện tại không đủ. Giữ dữ liệu English nguyên dạng, bổ sung ánh xạ khi cần; không chuyển CEFR thành năng lực Math.

## 7. Bộ chấm Math

Tách dạng trình bày câu hỏi khỏi kiểu đáp án và chính sách chấm. Các dạng trắc nghiệm, đúng/sai và trả lời ngắn được thiết kế cho Math theo yêu cầu riêng; không áp thay đổi này ngược vào English.

| Kiểu đáp án | Cách chấm đề xuất | Ca bắt buộc kiểm tra |
|---|---|---|
| Chọn đáp án | ID lựa chọn và chính sách một/nhiều lựa chọn | Chọn thiếu, chọn thừa, ID giả |
| Đúng/sai nhiều ý | Chấm từng ý, quy tắc tổng điểm được khai báo | Thiếu ý, thang điểm khác nhau |
| Số / phân số | Parse chính xác, quy tắc làm tròn/sai số theo đề | 1/2 = 0,5 khi đề cho phép; dấu âm; phần trăm |
| Đại lượng | Giá trị + đơn vị + quy tắc đổi đơn vị | 1 m = 100 cm; sai chiều đại lượng |
| Biểu thức / phương trình | So sánh theo miền xác định và kiểu đối tượng | x/x không bằng 1 trên toàn miền nếu bỏ x ≠ 0 |
| Tập nghiệm / khoảng | Chuẩn hóa tập, biên đóng/mở, điều kiện | Thứ tự nghiệm; nghiệm ngoại lai; biên |
| Tự luận / chứng minh | Rubric từng bước; AI hỗ trợ, giáo viên duyệt khi không chắc | Kết quả đúng nhưng lập luận sai; cách giải khác |
| Hình học | Đề/hình có phiên bản; chấm theo dữ kiện và rubric | Không suy kích thước từ hình minh họa |

Không tái sử dụng trực tiếp `learning.ts` để chấm số: bộ normalize English xóa dấu chấm và dấu câu, có thể làm sai số thập phân; cơ chế chấp nhận typo không phù hợp cho ký hiệu Toán. Không dùng thực thi chuỗi đầu vào làm bộ tính toán. Giới hạn kích thước/độ phức tạp biểu thức và thời gian xử lý.

Mọi đáp án chính thức phải chấm lại phía máy chủ. API tiến độ hiện nhận điểm lượt tự học từ request và kiểm tra dữ liệu; trước khi dùng cho đo năng lực Math cần chấm theo item version ở máy chủ, không chỉ tin điểm do trình duyệt gửi. Đây là rủi ro thiết kế cần xử lý, chưa phải kết luận đã khai thác lỗi.

## 8. Chính sách thích ứng Math bản đầu

Đề xuất MVP dùng quy tắc minh bạch trước khi đưa BKT/IRT vào. Những ngưỡng dưới đây chỉ là cấu hình thử, chưa được kiểm chứng sư phạm:

1. Đầu vào kiểm tra các khái niệm nền của một chương; câu chưa làm là chưa biết, không gán sai hoặc điểm 0.
2. Với mục tiêu học, kiểm tra tiên quyết. Thiếu bằng chứng thì cho câu chẩn đoán; đã thấy yếu thì chọn bài nền.
3. Nếu lỗi khái niệm lặp lại, chọn ví dụ giải mẫu/gợi ý và bài tương tự có thay đổi dữ kiện. Giữ nhãn lỗi tạm thời nếu chỉ có một quan sát.
4. Đúng có gợi ý ghi nhận tiến bộ có hỗ trợ; đúng sau khi xem lời giải không đủ chứng minh tự làm.
5. Ngưỡng thử cho trạng thái đạt: ít nhất 3 câu độc lập, thuộc ít nhất 2 họ bài, trên ít nhất 2 ngày; có bài vận dụng và không còn lỗi trọng yếu chưa xử lý. Cho phép giáo viên điều chỉnh.
6. Khi đạt, chuyển sang vận dụng hoặc khái niệm kế tiếp; lên lịch kiểm tra duy trì. FSRS chỉ dùng riêng cho thẻ công thức/định nghĩa nếu phù hợp.
7. Nếu chưa có câu đủ điều kiện, trả về lý do thiếu học liệu hoặc đề nghị giáo viên; không sinh điểm/năng lực giả.

Thứ tự ưu tiên chọn bài: tiên quyết đang yếu → lỗi gần đây → hoạt động đến hạn → mục tiêu hiện tại → thử thách. Trong cùng nhóm chọn bài đã duyệt, phù hợp độ khó, tránh lặp nguyên câu, cân bằng họ bài. Ghi lý do cho học sinh, ví dụ: “Ôn quy đồng vì hai bài gần nhất em cộng trực tiếp mẫu số”.

Ví dụ: mục tiêu giải phương trình có phân số; thiếu nền quy đồng → kiểm tra quy đồng → phát hiện cộng cả tử và mẫu → minh họa phản ví dụ → bài luyện độc lập → kiểm tra lại ngày khác → quay lại phương trình. Không dùng một điểm trung bình Toán để quyết định cả chuỗi.

## 9. Học liệu, AI và trải nghiệm Math

- Chuỗi nội dung: chọn chương trình → chia concept → lập tiên quyết → tạo họ bài → đáp án/rubric → duyệt chuyên môn → xuất bản version → thu bằng chứng → điều chỉnh có lịch sử.
- Một câu cần có mục tiêu, concept, kiểu đáp án, lời giải, gợi ý nhiều mức, lỗi thường gặp, độ khó có nguồn, tác giả/nguồn/quyền sử dụng và trạng thái duyệt.
- Import hiện chủ yếu trích text; PDF scan cần OCR. Không suy rằng parser đã giữ được công thức Word OMML, phân số, chỉ số, biểu đồ hoặc hình học. Math cần giữ tài liệu gốc, vị trí nguồn, ảnh đối chiếu và màn hình giáo viên sửa trước xuất bản.
- Tutor lấy đúng đề/version, bước làm và concept đang học. Gợi ý từ nhận diện dữ kiện → kiến thức liên quan → bước kế tiếp → lời giải khi được phép; lưu mức hỗ trợ đã dùng.
- AI gợi ý lỗi và rubric, không tự xác nhận chứng minh đúng khi bộ kiểm tra hoặc giáo viên chưa duyệt. Khi provider lỗi, giữ bài làm và cho tiếp tục luồng không phụ thuộc AI.
- Học sinh: “Học hôm nay”, bản đồ khái niệm, workspace công thức/hình, tổng kết lỗi và việc tiếp theo. Giáo viên: ma trận học sinh × concept, nhóm cần hỗ trợ, phiên bản đề và duyệt điểm. Không ép radar sáu kỹ năng English thành báo cáo Toán.

## 10. Ma trận thay đổi mã và API

| Vùng hiện có | Thao tác chuyển đổi |
|---|---|
| `src/types/index.ts` | Tách SkillType/CEFR khỏi hợp đồng chung; thêm kiểu câu/đáp án Math có cấu trúc |
| `prisma/schema*.prisma` | Bổ sung subject/concept/item response/evidence; đồng bộ hai provider bằng migration riêng |
| `src/lib/learning.ts` | Giữ evaluator English; tạo evaluator Math và dispatcher theo môn/answer type |
| `assignmentAbility.ts` | Giữ lịch sử English; Math dùng evidence theo concept, không dùng mốc CEFR |
| API `placement` | Giữ tương thích English; Math lưu đáp án theo item version/concept thay các cột reading/listening |
| API `student/progress` | Tách tổng hợp môn; chấm máy chủ, trạng thái chưa đánh giá, công bố và idempotency |
| API `assignments`, `submissions`, `grading` | Tái sử dụng quyền/version/công bố; thêm rubric Math và phân bổ evidence từng câu |
| `store.tsx`, `skillChart.ts` | Tách cấu hình môn và cache; thay báo cáo Math; tránh mang dữ liệu cũ sang môn mới |
| `documentImport.ts`, `docxParser.ts` | Nhánh xử lý công thức/hình và review nguồn Math |
| `aiEngine.ts`, API ai, leaf modules | Chính sách/prompt theo môn; phạm vi bộ nhớ và retrieval không lẫn học liệu |
| `vocabulary.ts`, `dictionary.ts`, API dictionary/vocab/audio | Giữ cho English; chỉ tái dùng scheduler/media khi Math có nhu cầu cụ thể |

API Math đề xuất: lấy curriculum/concepts, tạo attempt, lưu response, finalize/chấm, lấy concept progress và next activity. Đây là hợp đồng mới cần thiết kế, chưa phải các endpoint có sẵn. Response chấm cần `status`, `score`, `maxScore`, `feedback`, `misconceptionCandidates`, `evidenceId`, `evaluatorVersion`; endpoint đề không trả answer key trước thời điểm chính sách cho phép.

## 11. Lộ trình chuyển đổi và tiêu chí nghiệm thu

| Chặng | Đầu ra | Điều kiện hoàn thành |
|---|---|---|
| 0. Chốt phạm vi | Một lớp, một chương, danh sách concept và định dạng câu | Chủ dự án/giáo viên xác nhận phạm vi; không mặc định toàn bộ THCS |
| 1. Lõi dùng chung | Hợp đồng môn, dữ liệu có subject, evaluator riêng | English tiếp tục dùng đúng dữ liệu; kiểm tra quyền và tương thích |
| 2. Ngân hàng Math nhỏ | Khoảng 10–15 concept, 60–100 câu là quy mô dự kiến | Mọi câu được duyệt đáp án, rubric, tiên quyết và nguồn; số lượng không phải học liệu đã có |
| 3. Chấm và lưu evidence | Workspace Math, server grading, lịch sử từng câu | Các ca số/đơn vị/miền xác định PASS; refresh/retry không cộng trùng |
| 4. Adaptive MVP | Chẩn đoán, hồ sơ concept, chọn bài có lý do | Kịch bản yếu tiên quyết, có gợi ý, thiếu học liệu, học lại đều cho kết quả dự kiến |
| 5. Giáo viên và import | Giao/chấm/công bố, review tài liệu Math | Đổi phiên bản không đổi bài nộp cũ; AI lỗi vẫn giữ nháp; quyền lớp đúng |
| 6. Thử nghiệm có kiểm soát | Báo cáo lỗi, chất lượng chấm và tiến bộ | Dữ liệu được phép sử dụng; giáo viên đối chiếu; chưa tuyên bố hiệu quả từ demo |

Ưu tiên bắt buộc: dữ liệu môn/concept → bộ chấm đúng → evidence đáng tin → adaptive → mở rộng học liệu. OCR công thức, chứng minh tự động, đồ thị tương tác và mô hình thống kê nâng cao có thể làm sau nếu không thuộc chương thử.

Chỉ số thử nghiệm cần đo, chưa có số liệu: mức đồng thuận máy–giáo viên, false positive khi chấm, khái niệm bị bỏ sót, tỷ lệ làm độc lập, kết quả kiểm tra duy trì, thời gian sửa đề nhập, lỗi provider và dữ liệu bị đếm lặp. Ghi mẫu và điều kiện đo; không suy tiến bộ chỉ từ số lượt dùng.

## 12. Checklist kiểm thử trước khi dùng Math thật

- Unit: số thập phân/dấu âm/phân số, sai số, đơn vị, biểu thức và miền, nhiều đáp án; bài chưa duyệt không tạo mastery.
- Dữ liệu: retry cùng response/evidence, sửa điểm, phiên bản đề, offline/resume, hai tab; dựng lại hồ sơ từ lịch sử cho cùng kết quả.
- Adaptive: chưa có dữ liệu; tiên quyết yếu; đúng có gợi ý; xem lời giải; thiếu ngân hàng; bài hỗn hợp concept; không lặp vô hạn một câu.
- Quyền: học sinh không đọc answer key sớm; không nộp/chấm thay người khác; giáo viên chỉ quản lý lớp mình; bộ nhớ AI và cache tách người/môn.
- Tích hợp: nhập → duyệt → giao → nộp → chấm → công bố → tiến độ; đóng thu bài và sửa đề; provider timeout không mất nội dung.
- Regression English: đăng nhập/join, đầu vào/resume, bài tự học, FSRS, import, phiên bản/tệp, chấm/công bố và tiến độ.

Đây là checklist dự kiến. Phiên lập tài liệu không chạy các kiểm thử ứng dụng này, không migration, không reset/seed, không deploy.

## 13. Những lựa chọn cần chốt khi bắt đầu triển khai

Lớp và chương đầu tiên; chương trình/sách; mục tiêu tự học hay thi; các định dạng câu cần hỗ trợ; chính sách điểm đúng/sai nhiều ý; Math là web riêng hay môn trong cùng web; người duyệt học liệu và rubric. Có thể chuẩn bị lõi trước, nhưng không tự điền những lựa chọn này thành yêu cầu đã được xác nhận.

## 14. Nguồn và giới hạn đối chiếu

Nguồn trực tiếp: `english-learning-platform/package.json`; hai schema Prisma; `src/types/index.ts`; các lib và API được nêu ở trên; danh sách route student/teacher/admin. Nguồn lịch sử: `docs/PRODUCT-SPEC.md`, `docs/assignment-ability.md`, `docs/WORKLOG.md`, nhật ký nghiên cứu. Mã và báo cáo lịch sử được dùng phân biệt, không thay cho kiểm thử runtime.

Tài liệu bao quát các phân hệ và điểm chuyển đổi; không phải audit từng dòng hoặc xác nhận mọi tính năng hoạt động. Chưa kiểm tra chất lượng AI, bảo mật đầy đủ, dữ liệu production, khả năng giữ công thức import hoặc kết quả trên học sinh. Không cần tra cứu nền tảng bên ngoài để lập bản đồ từ mã local; việc chọn thư viện chấm/hiển thị Math cụ thể cần kiểm chứng riêng khi triển khai.
