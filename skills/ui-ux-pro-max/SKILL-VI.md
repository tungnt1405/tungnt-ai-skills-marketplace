---
name: ui-ux-pro-max
description: Sử dụng khi kỹ năng brainstorming được kích hoạt và gọi tới kỹ năng, kỹ năng là một ống kính hỗ trợ cho brainstorming đánh giá, thiết kế, chỉnh sửa khi thiết kế UI/UX
---

# ui-ux-pro-max

Kỹ năng lĩnh vực cho trí thông minh thiết kế UI/UX. Đây không phải kỹ năng quy trình; nó cung cấp cơ sở dữ liệu có thể tìm kiếm và tạo hệ thống thiết kế để hướng dẫn quyết định UI trước khi triển khai.

Sử dụng kỹ năng này như bằng chứng thiết kế trong quy trình làm việc dự án hiện tại. Nó là cơ sở đánh giá thiết kế UI/UX và cung cấp lại `brainstorming` thông tin thiết kế để `brainstorming` có đánh giá phân tích để làm tiếp.

<HARD-GATE>
CHỈ KÍCH HOẠT khi kỹ năng `brainstorming` gọi tới. KHÔNG kích hoạt tự động kỹ năng, KHÔNG kích hoạt sau các kỹ năng khác ngoại trừ kỹ năng `brainstorming`.

NẾU không phải `brainstorming` dừng lại và trả lại thông báo "Kỹ năng ui-ux-pro-max không được kích hoạt do kỹ năng khác không phải `brainstorming` gọi tới."

NẾU kỹ năng `brainstorming` gọi tới để yêu cầu hỗ trợ thì hãy thông báo `Đang dùng kỹ năng ui-ux-pro-max để làm việc...`

NẾU người dùng tự kích hoạt bằng cách gọi trực tiếp `/ui-ux-pro-max` thì chỉ làm đúng nhiệm vụ mà kỹ năng lĩnh vực phụ trách và đưa gợi ý cho người dùng.

```plaintext
Gợi ý: Để tiếp tục, hãy dùng:

/brainstorming Dựa trên phần phân tích từ kỹ năng ui-ux-pro-max ở trên, tiếp tục xây dựng spec và kế hoạch triển khai chi tiết để thực hiện.
```

TUYỆT ĐỐI KHÔNG CODE, KHÔNG SỬA FILE khi dùng kỹ năng `ui-ux-pro-max`.
</HARD-GATE>

## Cách Sử Dụng

Trước khi làm công việc thiết kế, đánh giá hoặc triển khai UI/UX, đọc hướng dẫn quy trình đầy đủ trong:
`skills/ui-ux-pro-max/PROMPT.md`

File đó chứa:
- Điều kiện tiên quyết (Python 3.x yêu cầu)
- Quy trình từng bước (phân tích -> tạo hệ thống thiết kế -> tìm kiếm chi tiết -> hướng dẫn stack)
- Quy tắc tích hợp cho quy trình `tungnt-ai-skills` hiện có
- Tham chiếu tìm kiếm (domain, stack, từ khóa)
- Quy tắc chung cho UI chuyên nghiệp
- Danh sách kiểm tra trước giao
