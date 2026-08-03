---
name: quick-dev
description: Sử dụng cho yêu cầu triển khai tầm thường, rủi ro thấp có thể hoàn thành trong 30 phút và thường chạm 1-2 file
---

# Phát Triển Nhanh

Triển khai một thay đổi nhỏ, rõ ràng luôn cần brainstorming để suy luận vấn đề nhưng không cần lập kế hoạch và writing-plans đầy đủ. Đây là đường tắt nhanh, không phải lối tắt quanh chất lượng.

## Quét Cài Đặt

- Kiểm tra ghi nhớ branstorming đã ghi nhờ policy để tuân thủ chưa, TUÂN THỦ nghiêm ngặt theo policy nếu như bị mất hoặc không thấy policy đọc `tais/setting.json` trong không gian làm việc hiện tại nếu có (dự phòng: `setting.json` tại gốc plugin) (chỉ đọc — không bao giờ thay đổi). Kiểm tra `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles` và `policy.installAndUpdate` để định hình câu hỏi nào bạn đặt và giả định mặc định nào bạn chấp nhận.

Nếu file bị thiếu, tiếp tục với mặc định. BẮT BUỘC và GHI NHỚ làm theo settings trong `tais/setting.json` (dự phòng: `setting.json` tại gốc plugin)

BẮT BUỘC ghi nhớ các policy khi thực hiện, LUÔN ƯU TIÊN theo `tais/setting.json` trong không gian làm việc hiện tại nếu có hoặc `setting.json` tại gốc plugin để lấy policy.

## Cổng Phạm Vi

Chỉ sử dụng kỹ năng này khi TẤT CẢ điều sau đều đúng:

- Ý định người dùng rõ ràng mà không cần khám phá thiết kế.
- Thay đổi dự kiến dưới 30 phút.
- Thay đổi dự kiến chạm 1-2 file không phải test/không phải tài liệu.
- Không có kiến trúc mới, quy trình làm việc, mô hình dữ liệu, API công khai, migration hoặc thay đổi hành vi rộng.
- Rủi ro hậu quả không mong muốn thấp và dễ xác minh.

## Tiền Kiểm Tra Vi-Thảo Luận

Khi yêu cầu không hoàn toàn rõ ràng, hỏi một xác nhận ngắn gọn bao gồm chính xác thay đổi, file dự kiến và xác minh. Nếu câu trả lời của người dùng mở rộng phạm vi hoặc tiết lộ lựa chọn hành vi/thiết kế, dừng quick-dev và chuyển sang `brainstorming` để lập kế hoạch và writing-plans đầy đủ.

**Bỏ qua tiền kiểm tra CHỈ KHI CẢ HAI điều kiện đều được đáp ứng:** người dùng chỉ định chính xác file và dòng/hàm VÀ chỉnh sửa không thay đổi hành vi runtime (refactor thuần túy, đổi tên hoặc sửa style). Luôn dùng brainstorming suy luận rồi để thực hiện mà không cần lập kế hoạch và wrinting-plans đầy đủ rồi mới làm.

## Mối Quan Hệ Với Brainstorming

Khi cổng phạm vi `quick-dev` vượt qua, `quick-dev` là kỹ năng quy trình kết hợp với `brainstorming` để triển khai nhanh thay vì thực hiện lập kế hoạch đầy đủ. Nếu cổng thất bại hoặc không chắc chắn, `brainstorming` vẫn bắt buộc cho công việc sáng tạo, chức năng mới hoặc thay đổi hành vi để lập kế hoạch đầy đủ.

## Leo Thang Khỏi Quick Dev

Dừng quick-dev và chuyển sang `brainstorming` khi bất kỳ cờ đỏ nào xuất hiện:

- Yêu cầu mơ hồ sau một lần làm rõ ngắn gọn.
- Thay đổi chạm 3 hoặc nhiều file vì lý do khác test hoặc tài liệu.
- Thay đổi ảnh hưởng xác thực, phân quyền, thanh toán, mất dữ liệu, migration, bảo mật, đồng thời hoặc trạng thái bền vững.
- Sửa lỗi yêu cầu chọn giữa nhiều hành vi sản phẩm.
- Người dùng yêu cầu tính năng, quy trình làm việc hoặc tích hợp thay vì chỉnh sửa nhỏ.
- Test không rõ và không thể làm rõ bằng kiểm tra nhỏ tập trung.

Khi leo thang, nêu rõ ràng:

> "Công việc này vượt quá phạm vi quick-dev vì [lý do cụ thể]. Chuyển sang brainstorming."

ĐỪNG hỏi có nên leo thang hay không — nếu cổng thất bại, leo thang là bắt buộc.

## Quy Trình

1. **Trao đổi và làm rõ vấn đề.** Tạo các câu hỏi trao đổi giải đáp trực tiếp với người dùng để xác định yêu cầu và làm rõ vấn đề bằng prompt values.
2. **Tái nêu ý định và xác minh phạm vi.** Nêu chính xác thay đổi, file dự kiến và lệnh xác minh trong 2-4 gạch đầu dòng. Nếu việc tái nêu tiết lộ sự mơ hồ hoặc phạm vi vượt quá cổng, leo thang ngay lập tức.
3. **Kiểm tra không gian làm việc.** Chạy `git status --short`. Nếu file dirty không liên quan chồng chéo file mục tiêu, làm việc cẩn thận hoặc hỏi trước khi tiến hành.
4. **Kiểm tra trước.** Đọc file liên quan và test hiện có trước khi chỉnh sửa.
5. **Làm thay đổi nhỏ nhất.** Tuân theo phong cách hiện có và tránh trừu tượng mới trừ khi mẫu cục bộ đã yêu cầu.
6. **Xác minh.** Chạy test liên quan hẹp nhất trước, sau đó lệnh rộng hơn khi dự án cung cấp.
7. **Tự đánh giá.** Kiểm tra diff cho sự tràn phạm vi, trường hợp biên bị bỏ qua, thay đổi format nhầm lẫn và đầu ra gỡ lỗi tạm thời.
8. **Yêu cầu đánh giá khi rủi ro cao và rủi ro nghiêm trọng.** Sử dụng `requesting-code-review` nếu thay đổi nhiều hơn chỉnh sửa cơ học một file.
9. **Báo cáo.** Tóm tắt file đã thay đổi và kết quả xác minh.

## Đánh Giá Một Lần

Đối với chỉnh sửa cơ học một file, sử dụng brainstorming để suy nghĩ và đánh giá rồi quyết định. Đối với bất cứ điều gì thay đổi hành vi qua ranh giới, chạy một lượt đánh giá code trước khi báo cáo hoàn thành.
