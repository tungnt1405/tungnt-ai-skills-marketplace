---
name: writing-plans
description: Sử dụng khi bạn có spec hoặc yêu cầu cho nhiệm vụ nhiều bước, trước khi chạm code
---

# Viết Kế Hoạch

## Tổng Quan

Viết kế hoạch triển khai toàn diện, giả định kỹ sư có 0 ngữ cảnh về codebase của chúng ta và hương vị đáng ngờ. Ghi lại mọi thứ họ cần biết: file nào chạm cho mỗi nhiệm vụ, code, kiểm thử, tài liệu có thể họ cần xem, cách test. Cung cấp toàn bộ kế hoạch thành các nhiệm vụ nhỏ. DRY. YAGNI. TDD. Commit thường xuyên.

Giả định họ là nhà phát triển kỹ năng, nhưng biết gần như không có gì về bộ công cụ hoặc lĩnh vực vấn đề. Giả định họ không biết thiết kế test tốt.

**Thông báo bắt đầu:** "Tôi đang sử dụng kỹ năng writing-plans để tạo kế hoạch triển khai."

**Ngữ cảnh:** Nếu đang làm việc trong worktree cô lập, nó nên được tạo thông qua kỹ năng `using-git-worktrees` tại thời điểm thực thi.

**Lưu kế hoạch vào:** `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md`
- (Sở thích người dùng về vị trí kế hoạch ghi đè mặc định này)

## Kiểm Tra Phạm Vi

Nếu spec bao gồm nhiều hệ thống con độc lập, nó nên đã được chia thành spec dự án con trong brainstorming. Nếu không, đề xuất chia thành các kế hoạch riêng biệt — mỗi kế hoạch một hệ thống con. Mỗi kế hoạch nên tạo ra phần mềm hoạt động, test được độc lập.

## Hình Dạng Kế Hoạch

Chọn đầu ra một file hoặc theo pha dựa trên tín hiệu cụ thể:

**Kế hoạch một file** — sử dụng cho công việc nhỏ, rủi ro thấp:
- Chạm ít hơn 3 kỹ năng quy trình làm việc.
- Ít hơn 3 pha triển khai.
- Không cần tách subagent.
- Một kỹ sư hoàn thành trong một phiên.

**Kế hoạch theo pha** — sử dụng khi bất kỳ điều nào áp dụng:
- Công việc bao gồm 3 hoặc nhiều kỹ năng quy trình hơn.
- Công việc có 3 hoặc nhiều pha triển khai.
- Công việc cần tách subagent cho thực thi song song hoặc độc lập.
- Công việc chạy nhiều hệ thống con được hưởng lợi từ theo dõi tiến độ độc lập.

Cho kế hoạch theo pha:
1. Tạo `plan.md` với bảng ánh xạ pha, phụ thuộc và tiêu chí thành công.
2. Tạo tất cả file `phase-*.md` ngay lập tức — không trì hoãn tạo file pha đến thời gian thực thi.
3. Mỗi file pha phải có frontmatter: `phase`, `title`, `status: pending`, `priority`, `effort`, `dependencies`.
4. Frontmatter pha là nguồn权威 cho tiến độ pha. File YAML trạng thái tùy chọn chỉ là theo dõi runtime.

Cho kế hoạch một file, giữ định dạng kế hoạch hiện tại không thay đổi. Không yêu cầu YAML trạng thái riêng.

## Cấu Trúc File

Trước khi định nghĩa nhiệm vụ, ánh xạ file nào sẽ được tạo hoặc sửa đổi và mỗi file chịu trách nhiệm gì. Đây là nơi quyết định phân tách bị khóa.

- Thiết kế đơn vị với ranh giới rõ ràng và giao diện được xác định rõ. Mỗi file nên có một trách nhiệm rõ ràng.
- Bạn lý luận tốt nhất về code bạn có thể giữ trong ngữ cảnh cùng lúc, và chỉnh sửa của bạn đáng tin cậy hơn khi file tập trung. Ưu tiên file nhỏ hơn, tập trung hơn lớn làm quá nhiều.
- File thay đổi cùng nhau nên sống cùng nhau. Chia theo trách nhiệm, không phải theo lớp kỹ thuật.
- Trong codebase hiện có, tuân theo mẫu đã thiết lập. Nếu codebase sử dụng file lớn, không đơn phương tái cấu trúc - nhưng nếu file bạn sửa đã trở nên cồng kềnh, bao gồm tách trong kế hoạch là hợp lý.

Cấu trúc này thông báo phân tách nhiệm vụ. Mỗi nhiệm vụ nên tạo ra thay đổi tự chứa có ý nghĩa độc lập.

## Độ Hạt Nhiệm Vụ Nhỏ

**Mỗi bước là một hành động (2-5 phút):**
- "Viết test thất bại" - bước
- "Chạy nó để đảm bảo nó thất bại" - bước
- "Triển khai code tối thiểu để làm test pass" - bước
- "Chạy test và đảm bảo chúng pass" - bước
- "Commit" - bước

## Tiêu Đề Tài Liệu Kế Hoạch

**MỌI kế hoạch PHẢI bắt đầu với tiêu đề này:**

