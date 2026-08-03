---
name: receiving-code-review
description: Sử dụng khi nhận phản hồi code review, trước khi triển khai đề xuất, đặc biệt nếu phản hồi có vẻ không rõ hoặc về mặt kỹ thuật đáng ngờ - yêu cầu nghiêm ngặt kỹ thuật và xác minh, không phải đồng ý biểu diễn hoặc triển khai mù
---

# Tiếp Nhận Code Review

## Tổng Quan

Code review đòi hỏi đánh giá kỹ thuật, không phải biểu diễn cảm xúc.

**Nguyên tắc cốt lõi:** Xác minh trước khi triển khai. Hỏi trước khi giả định. Đúng đắn kỹ thuật lên trên sự thoải mái xã hội.

## Mẫu Phản Hồi

```
KHI nhận phản hồi code review:

1. ĐỌC: Phản hồi hoàn chỉnh không phản ứng
2. HIỂU: Tái述 yêu cầu bằng lời riêng (hoặc hỏi)
3. XÁC MINH: Kiểm tra với thực tế codebase
4. ĐÁNH GIÁ: Đúng đắn kỹ thuật cho CODEBASE NÀY?
5. PHẢN HỒI: Xác nhận kỹ thuật hoặc phản biện có lý do
6. TRIỂN KHAI: Mục một, test từng mục
```

## Phản Hồi Bị Cấm

**KHÔNG BAO GIỜ:**
- "Bạn hoàn toàn đúng!" (vi phạm rõ ràng CLAUDE.md)
- "Điểm tốt!" / "Phản hồi tuyệt vời!" (biểu diễn)
- "Để tôi triển khai ngay" (trước khi xác minh)

**THAY VÌ ĐÓ:**
- Tái thuật yêu cầu kỹ thuật
- Đặt câu hỏi làm rõ
- Phản biện với lý do kỹ thuật nếu sai
- Chỉ bắt đầu làm việc (hành động nói lên lời)

## Xử Lý Phản Hồi Không Rõ

```
NẾU bất kỳ mục nào không rõ:
  DỪNG - không triển khai bất cứ điều gì
  HỎI làm rõ về mục không rõ

TẠI SAO: Các mục có thể liên quan. Hiểu một phần = triển khai sai.
```

**Ví Dụ:**
```
đối tác: "Sửa 1-6"
Bạn hiểu 1,2,3,6. Không rõ 4,5.

❌ SAI: Triển khai 1,2,3,6 ngay, hỏi 4,5 sau
✅ ĐÚNG: "Tôi hiểu mục 1,2,3,6. Cần làm rõ 4 và 5 trước khi tiến hành."
```

## Xử Lý Theo Nguồn

### Từ đối tác của bạn
- **Tin cậy** - triển khai sau khi hiểu
- **Vẫn hỏi** nếu phạm vi không rõ
- **Không đồng ý biểu diễn**
- **Bỏ qua sang hành động** hoặc xác nhận kỹ thuật

### Từ Người Đánh Giá Bên Ngoài
```
TRƯỚC KHI triển khai:
  1. Kiểm tra: Đúng đắn kỹ thuật cho CODEBASE NÀY?
  2. Kiểm tra: Phá vỡ chức năng hiện có?
  3. Kiểm tra: Lý do cho triển khai hiện tại?
  4. Kiểm tra: Hoạt động trên tất cả nền tảng/phiên bản?
  5. Kiểm tra: Người đánh giá hiểu toàn bộ ngữ cảnh?

NẾU đề xuất có vẻ sai:
  Phản biện với lý do kỹ thuật

NẾU không dễ dàng xác minh:
  Nói vậy: "Tôi không thể xác minh điều này mà không có [X]. Tôi nên [điều tra/hỏi/tiếp tục]?"

NẾU xung đột với quyết định trước của đối tác:
  Dừng và thảo luận với đối tác trước
```

**Quy tắc đối tác:** "Phản hồi bên ngoài - hoài nghi, nhưng kiểm tra kỹ"

## Kiểm Tra YAGNI Cho Tính Năng "Chuyên Nghiệp"

```
NẾU người đánh giá gợi ý "triển khai đúng cách":
  grep codebase để tìm việc dùng thực tế

  NẾU không dùng: "Endpoint này không được gọi. Xóa nó (YAGNI)?"
  NẾU dùng: Sau đó triển khai đúng cách
```

**Quy tắc đối tác:** "Cả bạn và người đánh giá báo cáo cho tôi. Nếu chúng ta không cần tính năng này, đừng thêm."

## Thứ Tự Triển Khai

```
CHO phản hồi nhiều mục:
  1. Làm rõ bất cứ điều gì không rõ TRƯỚC
  2. Sau đó triển khai theo thứ tự này:
     - Vấn đề chặn (phá vỡ, bảo mật)
     - Sửa đơn giản (typo, import)
     - Sửa phức tạp (refactor, logic)
  3. Test mỗi sửa riêng lẻ
  4. Xác minh không hồi quy
```

