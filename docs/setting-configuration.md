# Hướng dẫn cấu hình `setting.json` (Security Policy)

Framework skill hỗ trợ cơ chế thiết lập chính sách bảo mật và tuỳ chỉnh luồng làm việc của AI thông qua file cấu hình tập trung `setting.json`. 

## Vị trí file cấu hình

Hệ thống hook của AI sẽ tìm kiếm và áp dụng cấu hình theo thứ tự ưu tiên sau:
1. **Local Project Workspace (Ưu tiên cao nhất):** `tais/setting.json` (nằm ở thư mục gốc của project bạn đang làm việc cùng AI).
2. **Global Fallback:** `setting.json` (nằm ở thư mục cài đặt gốc của plugin).

Để tuỳ chỉnh cho từng dự án, bạn chỉ cần tạo thư mục `tais/` và đặt file `setting.json` vào dự án của bạn.

## Cấu trúc file cấu hình mặc định

```json
{
  "policy": {
    "autoCommit": false,
    "autoTest": false,
    "dangerousCommands": {
      "blocked": [
        "rm -rf /",
        "rm -rf *",
        "mkfs",
        "dd",
        "chmod -R 777 /",
        "chown -R"
      ],
      "askConfirmation": true
    },
    "sensitiveFiles": {
      "blocked": [
        "**/.env",
        "**/*.pem",
        "**/.ssh/id_*",
        "**/secrets.json"
      ],
      "askConfirmation": true
    },
    "installAndUpdate": {
      "askUser": true
    }
  }
}
```

## Giải thích các trường cấu hình

### 1. `autoCommit` (boolean)
- **`true`**: Cho phép AI tự động xử lý git (stage, commit) nhánh đang làm việc sau khi hoàn thành task.
- **`false` (Mặc định)**: AI **TỪ CHỐI** tự động tạo commit. Nó sẽ giữ nguyên các thay đổi và hỏi rõ ý kiến bạn muốn giữ nguyên (Keep), gộp nhánh (Merge) hay huỷ bỏ (Discard).

### 2. `autoTest` (boolean)
- **`true`**: Cho phép AI chủ động chạy lệnh test của dự án (ví dụ: `npm test`) để kiểm chứng code trước khi báo cáo hoàn thành.
- **`false` (Mặc định)**: AI sẽ vô hiệu hoá việc tự động test. Nếu muốn chạy test, AI phải xin phép bạn (tránh việc test suite chạy quá lâu ngoài ý muốn).

### 3. `dangerousCommands` (object)
Quản lý các thao tác shell nhạy cảm:
- **`blocked` (array)**: Danh sách các lệnh bị cấm tuyệt đối. AI không được phép thực thi dưới bất kỳ hình thức nào.
- **`askConfirmation` (boolean)**: Các lệnh phá huỷ khác (ngoài danh sách cấm) bắt buộc AI phải dùng tool `ask_question` để xin phép người dùng trực tiếp.

### 4. `sensitiveFiles` (object)
Quản lý quyền truy cập các file mật khẩu/cấu hình:
- **`blocked` (array)**: Pattern chỉ định những file AI không được phép đọc/ghi (tránh việc AI đưa thông tin API keys, passwords vào bộ nhớ hoặc gửi đi).
- **`askConfirmation` (boolean)**: Đảm bảo tính minh bạch, nhắc nhở AI luôn cảnh giác khi làm việc gần các tệp nhạy cảm.

### 5. `installAndUpdate` (object)
- **`askUser` (boolean)**: Bắt buộc AI thông báo và xin phép trước khi cài thêm hoặc cập nhật dependency (NPM packages, Pip, Cargo,...).

## Chế độ Fallback & Headless

- **Safety Fallback**: Nếu `tais/setting.json` bị lỗi cú pháp hoặc thiếu công cụ parser (như `jq`), framework sẽ tự động kích hoạt trạng thái **Default-deny** — ngầm định `autoCommit`, `autoTest` = `false` và tải danh sách cấm tiêu chuẩn để bảo vệ an toàn tối đa.
- **Environment Override**: Để bypass qua các hộp thoại chờ xác nhận từ AI trong môi trường Headless, bạn có thể truyền biến môi trường `TAIS_SKIP_PROMPT=1`.