```markdown
# [Tên Tính Năng] Kế Hoạch Triển Khai

> **Cho người làm việc là agent:** KỸ NĂNG PHỤ BẮT BUỘC: Sử dụng `subagent-driven-development` (khuyến nghị) hoặc `executing-plans` để triển khai kế hoạch này từng nhiệm vụ. Các bước sử dụng cú pháp checkbox (`- [ ]`) cho theo dõi.

**Mục tiêu:** [Một câu mô tả cái gì được xây dựng]

**Kiến trúc:** [2-3 câu về cách tiếp cận]

**Tech Stack:** [Công nghệ/thư viện chính]

**Hình dạng kế hoạch:** một-file | theo-pha (N pha)

---
```

## Cấu Trúc Nhiệm Vụ

````markdown
### Nhiệm vụ N: [Tên Thành Phần]

**File:**
- Tạo: `exact/path/to/file.py`
- Sửa: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Bước 1: Viết test thất bại**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Bước 2: Chạy test để xác minh nó thất bại**

Chạy: `pytest tests/path/test.py::test_name -v`
Kỳ vọng: FAIL với "function not defined"

- [ ] **Bước 3: Viết triển khai tối thiểu**

```python
def function(input):
    return expected
```

- [ ] **Bước 4: Chạy test để xác minh nó pass**

Chạy: `pytest tests/path/test.py::test_name -v`
Kỳ vọng: PASS

- [ ] **Bước 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: thêm tính năng cụ thể"
```
````

## Không Placeholder

Mỗi bước phải chứa nội dung thực tế kỹ sư cần. Đây là **thất bại kế hoạch** — không bao giờ viết chúng:
- "TBD", "TODO", "triển khai sau", "điền chi tiết sau"
- "Thêm xử lý lỗi phù hợp" / "thêm xác thực" / "xử lý trường hợp biên"
- "Viết test cho phần trên" (không có code test thực tế)
- "Tương tự Nhiệm vụ N" (lặp lại code — kỹ sư có thể đang đọc nhiệm vụ ngoài thứ tự)
- Các bước mô tả làm gì mà không cho thấy cách làm (code block yêu cầu cho bước code)
- Tham chiếu đến kiểu, hàm hoặc phương thức chưa định nghĩa trong bất kỳ nhiệm vụ nào

## Nhớ
- Đường dẫn file chính xác luôn
- Code hoàn chỉnh trong mỗi bước — nếu bước thay đổi code, hiển thị code
- Lệnh chính xác với đầu ra kỳ vọng
- DRY, YAGNI, TDD, commit thường xuyên

## Tự Đánh Giá

Sau khi viết kế hoạch hoàn chỉnh, nhìn spec bằng con mắt mới và kiểm tra kế hoạch đối với nó. Đây là danh sách kiểm tra bạn tự chạy — không phải gửi subagent.

**1. Độ phủ spec:** Lướt qua mỗi phần/yêu cầu trong spec. Bạn chỉ vào nhiệm vụ nào thực hiện nó? Liệt kê bất kỳ khoảng trống nào.

**2. Quét placeholder:** Tìm kiếm kế hoạch của bạn cho cờ đỏ — bất kỳ mẫu nào từ phần "Không Placeholder" ở trên. Sửa chúng.

**3. Nhất quán kiểu:** Kiểu, chữ ký phương thức và tên thuộc tính bạn sử dụng trong các nhiệm vụ sau có khớp với những gì bạn định nghĩa trong nhiệm vụ trước không? Hàm gọi `clearLayers()` trong Nhiệm vụ 3 nhưng `clearFullLayers()` trong Nhiệm vụ 7 là lỗi.

Nếu bạn tìm vấn đề, sửa nội tuyến. Không cần đánh giá lại — chỉ sửa và tiếp tục. Nếu bạn tìm yêu cầu spec không có nhiệm vụ, thêm nhiệm vụ.

## Xác Nhận

Xác nhận chỉ chạy khi người dùng gọi rõ ràng kỹ năng xác nhận hoặc lệnh con. Không thêm cổng xác nhận tự động vào quy trình writing-plans. Kế hoạch sẵn sàng cho chuyển giao thực thi sau khi tự đánh giá vượt qua.

## Chuyển Giao Thực Thi

Sau khi lưu kế hoạch, đề xuất lựa chọn thực thi:

**"Kế hoạch hoàn thành và lưu vào `docs/tungnt-ai-skills/plans/<filename>.md`. Hai tùy chọn thực thi:**

**1. Điều Khiển Subagent (khuyến nghị)** - Tôi gửi một subagent mới cho mỗi nhiệm vụ, đánh giá giữa nhiệm vụ, lặp lại nhanh

**2. Thực Thi Nội Tuyến** - Thực thi nhiệm vụ trong phiên này dùng executing-plans, thực thi theo lô với điểm kiểm tra

**Chọn cách nào?"**

**Nếu chọn Điều Khiển Subagent:**
- **KỸ NĂNG PHỤ BẮT BUỘC:** Sử dụng `subagent-driven-development`
- Subagent mới cho mỗi nhiệm vụ + đánh giá hai giai đoạn

**Nếu chọn Thực Thi Nội Tuyến:**
- **KỸ NĂNG PHỤ BẮT BUỘC:** Sử dụng `executing-plans`
- Thực thi theo lô với điểm kiểm tra cho đánh giá