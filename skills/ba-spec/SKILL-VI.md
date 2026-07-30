---
name: ba-spec
description: Chỉ sử dụng khi người dùng gọi rõ ràng ba-spec để chuyển đổi yêu cầu kinh doanh, ảnh chụp màn hình/liên kết Figma, tài liệu cũ, ticket, biên bản họp hoặc yêu cầu thay đổi thành đặc tả tính năng BA thực tế cho nhà phát triển và QA. Sử dụng cho tính năng mới và nâng cấp tính năng. Nếu có bất kỳ URL Figma nào, chạy cổng bằng chứng Figma bắt buộc trước khi viết hoặc chỉnh sửa đặc tả. Hướng dẫn kỹ năng bằng tiếng Anh, và mọi kết quả hướng tới người dùng phải tuân theo ngôn ngữ hội thoại trừ khi người dùng yêu cầu rõ ràng khác.
license: MIT
metadata:
  author: ba-spec
  version: "1.6.0"
---

# ba-spec

Sử dụng `ba-spec` để chuyển đổi đầu vào kinh doanh thành đặc tả tính năng BA cho chuyển giao dev/QA bằng ngôn ngữ hội thoại trừ khi người dùng yêu cầu rõ ràng khác. Không khóa đầu vào một ngôn ngữ.

File này là bộ định tuyến và hợp đồng thực thi. Giữ ngắn. Chỉ tải các file quy tắc được tham chiếu khi kích hoạt của chúng áp dụng.

## Chỉ Kích Hoạt Thủ Công

Sử dụng kỹ năng này chỉ khi người dùng gọi rõ ràng `ba-spec`.

Không chạy tại thời điểm cài đặt. Không tự xử lý trong quá trình khởi tạo phiên.

Chỉ sử dụng thủ công. Không phải kỹ năng quy trình. Đây là một kỹ năng lĩnh vực trong việc phát triển tài liệu hệ thống.

## Đầu vào bắt buộc

- Yêu cầu rõ ràng, cụ thể không thiếu ý thiếu thông tin. KHI THIẾU Ý, THIẾU THÔNG TIN cần dừng kỹ năng sử dụng đối đáp để hỏi người dùng làm rõ vấn đề trước rồi tiếp tục theo hướng dẫn kỹ năng này.
- BẮT BUỘC gọi tới `skills/brainstorming` để lấy phân tích cơ sở trước khi làm theo hướng dẫn và đồng thời thông báo "Đang dùng brainstorming để xác định yêu cầu..."
- Đợi phản hổi từ `brainstorming` trả ra rồi dựa vào phản hồi để tiếp tục đúng hướng dẫn của kỹ năng này.

## Quy Tắc Đầu Ra Bắt Buộc

Tất cả đầu ra hướng tới người dùng được tạo bởi kỹ năng này phải tuân theo ngôn ngữ hội thoại trừ khi người dùng yêu cầu rõ ràng khác:

- Đặc tả tính năng Markdown.
- Đặc tả tính năng HTML.
- Câu hỏi làm rõ.
- Danh sách kiểm tra Dev/QA.
- Nhật ký bằng chứng.
- Giả định và câu hỏi mở.

Giữ ID và thẻ nguồn đọc được bằng máy bằng tiếng Anh:

- ID như `FR-001`, `BR-001`, `AC-001`, `Q-001`.
- Thẻ nguồn: `[PROVIDED]`, `[FIGMA]`, `[FILE]`, `[INFERRED]`, `[ASSUMPTION]`, `[OPEN_QUESTION]`.
- Từ khóa Gherkin có thể giữ nguyên `Given / When / Then / And` trừ khi người dùng yêu cầu phong cách BDD bản địa hóa.

Nếu người dùng yêu cầu rõ ràng đầu ra với một ngôn ngữ cụ thể, tuân theo yêu cầu đó.
Nếu người dùng yêu cầu rõ ràng đầu ra song ngữ hoặc chỉ tiếng Anh, tuân theo yêu cầu đó.

