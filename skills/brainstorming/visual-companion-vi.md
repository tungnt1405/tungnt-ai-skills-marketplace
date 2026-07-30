# Hướng Dẫn Đồng Hành Trực Quan (Visual Companion Guide)

Công cụ đồng hành brainstorming trực quan trên trình duyệt dùng để hiển thị mockup, sơ đồ và các lựa chọn thiết kế.

## Khi Nào Nên Sử Dụng

Quyết định theo **từng câu hỏi**, không phải theo toàn bộ phiên (session). Tiêu chí kiểm tra: **liệu người dùng có hiểu rõ hơn khi nhìn trực quan thay vì đọc văn bản không?**

**Sử dụng trình duyệt** khi bản thân nội dung mang tính trực quan:

- **Mockup UI** — wireframe, bố cục (layout), cấu trúc điều hướng, thiết kế component
- **Sơ đồ kiến trúc (Architecture diagrams)** — các thành phần hệ thống, luồng dữ liệu (data flow), bản đồ mối quan hệ
- **So sánh trực quan song song (Side-by-side)** — so sánh 2 bố cục, 2 phối màu, 2 hướng thiết kế
- **Tinh chỉnh thiết kế (Design polish)** — khi câu hỏi liên quan đến vẻ ngoài (look and feel), khoảng cách (spacing), phân cấp trực quan (visual hierarchy)
- **Mối quan hệ không gian/luồng** — state machine, flowchart, mối quan hệ thực thể (ERD) được dựng thành sơ đồ

**Sử dụng terminal** khi nội dung là văn bản hoặc bảng biểu:

- **Câu hỏi về yêu cầu và phạm vi (Requirements & Scope)** — "X có nghĩa là gì?", "những tính năng nào nằm trong phạm vi?"
- **Lựa chọn khái niệm A/B/C** — chọn giữa các phương pháp được mô tả bằng từ ngữ
- **Danh sách đánh đổi (Tradeoffs)** — ưu/nhược điểm, bảng so sánh
- **Quyết định kỹ thuật** — thiết kế API, mô hình hóa dữ liệu (data modeling), lựa chọn kiến trúc
- **Câu hỏi làm rõ (Clarifying questions)** — bất kỳ câu hỏi nào mà câu trả lời là từ ngữ chứ không phải sở thích trực quan

Một câu hỏi *về* chủ đề UI không tự động biến thành câu hỏi trực quan. "Bạn muốn loại wizard nào?" là câu hỏi về mặt khái niệm — hãy dùng terminal. "Bố cục wizard nào trong số này cảm thấy hợp lý hơn?" là câu hỏi trực quan — hãy dùng trình duyệt.

## Cách Thức Hoạt Động

Server sẽ theo dõi một thư mục chứa các file HTML và phục vụ file mới nhất lên trình duyệt. Bạn ghi nội dung HTML vào `screen_dir`, người dùng sẽ thấy trên trình duyệt của họ và có thể nhấp để chọn phương án. Các lựa chọn sẽ được ghi lại vào `state_dir/events` để bạn đọc ở lượt tiếp theo.

**Nội dung dạng đoạn (Content fragment) so với Tài liệu đầy đủ (Full document):** Nếu file HTML của bạn bắt đầu bằng `<!DOCTYPE` hoặc `<html`, server sẽ phục vụ nguyên bản file đó (chỉ chèn thêm script hỗ trợ). Nếu không, server sẽ tự động bọc nội dung của bạn vào khung template (frame template) — tự động thêm header, CSS theme, chỉ báo lựa chọn và toàn bộ hạ tầng tương tác. **Hãy ưu tiên viết nội dung dạng fragment theo mặc định.** Chỉ viết tài liệu đầy đủ khi bạn cần kiểm soát hoàn toàn trang web.

## Khởi Chạy Phiên Làm Việc

```bash
# Khởi chạy server với chế độ lưu trữ lâu dài (mockup được lưu vào project)
scripts/start-server.sh --project-dir /path/to/project

# Trả về: {"type":"server-started","port":52341,"url":"http://localhost:52341",
#           "screen_dir":"/path/to/project/.tungnt-ai-skills/brainstorm/12345-1706000000/content",
#           "state_dir":"/path/to/project/.tungnt-ai-skills/brainstorm/12345-1706000000/state"}
```

