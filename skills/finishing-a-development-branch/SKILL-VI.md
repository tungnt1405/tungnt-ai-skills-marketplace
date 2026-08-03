---
name: finishing-a-development-branch
description: Sử dụng khi triển khai hoàn tất, tất cả test pass, và bạn cần quyết định cách tích hợp công việc - hướng dẫn hoàn thành công việc phát triển bằng cách trình bày các tùy chọn có cấu trúc để merge, PR hoặc dọn dẹp
---

# Hoàn Thất Nhánh Phát Triển

## Quét Cài Đặt

- Kiểm tra đã ghi nhớ policy để tuân thủ chưa, TUÂN THỦ nghiêm ngặt theo policy nếu như bị mất hoặc không thấy policy: đọc `tais/setting.json` trong không gian làm việc hiện tại nếu có (dự phòng: `setting.json` tại gốc plugin) (chỉ đọc — không bao giờ thay đổi). Kiểm tra `policy.autoCommit`, `policy.autoTest`, `policy.dangerousCommands`, `policy.sensitiveFiles` và `policy.installAndUpdate` để định hình câu hỏi nào bạn đặt và giả định mặc định nào bạn chấp nhận.

Nếu file bị thiếu, tiếp tục với mặc định. BẮT BUỘC và GHI NHỚ làm theo settings trong `setting.json` (dự phòng: `setting.json` tại gốc plugin)

BẮT BUỘC ghi nhớ các policy khi thực hiện, LUÔN ƯU TIÊN theo `tais/setting.json` trong không gian làm việc hiện tại nếu có hoặc `setting.json` tại gốc plugin để lấy policy.

## Tổng Quan

Hướng dẫn hoàn thành công việc phát triển bằng cách trình bày các tùy chọn rõ ràng và xử lý quy trình làm việc được chọn.

**Nguyên tắc cốt lõi:** Xác minh Định Nghĩa Hoàn Thành -> Xác minh test (nếu `policy.autoTest` bật thì chạy test, nếu tắt thì bỏ qua) -> Phát hiện môi trường -> Trình bày tùy chọn -> Thực thi lựa chọn ( `policy.dangerousCommands`, `policy.sensitiveFiles` và `policy.installAndUpdate` có đặt hạn chế thì tuân thủ nghiêm ngặt không chạy những lệnh thực thi bị cấm) -> Dọn dẹp.

**Thông báo bắt đầu:** "Tôi đang sử dụng kỹ năng finishing-a-development-branch để hoàn thành công việc này."

## Quy Trình

### Bước 1: Xác Minh Định Nghĩa Hoàn Thành

Trước khi trình bày các tùy chọn merge, PR, giữ hoặc loại bỏ, xác minh công việc thực sự đã xong:

- Tất cả nhiệm vụ kế hoạch được đánh dấu hoàn thành trong kế hoạch và đỏi trạng thái trong kế hoạch.
- Tất cả test mới và hiện có liên quan đến thay đổi pass.
- Code đã sửa không chứa placeholder tạm thời, đầu ra gỡ lỗi hoặc đánh dấu `TODO` / `FIXME` đúng nghĩa do thay đổi này gây ra.
- Tiêu chí chấp thuận được ánh xạ tới test hoặc lệnh xác minh rõ ràng.
- Kết quả đánh giá đánh dấu Must-Fix, Should-Fix, Critical hoặc Important được giải quyết hoặc từ chối rõ ràng bằng bằng chứng.

Kiểm tra gợi ý:

```bash
git diff --check
rg -n "TODO|FIXME|console\\.log|debugger" <các-file-đã-sửa>
```

Nếu bất kỳ mục Định Nghĩa Hoàn Thành nào thất bại, dừng lại và sửa trước khi tiếp tục.

### Bước 2: Xác Minh Test

**Kiểm Tra Chính Sách Auto-Test:**
Nếu `policy.autoTest` bị tắt, bỏ qua bước này hoàn toàn và tiến đến Bước 3 mà không chạy bất kỳ test nào.
Nếu `policy.autoTest` được bật, tiến hành xác minh:

**Trước khi trình bày tùy chọn, xác minh test pass:**

```bash
# Chạy bộ test của dự án
npm test / cargo test / pytest / go test ./...
```

