---
name: using-git-worktrees
description: Sử dụng khi bắt đầu công việc tính năng cần cô lập khỏi không gian làm việc hiện tại hoặc trước khi thực thi kế hoạch triển khai - đảm bảo không gian làm việc cô lập tồn tại qua công cụ gốc hoặc git worktree dự phòng
---

# Sử Dụng Git Worktrees

## Tổng Quan

Đảm bảo công việc xảy ra trong không gian làm việc cô lập. Ưu tiên công cụ worktree gốc của nền tảng. Dự phòng git worktree thủ công chỉ khi không có công cụ gốc nào có sẵn.

**Nguyên tắc cốt lõi:** Phát hiện cô lập hiện có trước. Sau đó dùng công cụ gốc. Sau đó dự phòng git. Không bao giờ chiến đấu với harness.

**Thông báo bắt đầu:** "Tôi đang sử dụng kỹ năng using-git-worktrees để thiết lập không gian làm việc cô lập."

## Bước 0: Phát Hiện Cô Lập Hiện Có

**Trước khi tạo bất cứ thứ gì, kiểm tra xem bạn đã ở trong không gian làm việc cô lập chưa.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Rào chắn submodule:** `GIT_DIR != GIT_COMMON` cũng đúng bên trong git submodules. Trước khi kết luận "đã ở trong worktree," xác minh bạn không ở trong submodule:

```bash
# Nếu cái này trả về đường dẫn, bạn ở submodule, không phải worktree — coi như repo bình thường
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**Nếu `GIT_DIR != GIT_COMMON` (và không phải submodule):** Bạn đã ở trong linked worktree. Chuyển đến Bước 3 (Thiết Lập Dự Án). KHÔNG tạo worktree khác.

Báo cáo với trạng thái nhánh:
- Trên nhánh: "Đã ở trong không gian làm việc cô lập tại `<path>` trên nhánh `<name>`."
- Detached HEAD: "Đã ở trong không gian làm việc cô lập tại `<path>` (detached HEAD, quản lý bên ngoài). Cần tạo nhánh khi kết thúc."

**Nếu `GIT_DIR == GIT_COMMON` (hoặc trong submodule):** Bạn đang ở checkout repo bình thường.

Người dùng đã cho biết sở thích worktree trong hướng dẫn chưa? Nếu chưa, hỏi đồng ý trước khi tạo worktree:

> "Bạn có muốn tôi thiết lập worktree cô lập? Nó bảo vệ nhánh hiện tại khỏi thay đổi."

Tôn trọng bất kỳ sở thích đã tuyên bố nào không cần hỏi. Nếu người dùng từ chối đồng ý, làm việc tại chỗ và chuyển đến Bước 3.

## Bước 1: Tạo Không Gian Làm Việc Cô Lập

**Bạn có hai cơ chế. Thử theo thứ tự này.**

### 1a. Công Cụ Worktree Gốc (ưu tiên)

Người dùng đã yêu cầu không gian làm việc cô lập (Bước 0 đồng ý). Bạn đã có cách tạo worktree? Nó có thể là công cụ tên `EnterWorktree`, `WorktreeCreate`, lệnh `/worktree` hoặc cờ `--worktree`. Nếu có, sử dụng nó và chuyển đến Bước 3.

Công cụ gốc xử lý vị trí thư mục, tạo nhánh và dọn dẹp tự động. Sử dụng `git worktree add` khi bạn có công cụ gốc tạo trạng thái ảo mà harness không thể thấy hoặc quản lý.

Chỉ tiến đến Bước 1b nếu bạn không có công cụ worktree gốc nào.

### 1b. Git Worktree Dự Phòng

**Chỉ sử dụng nếu Bước 1a không áp dụng — bạn không có công cụ worktree gốc. Tạo worktree thủ công bằng git.

#### Chọn Thư Mục

Tuân theo thứ tự ưu tiên này. Sở thích người dùng rõ ràng luôn đánh bại trạng thái hệ thống file quan sát được.

1. **Kiểm tra hướng dẫn của bạn cho sở thích thư mục worktree đã được tuyên bố.** Nếu người dùng đã chỉ định, sử dụng nó không hỏi.

2. **Kiểm tra thư mục worktree cục bộ dự án hiện có:**
   ```bash
   ls -d .worktrees 2>/dev/null     # Ưu tiên (ẩn)
   ls -d worktrees 2>/dev/null      # Thay thế
   ```
   Nếu tìm thấy, sử dụng. Nếu cả hai tồn tại, `.worktrees` thắng.

3. **Kiểm tra thư mục toàn cục hiện có:**
   ```bash
   project=$(basename "$(git rev-parse --show-toplevel)")
   ls -d ~/.config/tungnt-ai-skills/worktrees/$project 2>/dev/null || ls -d ~/.config/superpowers/worktrees/$project 2>/dev/null
   ```
   Nếu tìm thấy, sử dụng. Ưu tiên `~/.config/tungnt-ai-skills/worktrees/`; giữ `~/.config/superpowers/worktrees/` chỉ cho tương thích ngược.

4. **Nếu không có hướng dẫn nào khác**, mặc định `.worktrees/` tại gốc dự án.

#### Xác Minh An Toàn (chỉ thư mục cục bộ dự án)

**PHẢI xác minh thư mục được bỏ qua trước khi tạo worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**Nếu KHÔNG bỏ qua:** Thêm vào .gitignore, commit thay đổi, sau đó tiến hành.

**Tại sao quan trọng:** Ngăn vô tình commit nội dung worktree vào kho lưu trữ.

Thư mục toàn cục (`~/.config/tungnt-ai-skills/worktrees/` và cũ `~/.config/superpowers/worktrees/`) không cần xác minh.

#### Tạo Worktree

```bash
project=$(basename "$(git rev-parse --show-toplevel)")

