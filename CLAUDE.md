# Pip24h — Website Review Sàn Forex & Crypto

## Mục tiêu dự án
Website review/so sánh các sàn giao dịch forex và crypto, gắn link affiliate (aff) để nhận hoa hồng khi người dùng đăng ký qua sàn được giới thiệu.

Mô hình kiếm tiền: **affiliate marketing** — nội dung review, so sánh, xếp hạng sàn phải trung thực và hữu ích để giữ traffic + tin cậy SEO, nhưng CTA luôn dẫn về link aff.

## Ngôn ngữ
Song ngữ Việt + Anh (`/vi/...` và `/en/...`). Ưu tiên viết bản tiếng Việt trước vì thị trường mục tiêu chính là người dùng Việt Nam, sau đó dịch/viết bản tiếng Anh.

## Tech stack (đề xuất, có thể điều chỉnh)
- **Astro** — static site generator, có i18n routing built-in, phù hợp content-heavy site cần SEO nhanh.
- **Content Collections** của Astro để quản lý review từng sàn dưới dạng Markdown/MDX (mỗi sàn 1 file).
- **Cloudflare Pages** để deploy (free, nhanh, có sẵn CDN toàn cầu — hợp với traffic từ nhiều nước).
- Không dùng WordPress/backend động — giữ site tĩnh để tối ưu tốc độ và chi phí gần bằng 0.

## Cấu trúc nội dung dự kiến
- Trang chủ: bảng xếp hạng/so sánh nhanh các sàn (tên, ưu điểm, spread, nạp rút, CTA aff).
- Trang review chi tiết từng sàn (`/reviews/[broker-slug]`): tổng quan, phí, nền tảng giao dịch, ưu/nhược điểm, đánh giá, nút CTA aff.
- Trang so sánh (`/compare/a-vs-b`) — tối ưu cho từ khóa "X vs Y".
- Blog/kiến thức forex-crypto để kéo traffic tổ chức (organic SEO), không nhất thiết gắn aff trực tiếp.

## Affiliate links
**Chưa có link/mã aff thật tại thời điểm này.** Dùng placeholder trong content (ví dụ `AFF_LINK_PLACEHOLDER_[BROKER]`) và ghi chú rõ vị trí cần điền sau.

Khi có link thật:
- KHÔNG hardcode link aff trực tiếp trong nhiều file Markdown — lưu tập trung ở 1 file config (ví dụ `src/data/brokers.json` hoặc `.ts`) để dễ cập nhật/rotate khi link đổi.
- KHÔNG commit file chứa link/mã aff thật nếu chứa thông tin nhạy cảm (theo thói quen dự án SimilarWeb Crawler và Buy Smart Reviews — không commit/share credentials hoặc dữ liệu nhạy cảm).
- Cân nhắc dùng redirect nội bộ (ví dụ `/go/broker-name`) thay vì để thẳng link aff ngoài trang, để dễ track click và đổi link mà không sửa lại toàn bộ nội dung.

## Lưu ý pháp lý/tuân thủ (cần nhớ khi viết nội dung)
- Quảng cáo forex/crypto có rủi ro pháp lý ở một số khu vực — nội dung nên có disclaimer rủi ro rõ ràng ("Trading involves risk...").
- Ghi rõ đây là nội dung có chứa affiliate link (disclosure) để tuân thủ minh bạch quảng cáo.

## Quy ước làm việc
- Luôn xác nhận với người dùng trước khi sửa/tạo code, kể cả thay đổi nhỏ (xem trao đổi trước khi thực hiện).

## Development (Astro)

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Documentation
Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:
- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