**Nếu test thất bại:**
```
Test thất bại (<N> lỗi). Phải sửa trước khi hoàn thành:

[Hiển thị lỗi]

Không thể tiếp tục merge/PR cho đến khi test pass.
```

Dừng. Không tiến đến Bước 3.

**Nếu test pass:** Tiếp tục Bước 3.

### Bước 3: Phát Hiện Môi Trường

**Xác định trạng thái không gian làm việc trước khi trình bày tùy chọn:**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

Điều này quyết định menu nào hiển thị và dọn dẹp hoạt động như thế nào:

| Trạng thái | Menu | Dọn Dẹp |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON` (repo bình thường) | 4 tùy chọn tiêu chuẩn | Không có worktree cần dọn |
| `GIT_DIR != GIT_COMMON`, nhánh có tên | 4 tùy chọn tiêu chuẩn | Dựa trên nguồn gốc (xem Bước 7) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | 3 tùy chọn rút gọn (không merge) | Không dọn dẹp (quản lý bên ngoài) |

### Bước 4: Xác Định Nhánh Cơ Sở

```bash
# Thử các nhánh cơ sở phổ biến
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Hoặc hỏi: "Nhánh này tách từ main - đúng không?"

### Bước 5: Trình Bày Tùy Chọn

**Kiểm Tra Chính Sách Auto-Commit:**
Nếu `policy.autoCommit` bị tắt, không tự động thực thi merge/push/discard. Vẫn trình bày các tùy chọn, nhưng chỉ thực hiện hành động khi người dùng chọn rõ ràng.

Nếu `policy.autoCommit` được bật, tiến trình trình bày tùy chọn:

**Repo bình thường và worktree nhánh có tên — trình bày chính xác 4 tùy chọn này:**

```
Triển khai hoàn tất. Bạn muốn làm gì?

1. Merge về <base-branch> cục bộ
2. Push và tạo Pull Request
3. Giữ nhánh như hiện tại (Sẽ tự xử lý sau)
4. Loại bỏ công việc này

Tùy chọn nào?
```

**Detached HEAD — trình bày chính xác 3 tùy chọn này:**

```
Triển khai hoàn tất. Bạn đang ở detached HEAD (không gian làm việc được quản lý bên ngoài).

1. Push làm nhánh mới và tạo Pull Request
2. Giữ như hiện tại (Sẽ tự xử lý sau)
3. Loại bỏ công việc này

Tùy chọn nào?
```

**Không thêm giải thích** - giữ tùy chọn ngắn gọn.

### Bước 6: Thực Thi Lựa Chọn

#### Tùy Chọn 1: Merge Cục Bộ

```bash
# Lấy gốc repo chính cho an toàn CWD
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge trước — xác minh thành công trước khi xóa bất cứ thứ gì
git checkout <base-branch>
git pull
git merge <feature-branch>

# Xác minh test trên kết quả đã merge
<lệnh test>

# Chỉ sau khi merge thành công: dọn dẹp worktree (Bước 7), sau đó xóa nhánh
```

Sau đó: Dọn dẹp worktree (Bước 7), sau đó xóa nhánh:

```bash
git branch -d <feature-branch>
```

#### Tùy Chọn 2: Push và Tạo PR

```bash
# Push nhánh
git push -u origin <feature-branch>

# Tạo PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Tóm Tắt
<2-3 gạch đầu dòng về những gì đã thay đổi>

## Kế Hoạch Test
- [ ] <bước xác minh>
EOF
)"
```

**KHÔNG dọn dẹp worktree** — người dùng cần nó sống để lặp lại dựa trên phản hồi PR.

#### Tùy Chọn 3: Giữ Như Hiện Tại

Báo cáo: "Giữ nhánh <tên>. Worktree được bảo toàn tại <đường dẫn>."

**Không dọn dẹp worktree.**

#### Tùy Chọn 4: Loại Bỏ

**Xác nhận trước:**
```
Điều này sẽ xóa vĩnh viễn:
- Nhánh <tên>
- Tất cả commit: <danh-sách-commit>
- Worktree tại <đường dẫn>

Gõ 'discard' để xác nhận.
```

Chờ xác nhận chính xác.

Nếu xác nhận:
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