# Xác định đường dẫn dựa trên vị trí đã chọn
# Cho cục bộ dự án: path="$LOCATION/$BRANCH_NAME"
# Cho toàn cục: path="~/.config/tungnt-ai-skills/worktrees/$project/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Dự phòng Sandbox:** Nếu `git worktree add` thất bại với lỗi quyền (từ chối sandbox), nói người dùng sandbox đã chặn tạo worktree và bạn đang làm việc trong thư mục hiện tại thay thế. Sau đó chạy thiết lập và test cơ sở tại chỗ.

## Bước 3: Thiết Lập Dự Án

Tự động phát hiện và chạy thiết lập phù hợp:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## Bước 4: Xác Minh Cơ Sở Sạch

### Quét Cài Đặt

- Kiểm tra đã ghi nhớ policy để tuân thủ chưa, TUÂN THỦ nghiêm ngặt theo policy nếu như bị mất hoặc không thấy policy đọc `tais/setting.json` trong không gian làm việc hiện tại nếu có (dự phòng: `setting.json` tại gốc plugin) (chỉ đọc — không bao giờ thay đổi). Kiểm tra `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles` và `policy.installAndUpdate` để định hình câu hỏi nào bạn đặt và giả định mặc định nào bạn chấp nhận.

Nếu file bị thiếu, tiếp tục với mặc định. BẮT BUỘC và GHI NHỚ làm theo settings trong `tais/setting.json` (dự phòng: `setting.json` tại gốc plugin)

BẮT BUỘC ghi nhớ các policy khi thực hiện, LUÔN ƯU TIÊN theo `tais/setting.json` trong không gian làm việc hiện tại nếu có hoặc `setting.json` tại gốc plugin để lấy policy.

### Xác minh

Kiểm tra `policy.autoTest` có bật thì thực hiện tiếp

Chạy test để đảm bảo không gian làm việc bắt đầu sạch:

```bash
# Sử dụng lệnh phù hợp dự án
npm test / cargo test / pytest / go test ./...
```

**Nếu test thất bại:** Báo cáo thất bại, hỏi có nên tiến hành hoặc điều tra không.

**Nếu test pass:** Báo cáo sẵn sàng.

Nếu không bật `policy.autoTest` thông báo "Tuân thủ quy định bỏ qua bước kiểm tra xác minh. Bạn chạy thủ công test để đảm bảo không gian làm việc sạch." và gửi danh danh lệnh test cho người dùng chạy.

### Báo Cáo

