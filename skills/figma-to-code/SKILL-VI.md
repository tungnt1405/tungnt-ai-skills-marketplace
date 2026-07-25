---
name: figma-to-code
description: Dịch chính xác một khung Figma, thành phần, hoặc instance được chọn thành code frontend sẵn sàng sản xuất với trích xuất xác định, ánh xạ token thiết kế, tái sử dụng thành phần và xác nhận trực quan. Chỉ sử dụng khi người dùng gọi rõ ràng figma-to-code, yêu cầu triển khai code UI từ Figma, hoặc khi ba-spec cần hướng dẫn triển khai Figma cho đặc tả tính năng liên quan đến Figma. Không sử dụng cho đặc tả BA-riêng, nhật ký bằng chứng Figma hoặc chỉnh sửa canvas Figma.
---

# Trung Thực Triển Khai Figma

## Mục Đích

Triển khai UI frontend từ Figma với độ trung thực hình ảnh 1:1 có thể lặp lại. Agent không được code trực tiếp từ dump MCP thô. Phải tạo ảnh chụp thiết kế xác định và IR chuẩn hóa, sau đó tạo code từ IR đó và xác nhận kết quả so với ảnh chụp Figma.

## Khi Nào Sử Dụng

Sử dụng kỹ năng này chỉ khi:

- Người dùng gọi rõ ràng `figma-to-code`.
- Kết quả là code ứng dụng, không phải chỉnh sửa bên trong Figma.
- Người dùng yêu cầu triển khai, tạo, chuyển đổi hoặc ghép một thiết kế/thành phần/màn hình/modal Figma.
- `ba-spec` đã hoạt động, đầu vào liên quan đến Figma và chuyển giao nhà phát triển cần hướng dẫn triển khai UI từ nguồn Figma.
- Độ trung thực hình ảnh, khoảng cách chính xác, kiểu chữ, màu sắc và tính nhất quán bố cục quan trọng.

Không sử dụng kỹ năng này khi:

- Yêu cầu chỉ là tạo đặc tả BA-riêng, ghi nhật ký bằng chứng Figma hoặc chuyển giao PO/QA không có hướng dẫn code UI.
- Người dùng muốn tạo hoặc sửa đổi node trong Figma.
- Đầu vào chỉ là mô tả UI mơ hồ không có nguồn Figma.
- Người dùng chỉ yêu cầu phê bình thiết kế hoặc thay đổi văn bản.

## Quy Tắc Cứng

1. Làm việc từ chính xác một node mục tiêu: `FRAME`, `COMPONENT`, `COMPONENT_SET` hoặc `INSTANCE` đã chọn.
2. Không bao giờ triển khai từ kết quả `get_document` đầy đủ trừ khi gỡ lỗi. Dump tài liệu đầy đủ thường bao gồm khung ngang hàng, biến thể ngoài canvas và lớp ẩn.
3. Luôn tạo thư mục ảnh chụp trước khi code.
4. Luôn chạy `scripts/extract_figma_ir.py` trước khi agent đọc kết quả MCP thô chi tiết.
5. Tạo code từ `figma-ir.json`, không phải trực tiếp từ JSON MCP thô.
6. Coi ảnh chụp Figma là nguồn sự thật hình ảnh cho xác nhận, không phải nguồn triển khai duy nhất.
7. Bỏ qua node ẩn, node độ mờ bằng không, khung ngang hàng ngoài canvas và node bên ngoài ranh giới mục tiêu trừ khi cần làm overlay/tài nguyên.
8. Tái sử dụng thành phần dự án và token thiết kế trước khi tạo nguyên thủy HTML/CSS.
9. Chỉ sử dụng định vị tuyệt đối cho biểu tượng, đồ họa trang trí và overlay có chủ ý. Sử dụng flex/grid cho form, danh sách, thẻ, header, footer và bố cục chính.
10. Xác nhận UI hiển thị với so sánh ảnh chụp trước khi tuyên bố hoàn thành.
11. Trên Windows, chạy lệnh Python với `python -X utf8`.
12. Không kiểm tra JSON Figma thô với `json.load(open(path))`. Sử dụng `scripts/extract_figma_ir.py`, hoặc sử dụng `Path(path).read_text(encoding="utf-8-sig")` cho bất kỳ kiểm tra JSON nhanh nào.
13. Lấy màu phẳng, văn bản, font, kích thước, bán kính và tọa độ từ JSON (`styles.fills`/`styles.strokes`/`characters`/`fontFamily`...). Không ước lượng chúng từ ảnh chụp khi JSON có chúng.
14. Sử dụng ảnh chụp để PHỤC HỒI những gì JSON không thể diễn tả: gradient (JSON chỉ một màu phẳng), `styles:{}` trống trên node nhìn thấy được và `fills:"mixed"` (nhiều màu trong một node, ví dụ label + `*` đỏ). Xem `references/color-and-icon-extraction.md`.
15. Biểu tượng: JSON cung cấp HEX stroke/fill nhưng không có đường dẫn `d` sử dụng được. Hoặc xuất node biểu tượng dưới dạng SVG (`save_screenshots` `format:"SVG"`) để lấy đường dẫn chính xác, hoặc tạo lại biểu tượng đường nét phù hợp và tô màu từ hex JSON. Ghi lại lựa chọn.
16. Chụp ảnh màn hình với `save_screenshots` vào đĩa (PNG cho kiểm tra hình ảnh + SVG cho đường dẫn biểu tượng). Tránh `get_screenshot` cho khung đầy đủ — base64 nội tuyến của nó thường vượt quá giới hạn token của kết quả công cụ.

