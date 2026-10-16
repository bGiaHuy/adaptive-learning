# Tích hợp từ điển minhqnd

Adaptive Study dùng bản SQLite `data/dictionary.db` đã tải trong workspace ở chế độ chỉ đọc. API tra cứu chỉ lọc `lang_code = 'en'`, giữ từng nghĩa tiếng Việt riêng, IPA, ví dụ và nguồn để học sinh chọn đúng nghĩa trước khi lưu.

Thông tin phạm vi hiện tại của bản dữ liệu: 118.356 mục từ tiếng Anh; 118.183 mục có ít nhất một nghĩa tiếng Việt. Đây là độ phủ dữ liệu, không phải nhãn CEFR. Ứng dụng luôn hiển thị `Chưa phân trình độ` vì database không cung cấp bằng chứng phân cấp năng lực.

Luồng dữ liệu:

`Tra từ → chọn nghĩa → UserVocab state=saved → Đưa vào học → ôn FSRS`

`VocabularyItem` giữ dữ liệu dùng chung và mã nghĩa nguồn; `UserVocab` giữ lịch ôn, trạng thái, stability, difficulty và review history riêng theo học sinh. Một từ có nhiều nghĩa được tổng hợp mastery theo từng từ nhưng chỉ đạt `mastered` khi mọi nghĩa đã lưu đều đạt trạng thái đó.

Nguồn: [minhqnd/dictionary](https://github.com/minhqnd/dictionary). Dữ liệu được ghi nhận theo giấy phép [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); mã nguồn repo theo MIT. Ứng dụng giữ liên kết nguồn và giấy phép ở phần tra cứu và thẻ từ đã lưu.