Lưu lại `screen_dir` và `state_dir` từ kết quả trả về. Nhắc người dùng mở URL đó.

**Tìm thông tin kết nối:** Server ghi JSON khởi động vào `$STATE_DIR/server-info`. Nếu bạn chạy server dưới nền (background) và không bắt được stdout, hãy đọc file đó để lấy URL và port. Khi sử dụng `--project-dir`, hãy kiểm tra `<project>/.tungnt-ai-skills/brainstorm/` để tìm thư mục phiên làm việc.

**Lưu ý:** Truyền thư mục gốc dự án vào `--project-dir` để các mockup được lưu lại trong `.tungnt-ai-skills/brainstorm/` và tồn tại qua các lần khởi động lại server. Nếu không có cờ này, các file sẽ nằm trong `/tmp` và bị dọn dẹp. Nhắc người dùng thêm `.tungnt-ai-skills/` vào `.gitignore` nếu chưa có.

**Khởi chạy server theo nền tảng (Platform):**

**Claude Code (macOS / Linux):**
```bash
# Chế độ mặc định hoạt động tốt — script tự đưa server chạy ngầm
scripts/start-server.sh --project-dir /path/to/project
```

**Claude Code (Windows):**
```bash
# Windows tự động phát hiện và dùng chế độ foreground, gây nghẽn tool call.
# Hãy dùng run_in_background: true trên Bash tool call để server tồn tại qua các lượt trò chuyện.
scripts/start-server.sh --project-dir /path/to/project
```
Khi gọi qua Bash tool, hãy đặt `run_in_background: true`. Sau đó đọc `$STATE_DIR/server-info` ở lượt tiếp theo để lấy URL và port.

**Codex:**
```bash
# Codex tự động thu hồi các tiến trình chạy ngầm. Script tự phát hiện CODEX_CI và chuyển sang foreground. Run bình thường — không cần cờ bổ sung.
scripts/start-server.sh --project-dir /path/to/project
```

**Gemini CLI:**
```bash
# Sử dụng --foreground và đặt is_background: true trên shell tool call để tiến trình tồn tại qua các lượt
scripts/start-server.sh --project-dir /path/to/project --foreground
```

**Môi trường khác:** Server phải duy trì chạy dưới nền qua các lượt trò chuyện. Nếu môi trường của bạn thu hồi các tiến trình chạy độc lập (detached processes), hãy dùng `--foreground` và khởi chạy lệnh với cơ chế chạy ngầm của nền tảng đó.

Nếu URL không thể truy cập từ trình duyệt (thường gặp trong thiết lập từ xa/containerized), hãy bind một host không phải loopback:

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

Sử dụng `--url-host` để kiểm soát hostname nào được in ra trong JSON URL trả về.

## Vòng Lặp Quy Trình (The Loop)

1. **Kiểm tra server còn sống**, sau đó **ghi file HTML** mới vào `screen_dir`:
   - Trước mỗi lần ghi, hãy kiểm tra xem `$STATE_DIR/server-info` có tồn tại không. Nếu không (hoặc `$STATE_DIR/server-stopped` tồn tại), server đã tắt — hãy khởi động lại bằng `start-server.sh` trước khi tiếp tục. Server tự động thoát sau 30 phút không hoạt động.
   - Sử dụng tên file có ý nghĩa: `platform.html`, `visual-style.html`, `layout.html`
   - **Không bao giờ dùng lại tên file cũ** — mỗi màn hình phải ghi ra một file mới
   - Sử dụng tool Write — **không bao giờ dùng cat/heredoc** (gây rác output terminal)
   - Server tự động phục vụ file mới nhất

2. **Thông báo cho người dùng điều cần chờ đợi và kết thúc lượt:**
   - Nhắc lại URL cho họ (ở mỗi bước, không chỉ bước đầu tiên)
   - Đưa ra tóm tắt ngắn bằng văn bản về những gì hiển thị trên màn hình (ví dụ: "Đang hiển thị 3 lựa chọn bố cục cho trang chủ")
   - Yêu cầu họ phản hồi trong terminal: "Hãy xem qua và cho tôi biết ý kiến của bạn. Bạn có thể nhấp chọn một tùy chọn trên trình duyệt nếu muốn."

