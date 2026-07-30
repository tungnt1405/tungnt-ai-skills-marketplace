---
name: writing-plans
description: Sử dụng khi bạn có spec hoặc yêu cầu cho nhiệm vụ nhiều bước, trước khi chạm code
---

# Viết Kế Hoạch

## Quét Cài Đặt

- Kiểm tra ghi nhớ branstorming đã ghi nhờ policy để tuân thủ chưa, TUÂN THỦ nghiêm ngặt theo policy nếu như bị mất hoặc không thấy policy đọc `tais/setting.json` trong không gian làm việc hiện tại nếu có (dự phòng: `setting.json` tại gốc plugin) (chỉ đọc — không bao giờ thay đổi). Kiểm tra `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles` và `policy.installAndUpdate` để định hình câu hỏi nào bạn đặt và giả định mặc định nào bạn chấp nhận.

Nếu file bị thiếu, tiếp tục với mặc định. BẮT BUỘC và GHI NHỚ làm theo settings trong `tais/setting.json` (dự phòng: `setting.json` tại gốc plugin)

BẮT BUỘC ghi nhớ các policy khi thực hiện, LUÔN ƯU TIÊN theo `tais/setting.json` trong không gian làm việc hiện tại nếu có hoặc `setting.json` tại gốc plugin để lấy policy.

## Tổng Quan

Viết kế hoạch triển khai toàn diện, giả định kỹ sư có 0 ngữ cảnh về codebase của chúng ta và hương vị đáng ngờ. Ghi lại mọi thứ họ cần biết: file nào chạm cho mỗi nhiệm vụ, code, kiểm thử, tài liệu có thể họ cần xem, cách test. Cung cấp toàn bộ kế hoạch thành các nhiệm vụ nhỏ. DRY. YAGNI. TDD. Commit thường xuyên (nếu `policy.autoCommit` được bật, TUÂN THỦ theo `setting.json`).

Giả định họ là nhà phát triển kỹ năng, nhưng biết gần như không có gì về bộ công cụ hoặc lĩnh vực vấn đề. Giả định họ không biết thiết kế test tốt.

**Thông báo bắt đầu:** "Tôi đang sử dụng kỹ năng writing-plans để tạo kế hoạch triển khai."

**Ngữ cảnh:** Nếu đang làm việc trong worktree cô lập, nó nên được tạo thông qua kỹ năng `using-git-worktrees` tại thời điểm thực thi.

**Lưu kế hoạch vào:** Nếu đang làm việc ít hơn 3 pha triển khai lưu `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md`. Trường hợp làm việc nhiều hơn 2 pha triển khai lưu `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md` `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/phase-xxx-<feature-name>.md`, với xxx là số pha tương ứng
- (Sở thích người dùng về vị trí kế hoạch ghi đè mặc định này)

## Kiểm Tra Phạm Vi

Nếu spec bao gồm nhiều hệ thống con độc lập, nó nên đã được chia thành spec dự án con trong brainstorming. Nếu không, đề xuất chia thành các kế hoạch riêng biệt — mỗi kế hoạch một hệ thống con. Mỗi kế hoạch nên tạo ra phần mềm hoạt động, test được độc lập.

## Hình Dạng Kế Hoạch

Chọn đầu ra một file hoặc theo pha dựa trên tín hiệu cụ thể:

**Kế hoạch một file** — sử dụng khi thỏa mãn điều kiện: Ít hơn 3 pha triển khai.
- Tạo file plan duy nhât là: `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>.md`.

**Kế hoạch theo pha** — sử dụng khi thỏa mãn điều kiện: Công việc có 3 hoặc nhiều pha triển khai.
- Tạo file plan và các file phase tương ứng theo đúng format `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/plan.md` `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/phase-xxx-<feature-name>.md`, với xxx là số pha tương ứng. `plan.md` là file overview

Cho kế hoạch theo pha:
1. Tạo `plan.md` với bảng ánh xạ pha, phụ thuộc và tiêu chí thành công.
2. Tạo tất cả file `phase-*.md` ngay lập tức — không trì hoãn tạo file pha đến thời gian thực thi.
3. Mỗi file pha phải có frontmatter: `phase`, `title`, `status: pending`, `priority`, `effort`, `dependencies`.
4. Frontmatter pha là nguồn tham khảo chính cho tiến độ pha. File YAML trạng thái tùy chọn chỉ là theo dõi runtime.

Cho kế hoạch một file, giữ định dạng kế hoạch hiện tại không thay đổi. Không yêu cầu YAML trạng thái riêng.

## Cấu Trúc File

Trước khi định nghĩa nhiệm vụ, ánh xạ file nào sẽ được tạo hoặc sửa đổi và mỗi file chịu trách nhiệm gì. Đây là nơi quyết định phân tách bị khóa.

