---
name: prompt-leverage
description: Sử dụng khi người dùng viết rõ skill:prompt-leverage hoặc yêu cầu cải thiện, nâng cấp, làm rõ, tạo mẫu hoặc áp dụng một prompt thô trước khi thực thi
---

# Đòn Bẩy Prompt

Nâng cấp prompt thô thành prompt thực thi rõ ràng hơn mà không thay đổi ý định gốc của người dùng. Đây là bộ tiền xử lý thủ công, không phải thay thế cho quy trình `tungnt-ai-skills` thông thường.

Kỹ năng này được tham khảo từ các ví dụ prompt-leverage được liên kết, nhưng hợp đồng kích hoạt thủ công và tích hợp quy trình làm việc được duy trì như một phần của dự án này.

## Chỉ Kích Hoạt Thủ Công

Chỉ sử dụng kỹ năng này khi người dùng gọi rõ ràng với `skill:prompt-leverage` hoặc trực tiếp yêu cầu cải thiện, nâng cấp, làm rõ, tạo mẫu hoặc áp dụng prompt.

Không sử dụng kỹ năng này chỉ vì nhiệm vụ hiện tại mơ hồ, phức tạp hoặc thiếu ngữ cảnh. Nếu người dùng không yêu cầu rõ ràng đòn bẩy prompt, tiếp tục quy trình `using-tungnt-ai-skills` thông thường.

## Hợp Đồng Kích Hoạt

| Hình thức người dùng | Ý nghĩa |
| --- | --- |
| `skill:prompt-leverage prompt: <text>` | Chỉ nâng cấp prompt. Không thực thi. |
| `skill:prompt-leverage apply prompt: <text>` | Nâng cấp prompt, sau đó thực thi prompt đã nâng cấp qua quy trình thông thường. |
| `skill:prompt-leverage template prompt: <text>` | Chuyển đổi prompt thành mẫu fill-in-the-blank tái sử dụng. |
| `skill:prompt-leverage hook prompt: <text>` | Mô tả hook tiền xử lý prompt cho hình dạng prompt được yêu cầu. |

Nếu người dùng dùng `prompt:` không có `apply`, trả về prompt đã nâng cấp và dừng. Nếu người dùng dùng `apply`, hiển thị prompt đã nâng cấp ngắn, sau đó khởi động lại chọn quy trình làm việc thông thường từ `using-tungnt-ai-skills`.

## Quy Trình

1. Đọc prompt thô và xác định công việc thực sự cần làm.
2. Suy ra loại nhiệm vụ: code, nghiên cứu, viết, phân tích, lập kế hoạch, đánh giá hoặc viết kỹ năng.
3. Xây dựng lại prompt với các khối khung trong `references/framework.md`.
4. Giữ kết quả cân đối; không biến yêu cầu đơn giản thành đặc tả khổng lồ.
5. Trả về chế độ đầu ra đã chọn. Chỉ thực thi khi người dùng yêu cầu rõ ràng `apply`.

## Quy Tắc Chuyển Đổi

- Giữ mục tiêu, ràng buộc và giọng văn của người dùng trừ khi xung đột.
- Ưu tiên thêm cấu trúc còn thiếu hơn là viết lại toàn bộ về mặt phong cách.
- Chỉ thêm yêu cầu ngữ cảnh khi chúng cải thiện sự đúng đắn.
- Chỉ thêm quy tắc công cụ khi việc dùng công cụ ảnh hưởng thực tế đến sự đúng đắn.
- Thêm tiêu chí xác minh và hoàn thành cho nhiệm vụ phi đơn giản.
- Giữ prompt đủ gọn để thực tế khi dùng lặp lại.
- Giữ prompt nâng cấp tương thích với các cổng quy trình `tungnt-ai-skills` hiện có.

## Khối Khung

Sử dụng các khối này một cách chọn lọc:

- `Objective`: nêu nhiệm vụ và thành công trông như thế nào.
- `Context`: liệt kê nguồn, file, ràng buộc, chưa biết và ranh giới sự thật.
- `Work Style`: đặt độ sâu, độ rộng, sự cẩn trọng và kỳ vọng nguyên lý đầu tiên.
- `Tool Rules`: nêu khi nào công cụ, duyệt web hoặc kiểm tra file là bắt buộc.
- `Output Contract`: định nghĩa cấu trúc, định dạng, giọng văn và mức độ chi tiết.
- `Verification`: yêu cầu kiểm tra sự đúng đắn, trường hợp biên và phương án thay thế.
- `Done Criteria`: định nghĩa khi nào agent nên dừng.

Sử dụng `scripts/augment_prompt.py` khi việc viết lại qua quyết định đầu tiên có giúp ích.

## Hành Động Apply

Khi người dùng yêu cầu rõ ràng `apply`:

1. Tạo prompt đã nâng cấp.
2. Coi prompt đã nâng cấp là yêu cầu đang hoạt động của người dùng.
3. Khởi động lại chọn quy trình làm việc thông thường từ `using-tungnt-ai-skills`.
4. Chọn kỹ năng quy trình đúng, như `quick-dev`, `brainstorming`, `investigation`, `writing-plans`, `requesting-code-review` hoặc `writing-skills`.
5. Thêm ống kính lĩnh vực chỉ sau khi kỹ năng quy trình được chọn.

