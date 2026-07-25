---
name: writing-skills
description: Sử dụng khi tạo kỹ năng mới, chỉnh sửa kỹ năng hiện có hoặc xác minh kỹ năng hoạt động trước khi triển khai
---

# Viết Kỹ Năng

## Tổng Quan

**Viết kỹ năng LÀ Phát Triển Hướng Test áp dụng cho tài liệu quy trình.**

**Trong repo này, kỹ năng quy trình làm việc chia sẻ sống trong thư mục gốc `skills/`. Cài đặt cá nhân phụ thuộc vào nền tảng; cho Codex, ưu tiên `$CODEX_HOME/skills` hoặc `~/.codex/skills`, và cho harness khác sử dụng thư mục kỹ năng được ghi chép của chúng.**

Bạn viết test case (kịch bản áp lực với subagent), xem chúng thất bại (hành vi cơ sở), viết kỹ năng (tài liệu), xem test pass (agent tuân thủ), và refactor (đóng lỗ hổng).

**Nguyên tắc cốt lõi:** Nếu bạn không xem agent thất bại khi không có kỹ năng, bạn không biết kỹ năng dạy đúng điều hay không.

**NỀN TẢNG CẦN THIẾT:** Bạn PHẢI hiểu chu kỳ RED-GREEN-REFACTOR trước khi sử dụng kỹ năng này. Nếu bộ kỹ năng hoạt động bao gồm kỹ năng TDD riêng, tải nó làm nền hỗ trợ. Kỹ năng này thích ứng TDD cho tài liệu.

**Hướng dẫn nhà cung cấp:** Cho các phương pháp hay nhất về viết kỹ năng của Anthropic, xem `anthropic-best-practices.md`. Tài liệu này cung cấp các mẫu và hướng dẫn bổ sung bổ trợ cho cách tiếp cận tập trung TDD trong kỹ năng này.

## Kỹ Năng Là Gì?

Một **kỹ năng** là hướng dẫn tham khảo cho kỹ thuật, mẫu hoặc công cụ đã được chứng minh. Kỹ năng giúp các phiên bản agent tương lai tìm và áp dụng cách tiếp cận hiệu quả.

**Kỹ năng LÀ:** Kỹ thuật tái sử dụng, Mẫu, Công cụ, Hướng dẫn tham khảo

**Kỹ năng KHÔNG PHẢI LÀ:** Tường thuật về cách bạn giải quyết vấn đề một lần

## Ánh Xạ TDD Cho Kỹ Năng

| Khái niệm TDD | Tạo Kỹ năng |
|-------------|----------------|
| **Test case** | Kịch bản áp lực với subagent |
| **Code sản xuất** | Tài liệu kỹ năng (SKILL.md) |
| **Test thất bại (RED)** | Agent vi phạm quy tắc không có kỹ năng (cơ sở) |
| **Test pass (GREEN)** | Agent tuân thủ với kỹ năng |
| **Refactor** | Đóng lỗ hổng trong khi duy trì tuân thủ |
| **Viết test trước** | Chạy kịch bản cơ sở TRƯỚC khi viết kỹ năng |
| **Xem nó thất bại** | Ghi chính xác sự hợp lý hóa agent sử dụng |
| **Code tối thiểu** | Viết kỹ năng giải quyết các vi phạm cụ thể đó |
| **Xem nó pass** | Xác minh agent bây giờ tuân thủ |
| **Chu kỳ refactor** | Tìm hợp lý hóa mới → đóng → xác minh lại |

Toàn bộ quá trình tạo kỹ năng tuân theo RED-GREEN-REFACTOR.

## Khi Nào Tạo Kỹ Năng

**Tạo khi:**
- Kỹ thuật không hiển nhiên trực quan với bạn
- Bạn sẽ tham khảo lại điều này qua các dự án
- Mẫu áp dụng rộng (không phải dự án-cụ thể)
- Người khác sẽ được lợi

**Không tạo cho:**
- Giải pháp một lần
- Thực hành tiêu chuẩn được ghi tốt ở nơi khác
- Quy ước dự án-cụ thể (đặt trong hướng dẫn dự án như `CLAUDE.md` hoặc `AGENTS.md`)
- Ràng buộc cơ học (nếu có thể thực thi với regex/xác nhận, tự động hóa nó—để tài liệu cho phán xét)

## Loại Kỹ Năng

### Kỹ thuật
Phương pháp cụ thể với các bước để tuân theo (chờ-dựa-trên-điều-kiện, truy-vết-gốc-nguyên-nhân)

### Mẫu
Cách suy nghĩ về vấn đề (làm-phẳng-với-cờ, kiểm-tra-bất-biến)

### Tham khảo
Tài liệu API, hướng dẫn cú pháp, tài liệu công cụ (tài liệu văn phòng)

## Cấu Trúc Thư Mục

```
skills/
  skill-name/
    SKILL.md              # Tham khảo chính (bắt buộc)
    supporting-file.*     # Chỉ nếu cần
```