3. **Ở lượt tiếp theo của bạn** — sau khi người dùng phản hồi trong terminal:
   - Đọc `$STATE_DIR/events` nếu file này tồn tại — file này chứa tương tác trình duyệt của người dùng (lượt nhấp, lựa chọn) dưới dạng các dòng JSON
   - Phối hợp với phản hồi văn bản của người dùng trong terminal để có bức tranh toàn cảnh
   - Tin nhắn terminal là phản hồi chính; `state_dir/events` cung cấp dữ liệu tương tác có cấu trúc

4. **Lặp lại tinh chỉnh hoặc chuyển bước** — nếu phản hồi làm thay đổi màn hình hiện tại, hãy ghi file mới (ví dụ: `layout-v2.html`). Chỉ chuyển sang câu hỏi tiếp theo khi bước hiện tại đã được xác nhận.

5. **Dọn màn hình trình duyệt khi quay lại terminal** — khi bước tiếp theo không cần trình duyệt (ví dụ: câu hỏi làm rõ, thảo luận đánh đổi), hãy đẩy một màn hình chờ (waiting screen) để xóa nội dung cũ:

   ```html
   <!-- tên file: waiting.html (hoặc waiting-2.html, v.v.) -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">Tiếp tục trong terminal...</p>
   </div>
   ```

   Điều này giúp người dùng không bị nhìn vào một lựa chọn đã xong trong khi cuộc trò chuyện đã chuyển sang chủ đề khác. Khi câu hỏi trực quan tiếp theo xuất hiện, lại đẩy một file nội dung mới như bình thường.

6. Lặp lại cho đến khi hoàn thành.

## Viết Các Đoạn Nội Dung Fragment (Writing Content Fragments)

Chỉ cần viết nội dung hiển thị bên trong trang. Server sẽ tự động bọc nội dung đó trong khung template (header, CSS theme, chỉ báo lựa chọn và toàn bộ hạ tầng tương tác).

**Ví dụ tối giản:**

```html
<h2>Bố cục nào hoạt động tốt hơn?</h2>
<p class="subtitle">Hãy cân nhắc về khả năng đọc và phân cấp trực quan</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Một Cột (Single Column)</h3>
      <p>Trải nghiệm đọc gọn gàng, tập trung</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>Hai Cột (Two Column)</h3>
      <p>Thanh điều hướng bên cạnh cùng nội dung chính</p>
    </div>
  </div>
</div>
```

Chỉ đơn giản vậy thôi. Không cần `<html>`, không cần CSS, không cần thẻ `<script>`. Server đã cung cấp sẵn tất cả những thứ đó.

## Các CSS Class Sẵn Có

Khung template cung cấp sẵn các class CSS sau cho nội dung của bạn:

### Options (Lựa chọn A/B/C)

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Tiêu đề</h3>
      <p>Mô tả</p>
    </div>
  </div>
</div>
```

**Chọn nhiều (Multi-select):** Thêm `data-multiselect` vào container để cho phép người dùng chọn nhiều phương án. Mỗi lần nhấp sẽ bật/tắt mục đó. Thanh chỉ báo sẽ hiển thị số lượng mục đã chọn.

```html
<div class="options" data-multiselect>
  <!-- cấu trúc option tương tự — người dùng có thể chọn/bỏ chọn nhiều mục -->
</div>
```

### Cards (Thiết kế trực quan)

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- nội dung mockup --></div>
    <div class="card-body">
      <h3>Tên</h3>
      <p>Mô tả</p>
    </div>
  </div>
</div>
```

### Mockup Container (Thẻ chứa mockup)

```html
<div class="mockup">
  <div class="mockup-header">Xem trước: Bố Cục Dashboard</div>
  <div class="mockup-body"><!-- HTML mockup của bạn --></div>
</div>
```

### Split View (Xem song song)

```html
<div class="split">
  <div class="mockup"><!-- bên trái --></div>
  <div class="mockup"><!-- bên phải --></div>
</div>
```

