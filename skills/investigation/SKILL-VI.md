---
name: investigation
description: Sử dụng khi điều tra lỗi, truy vết sự việc, khám phá code không quen thuộc, hoặc xây dựng hồ sơ bằng chứng trước khi thay đổi hành vi
---

# Điều Tra

Điều tra trước khi sửa. Tái tạo những gì đang xảy ra từ bằng chứng, ghi lại độ tin cậy và dừng ở chẩn đoán trừ khi người dùng yêu cầu rõ ràng triển khai.

## Khi Nào Sử Dụng

- Lỗi, sự việc, stack trace, log, lưu trữ chẩn đoán, test thất bại hoặc hành vi đáng ngờ cần chẩn đoán.
- Khu vực code không quen thuộc và người dùng cần mô hình tâm lý tin cậy trước khi bắt đầu.
- Hồ sơ điều tra trước đó cần tiếp tục.

## Đầu Ra

Tạo hoặc cập nhật hồ sơ vụ việc tại `docs/tungnt-ai-skills/investigations/<slug>.md` cho lỗi, sự việc, điều tra có thể tiếp tục hoặc khám phá khu vực code không đơn giản. Cho yêu cầu "giải thích đường dẫn code này" nhẹ, báo cáo kết quả trực tiếp trừ khi người dùng yêu cầu hồ sơ vụ việc bền vững.

Slug là ID ticket khi có. Nếu không, lấy tên ngắn kebab-case từ mô tả vấn đề. Nếu file đã tồn tại, tiếp tục khi người dùng yêu cầu tiếp tục hoặc theo dõi; nếu không tạo `<slug>-YYYY-MM-DD.md`.

## Cấp Độ Bằng Chứng

- **Xác Nhận (Confirmed).** Bằng chứng quan sát trực tiếp. Trích dẫn `path:line`, thời gian log, đầu ra lệnh hoặc commit hash.
- **Suy Luận (Deduced).** Theo logic từ bằng chứng Xác Nhận. Cho thấy chuỗi logic.
- **Giả Thuyết (Hypothesized).** Có vẻ đúng nhưng chưa xác nhận. Nêu gì sẽ xác nhận hoặc bác bỏ nó.

## Nguyên Tắc

- Coi mô tả của người dùng là giả thuyết cho đến khi bằng chứng xác nhận.
- Bắt đầu từ một điểm neo Xác Nhận mạnh: lỗi chính xác, tên hàm, route, khóa cấu hình, test thất bại, thời gian hoặc commit.
- Theo dõi bằng chứng ra ngoài. Khi bằng chứng mâu thuẫn với lý thuyết đang làm việc, cập nhật lý thuyết.
- Giữ lại lối sai. Đánh dấu giả thuyết là Mở, Xác Nhận hoặc Bác Bỏ thay vì xóa.
- Bằng chứng thiếu là một phát hiện. Ghi lại khoảng trống, tác động và cách lấy được.
- Sử dụng trích dẫn `path:line` tương đối CWD.
- Sử dụng đọc file song song và tìm kiếm khi nguồn bằng chứng độc lập.
- Ủy thác quét rộng chỉ khi nền tảng hỗ trợ subagent và người dùng hoặc quy trình làm việc cho phép ủy thác. Nếu không, thu hẹp quét và tóm tắt bằng chứng dần dần.

## An Toàn

- Ưu tiên lệnh chỉ đọc khi thu thập bằng chứng.
- Không chạy migration, trình cài đặt, script dọn dẹp, ghi dịch vụ bên ngoài, lệnh phá hoại hoặc lệnh thay đổi hành vi trừ khi người dùng yêu cầu hoặc phê duyệt rõ ràng.
- Không triển khai sửa lỗi trong quá trình điều tra trừ khi người dùng thay đổi nhiệm vụ từ chẩn đoán sang triển khai.

## Quy Trình

1. **Định tuyến đầu vào.**
   - Hồ sơ vụ việc hiện có: đọc nó, tóm tắt giả thuyết mở, bằng chứng thiếu, backlog và kết luận cuối cùng.
   - Vấn đề mới: ghi hình dạng đầu vào, phạm vi và bất kỳ giả thuyết nêu nào.

2. **Tìm điểm neo.**
   - Xác định một neo Xác Nhận độc lập từ lý thuyết của người dùng.
   - Nếu không có neo Xác Nhận sau khi kiểm tra nguồn có thể truy cập, tạo hồ sơ vụ việc nhẹ bằng chứng với backlog thu thập dữ liệu ưu tiên và tạm dừng.

