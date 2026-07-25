---
name: requesting-code-review
description: Sử dụng khi hoàn thành nhiệm vụ, triển khai tính năng chính hoặc trước khi merge để xác minh công việc đáp ứng yêu cầu
---

# Yêu Cầu Code Review

Gửi subagent người đánh giá code để bắt vấn đề trước khi chúng lan. Người đánh giá nhận ngữ cảnh được chế tác chính xác để đánh giá - không bao giờ lịch sử phiên của bạn. Điều này giữ người đánh giá tập trung vào sản phẩm công việc, không phải quá trình suy nghĩ của bạn, và bảo toàn ngữ cảnh của bạn cho công việc tiếp theo.

**Nguyên tắc cốt lõi:** Đánh giá sớm, đánh giá thường.

## Khi Nào Yêu Cầu Đánh Giá

**Bắt buộc:**
- Sau mỗi nhiệm vụ trong phát triển điều khiển bởi subagent
- Sau khi hoàn thành tính năng chính
- Trước khi merge vào main

**Tùy chọn nhưng có giá trị:**
- Khi bị kẹt (góc nhìn mới)
- Trước khi refactor (kiểm tra cơ sở)
- Sau khi sửa lỗi phức tạp

## Cách Yêu Cầu

**1. Lấy git SHA:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # hoặc origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Gửi subagent người đánh giá code:**

Dùng công cụ Task với loại `general-purpose`, điền mẫu tại `code-reviewer.md`

**Placeholder:**
- `{DESCRIPTION}` - Tóm tắt ngắn những gì bạn xây dựng
- `{PLAN_OR_REQUIREMENTS}` - Nó nên làm gì
- `{BASE_SHA}` - Commit bắt đầu
- `{HEAD_SHA}` - Commit kết thúc

## Ba Ống Kính Đánh Giá

Một lượt đánh giá code sử dụng ba ống kính độc lập bên trong cùng một subagent người đánh giá. Các ống kính này không thay đổi số lượng subagent người đánh giá quy trình gửi đi.

1. **Thợ Săn Mù (Blind Hunter)** chỉ nhận diff. Nó tìm lỗi, vấn đề bảo mật, giả định bị phá vỡ, migration thiếu, mặc định không an toàn và sự thiếu hụt đáng ngờ mà không có chuyện dự án.
2. **Thợ Săn Trường Hợp Biên (Edge Case Hunter)** nhận diff và có thể kiểm tra dự án. Nó đi qua các nhánh thay đổi và điều kiện biên: đầu vào trống, mặc định thiếu, chuyển trạng thái, đồng thời, thử lại, timeout, thất bại hệ thống file và mạng, xử lý đường dẫn và dọn dẹp.
3. **Kiểm Toán Chấp Thuận (Acceptance Auditor)** nhận diff cộng kế hoạch hoặc yêu cầu. Nó xác minh mọi tiêu chí chấp thuận, ràng buộc và phi mục tiêu đối với triển khai.

Phân loại phát hiện thành:

- **Must-Fix**: đúng đắn, bảo mật, mất dữ liệu, tiêu chí chấp thuần bị phá vỡ hoặc test thất bại.
- **Should-Fix**: khả năng bảo trì, khoảng trống test, hành vi lỗi không rõ hoặc thiết kế mong manh cần sửa trước khi tiếp tục.
- **Consider**: cải tiến thực sự nhưng không bắt buộc cho thay đổi này.
- **Praise**: bằng chứng cụ thể của lựa chọn triển khai tốt.

**3. Hành động theo phản hồi:**
- Sửa mục Must-Fix ngay lập tức.
- Sửa mục Should-Fix trước khi tiếp tục trừ khi bạn có thể bảo vệ phạm vi hẹp hơn bằng bằng chứng.
- Theo dõi mục Consider riêng khi chúng nằm ngoài thay đổi hiện tại.
- Đẩy lùi phát hiện sai với code, test hoặc trích dẫn nguồn.

## Ví Dụ

```
[Vừa hoàn thành Nhiệm vụ 2: Thêm hàm xác minh]

Bạn: Để tôi yêu cầu code review trước khi tiến hành.

BASE_SHA=$(git log --oneline | grep "Nhiệm vụ 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Gửi subagent người đánh giá code]
  MÔ TẢ: Đã thêm verifyIndex() và repairIndex() với 4 loại vấn đề
  KẾ_HOẶCH_HOẶC_YÊU_CẦU: Nhiệm vụ 2 từ docs/tungnt-ai-skills/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent trả về]:
  Praise: Kiến trúc sạch, test thực
  Should-Fix:
    Thiếu chỉ báo tiến trình
  Consider:
    Con số ma thuật (100) cho khoảng báo cáo
  Đánh Giá: Sẵn sàng tiến hành với sửa

Bạn: [Sửa chỉ báo tiến trình]
[Tiếp tục Nhiệm vụ 3]
```

## Tích Hợp Với Quy Trình

**Phát Triển Điều Khiển Bởi Subagent:**
- Đánh giá sau TỪNG nhiệm vụ
- Bắt vấn đề trước khi chúng cộng dồn
- Sửa trước khi chuyển nhiệm vụ tiếp theo

**Thực Thi Kế Hoạch:**
- Đánh giá sau mỗi nhiệm vụ hoặc tại điểm kiểm tra tự nhiên
- Nhận phản hồi, áp dụng, tiếp tục

**Phát Triển Ad-Hoc:**
- Đánh giá trước merge
- Đánh giá khi bị kẹt

## Tín Hiệu Cảnh Báo

**Không bao giờ:**
- Bỏ qua đánh giá vì "đơn giản"
- Bỏ qua vấn đề Must-Fix
- Tiếp tục với vấn đề Should-Fix chưa sửa mà không có bằng chứng
- Tranh luận với phản hồi kỹ thuật đúng

**Nếu người đánh giá sai:**
- Đẩy lùi với lý do kỹ thuật
- Cho thấy code/test chứng minh nó hoạt động
- Yêu cầu làm rõ

Xem mẫu tại: requesting-code-review/code-reviewer.md