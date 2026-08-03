---
name: configuring-settings
description: Sử dụng kỹ năng này khi người dùng cần cấu hình cài đặt bảo mật và quy trình làm việc (setting.json) cho tungnt-ai-skills, ở mức chung hoặc cục bộ.
---

# Cấu Hình Cài Đặt

## Tổng Quan
Kỹ năng này giúp người dùng cấu hình file `setting.json` quản lý Auto-Commit, Auto-Test, lệnh bị chặn và file nhạy cảm. Nó thường được gọi trong quá trình cài đặt lần đầu, cập nhật hoặc khi người dùng yêu cầu.

## Bước 1: Hỏi Phạm Vi Cấu Hình
Nếu người dùng chưa chỉ định sở thích, hỏi họ:
"Bạn muốn cấu hình settings ở mức **Chung (Global)** (áp dụng cho mọi dự án dùng AI) hay **Cục bộ (Local)** (chỉ áp dụng cho dự án hiện tại)?"
*Khuyến nghị:* Luôn khuyến nghị **Global** cho thiết lập đầu tiên để cài đặt áp dụng mọi nơi.

## Bước 2: Xác Định Đường Dẫn File
Đọc `<SECURITY_POLICY>` từ ngữ cảnh hệ thống để tìm `Plugin Root`.
- **Global**: File cài đặt phải được lưu chính xác tại `[Plugin Root]/setting.json`.
- **Local**: File cài đặt phải được lưu tại `tais/setting.json` tương đối với thư mục làm việc hiện tại.

## Bước 3: Hỏi Sở Thích Cấu Hình
Hỏi người dùng về sở thích của họ cho mỗi khóa cấu hình. Bạn có thể sử dụng prompt tương tác hoặc chat tiêu chuẩn.
Nói rõ với người dùng: *"Nếu bạn để trống, hệ thống sẽ tự động sử dụng giá trị mặc định an toàn."*

Các khóa cần cấu hình:
1. **autoCommit**: `true` hoặc `false` (Mặc định: `false`)
2. **autoTest**: `true` hoặc `false` (Mặc định: `false`)
3. **dangerousCommands.blocked**: Danh sách lệnh shell bị chặn (Mặc định: `["rm -rf /", "rm -rf *", "mkfs", "dd", "chmod -R 777 /", "chown -R"]`)
4. **sensitiveFiles.blocked**: Danh sách mẫu file nhạy cảm bị chặn (Mặc định: `["**/.env", "**/*.pem", "**/.ssh/id_*", "**/secrets.json"]`)

## Bước 4: Ghi Cấu Hình
Tạo hoặc cập nhật file `setting.json` mục tiêu sử dụng template JSON dưới đây. Thay thế các placeholder bằng lựa chọn của người dùng. Nếu người dùng không cung cấp đầu vào cho một khóa cụ thể, thay thế placeholder bằng giá trị mặc định trong Bước 3.

```json
{
  "policy": {
    "autoCommit": <autoCommit_value>,
    "autoTest": <autoTest_value>,
    "dangerousCommands": {
      "blocked": [
        <blockedCommands_list>
      ],
      "askConfirmation": true
    },
    "sensitiveFiles": {
      "blocked": [
        <sensitiveFiles_list>
      ],
      "askConfirmation": true
    },
    "installAndUpdate": {
      "askUser": true
    }
  }
}
```

## Bước 5: Kết Thúc
Sau khi ghi file thành công, thông báo cho người dùng rằng cài đặt đã được áp dụng. Nói với họ rằng cảnh báo sẽ biến mất và framework sẽ tuân theo chính sách đã định.