- Thiết kế đơn vị với ranh giới rõ ràng và giao diện được xác định rõ. Mỗi file nên có một trách nhiệm rõ ràng.
- Bạn lý luận tốt nhất về code bạn có thể giữ trong ngữ cảnh cùng lúc, và chỉnh sửa của bạn đáng tin cậy hơn khi file tập trung. Ưu tiên file nhỏ hơn, tập trung hơn là làm quá nhiều.
- File thay đổi cùng nhau nên sống cùng nhau. Chia theo trách nhiệm, không phải theo lớp kỹ thuật.
- Trong codebase hiện có, tuân theo mẫu đã thiết lập. Nếu codebase sử dụng file lớn, không đơn phương tái cấu trúc - nhưng nếu file bạn sửa đã trở nên cồng kềnh, bao gồm tách và chia giai đoạn theo file **kế hoạch theo pha** là hợp lý.

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

**Trạng thái:** pending/in-progress/completed

---
```

## Cấu Trúc Nhiệm Vụ

### Chỉ 1 file duy nhất

- `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles` và `policy.installAndUpdate` kiểm tra policy đang cấu hình nếu tất cả đều tắt thì thêm **Bước 0: Không thực hiện các hành vi sau:**  không tự commit, không chạy các lệnh trong policy, không đọc/ghi vào các file của sensitiveFiles, không tự installAndUpdate mà phải người dùng. Nếu tắt/bật 1 số policy thì policy nào tắt thì thêm cấu trúc **Bước 0: Không thực hiện các hành vi sau:** ... Nếu tất cả đều được phép không thêm **Bước 0: Không thực hiện các hành vi sau:**

- Cấu trúc Bước 5 ở dưới cần kiểm tra `policy.autoCommit` nếu bật thì thêm cấu trúc bước 5 nếu không bật bỏ cấu trúc bước 5.

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

````markdown
### Làm theo giai đoạn bước lên plan.md

# <ten-cong-viec>

## Overview

- Mô tả ngắn mục tiêu.
- Giá trị mang lại sau khi hoàn thành.
- Phạm vi tổng quát.
- Kết quả đầu ra mong muốn.

## Source Context

- Tài liệu đặc tả.
- Yêu cầu nghiệp vụ.
- Thiết kế.
- Quyết định kỹ thuật.
- Tài liệu tham khảo.
- Các giả định.

## Related Plans

- Kế hoạch liên quan.
- Công việc đã hoàn thành có ảnh hưởng.
- Công việc đang thực hiện.
- Công việc phụ thuộc.
- Công việc kế thừa.

## Phase Mapping

| Phase | File | Status | Purpose | Main files |
|---|---|---|---|---|
| 1 | phase-01-<ten>.md | pending | Phân tích và chuẩn bị | |
| 2 | phase-02-<ten>.md | pending | Thiết kế giải pháp | |
| 3 | phase-03-<ten>.md | pending | Triển khai | |
| 4 | phase-04-<ten>.md | pending | Kiểm thử và hoàn thiện | |
| 5 | phase-05-<ten>.md | pending | Tổng kết và bàn giao | |
| n | phase-0n-<ten>.md | pending | .................... | |

## Dependencies

```text
Phase 1 -> Phase 2
Phase 2 -> Phase 3
Phase 3 -> Phase 4
Phase 4 -> Phase 5
Phase n -> Phase n+1
```

## Phase Details

### Phase 1 - Phân tích

#### Mục tiêu

#### Công việc

- Thu thập yêu cầu.
- Đọc tài liệu liên quan.
- Xác định phạm vi.
- Liệt kê rủi ro.
- Xác định phụ thuộc.

#### Đầu ra

- Danh sách yêu cầu.
- Phạm vi rõ ràng.
- Danh sách phụ thuộc.
- Danh sách rủi ro.

---

### Phase 2 - Thiết kế

#### Mục tiêu

#### Công việc

- Thiết kế luồng xử lý.
- Thiết kế cấu trúc dữ liệu.
- Thiết kế kiến trúc.
- Xác định thay đổi cần thực hiện.
- Xác định tác động.

#### Đầu ra

- Thiết kế hoàn chỉnh.
- Danh sách file cần thay đổi.
- Danh sách API.
- Danh sách interface.

---

### Phase 3 - Triển khai

#### Mục tiêu

#### Công việc

- Cập nhật mã nguồn.
- Thêm chức năng.
- Sửa lỗi.
- Refactor nếu cần.
- Đồng bộ tài liệu.

#### Đầu ra

- Chức năng hoạt động.
- Mã nguồn hoàn chỉnh.
- Tài liệu cập nhật.

---

### Phase 4 - Kiểm thử

#### Mục tiêu

#### Công việc

- Unit test.
- Integration test.
- Manual test.
- Regression test.
- Sửa lỗi phát hiện.

#### Đầu ra

- Kết quả kiểm thử.
- Danh sách lỗi đã xử lý.
- Xác nhận chất lượng.

---

### Phase 5 - Hoàn thiện

#### Mục tiêu

#### Công việc

- Rà soát toàn bộ thay đổi.
- Kiểm tra tài liệu.
- Kiểm tra coding convention.
- Kiểm tra dependency.
- Chuẩn bị bàn giao.

---

### Phase N - ...

#### Mục tiêu

#### Công việc

- ...

#### Đầu ra

- Pull Request.
- Tài liệu hoàn chỉnh.
- Báo cáo kết quả.
- Hướng dẫn sử dụng (nếu có).

## Success Criteria

- [ ] Yêu cầu được đáp ứng.
- [ ] Chức năng hoạt động đúng.
- [ ] Không phát sinh lỗi nghiêm trọng.
- [ ] Kiểm thử đạt.
- [ ] Tài liệu được cập nhật.
- [ ] Không ảnh hưởng chức năng hiện có.
- [ ] Hoàn thành đúng phạm vi.

## Out of Scope

- Các chức năng không thuộc phạm vi.
- Refactor không cần thiết.
- Thay đổi kiến trúc lớn.
- Thay đổi không liên quan.
- Tối ưu ngoài yêu cầu.

## Validation Log

### <YYYY-MM-DD HH:mm>

#### Kiểm tra

- Yêu cầu.
- Thiết kế.
- Triển khai.
- Kiểm thử.
- Tài liệu.

#### Kết quả

- Đã xác minh.
- Chưa xác minh.
- Cần bổ sung.

#### Quyết định

1.
2.
3.

## Risks

- Thiếu yêu cầu.
- Thiếu tài liệu.
- Phụ thuộc chưa hoàn thành.
- Xung đột với thay đổi khác.
- Phát sinh lỗi ngoài dự kiến.

## Handoff

### Bước tiếp theo

Cung cấp lệnh gợi ý để thực hiện plan

```bash

