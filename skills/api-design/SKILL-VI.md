---
name: api-design
description: Sử dụng khi kỹ năng brainstorming được kích hoạt và gọi tới kỹ năng, kỹ năng là một ống kính hỗ trợ cho brainstorming đánh giá, thiết kế, chỉnh sửa khi làm việc với API
---

# Thiết Kế API

## Tổng Quan

Thiết kế hợp đồng trước khi triển khai. Một API tốt tập trung vào tài nguyên, có thể dự đoán, có thể thử lại, có thể chẩn đoán và ổn định theo thời gian; mọi hành vi có thể quan sát được đều có thể trở thành phụ thuộc của khách hàng.

Sử dụng tiêu chuẩn API cục bộ nghiêm ngặt hơn trước.

## Khi Nào Sử Dụng

- Tạo hoặc thay đổi endpoint REST/HTTP hoặc hợp đồng dịch vụ công khai.
- Định nghĩa schema request, response, error, phân trang, lọc, sắp xếp, hoặc tương tác với SDK.
- Lập kế hoạch phiên bản hóa, ngừng hỗ trợ, tính idempotent, thử lại, hoạt động chạy lâu dài hoặc tương thích.
- Đánh giá API để tìm thay đổi phá vỡ hoặc hành vi không nhất quán.

Không sử dụng cho các trợ lý riêng trừ khi chúng vượt qua ranh giới nhóm, gói, quy trình hoặc triển khai.

## Kích Hoạt Theo Quy Trình Lĩnh Vực

<HARD-GATE>
CHỈ KÍCH HOẠT khi kỹ năng `brainstorming` gọi tới. KHÔNG kích hoạt tự động kỹ năng, không kích hoạt sau các kỹ năng khác ngoại trừ kỹ năng `brainstorming`.

NẾU không phải `brainstorming` dừng lại và trả lại thông báo "Kỹ năng api-design không được kích hoạt do kỹ năng khác không phải `brainstorming` gọi tới."

NẾU kỹ năng `brainstorming` gọi tới để yêu cầu hỗ trợ thì hãy thông báo `Đang dùng kỹ năng api-design để làm việc...`

NẾU người dùng tự kích hoạt bằng cách gọi trực tiếp `/api-design` thì chỉ làm đúng nhiệm vụ mà kỹ năng lĩnh vực phụ trách và đưa gợi ý cho người dùng.

```plaintext
Gợi ý: Để tiếp tục, hãy dùng:

/brainstorming Dựa trên phần phân tích từ kỹ năng /api-design ở trên, tiếp tục xây dựng spec và kế hoạch triển khai chi tiết để thực hiện.
```

TUYỆT ĐỐI KHÔNG CODE, KHÔNG SỬA FILE khi dùng kỹ năng `api-design`.
</HARD-GATE>

Đây là kỹ năng lĩnh vực cho thiết kế hợp đồng API. Nó cung cấp đánh giá thiết kế API bên trong quy trình làm việc đã chọn; nó không chọn hoặc thay thế `brainstorming` hoặc các kỹ năng đánh giá mà sẽ hỗ trợ `brainstorming` đưa ra nhận định cụ thể hơn trong việc đưa ra quyết định.

Gọi kỹ năng này trong quy trình làm việc chỉ khi công việc liên quan đến thiết kế, tạo, cập nhật hoặc đánh giá hợp đồng REST/HTTP API:

- Trong `brainstorming`, sử dụng khi người dùng yêu cầu tạo hoặc thay đổi API, endpoint, schema request, schema response, ngữ nghĩa lỗi, phân trang, lọc, sắp xếp, phiên bản hóa, tính idempotent, hành vi thử lại hoặc hành vi tương thích.
- Trong quá trình thực thi, sử dụng như ràng buộc khi nhiệm vụ kế hoạch triển khai hoặc thay đổi hành vi hợp đồng API; nếu triển khai phát hiện lỗ hổng hợp đồng, dừng lại và thông báo lại cho `brainstorming` để phân tích lỗ hổng và điều chỉnh lại.
- Trong quá trình đánh giá, sử dụng như ống kính API khi diff thay đổi endpoint, schema, lỗi, phân trang, thử lại, tính idempotent, phiên bản hóa, xác thực hoặc tương thích.

Không gọi kỹ năng này cho logic backend chung, trợ lý riêng, thay đổi chỉ liên quan đến cơ sở dữ liệu, công việc chỉ liên quan đến UI hoặc nhiệm vụ triển khai không hiển thị hoặc thay đổi hợp đồng API.

## Phủ Định Kịch Bản RED

Đây là các kịch bản RED mà kỹ năng này phải ngăn chặn:

| Kích hoạt | Thất bại cơ sở | Đối phó kỹ năng |
| --- | --- | --- |
| "Chỉ thêm API CRUD đơn giản nhanh chóng" | URL bằng động từ, thiết kế ưu tiên handler, không phân trang | Tài nguyên ưu tiên hợp đồng, ngữ nghĩa phương thức, quy tắc danh sách |
| "Phát hành ngay, ghi lỗi sau" | Exception thô hoặc dạng lỗi hỗn hợp | Một dạng lỗi có cấu trúc và mã máy ổn định |
| "Chúng ta có thể thay đổi trường này; chỉ ứng dụng của mình dùng" | Thay đổi phá vỡ trường/loại/bắt buộc | Tiến hóa cộng dồn và đánh giá tương thích |
| "POST được; khách hàng có thể thử lại thủ công" | Tác dụng phụ trùng lặp khi thử lại | Yêu cầu tính idempotent/khả năng lặp lại |
| "API bên thứ ba đã xác thực việc này" | Dữ liệu bên ngoài không đáng tin vào logic | Xác thực biên cho tất cả đầu vào bên ngoài |

