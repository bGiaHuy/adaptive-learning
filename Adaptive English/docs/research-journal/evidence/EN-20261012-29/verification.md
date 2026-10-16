# Điểm năng lực từ bài giáo viên giao — 12/10/2026

## Phạm vi trực tiếp thực hiện

Chủ dự án chấp thuận điểm lượt làm = điểm đạt/thang điểm × mức AI của bài; năng lực mới =80% năng lực cũ +20% điểm lượt làm. Codex triển khai trên mã local. Không deploy/migration Production.

AI đánh giá bài giao thường/DOCX và mỗi phiên bản sửa đề qua gateway MWAPI hiện có; lưu difficultyJson kèm skill/maxScore. Chỉ server đánh giá, không nhận mức khó do client tự gửi. Provider lỗi/không cấu hình/lớp tắt AI thì bài vẫn giao được, mức unavailable không tạo điểm khó giả. Nhãn CEFR theo thang nội bộ, không chứng nhận chuẩn.

Công bố điểm/auto-release trắc nghiệm lưu abilityEvidenceJson trong transaction. Lưu nháp/AI draft không tính. Progress tính lại theo từng kỹ năng từ các bài graded, mỗi submission một contribution; sửa điểm giữ publishedAt đầu tiên, tránh cộng lặp. Giữ mức/thang điểm phiên bản đã làm. Không đếm thêm raw percentage của cùng bài. Mức cũ A1/A2/B1 được dùng làm baseline400/800/1200; nếu chưa có baseline thì lượt đầu khởi tạo. Các nguồn cũ giữ lịch sử. DOCX vẫn dùng kỹ năng chính reading theo luồng cũ.

Giao diện tạo bài, DOCX, chấm và lịch sử phiên bản hiển thị mức AI/trạng thái chưa đánh giá; sửa chọn lớp ban đầu để đồng bộ lớp tải bất đồng bộ. Rà TSX theo skill vercel:react-best-practices; không đổi định dạng câu hỏi English.

## Lệnh/kiểm tra ĐÃ CHẠY

Môi trường Windows, Node24.19.0, Next14.2.35, Prisma5.21.1, TypeScript, node:test; Python bundled3.12+lxml. Thư mục lệnh Node: english-learning-platform.

1. `node --test tests/assignment-ability.test.cjs tests/grading-flow.test.cjs tests/docx-publish.test.cjs tests/assignment-questions.test.cjs tests/notifications.test.cjs tests/progress-vocab-api.test.cjs`: lần đầu32/32 PASS; mở rộng35/35 PASS; chạy xác nhận sau chỉnh cuối35/35 PASS exit0 (tests-initial.log, tests-final.log, tests-confirmed.log). Bao gồm8/10×1200=960; prior1200→1152; thang20; nháp/grade privacy; AI lỗi; auto-release; sửa điểm; version cũ; migration SQLite memory giữ dữ liệu.
2. `node node_modules/typescript/bin/tsc --noEmit`: ban đầu FAIL exit1 do TS2802 MapIterator với target thấp; sửa Array.from rồi PASS exit0 (typecheck-final.log). Không đổi FAIL cũ thành PASS.
3. `node node_modules/prisma/build/index.js generate --schema prisma/schema.prisma`: FAIL EPERM unlink query_engine-windows.dll.node, chạy cấp quyền vẫn FAIL; binary đang được tiến trình sử dụng, không dừng tiến trình khác. JS/types client đã chứa2 trường mới; kiểm tra DMMF root client PASS exit0(root-client-metadata.log). Tạo client riêng bằng scripts/prepare_assignment_ability.py: generate isolated schema PASS exit0(isolated-client.log).
4. `python scripts/prepare_assignment_ability.py`: PASS exit0. CHỈ thêm2 cột nullable trên prisma/dev.db; counts User56,Classroom23,Assignment21,AssignmentVersion52,Submission47 trước/sau khớp; không reset/seed/delete hoặc viết lại bài nộp (local-additive-migration.json).
5. `node node_modules/prisma/build/index.js db push --schema artifacts/assignment-ability-20261012/schema.prisma --skip-generate`: PASS exit0, CHỈ DB rỗng cô lập (isolated-db-setup.log). `node tests/assignment-ability-persistence.cjs`: PASS exit0 trên Prisma/SQLite thật, kiểm tra publication1152, repeat unchanged, regrade, old version, transaction rollback và một submission (persistence.log). Tất cả tài khoản/bài nộp trong DB này là synthetic; không DB thật.
6. `npm run build`: PASS exit0,55/55 trang; cảnh báo không tải Google Fonts stylesheet, build vẫn hoàn tất (build.log).

## Giới hạn và hướng tiếp

Không gọi dịch vụ AI live để đo chất lượng độ khó trong phiên; gateway dùng provider mock trong unit tests. Chưa authenticated browser E2E/visual; chưa deploy/Production migration. Phải áp2 ALTER TABLE Production trước khi deploy; migration file có cả schema SQLite/PostgreSQL. Không tự hồi tố mức AI cho bài cũ. Chưa phân bổ kỹ năng riêng cho đề DOCX hỗn hợp. Cần hiệu chỉnh thang điểm/độ tin cậy bằng dữ liệu được phép khi dùng thực tế.

Không có renderer Word được xác nhận; xuất nguồn Markdown/Word và kiểm tra exporter, chưa nghiệm thu phân trang trực quan. Cảnh báo minh chứng lịch sử giữ nguyên.