Chi tiết, đọc `references/output-language-rules.md`.

## Khi Nào Sử Dụng

Sử dụng kỹ năng này khi người dùng yêu cầu:

- Tạo đặc tả tính năng.
- Chuyển đổi yêu cầu kinh doanh thành tài liệu sẵn sàng cho dev.
- Tạo tài liệu chuyển giao cho dev/QA.
- Mô tả tính năng mới.
- Mô tả nâng cấp tính năng hoặc yêu cầu thay đổi.
- Sử dụng văn bản kinh doanh, liên kết Figma (nếu có), ảnh chụp màn hình Figma(nếu có), đặc tả cũ, ticket, PDF, bảng tính, biên bản họp, ghi chú API hoặc các file liên quan khác làm đầu vào.
- Tạo tài liệu cả Markdown và HTML.

## Giới Hạn BA-Riêng

Nếu yêu cầu chỉ cho đầu ra BA/PO/spec, không gọi bất kỳ quy trình mã hóa UI nào. Giữ `ba-spec` giới hạn ở phân tích kinh doanh và kết quả chuyển giao.

Nếu đầu vào liên quan đến Figma và chuyển giao nhà phát triển cần hướng dẫn triển khai UI, tham khảo `skills/figma-to-code` như tham chiếu hỗ trợ cho chi tiết triển khai. Không biến điều đó thành mã hóa UI tự động cho yêu cầu BA-riêng.

## Khi Không Sử Dụng

Không sử dụng kỹ năng này để:

- Triển khai code sản phẩm.
- Sáng tạo API, cơ sở dữ liệu, kiến trúc, hàng đợi, bảo mật hoặc thiết kế cơ sở hạ tầng.
- Coi UI Figma là quy tắc kinh doanh đã xác nhận.
- Thay thế phê duyệt PO/bên liên quan.
- Ẩn sự không chắc chắn.

## Quy Trình Bắt Buộc

Tuân theo quy trình chính xác này.

1. **Phân loại đầu vào** sử dụng `references/input-classification.md`.
2. **Xác định đường dẫn gói đầu ra** sử dụng `references/output-packaging-rules.md` trước khi tạo bất kỳ kết quả cuối cùng nào.
3. **Áp dụng quy tắc vệ sinh không gian làm việc** sử dụng `references/workspace-hygiene-rules.md` trước khi tạo script tạm thời hoặc file trợ giúp.
4. **Nếu có bất kỳ URL `figma.com` hoặc ảnh chụp màn hình Figma nào, chạy cổng bằng chứng Figma** sử dụng `references/figma-mcp-gate.md` trước khi viết hoặc chỉnh sửa đặc tả.
5. **Giữ nguyên mỗi URL Figma gốc** trong đầu ra đặc tả; đầu ra hướng tới dev phải bao gồm liên kết Figma có thể nhấp, không chỉ ID node.
6. **Trích xuất bằng chứng và thẻ độ tin cậy** sử dụng `references/source-confidence-and-evidence.md`.
7. **Áp dụng quy tắc thực hành BA** sử dụng `references/ba-documentation-principles.md`.
8. **Nếu đây là nâng cấp tính năng**, áp dụng `references/feature-upgrade-rules.md`.
9. **Nếu cung cấp file liên quan**, áp dụng `references/file-handling-rules.md`. **Nếu file nhúng ảnh chụp sơ đồ** (ví dụ `.docx`/`.pptx`/`.pdf`), trích xuất chúng sử dụng `references/file-image-extraction-rules.md`, sao chép vào `assets/` của gói và gắn thẻ `[FILE]`.
10. **Tạo đặc tả Markdown bằng ngôn ngữ đầu ra** bên trong gói đầu ra sử dụng `templates/feature-spec.md` và `references/spec-generation-workflow.md`.
11. **Tạo đặc tả HTML bằng ngôn ngữ đầu ra** bên trong cùng gói đầu ra sử dụng `templates/feature-spec.html` và `references/html-rendering-rules.md`. Nếu có ảnh chụp sơ đồ được trích xuất, sử dụng biến thể tài liệu từng bước (ảnh bên cạnh mỗi bước + CSS lightbox). Nếu Markdown chứa sơ đồ Mermaid, HTML phải hiển thị chúng bằng CDN Mermaid.js và cũng giữ nguồn dự phòng đọc được.
12. **Xóa các file trợ giúp tạm thời** sử dụng `references/workspace-hygiene-rules.md`.
13. **Chạy cổng chất lượng** sử dụng `references/quality-gates.md` trước phản hồi cuối cùng.