## Mẫu Cốt Lõi

| Vấn đề | Quy tắc |
| --- | --- |
| Tài nguyên | Sử dụng danh từ số nhiều rõ ràng và URL dễ đọc; tránh đường dẫn động từ như `/createTask`. |
| Hợp đồng | Định nghĩa schema request, response và error có kiểu trước khi viết handler. |
| Phương thức | `GET` đọc, `PATCH` cập nhật một phần, `PUT` thay thế, `POST` tạo tài nguyên theo tên dịch vụ hoặc hành động, `DELETE` xóa. |
| Thử lại | Đảm bảo tất cả hoạt động an toàn khi thử lại; sử dụng khóa lặp lại hoặc tương đương cho hoạt động `POST` rủi ro. |
| Danh sách | Thêm phân trang từ v1. Lọc và sắp xếp phải kết hợp được với mỗi trang và `nextLink`. |
| Xác thực | Xác thực tham số đường dẫn, tham số query, header, body JSON và phản hồi bên thứ ba tại biên. |
| Lỗi | Trả về một dạng có cấu trúc ở mọi nơi. Mã lỗi máy đọc được ở cấp cao nhất là hợp đồng. |
| Tiến hóa | Thêm trường tùy chọn hoặc giá trị enum có thể mở rộng; không xóa trường, thay đổi ý nghĩa/loại hoặc làm cho dữ liệu tùy chọn trở thành bắt buộc. |
| Đồng thời | Sử dụng ETag/If-Match hoặc kiểm tra phiên bản tương đương khi cập nhật có thể xung đột. |
| Công việc bất đồng bộ | Trả về `202 Accepted` với URL theo dõi trạng thái; bộ theo dõi hỗ trợ `GET`, trạng thái và `retry-after` khi chưa hoàn thành. |

## Ví Dụ

```http
GET /tasks?pageSize=50&continuationToken=abc&filter=status eq 'open'&orderby=createdAt desc
200 OK
{
  "value": [{ "id": "task_123", "title": "Review contract", "status": "open", "etag": "\"67ab43\"" }],
  "nextLink": "/tasks?pageSize=50&continuationToken=def&filter=status eq 'open'&orderby=createdAt desc"
}

PATCH /tasks/task_123
If-Match: "67ab43"
Content-Type: application/merge-patch+json
{ "title": "Review API contract" }

400 Bad Request
x-ms-error-code: InvalidTaskTitle
{ "error": { "code": "InvalidTaskTitle", "message": "Task title must be 1-120 characters.", "target": "title" } }
```

Tại sao hoạt động này: danh sách bị giới hạn, bộ lọc và thứ tự sắp xếp tồn tại trong `nextLink`, ID là chuỗi mờ, `PATCH` là một phần, đồng thời là rõ ràng, và khách hàng phân nhánh dựa trên mã lỗi ổn định thay vì phân tích văn bản.

## Đánh Giá Tương Thích

Trước khi phát hành, trả lời:

- Hành vi quan sát được nào mà khách hàng có thể đã phụ thuộc?
- Khách hàng hiện tại có thể áp dụng dịch vụ hoặc phiên bản SDK mới mà không cần thay đổi code không?
- Các trường mới có tùy chọn và an toàn để khách hàng cũ bỏ qua không?
- Các chuỗi kiểu enum có thể mở rộng không, hay giá trị chưa biết sẽ phá vỡ khách hàng được tạo?
- Mọi đường dẫn thử lại có an toàn khỏi tác dụng phụ trùng lặp không?

## Sai Lầm Phổ Biến

| Sai lầm | Sửa |
| --- | --- |
| Bắt đầu từ code handler | Viết hợp đồng endpoint trước. |
| Trả về exception thô | Áp vào dạng lỗi chung và mã ổn định. |
| Sử dụng `POST` vì tiện lợi | Sử dụng ngữ nghĩa tài nguyên; làm cho `POST` lặp lại được khi cần. |
| Thêm trường bắt buộc sau v1 | Thêm trường tùy chọn, giá trị mặc định hoặc hoạt động mới. |

## Tín Hiệu Cảnh Báo

- URL bắt đầu bằng động từ, casing đường dẫn không nhất quán hoặc tên tài nguyên không rõ ràng. |
- Danh sách endpoint không có phân trang. |
- Dạng thành công hoặc lỗi khác nhau giữa các endpoint. |
- Đầu vào bên ngoài hoặc phản hồi bên thứ ba được sử dụng mà không xác thực. |
| Trường bị xóa, trường được giải thích lại, giá trị enum bị thu hẹp hoặc dữ liệu bắt buộc mới. |
| Không có tính idempotent, phiên bản hóa, ngừng hỗ trợ hoặc kế hoạch di chuyển. |