```
Worktree sẵn sàng tại <đường-dẫn-đầy-đủ>
Test pass (<N> test, 0 lỗi)
Sẵn sàng triển khai <tên-tính-năng>
```

## Tra Cứu Nhanh

| Tình huống | Hành động |
|-----------|--------|
| Đã ở trong linked worktree | Bỏ qua tạo (Bước 0) |
| Trong submodule | Coi như repo bình thường (rào chắn Bước 0) |
| Có công cụ worktree gốc | Sử dụng nó (Bước 1a) |
| Không có công cụ gốc | Git worktree dự phòng (Bước 1b) |
| `.worktrees/` tồn tại | Sử dụng (xác minh bỏ qua) |
| `worktrees/` tồn tại | Sử dụng (xác minh bỏ qua) |
| Cả hai tồn tại | Sử dụng `.worktrees/` |
| Không tồn tại | Kiểm tra file hướng dẫn, sau đó mặc định `.worktrees/` |
| Đường dẫn toàn cục tồn tại | Sử dụng (tương thích ngược) |
| Thư mục không bỏ qua | Thêm vào .gitignore + commit (tuân thủ theo policy) |
| Lỗi quyền khi tạo | Dự phòng sandbox, làm việc tại chỗ |
| Test thất bại khi kiểm tra cơ sở | Báo thất bại + hỏi (tuân thủ theo policy) |
| Không có package.json/Cargo.toml | Bỏ qua cài đặt phụ thuộc |

## Sai Lầm Phổ Biến

### Chiến đấu với harness

- **Vấn đề:** Sử dụng `git worktree add` khi nền tảng đã cung cấp cô lập
- **Sửa:** Bước 0 phát hiện cô lập hiện có. Bước 1a ưu tiên công cụ gốc.

### Bỏ qua phát hiện

- **Vấn đề:** Tạo worktree lồng bên trong worktree hiện có
- **Sửa:** Luôn chạy Bước 0 trước khi tạo bất cứ thứ gì

### Bỏ qua xác minh bỏ qua

- **Vấn đề:** Nội dung worktree bị theo dõi, làm ô nhiễm git status
- **Sửa:** Luôn dùng `git check-ignore` trước khi tạo worktree cục bộ dự án

### Giả định vị trí thư mục

- **Vấn đề:** Tạo không nhất quán, vi phạm quy ước dự án
- **Sửa:** Tuần tự ưu tiên: hiện có > toàn cục cũ > file hướng dẫn > mặc định

### Tiến hành với test thất bại

- **Vấn đề:** Không thể phân biệt lỗi mới từ vấn đề có sẵn
- **Sửa:** Báo thất bại, nhận cho phép rõ ràng để tiến hành

## Tín Hiệu Cảnh Báo

**Không bao giờ:**
- Tạo worktree khi Bước 0 phát hiện cô lập hiện có
- Sử dụng `git worktree add` khi bạn có công cụ worktree gốc (ví dụ `EnterWorktree`). Đây là lỗi #1 — nếu bạn có, hãy dùng nó.
- Bỏ qua Bước 1a bằng cách nhảy thẳng đến lệnh git Bước 1b
- Tạo worktree không xác minh nó bị bỏ qua (cục bộ dự án)
- Bỏ qua xác minh test cơ sở (chỉ chấp nhận khi policy của `setting.json` yêu cầu bỏ qua)
- Tiến hành với test thất bại không hỏi (chỉ làm khi policy của `setting.json` yêu cầu)

**Luôn:**
- Chạy phát hiện Bước 0 trước
- Ưu tiên công cụ gốc hơn git dự phòng
- Tuần tự thư mục: hiện có > toàn cục cũ > file hướng dẫn > mặc định
- Xác minh thư mục bị bỏ qua cho cục bộ dự án
- Tự động phát hiện và chạy thiết lập dự án
- Xác minh cơ sở test sạch (TUÂN THỦ policy của `setting.json`). Nếu không yêu cầu test thông báo người dùng ví dụ "Xác minh cơ sở test sạch chưa chạy lý do bạn đang cấu hình không chạy test. Vui lòng kiểm tra thủ công hoặc cài đặt thông qua /configuring-settings để bật test xác minh cơ sở".