## Quy Trình Bắt Buộc

### 1. Xác định mục tiêu

Nếu URL Figma được cung cấp, trích xuất chính xác `node-id`. Nếu chỉ có Figma desktop, gọi công cụ chọn trước.

Từ chối mục tiêu mơ hồ:

- Nhiều node được chọn cấp cao nhất.
- Gốc trang/canvas/tài liệu thay vì khung/thành phần.
- Khung cha chứa nhiều màn hình không liên quan.

Nếu có mơ hồ, chọn khung hoặc thành phần được chọn cụ thể nhất. Không thu thập thông tin ngang hàng không liên quan.

### 2. Lấy ngữ cảnh thiết kế tập trung

Trình tự MCP ưa thích cho công cụ kiểu `figma-mcp-go`:

1. `get_selection`
2. `get_design_context` cho node đã chọn, dạng gọn trước
3. `get_node` cho node đã chọn chỉ khi cần chi tiết sâu hơn
4. `get_styles`
5. `get_variable_defs`
6. `get_fonts`
7. `export_tokens`
8. `save_screenshots` cho cùng node — ghi PNG (hình ảnh) + SVG (đường dẫn biểu tượng) vào thư mục ảnh chụp. Ưu tiên cái này hơn `get_screenshot`, vì base64 nội tuyến của nó thường vượt quá giới hạn token cho khung đầy đủ.

Tránh `get_document` cho triển khai. Nếu phản hồi bị cắt, lấy node con nhỏ hơn theo ID thay vì mở rộng phạm vi.

### 3. Lưu ảnh chụp xác định

Tạo:

```text
.design-snapshots/<feature-name>/
  raw-output.json
  screenshot.png
  tokens.json
  styles.json
  fonts.json
  component-registry.json
  figma-ir.json
```

### 4. Chạy trích xuất trước khi đọc kết quả thô

Chạy:

```bash
python -X utf8 skills/figma-to-code/scripts/extract_figma_ir.py \
  --input .design-snapshots/<feature-name>/raw-output.json \
  --out .design-snapshots/<feature-name>/figma-ir.json \
  --target-node-id <nodeId>
```

Nếu ID node mục tiêu không rõ, chạy trích xuất không có `--target-node-id` để nhận tổng quan ứng viên, sau đó chạy lại với mục tiêu đã chọn.

Trên Windows, không bao giờ kiểm tra JSON với mã hóa mặc định:

```bash
# Không sử dụng cái này:
python -c "import json; data=json.load(open('.design-snapshots/<feature-name>/raw-output.json')); print(data.keys())"

# Sử dụng cái này thay thế:
python -X utf8 -c "import json, pathlib; p=pathlib.Path(r'.design-snapshots/<feature-name>/raw-output.json'); data=json.loads(p.read_text(encoding='utf-8-sig')); c=(data.get('context') or [data])[0]; print(c.get('id'), c.get('type'), c.get('name'))"
```

### 5. Kiểm tra tổng quan IR

Trước khi code, chỉ đọc:

- `summary`
- `layout.columns`
- `layout.sections`
- `tokens`
- `semanticNodes`
- `warnings`