## Cổng Hard Gate Figma

Nếu đầu vào chứa ít nhất một URL Figma, bạn không được tạo hoặc chỉnh sửa trực tiếp `feature-spec.md` hoặc `feature-spec.html` cho đến khi một trong các điều kiện sau là đúng:

- Bạn đã sử dụng thành công công cụ Figma MCP để kiểm tra file/frame/node được liên kết và ghi lại bằng chứng đã trích xuất; hoặc
- Bạn đã thử truy cập Figma MCP, nó thất bại hoặc không khả dụng, và bạn đã ghi lại nhật ký bằng chứng Figma bằng ngôn ngữ đầu ra giải thích lỗi và trạng thái dự phòng; hoặc
- Người dùng nói rõ bỏ qua Figma/MCP và tiến hành chỉ dựa trên văn bản kinh doanh.

Một câu chung chung như "Tôi đã sử dụng liên kết Figma" là không đủ. Đặc tả phải bao gồm hàng bằng chứng cho mỗi liên kết Figma hoặc hàng lỗi rõ ràng cho mỗi liên kết.

Khi Figma MCP thất bại hoặc không khả dụng, đừng giả vờ rằng Figma đã được phân tích. Đánh dấu dữ liệu có nguồn gốc từ Figma là `[OPEN_QUESTION]` hoặc yêu cầu ảnh chụp màn hình dự phòng/frame đã xuất/văn bản đã sao chép.

Quy tắc chi tiết: `references/figma-mcp-gate.md`.

## Thẻ Độ Tin Cậy Nguồn

Sử dụng chính xác các thẻ sau:

- `[PROVIDED]`: được người dùng nêu trực tiếp.
- `[FIGMA]`: được trích xuất từ ảnh chụp màn hình/liên kết/Figma MCP.
- `[FILE]`: được trích xuất từ file liên quan.
- `[INFERRED]`: được suy luận logic từ bằng chứng được cung cấp.
- `[ASSUMPTION]`: chỉ giả định để làm cho bản nháp sử dụng được; cần xác nhận.
- `[OPEN_QUESTION]`: câu hỏi chưa giải quyết ảnh hưởng đến phạm vi, hành vi, khả năng kiểm tra hoặc triển khai.

Nếu không chắc chắn, sử dụng `[OPEN_QUESTION]`.

## Gói Đầu Ra Bắt Buộc

Khi người dùng yêu cầu kết quả, tạo một thư mục gói cuối cùng, không phải các file rời rạc trong thư mục gốc dự án.

Đường dẫn gói mặc định:

```text
docs/tungnt-ai-skills/ba-spec-output/{{YYYY-MM-DD-<feature-slug>}}/
```

Không nhúng tên Epic và Story đầy đủ trong đường dẫn thư mục theo mặc định. Giữ Epic/Story trong các phần metadata bên trong `feature-spec.md` và `feature-spec.html`. Nếu người dùng yêu cầu rõ ràng nhóm theo Epic, sử dụng định dạng nhóm tùy chọn được ghi trong `references/output-packaging-rules.md`.

### Kết Quả Cuối Cùng Mặc Định

Theo mặc định, chỉ tạo **hai file hướng tới người dùng này** bên trong gói:

```text
feature-spec.md
feature-spec.html
```