### Pros/Cons (Ưu / Nhược điểm)

```html
<div class="pros-cons">
  <div class="pros"><h4>Ưu điểm</h4><ul><li>Lợi ích</li></ul></div>
  <div class="cons"><h4>Nhược điểm</h4><ul><li>Hạn chế</li></ul></div>
</div>
```

### Mock Elements (Các khối dựng wireframe)

```html
<div class="mock-nav">Logo | Trang chủ | Giới thiệu | Liên hệ</div>
<div style="display: flex;">
  <div class="mock-sidebar">Điều hướng</div>
  <div class="mock-content">Khu vực nội dung chính</div>
</div>
<button class="mock-button">Nút Hành Động</button>
<input class="mock-input" placeholder="Trường nhập dữ liệu">
<div class="placeholder">Khu vực giữ chỗ (Placeholder)</div>
```

### Định Dạng Văn Bản Và Các Phần (Typography and sections)

- `h2` — tiêu đề trang
- `h3` — tiêu đề phần
- `.subtitle` — văn bản phụ bên dưới tiêu đề
- `.section` — khối nội dung có margin dưới
- `.label` — văn bản nhãn nhỏ viết hoa

## Định Dạng Sự Kiện Trình Duyệt (Browser Events Format)

Khi người dùng nhấp chọn các tùy chọn trên trình duyệt, các tương tác của họ sẽ được ghi vào `$STATE_DIR/events` (mỗi dòng là một đối tượng JSON). File này sẽ tự động xóa sạch khi bạn đẩy một màn hình mới.

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Complex Grid","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Hybrid","timestamp":1706000115}
```

Luồng sự kiện đầy đủ cho thấy hành trình khám phá của người dùng — họ có thể nhấp nhiều tùy chọn trước khi quyết định. Sự kiện `choice` cuối cùng thường là lựa chọn chốt hạ, nhưng chuỗi các lần nhấp có thể tiết lộ sự phân vân hoặc sở thích đáng để bạn hỏi thêm.

Nếu `$STATE_DIR/events` không tồn tại, người dùng đã không tương tác với trình duyệt — chỉ sử dụng phản hồi văn bản trong terminal của họ.

## Lời Khuyên Thiết Kế (Design Tips)

- **Cân đối độ chi tiết với bản chất câu hỏi** — wireframe cho bố cục, trau chuốt cho câu hỏi thẩm mỹ
- **Giải thích rõ câu hỏi trên từng trang** — "Bố cục nào cảm thấy chuyên nghiệp hơn?" thay vì chỉ ghi "Hãy chọn một"
- **Tinh chỉnh trước khi chuyển bước** — nếu phản hồi làm thay đổi màn hình hiện tại, hãy ghi phiên bản mới
- **Tối đa 2-4 tùy chọn** trên mỗi màn hình
- **Dùng nội dung thực tế khi cần thiết** — đối với portfolio nhiếp ảnh, hãy dùng ảnh thực tế (Unsplash). Nội dung giữ chỗ (placeholder) làm mờ đi các vấn đề thiết kế.
- **Giữ mockup đơn giản** — tập trung vào bố cục và cấu trúc, không cần thiết kế chính xác từng pixel

## Quy Tắc Đặt Tên File (File Naming)

- Sử dụng tên file có ý nghĩa: `platform.html`, `visual-style.html`, `layout.html`
- Không bao giờ dùng lại tên file cũ — mỗi màn hình phải là một file mới
- Đối với các lần lặp tinh chỉnh: thêm hậu tố phiên bản như `layout-v2.html`, `layout-v3.html`
- Server phục vụ file mới nhất theo thời gian sửa đổi

## Dọn Dẹp (Cleaning Up)

```bash
scripts/stop-server.sh $SESSION_DIR
```

Nếu phiên làm việc có dùng `--project-dir`, các file mockup sẽ được lưu giữ trong `.tungnt-ai-skills/brainstorm/` để tham khảo sau này. Chỉ các phiên làm việc trong `/tmp` mới bị xóa khi dừng.

## Tài Liệu Tham Khảo (Reference)

- Frame template (tham khảo CSS): `scripts/frame-template.html`
- Helper script (phía client): `scripts/helper.js`