Sau đó: Dọn dẹp worktree (Bước 7), sau đó xóa nhánh ép buộc:
```bash
git branch -D <feature-branch>
```

### Bước 7: Dọn Dẹp Không Gian Làm Việc

**Chỉ chạy cho Tùy Chọn 1 và 4.** Tùy Chọn 2 và 3 luôn bảo toàn worktree.

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**Nếu `GIT_DIR == GIT_COMMON`:** Repo bình thường, không có worktree cần dọn. Xong.

**Nếu đường dẫn worktree nằm trong `.worktrees/`, `worktrees/`, `~/.config/tungnt-ai-skills/worktrees/`, hoặc cũ `~/.config/superpowers/worktrees/`:** tungnt-ai-skills tạo worktree này — chúng tôi sở hữu việc dọn dẹp.

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Tự chữa lành: dọn dẹp đăng ký lỗi thời
```

**Khác:** Môi trường chủ (harness) sở hữu không gian làm việc này. KHÔNG xóa. Nếu nền tảng cung cấp công cụ thoát worktree, hãy dùng. Ngược lại, để không gian làm việc nguyên vẹn.

## Tra Cứu Nhanh

| Tùy chọn | Merge | Push | Giữ Worktree | Dọn Dẹp Nhánh |
|--------|-------|------|---------------|----------------|
| 1. Merge cục bộ | yes | - | - | yes |
| 2. Tạo PR | - | yes | yes | - |
| 3. Giữ như hiện tại | - | - | yes | - |
| 4. Loại bỏ | - | - | - | yes (ép buộc) |

## Sai Lầm Phổ Biến

**Bỏ qua xác minh test**
- **Vấn đề:** Merge code bị lỗi, tạo PR thất bại
- **Sửa:** Luôn xác minh test trước khi đưa ra tùy chọn

**Câu hỏi mở**
- **Vấn đề:** "Tiếp theo làm gì?" mơ hồ
- **Sửa:** Trình bày chính xác 4 tùy chọn có cấu trúc (hoặc 3 cho detached HEAD)

**Dọn dẹp worktree cho Tùy Chọn 2**
- **Vấn đề:** Xóa worktree người dùng cần cho lặp PR
- **Sửa:** Chỉ dọn dẹp cho Tùy Chọn 1 và 4

**Xóa nhánh trước khi xóa worktree**
- **Vấn đề:** `git branch -d` thất bại vì worktree vẫn tham chiếu nhánh
- **Sửa:** Merge trước, xóa worktree, sau đó xóa nhánh

**Chạy `git worktree remove` từ bên trong worktree**
- **Vấn đề:** Lệnh thất bại im lặng khi CWD bên trong worktree bị xóa
- **Sửa:** Luôn `cd` tới gốc repo chính trước `git worktree remove`

**Dọn dẹp worktree sở hữu harness**
- **Vấn đề:** Xóa worktree harness tạo gây trạng thái ảo
- **Sửa:** Chỉ dọn dẹp worktree trong `.worktrees/`, `worktrees/`, `~/.config/tungnt-ai-skills/worktrees/`, hoặc cũ `~/.config/superpowers/worktrees/`

**Không xác nhận cho loại bỏ**
- **Vấn đề:** Xóa công việc nhầm
- **Sửa:** Yêu cầu gõ chính xác "discard" để xác nhận

## Tín Hiệu Cảnh Báo

**Không bao giờ:**
- Tiếp tục với test thất bại
- Merge mà không xác minh test trên kết quả
- Xóa công việc không xác nhận
- Force-push không yêu cầu rõ ràng
- Xóa worktree trước khi xác nhận merge thành công
- Dọn dẹp worktree bạn không tạo (kiểm tra nguồn gốc)
- Chạy `git worktree remove` từ bên trong worktree

**Luôn:**
- Xác minh test trước khi đưa ra tùy chọn
- Phát hiện môi trường trước khi trình bày menu
- Trình bày chính xác 4 tùy chọn (hoặc 3 cho detached HEAD)
- Nhận xác nhận gõ cho Tùy Chọn 4
- Dọn dẹp worktree cho Tùy Chọn 1 & 4 chỉ
- `cd` tới gốc repo chính trước khi xóa worktree
- Chạy `git worktree prune` sau khi xóa