**Không gian tên phẳng** - tất cả kỹ năng trong một không gian tên tìm kiếm được

**File riêng cho:**
1. **Tham khảo nặng** (100+ dòng) - Tài liệu API, cú pháp toàn diện
2. **Công cụ tái sử dụng** - Script, tiện ích, mẫu

**Giữ nội tuyến:**
- Nguyên tắc và khái niệm
- Mẫu code (< 50 dòng)
- Mọi thứ khác

## Cấu Trúc SKILL.md

**Frontmatter (YAML):**
- Hai trường bắt buộc: `name` và `description` (xem [agentskills.io/specification](https://agentskills.io/specification) cho tất cả trường được hỗ trợ)
- Tối đa 1024 ký tự tổng
- `name`: Chỉ sử dụng chữ cái, số và dấu gạch ngang (không ngoặc, ký tự đặc biệt)
- `description`: Ngôi thứ ba, chỉ mô tả KHI NÀO dùng (không phải làm gì)
  - Bắt đầu bằng "Use when..." để tập trung vào điều kiện kích hoạt
  - Bao gồm triệu chứng cụ thể, tình huống và ngữ cảnh
  - **KHÔNG BAO GIỜ tóm tắt quy trình hoặc workflow của kỹ năng** (xem phần SSO cho lý do)
  - Giữ dưới 500 ký tự nếu có thể

```yaml
# ❌ XẤU: Tóm tắt workflow - agent có thể tuân theo cái này thay vì đọc kỹ năng
description: Sử dụng khi thực thi kế hoạch - gửi subagent mỗi nhiệm vụ với code review giữa các nhiệm vụ

# ❌ XẤU: Quá nhiều chi tiết quy trình
description: Sử dụng cho TDD - viết test trước, xem nó thất bại, viết code tối thiểu, refactor

# ✅ TỐT: Chỉ điều kiện kích hoạt, không tóm tắt workflow
description: Sử dụng khi thực thi kế hoạch triển khai với nhiệm vụ độc lập trong phiên hiện tại
```

**Nội dung:**
- Sử dụng bộ kích hoạt, triệu chứng và tình huống cụ thể báo hiệu kỹ năng này áp dụng
- Mô tả *vấn đề* (race condition, hành vi không nhất quán) không phải triệu chứng *công nghệ cụ thể* (setTimeout, sleep)
- Giữ kích hoạt trung lập công nghệ trừ khi kỹ năng chính là công nghệ cụ thể
- Nếu kỹ năng là công nghệ cụ thể, làm rõ kích hoạt
- Viết ở ngôi thứ ba (được chèn vào system prompt)
- **KHÔNG BAO GIỜ tóm tắt quy trình hoặc workflow của kỹ năng**

## Bảo Trì

Sau khi viết BẤT KỲ kỹ năng nào, bạn PHẢI DỪNG và hoàn thành quy trình triển khai.

**KHÔNG:**
- Tạo nhiều kỹ năng theo lô không test từng cái
- Chuyển sang kỹ năng tiếp theo trước khi kỹ năng hiện tại được xác minh
- Bỏ qua test vì "làm theo lô hiệu quả hơn"

## Định Luật Sắt (Giống TDD)

```
KHÔNG KỸ NĂNG NÀO KHÔNG CÓ TEST THẤT BẠI TRƯỚC
```

Điều này áp dụng cho kỹ năng MỚI VÀ CHỈNH SỬA kỹ năng hiện có.

Viết kỹ năng trước khi test? Xóa nó. Bắt đầu lại.
Chỉnh sửa kỹ năng không test? Cùng vi phạm.

**Không ngoại lệ:**
- Không cho "thêm đơn giản"
- Không cho "chỉ thêm phần"
- Không cho "cập nhật tài liệu"
- Đừng giữ thay đổi chưa test như "tham khảo"
- Đừng "thích ứng" khi chạy test
- Xóa có nghĩa là xóa

**NỂN TẢNG CẦN THIẾT:** Chu kỳ RED-GREEN-REFACTOR giải thích tại sao điều này quan trọng. Bao gồm kỹ năng TDD riêng trong bộ kỹ năng đang hoạt động, tải nó làm nền hỗ trợ. Cùng nguyên tắc áp dụng cho tài liệu.

## Dòng Cuối

**Tạo kỹ năng LÀ TDD cho tài liệu quy trình.**

Cùng Định Luật Sắt: Không kỹ năng nào không có test thất bại trước.
Cùng chu kỳ: RED (cơ sở) → GREEN (viết kỹ năng) → REFACTOR (đóng lỗ hổng).
Cùng lợi ích: Chất lượng tốt hơn, ít bất ngờ hơn, kết quả siêu chịu đạn.

Nếu bạn tuân theo TDD cho code, tuân theo nó cho kỹ năng. Cùng kỷ luật áp dụng cho tài liệu.