/subagent-driven-development <duong-dan-bao-cao>/plan.md

# hoặc

/executing-plans <duong-dan-bao-cao>/plan.md
```


### Chia thao giai đoạn

---
phase: <N>
title: "<Tên giai đoạn>"
status: pending       # pending | in-progress | completed
priority: P2          # P1 | P2 | P3
effort: ""            # Ví dụ: "4h", "2d"
dependencies: []      # Danh sách phase phụ thuộc
---

# Phase <id>: <Tên giai đoạn>

## Overview

<Mô tả ngắn gọn mục tiêu và kết quả của giai đoạn này>

## Requirements

- Functional:
- Non-functional:

## Architecture

<Mô tả thiết kế, luồng xử lý, luồng dữ liệu, thành phần liên quan và cách các thành phần tương tác>

## Related Code Files

- Tạo mới: `path/...`
- Chỉnh sửa: `path/...`
- Xóa: `path/...`

## Implementation Steps

1.
2.
3.

## Success Criteria

- [ ] Hoàn thành toàn bộ yêu cầu của giai đoạn.
- [ ] Chức năng hoạt động đúng.
- [ ] Không phát sinh lỗi mới.
- [ ] Đáp ứng yêu cầu kỹ thuật.
- [ ] Tài liệu được cập nhật (nếu có).

## Risk Assessment

### Rủi ro

-

### Giải pháp giảm thiểu

-
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

**"Kế hoạch hoàn thành và lưu vào `docs/tungnt-ai-skills/plans/<filename>.md` với trường hợp đơn giản không làm theo giai đoạn còn làm theo giai đoạn lưu vào `docs/tungnt-ai-skills/plans/YYYY-MM-DD-<feature-name>/<filename>*.md`. Hai tùy chọn thực thi:**

**1. Điều Khiển Subagent (khuyến nghị)** - Tôi gửi một subagent mới cho mỗi nhiệm vụ, đánh giá giữa nhiệm vụ, lặp lại nhanh

**2. Thực Thi Nội Tuyến** - Thực thi nhiệm vụ trong phiên này dùng executing-plans, thực thi theo lô với điểm kiểm tra

**Chọn cách nào?"**

**Nếu chọn Điều Khiển Subagent:**
- **KỸ NĂNG PHỤ BẮT BUỘC:** Sử dụng `subagent-driven-development`
- Subagent mới cho mỗi nhiệm vụ + đánh giá hai giai đoạn

**Nếu chọn Thực Thi Nội Tuyến:**
- **KỸ NĂNG PHỤ BẮT BUỘC:** Sử dụng `executing-plans`
- Thực thi theo lô với điểm kiểm tra cho đánh giá
