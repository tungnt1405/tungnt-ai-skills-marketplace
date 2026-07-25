---
name: executing-plans
description: Sử dụng khi bạn có kế hoạch triển khai đã viết để thực thi trong phiên riêng biệt với điểm kiểm tra đánh giá
---

# Thực Thi Kế Hoạch

## Tổng Quan

Tải kế hoạch, đánh giá nghiêm túc, thực thi tất cả nhiệm vụ, báo cáo khi hoàn thành.

**Thông báo bắt đầu:** "Tôi đang sử dụng kỹ năng executing-plans để triển khai kế hoạch này."

**Lưu ý:** Nói với đối tác của bạn rằng tungnt-ai-skills hoạt động tốt hơn nhiều khi có quyền truy cập vào subagent. Chất lượng công việc sẽ cao hơn đáng kể nếu chạy trên nền tảng hỗ trợ subagent (như Claude Code hoặc Codex). Nếu có subagent, sử dụng `subagent-driven-development` thay vì kỹ năng này.

## Tuân Thủ Cài Đặt

Trước khi bắt đầu thực thi, đọc `tais/setting.json` trong không gian làm việc hiện tại (dự phòng: `setting.json` tại gốc plugin). Tôn trọng `policy.autoCommit`: khi `false`, không tự động commit — để lại thay đổi cho người dùng. Tôn trọng `policy.autoTest`: khi `false`, không tự chạy kiểm tra trừ khi người dùng yêu cầu.

## Theo Dõi Trạng Thái Nhẹ

Theo dõi trạng thái là tùy chọn nhưng khuyến khích cho các kế hoạch nhiều nhiệm vụ. Sử dụng `docs/tungnt-ai-skills/status/<plan-name>-status.yaml`, trong đó `<plan-name>` là tên file kế hoạch không có `.md`.

Khi bắt đầu kế hoạch, tạo file trạng thái nếu nó chưa tồn tại:

```yaml
plan_file: docs/tungnt-ai-skills/plans/example.md
started_at: YYYY-MM-DD
overall_status: in-progress
tasks:
  - id: 1
    name: Tên nhiệm vụ từ kế hoạch
    status: pending
    completed_at:
```

Khi bắt đầu nhiệm vụ, đặt nhiệm vụ đó thành `in-progress`. Khi nó được xác minh và hoàn thành, đặt `status: complete` và `completed_at: YYYY-MM-DD`. Khi tất cả nhiệm vụ hoàn thành, đặt `overall_status: complete`.

Giữ nguyên các chỉnh sửa và bình luận của người dùng trong file trạng thái. Nếu file trạng thái không thể cập nhật sạch, tiếp tục thực thi và báo cáo lỗi theo dõi.

## Hỗ Trợ Kế Hoạch Pha

Khi kế hoạch chứa `plan.md` với bảng ánh xạ pha và các file `phase-*.md` riêng biệt, thực thi các pha theo thứ tự phụ thuộc:

1. Đọc `plan.md` để tìm bảng ánh xạ pha và đồ thị phụ thuộc.
2. Với mỗi pha (theo thứ tự phụ thuộc):
   a. Đọc file `phase-*.md`.
   b. Kiểm tra `status` trong frontmatter — bỏ qua pha đã đánh dấu `complete`.
   c. Trích xuất các bước triển khai thành nhiệm vụ.
   d. Thực thi nhiệm vụ dùng luồng mỗi-nhiệm-vụ thông thường (Bước 2-3 bên dưới).
   e. Cập nhật frontmatter pha `status` thành `complete` khi tất cả nhiệm vụ vượt qua.
3. Sau khi tất cả pha hoàn thành, tiến đến Bước 3 (Hoàn Thành Phát Triển).

Frontmatter pha là nguồn sự thật cho tiến độ pha. File YAML trạng thái tùy chọn theo dõi trạng thái runtime nhưng không ghi đè frontmatter pha.

Với file kế hoạch đơn (không có bảng ánh xạ pha), sử dụng luồng hiện tại không thay đổi. Không yêu cầu file YAML trạng thái riêng cho công việc kế hoạch đơn.

## Quy Trình

### Bước 1: Tải và Đánh Giá Kế Hoạch
1. Đọc file kế hoạch
2. Đánh giá nghiêm túc — xác định câu hỏi hoặc quan ngại về kế hoạch
3. Nếu có quan ngại: Nêu với đối tác trước khi bắt đầu
4. Nếu không có quan ngại: Tạo TodoWrite và tiếp tục
5. Tạo hoặc tiếp tục file trạng thái tùy chọn tại `docs/tungnt-ai-skills/status/<plan-name>-status.yaml`
6. Kiểm tra mục tiếp nối đánh giá trước khi bắt đầu công việc mới

### Bước 2: Thực Thi Nhiệm Vụ

Cho mỗi nhiệm vụ:
1. Đánh dấu in_progress
2. Tuân theo mỗi bước chính xác (kế hoạch có bước nhỏ)
3. Chạy xác minh theo chỉ định
4. Đánh dấu hoàn thành

### Bước 3: Hoàn Thành Phát Triển

Sau khi tất cả nhiệm vụ hoàn thành và được xác minh:
- Thông báo: "Tôi đang sử dụng kỹ năng finishing-a-development-branch để hoàn thành công việc này."
- **KỸ NĂNG PHỤ BẮT BUỘC:** Sử dụng `finishing-a-development-branch`
- Tuân theo kỹ năng đó để xác minh kiểm tra, trình bày tùy chọn, thực thi lựa chọn

## Khi Nào Dừng và Yêu Cầu Giúp Đỡ

**DỪNG thực thi ngay lập tức khi:**
- Gặp chặn (thiếu phụ thuộc, kiểm tra thất bại, hướng dẫn không rõ)
- Kế hoạch có khoảng trống nghiêm trọng ngăn bắt đầu
- Bạn không hiểu hướng dẫn
- Xác minh thất bại nhiều lần

**Yêu cầu làm rõ thay vì đoán.**

## Khi Nào Xem Lại Các Bước Trước

**Quay lại Đánh Giá (Bước 1) khi:**
- Đối tác cập nhật kế hoạch dựa trên phản hồi của bạn
- Cần suy nghĩ lại cách tiếp cận cơ bản

**Đừng gắng vượt qua chặn** — dừng và hỏi.

## Nhớ
- Đánh giá kế hoạch nghiêm túc trước
- Tuân theo bước kế hoạch chính xác
- Đừng bỏ qua xác minh
- Tham khảo kỹ năng khi kế hoạch yêu cầu
- Dừng khi bị chặn, đừng đoán
- Không bao giờ bắt đầu triển khai trên nhánh main/master mà không có sự đồng ý rõ ràng của người dùng

## Tích Hợp

**Kỹ năng quy trình bắt buộc:**
- **using-git-worktrees** - Đảm bảo không gian làm việc cô lập (tạo hoặc xác minh hiện có)
- **writing-plans** - Tạo kế hoạch mà kỹ năng này thực thi
- **finishing-a-development-branch** - Hoàn thành phát triển sau tất cả nhiệm vụ