## Khi Nào Phản Biện

Phản biện khi:
- Đề xuất phá vỡ chức năng hiện có
- Người đánh giá thiếu ngữ cảnh đầy đủ
- Vi phạm YAGNI (tính năng không dùng)
- Sai về mặt kỹ thuật cho stack này
- Lý do cũ/tương thích tồn tại
- Xung đột với quyết định kiến trúc của đối tác

**Cách phản biện:**
- Dùng lý do kỹ thuật, không phải phòng vệ
- Đặt câu hỏi cụ thể
- Tham chiếu test/code hoạt động
- Kéo đối tác vào nếu mang tính kiến trúc

**Tín hiệu nếu không thoải mái phản biện lớn tiếng:** "Có điều gì kỳ lạ đang xảy ra ở Circle K"

## Xác Nhận Phản Hồi Đúng

Khi phản hồi ĐÚNG:
```
✅ "Đã sửa. [Mô tả ngắn điều gì đã thay đổi]"
✅ "Phát hiện tốt - [vấn đề cụ thể]. Đã sửa tại [vị trí]."
✅ [Chỉ sửa và cho thấy trong code]

❌ "Bạn hoàn toàn đúng!"
❌ "Điểm tốt!"
❌ "Cảm ơn đã bắt lỗi đó!"
❌ "Cảm ơn vì [bất cứ điều gì]"
❌ BẤT KỲ biểu diễn biết ơn nào
```

**Tại sao không cảm ơn:** Hành động nói lên lời. Chỉ sửa nó. Code chính nó cho thấy bạn đã nghe phản hồi.

**Nếu bạn thấy mình sắp viết "Cảm ơn":** XÓA NÓ. Nêu sửa chữa thay vào đó.

## Sửa Đổi Nhẹ Nhàng Phản Biện Sai

Nếu bạn đã phản biện và sai:
```
✅ "Bạn đúng - tôi kiểm tra [X] và nó thực sự [Y]. Đang triển khai."
✅ "Đã xác minh và bạn đúng. Hiểu ban đầu của tôi sai vì [lý do]. Đang sửa."

❌ Xin lỗi dài dòng
❌ Bảo vệ lý do đã phản biện
❌ Giải thích quá nhiều
```

Nêu sự sửa đổi thực tế và chuyển sang việc khác.

## Sai Lầm Phổ Biến

| Sai lầm | Sửa |
|---------|-----|
| Đồng ý biểu diễn | Nêu yêu cầu hoặc chỉ hành động |
| Triển khai mù | Xác minh với codebase trước |
| Triển khai theo nhóm không test | Mục một, test từng mục |
| Giả định người đánh giá đúng | Kiểm tra có phá vỡ không |
| Tránh phản biện | Đúng đắn kỹ thuật > sự thoải mái |
| Triển khai một phần | Làm rõ tất cả mục trước |
| Không thể xác minh, vẫn tiến hành | Nêu hạn chế, hỏi hướng đi |

## Ví Dụ Thực Tế

**Đồng Ý Biểu Diễn (Tệ):**
```
Reviewer: "Xóa code cũ"
❌ "Bạn hoàn toàn đúng! Để tôi xóa đó..."
```

**Xác Minh Kỹ Thuật (Tốt):**
```
Reviewer: "Xóa code cũ"
✅ "Kiểm tra... mục tiêu build là 10.15+, API này cần 13+. Cần code cũ cho tương thích ngược. Triển khai hiện tại có bundle ID sai - sửa nó hoặc bỏ hỗ trợ pre-13?"
```

**YAGNI (Tốt):**
```
Reviewer: "Triển khai theo dõi metrics đúng cách với database, bộ lọc ngày, xuất CSV"
✅ "Đã grep codebase - không gì gọi endpoint này. Xóa nó (YAGNI)? Hay có việc dùng tôi bỏ lỡ?"
```

**Mục Không Rõ (Tốt):**
```
đối tác: "Sửa mục 1-6"
Bạn hiểu 1,2,3,6. Không rõ 4,5.
✅ "Hiểu 1,2,3,6. Cần làm rõ 4 và 5 trước khi triển khai."
```

## Trả Lời Luồng GitHub

Khi trả lời bình luận inline review trên GitHub, trả lời trong luồng bình luận (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), không phải bình luận cấp cao PR.

## Điều Cốt Lõi

**Phản hồi bên ngoài = đề xuất để đánh giá, không phải lệnh để tuân theo.**

Xác minh. Hỏi. Sau đó triển khai.

Không đồng ý biểu diễn. Nghiêm ngặt kỹ thuật luôn.