Chỉ mở kết quả thô khi IR có cảnh báo yêu cầu xác minh nguồn.

### 6. Ánh xạ với quy ước dự án

Kiểm tra kho lưu trữ trước khi tạo nguyên thủy mới:

- Các thành phần sẵn có `Button`, `Input`, `Select`, `Dialog`, `Modal`, `Card`, `Table`, `Typography`, `Icon`, `FormField`.
- Tên biến CSS, cấu hình Tailwind, file token thiết kế, nhà cung cấp chủ đề và import font.
- Quy ước định tuyến, lấy dữ liệu, xác thực và quản lý trạng thái.

Sử dụng `examples/component-registry.example.json` làm định dạng registry nếu repo chưa có.

### 7. Tạo code

Ưu tiên triển khai:

1. Cấu trúc ngữ nghĩa: modal/header/body/footer, phần form, hàng form, trường, hành động.
2. Bố cục: cột, hàng, khoảng cách, padding, chiều rộng/cao từ IR.
3. Kiểu chữ: font family, kích thước, trọng lượng, chiều cao dòng.
4. Màu sắc, đường viền, bán kính, đổ bóng, độ mờ — giá trị phẳng từ JSON; giải quyết gradient / `styles:{}` trống / `fills:"mixed"` từ ảnh chụp theo `references/color-and-icon-extraction.md`.
5. Tài nguyên/Biểu tượng: xuất node biểu tượng dưới dạng SVG cho đường dẫn chính xác, hoặc tạo lại biểu tượng đường nét phù hợp tô màu từ hex JSON (JSON có màu biểu tượng nhưng không có đường dẫn `d` sử dụng được).
6. Hành vi đáp ứng từ ràng buộc/mẫu auto-layout.

Không sao chép kiểu node ẩn vào CSS toàn cục.

### 8. Xác nhận trực quan

Hiển thị kết quả và chụp ảnh màn hình (Playwright, công cụ kiểm tra hình ảnh của repo, hoặc headless Chrome `--headless --screenshot`). Khi hiển thị file cục bộ, truyền URL `file://` — `index.html` trần được phân tích là hostname và tải thất bại. So sánh với tham chiếu Figma:

- Bố cục: khác biệt x/y/chiều rộng/cao/khoảng cách.
- Kiểu chữ: font family, kích thước, trọng lượng, line-height.
- Màu sắc: màu nền/viền/văn bản/nền.
- Bán kính/đổ bóng/độ mờ.
- Node thiếu/thừa.

Lặp lại cho đến khi các sai lệch chính được sửa. Nếu không thể đạt được sự tương đồng chính xác, ghi lại lý do.

## Chế Độ Thất Bại Phổ Biến Cần Ngăn Chặn

- Kết quả MCP thô bao gồm khung ngang hàng không liên quan và agent sao chép kiểu của chúng.
- Trình phân tích do agent tạo thay đổi mỗi lần chạy.
- Biến thể ẩn rò rỉ kiểu vào phần tử hiển thị.
- Hình chữ nhật vector được coi là container ngữ nghĩa không có nhóm.
- Agent tạo bố cục định vị tuyệt đối cho form nên là flex/grid.
- Kết quả Figma MCP được coi là React/Tailwind cuối cùng thay vì tham chiếu thiết kế.
- Ảnh chụp được sử dụng không có metadata, gây ra đoán khoảng cách và kiểu chữ.
- Gradient hoặc node `styles` trống được giao dưới dạng màu phẳng sai vì không tham khảo ảnh chụp.
- Hình dạng biểu tượng được phát minh từ trí tưởng tượng thay vì SVG đã xuất hoặc biểu tượng đường nét phù hợp được tô màu từ hex JSON.

## Ví Dụ Prompt

```text
Triển khai node Figma đã chọn trong repo này sử dụng kỹ năng figma-to-code.

Yêu cầu:
- Chỉ sử dụng khung/thành phần đã chọn chính xác.
- Chạy trình trích xuất trước khi đọc kết quả MCP thô chi tiết.
- Tạo code từ figma-ir.json, không phải kết quả thô.
- Tái sử dụng các thành phần Button/Input/Select/Modal/FormField hiện có.
- Sử dụng token dự án khi có thể.
- Xác nhận với ảnh chụp Figma dùng Playwright và sửa sai lệch hiển thị.
```