Kỹ năng này không được bỏ qua cổng phê duyệt brainstorming, cổng phạm vi quick-dev, phân cấp bằng chứng investigation, luồng đánh giá hoặc kỳ vọng RED/GREEN writing-skills.

## Đặc Tả Hook

Khi người dùng yêu cầu `hook`, tạo mẫu cho bộ tiền xử lý prompt có thể tự động nhận diện prompt đáng nâng cấp. Không cài đặt, bật hoặc ngụ ý hook tự động trừ khi người dùng yêu cầu rõ ràng triển khai.

Đặc tả hook nên định nghĩa:

1. **Đầu Vào:** prompt thô, tải trọng tin nhắn hoặc bao yêu cầu mà hook nhận.
2. **Mẫu kích hoạt:** điều kiện kích hoạt đòn bẩy prompt tự động.
3. **Mẫu không kích hoạt:** điều kiện phải đi qua không đổi.
4. **Phân loại:** loại nhiệm vụ, mức rủi ro và có yêu cầu xác nhận trước khi thực thi không.
5. **Chuyển đổi:** khối khung nào thêm, bỏ qua hoặc giữ gọn.
6. **Đầu Ra:** prompt đã nâng cấp cộng tóm tắt tùy chọn về cấu trúc đã chèn.
7. **Quy tắc an toàn:** `prompt` mode không bao giờ thực thi; chỉ `apply` rõ ràng mới tiếp tục vào quy trình thông thường.

Sử dụng mẫu kích hoạt này cho prompt mơ hồ hoặc chưa đủ đặc tả:

| Tín hiệu | Kích hoạt khi |
| --- | --- |
| Thiếu mục tiêu | Prompt yêu cầu "sửa", "cải thiện", "tạo", "xử lý", "làm điều này" hoặc "giúp" không có tiêu chí thành công rõ ràng. |
| Thiếu ngữ cảnh | Prompt tham chiếu file, code, tài liệu, dữ liệu, ảnh chụp màn hình hoặc công việc trước không nêu nguồn hoặc ranh giới. |
| Thiếu hợp đồng đầu ra | Prompt không nêu định dạng, độ sâu, giọng văn, tác phẩm hoặc mức độ chi tiết mong đợi. |
| Thiếu xác minh | Prompt yêu cầu code, nghiên cứu, đánh giá, lập kế hoạch hoặc đầu ra rủi ro cao không có kiểm tra hoặc tiêu chí hoàn thành. |
| Rủi ro không có rào chắn | Prompt chạm bảo mật, tiền, mất dữ liệu, sản xuất, pháp lý, y tế, hành vi API công khai hoặc thay đổi quy trình rộng mà không có ràng buộc. |

Sử dụng mẫu không kích hoạt này để tránh vượt quyền:

| Tín hiệu | Đi qua khi |
| --- | --- |
| Lệnh đơn giản | Người dùng yêu cầu lệnh shell hiện tại, tra cứu nhanh, viết lại trực tiếp, dịch hoặc thay đổi định dạng với đủ chi tiết. |
| Đã có cấu trúc | Prompt đã có mục tiêu, ngữ cảnh, hợp đồng đầu ra, xác minh và tiêu chí hoàn thành. |
| Không nâng cấp rõ ràng | Người dùng yêu cầu không viết lại, không làm rõ hoặc thực thi chính xác như đã viết. |
| Kích hoạt quy trình | Prompt ánh xạ rõ ràng đến kỹ năng quy trình `tungnt-ai-skills` hiện có và không yêu cầu tiền xử lý prompt. |

Quyết định hook khuyến nghị:

```text
if explicit skill:prompt-leverage:
  run requested prompt-leverage mode
elif automatic hook is enabled and activation pattern matches and non-trigger pattern does not match:
  upgrade prompt and ask for confirmation before execution
else:
  continue unchanged
```

## Thanh Chất Lượng

Trước khi hoàn tất, kiểm tra prompt đã nâng cấp:

- vẫn khớp với ý định gốc
- không thêm nghi thức không cần thiết
- bao gồm mức xác minh đúng cho nhiệm vụ
- cho agent định nghĩa hoàn thành rõ ràng
- không thực thi im lặng trừ khi `apply` rõ ràng

Nếu prompt đã đủ mạnh, nói vậy và chỉ chỉnh sửa tối thiểu.

## Sai Lầm Phổ Biến

| Sai lầm | Sửa |
| --- | --- |
| Kích hoạt trên bất kỳ yêu cầu mơ hồ nào | Chỉ kích hoạt trên ngôn ngữ nâng cấp prompt rõ ràng hoặc `skill:prompt-leverage`. |
| Coi `prompt:` là thực thi | Chỉ trả prompt đã nâng cấp trừ khi có `apply`. |
| Bỏ qua quy trình hiện có sau `apply` | Khởi động lại từ `using-tungnt-ai-skills` và chọn kỹ năng quy trình thông thường. |
| Quá cụ thể hóa prompt đơn giản | Chỉ thêm khối cải thiện thực thi thực tế. |