3. **Khởi tạo hồ sơ vụ việc.**
   - Điền Thông Tin Vụ Việc, Tuyên Bố Vấn Đề, Danh Sách Bằng Chứng, Giả Thuyết Ban Đầu và Backlog Điều Tra.
   - Trình bày phạm vi, điểm neo, đường dẫn hồ sơ vụ việc và đà tiếp theo được đề xuất.

4. **Vẽ bằng chứng xung quanh.**
   - Kiểm tra nguồn có sẵn, một phần và thiếu qua log, chẩn đoán, kiểm soát phiên bản, test, kiểm tra tĩnh, mã nguồn và ngữ cảnh issue tracker khi có.
   - Cập nhật Danh Sách Bằng Chứng và Bằng Chứng Thiếu.

5. **Lý luận về nguyên nhân.**
   - Truy vết ngược từ triệu chứng đến điều kiện tạo ra.
   - Xây dựng dòng thời gian nơi có bằng chứng dựa trên thời gian.
   - Xác nhận hoặc bác bỏ giả thuyết với trích dẫn.
   - Chạy lượt bác bỏ trước khi chuyển giả thuyết sang Xác Nhận.

6. **Truy vết nguồn nơi quan trọng.**
   - Tìm kiếm chuỗi lỗi chính xác, ký hiệu bị ảnh hưởng, commit gần đây và triển khai lân cận.
   - Đọc code xung quanh và chuỗi caller.
   - Cho trường hợp khám phá, ánh xạ đầu vào, đầu ra, phụ thuộc và luồng điều khiển.
   - Cho trường hợp triệu chứng, xác định nguyên nhân là cục bộ hay yêu cầu mô hình rộng hơn.

7. **Hoàn tất.**
   - Điền bảng Chẩn Đoán Gỡ Lỗi với triệu chứng được phân cấp bằng chứng, hành vi mong đợi, nguyên nhân gốc, bán kính ảnh hưởng, tái tạo, xác minh và sản phẩm gỡ lỗi.
   - Viết lại Tóm Tắt Chuyển Giao.
   - Nêu Kết Luận Cuối Cùng với độ tin cậy Cao, Trung Bình hoặc Thấp.
   - Cung cấp hướng sửa lỗi chỉ ở cấp độ cơ chế.
   - Cung cấp bước tái tạo hoặc xác minh.
   - Cập nhật trạng thái vụ việc thành Đang Hoạt Động, Hoàn Thành, Bị Chặn hoặc Đã Thay Thế.
   - Khuyên quy trình làm việc tiếp theo: `quick-dev` cho sửa lỗi đơn giản đã xác nhận, `brainstorming` cộng `writing-plans` cho lựa chọn hành vi sản phẩm hoặc mơ hồ, `writing-plans` chỉ khi yêu cầu đã rõ ràng, hoặc `requesting-code-review` cho đánh giá.

## Độ Tin Cậy

- **Cao:** Triệu chứng được tái tạo hoặc quan sát trực tiếp, và nguyên nhân gốc có bằng chứng trích dẫn.
- **Trung Bình:** Kết luận được suy luận từ bằng chứng đã xác nhận, với sự không chắc chắn nhỏ còn lại.
- **Thấp:** Kết luận có vẻ đúng nhưng phụ thuộc vào bằng chứng thiếu được nêu rõ ràng.

## Template Hồ Sơ Vụ Việc