Không tạo các file `README.md`, `figma-links.md`, `evidence/`, `handoff/`, `questions/` hoặc `change-impact-summary.md` riêng biệt trừ khi người dùng yêu cầu rõ ràng các file đồng hành bổ sung, kết quả gỡ lỗi hoặc chỉ mục chuyển giao tách biệt.

Tất cả thông tin chuyển giao bắt buộc phải được nhúng trong hai kết quả mặc định:

- Liên kết gốc Figma và nhật ký bằng chứng MCP: nhúng trong `feature-spec.md` và phản chiếu trong `feature-spec.html`.
- Danh sách kiểm tra Dev/QA: nhúng dưới dạng phần trong `feature-spec.md` và phản chiếu trong `feature-spec.html`.
- Câu hỏi làm rõ: nhúng trong phần câu hỏi mở bằng ngôn ngữ đầu ra trong `feature-spec.md` và phản chiếu trong `feature-spec.html`.
- Epic, Story, Feature, đường dẫn gói, ngày, trạng thái và metadata nguồn: nhúng trong `feature-spec.md` và phản chiếu trong `feature-spec.html`.

Không để `feature-spec.md`, `feature-spec.html`, `extract_texts.py`, `generate_html.py`, `output.txt`, `extracted_texts.txt` hoặc các file trợ giúp tương tự trong thư mục gốc dự án. Nếu các file đó bị tạo nhầm, di chuyển kết quả cuối cùng vào gói và xóa file trợ giúp trước phản hồi cuối cùng.

Quy tắc chi tiết: `references/output-packaging-rules.md` và `references/workspace-hygiene-rules.md`.

## Quy Ước ID Yêu Cầu

Sử dụng các tiền tố này:

- `BG-###`: Mục Tiêu Kinh Doanh
- `STK-###`: Bên Liên Quan
- `ROLE-###`: Vai Trò / Diễn Viên
- `US-###`: Câu Chuyện Người Dùng
- `FLOW-###`: Bước Luồng
- `FR-###`: Yêu Cầu Chức Năng
- `BR-###`: Quy Tắc Kinh Doanh
- `DR-###`: Yêu Cầu Dữ Liệu
- `VR-###`: Quy Tắc Xác Thực
- `PERM-###`: Quy Tắc Quyền
- `STATE-###`: Trạng Thái
- `TR-###`: Chuyển Tiếp Trạng Thái
- `EC-###`: Trường Hợp Biên
- `ERR-###`: Xử Lý Lỗi
- `AC-###`: Tiêu Chí Chấp Thuận
- `NFR-###`: Yêu Cầu Phi Chức Năng
- `AUD-###`: Kiểm Toán / Phân Tích / Ghi Nhật Ký
- `DEP-###`: Phụ Thuộc
- `CHG-###`: Ảnh Hưởng Thay Đổi
- `ASM-###`: Giả Định
- `Q-###`: Câu Hỏi Mở
- `UIQ-###`: Câu Hỏi Mở UI (danh mục select không rõ hoặc nút/phần tử chưa rõ — hỏi, không bao giờ đoán)

## Hợp Đồng Phản Hồi Cuối Cùng

Sau khi tạo file, phản hồi bằng ngôn ngữ đầu ra với:

1. Đường dẫn gói đầu ra cuối cùng.
2. File đã tạo/cập nhật bên trong gói.
3. Liệu file trợ giúp tạm thời đã được dọn dẹp.
4. Liệu Figma MCP đã được sử dụng thành công.
5. Số lượng liên kết Figma đã kiểm tra, thất bại hoặc bỏ qua.
6. Xác nhận rằng liên kết Figma gốc có thể nhấp đã được nhúng trong cả `feature-spec.md` và `feature-spec.html`.
7. Câu hỏi mở chặn.
8. Liệu đặc tả đã vượt qua cổng chất lượng.

Không tuyên bố Figma đã được phân tích trừ khi nhật ký chứng minh điều đó. Nếu có sơ đồ, xác nhận rằng HTML bao gồm hỗ trợ hiển thị Mermaid.js.
