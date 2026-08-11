# Logo cần bạn kiểm tra lại thủ công

## Đã import tự động: 169 sàn
Logo đã được copy vào `src/assets/brokers/[slug]/logo.*` dựa theo tên file gốc trong `Logo dự án/Logo dự án`. Xem chi tiết từng slug ↔ file gốc trong `src/assets/brokers/_import-report.json`.

Đã tự gộp `justmarket` + `justmarkets` (cùng 1 sàn JustMarkets, khác chính tả filename) thành 1 slug `justmarkets`, dùng bản logo lớn hơn.

## Chưa import — cần xem bằng mắt (102 file)
Các file trong `Logo dự án/Logo dự án` có tên dạng `11zon_cropped (N).png` — không có tên sàn trong filename nên không thể tự động gán. Bạn cần mở từng file, xác định là logo của sàn nào, rồi tôi sẽ copy thủ công vào đúng thư mục `src/assets/brokers/[slug]/`.

## Bỏ qua — không xác định được / không liên quan (8 file + 1 file lạc)
Các file tên dạng hash ngẫu nhiên (không phải tên sàn, không đoán được):
- `08b5c22f2327a979f036.jpg`
- `9fb1669197991dc74488.jpg`
- `9ffef842-ea78-4ebe-904f-8f3903b7da38.png`
- `b538ad0c1687a8d9f196.jpg`
- `c9571dd8e14e6e10375f.jpg`
- `f6c5bad4f0fd44a31dec.jpg`
- `analysticc1analysticc0.png`
- `snapedit_1758633407970.jpeg`

Và file không liên quan tới project (không đụng tới):
- `checkcampgoogle ads chuẩn - Copy.xlsx`

## Trùng lặp (đã tự động chọn bản lớn nhất, còn lại vẫn nằm trong `Logo dự án/`)
Một số sàn có nhiều bản logo (vd: `amarkets`, `hantec`, `cxm`, `axi`, `jammable`, `akool`...) — script đã tự chọn file có dung lượng lớn nhất làm logo chính. Nếu bản được chọn không phải bản đẹp nhất, xem danh sách `alternates` trong `_import-report.json` để đổi lại.