```markdown
# Điều Tra: <tiêu đề>

## Tóm Tắt Chuyển Giao

1. **Điều gì xảy ra.** <tuyên bố vấn đề được phân cấp bằng chứng một câu>
2. **Vụ việc ở đâu.** <trạng thái, phát hiện mạnh nhất, sự không chắc chắn còn lại>
3. **Điều gì cần thiết tiếp theo.** <hành động được khuyến nghị đơn lẻ>

## Thông Tin Vụ Việc

| Trường | Giá Trị |
| --- | --- |
| Ticket | <ID ticket hoặc N/A> |
| Ngày mở | <YYYY-MM-DD> |
| Trạng thái | Đang Hoạt Động / Hoàn Thành / Bị Chặn / Đã Thay Thế |
| Nguồn bằng chứng | <log, test, commit, đường dẫn code, báo cáo> |

## Tuyên Bố Vấn Đề

<Khiếu nại người dùng, được tinh chỉnh hoặc mâu thuẫn bằng bằng chứng khi cần.>

## Danh Sách Bằng Chứng

| Nguồn | Trạng Thái | Ghi Chú |
| --- | --- | --- |
| <nguồn> | Có Sẵn / Một Phần / Thiếu | <chi tiết> |

## Backlog Điều Tra

| # | Đường Dẫn Khám Phá | Ưu Tiên | Trạng Thái | Ghi Chú |
| --- | --- | --- | --- | --- |
| 1 | <mô tả> | Cao / Trung Bình / Thấp | Mở | <ngữ cảnh> |

## Dòng Thời Gian Sự Kiện

| Thời Gian | Sự Kiện | Nguồn | Độ Tin Cậy |
| --- | --- | --- | --- |
| <dấu thời gian> | <sự kiện> | <trích dẫn> | Xác Nhận / Suy Luận |

## Phát Hiện Xác Nhận

### Phát Hiện 1: <tiêu đề>

**Bằng Chứng:** <path:line, dấu thời gian, đầu ra lệnh hoặc commit hash>

**Chi Tiết:** <mô tả>

## Kết Luận Suy Luận

### Suy Luận 1: <tiêu đề>

**Dựa Trên:** <phát hiện xác nhận>

**Lý Luận:** <chuỗi logic>

**Kết Luận:** <cái gì theo sau>

## Đường Dẫn Giả Thuyết

### Giả Thuyết 1: <tiêu đề>

**Trạng Thái:** Mở / Xác Nhận / Bác Bỏ

**Lý Thuyết:** <mô tả>

**Sẽ Xác Nhận:** <bằng chứng cụ thể>

**Sẽ Bác Bỏ:** <bằng chứng cụ thể>

**Giải Quyết:** <cái gì giải quyết nó, một khi biết>

## Bằng Chứng Thiếu

| Khoảng Trống | Tác Động | Cách Lấy |
| --- | --- | --- |
| <khoảng trống> | <cái gì nó sẽ giải quyết> | <bước thu thập> |

## Truy Vết Mã Nguồn

| Phần Tử | Chi Tiết |
| --- | --- |
| Nguồn lỗi | <file:line hoặc hàm> |
| Kích Hoạt | <cái gì thực thi nó> |
| Điều Kiện | <trạng thái tạo hành vi> |
| File liên quan | <cùng đường dẫn code> |

## Chẩn Đoán Gỡ Lỗi

| Trường | Chi Tiết |
| --- | --- |
| Triệu chứng chính xác | <hành vi quan sát được và cách phát hiện> |
| Hành vi mong đợi | <cái gì nên xảy ra dưới cùng điều kiện> |
| Nguyên nhân gốc | <nguyên nhân xác nhận hoặc giả thuyết với cấp độ bằng chứng> |
| Bán kính ảnh hưởng | <tính năng, người dùng hoặc dữ liệu khác bị ảnh hưởng> |
| Tái Tạo | <bước tối thiểu để kích hoạt triệu chứng> |
| Bước Xác Minh | <lệnh hoặc kiểm tra xác nhận sửa lỗi hoạt động> |
| Sản Phẩm Gỡ Lỗi | <log, ảnh chụp màn hình, đầu ra chẩn đoán hoặc ảnh chụp liên quan> |

## Kết Luận

**Độ Tin Cậy:** Cao / Trung Bình / Thấp

<Tóm tách phân biệt Kết luận Xác Nhận, Suy Luận và Giả Thuyết.>

## Các Bước Tiếp Theo Được Khuyến Nghị

### Hướng Sửa Lỗi

<Hướng sửa lỗi cấp độ cơ chế. Trích dẫn nguyên nhân gốc từ Chẩn Đoán Gỡ Lỗi. Ở mức chẩn đoán — không triển khai.>

### Chẩn Đoán

<Bước xác nhận thêm nếu sự không chắc chắn còn lại.>

## Kế Hoạch Tái Tạo

<Thiết lập, kích hoạt, kết quả mong đợi.>

## Phát Hiện Phụ

- <quan sát được phân cấp bằng chứng>

## Theo Dõi: <YYYY-MM-DD>

### Bằng Chứng Mới

### Phát Hiện Bổ Sung

### Giả Thuyết Cập Nhật

### Thay Đổi Backlog

### Kết Luận Cập Nhật
```