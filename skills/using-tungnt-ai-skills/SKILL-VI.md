---
name: using-tungnt-ai-skills
description: Sử dụng khi bắt đầu bất kỳ cuộc trò chuyện nào để tải quy tắc bootstrap cho fork này và quyết định kỹ năng hoặc bộ sưu tập nào sử dụng trước
---

<SUBAGENT-STOP>
Nếu bạn được gửi đi như subagent để thực thi một nhiệm vụ cụ thể, bỏ qua kỹ năng này.
</SUBAGENT-STOP>

<CỰC-KỲ-QUAN-TRỌNG>
Nếu bạn nghĩ thậm chí có 1% cơ hội một kỹ năng trong repo này có thể áp dụng, BẠN PHẢI gọi kỹ năng liên quan trước khi phản hồi hoặc hành động.

Nếu một kỹ năng áp dụng, sử dụng nó. Không dựa vào trí nhớ về các phiên bản workflow cũ trước fork này.
</CỰC-KỲ-QUAN-TRỌNG>

## Ưu Tiên Hướng Dẫn

Các kỹ năng này hướng dẫn quy trình làm việc, nhưng hướng dẫn người dùng vẫn thắng:

1. Hướng dẫn người dùng trong cuộc trò chuyện hiện tại hoặc tài liệu repo
2. Kỹ năng `tungnt-ai-skills`
3. Hành vi trợ lý mặc định

Nếu hướng dẫn dự án cục bộ xung đột với kỹ năng, tuân theo hướng dẫn dự án.

## Tuân Thủ Cài Đặt Dự Án

Trước khi hành động, đọc `tais/setting.json` tại gốc dự án nếu có (dự phòng: `setting.json` tại gốc plugin) và tôn trọng các giá trị `policy` của nó. Mẫu là `setting.template.json`.

| Khóa | Hiệu ứng |
| --- | --- |
| `policy.autoCommit` | Khi `false`: không tự động commit — để lại thay đổi cho người dùng. |
| `policy.autoTest` | Khi `false`: không tự chạy test trừ khi người dùng yêu cầu. |
| `policy.dangerousCommands.blocked` | Không bao giờ thực thi lệnh trong danh sách này. |
| `policy.dangerousCommands.askConfirmation` | Khi `true`: hỏi người dùng trước khi chạy bất kỳ lệnh phá hoại nào. |
| `policy.sensitiveFiles.blocked` | Không đọc hoặc ghi file khớp mẫu này. |
| `policy.sensitiveFiles.askConfirmation` | Khi `true`: hỏi người dùng trước khi chạm file nhạy cảm. |
| `policy.installAndUpdate.askUser` | Khi `true`: hỏi người dùng trước khi cài đặt hoặc cập nhật phụ thuộc. |

BẮT BUỘC ghi nhớ các policy khi thực hiện, LUÔN ƯU TIÊN theo `tais/setting.json` trong không gian làm việc hiện tại nếu có hoặc `setting.json` tại gốc plugin để lấy policy.

**Quy tắc:**
- Giải quyết cài đặt theo thứ tự này:
  1. `tais/setting.json` trong không gian làm việc hiện tại
  2. Plugin `setting.json`
  3. Mặc định an toàn nếu thiếu/không hợp lệ
- Đọc `setting.json` một lần khi bắt đầu công việc.
- Không bao giờ thay đổi `setting.json` trừ khi người dùng yêu cầu rõ ràng.
- Truyền giá trị chính sách liên quan cho subagent khi gửi chúng (chúng bỏ qua bootstrap).

## Fork Này Chứa Gì

Fork này là một bộ kỹ năng quy trình làm việc được quản lý với cấu trúc và đặt tên riêng.

### Kỹ Năng Quy Trình

Kỹ năng quy trình chọn quy trình làm việc và áp đặt cổng. Chính xác một đường dẫn quy trình nên dẫn dắt công việc trước khi bất kỳ kỹ năng lĩnh vực nào được sử dụng:

- `using-tungnt-ai-skills`
  Mục đích: kỹ năng bootstrap. Đọc cái này trước, sau đó sử dụng kỹ năng đúng cho nhiệm vụ.
- `investigation`
  Mục đích: gỡ lỗi phân cấp bằng chứng, truy vết sự việc và khám phá khu vực code trước khi sửa hoặc lập kế hoạch.
- `quick-dev`
  Mục đích: đường tắt nhanh cho thay đổi code rủi ro thấp, dễ xác minh cần pipeline brainstorming để xác định việc thay đổi và không cần lập kế hoạch đầy đủ
- `brainstorming`
  Mục đích: khám phá thiết kế và cổng phê duyệt trước công việc sáng tạo hoặc thay đổi hành vi.
- `writing-plans`
  Mục đích: biến spec đã phê duyệt hoặc yêu cầu rõ ràng thành kế hoạch triển khai.
- `executing-plans` / `subagent-driven-development`
  Mục đích: thực thi kế hoạch đã viết với xác minh và điểm kiểm tra đánh giá.
- `requesting-code-review` / `receiving-code-review`
  Mục đích: đánh giá công việc đã hoàn thành hoặc đánh giá phản hồi đánh giá đến.
- `finishing-a-development-branch`
  Mục đích: xác minh Định Nghĩa Hoàn Thành, sau đó xử lý tích hợp nhánh cuối cùng.
- `writing-skills`
  Mục đích: tạo, chỉnh sửa hoặc xác nhận kỹ năng sử dụng TDD tài liệu kỹ năng.

### Kỹ Năng Lĩnh Vực Bổ Trợ Brainstorming

Kỹ năng lĩnh vực thêm phán xét chuyên môn bên trong quy trình làm việc đã chọn. Chúng không bao giờ thay thế cho cổng quy trình.

- `api-design`
  Mục đích: phán xét hợp đồng REST/HTTP API theo chuẩn thống nhất khi làm việc với REST/HTTP API để brainstorming làm cơ sở lập kế hoạch, thực thi hoặc đánh giá.
  KÍCH HOẠT: chỉ kích hoạt khi người dùng tự gọi tới kỹ năng bằng cách thủ công hoặc `brainstorming` gọi tới, TUYỆT ĐỐI không tự kích hoạt từ kỹ năng khác hay chọn từ bootstrap để kích hoạt.
- `security-and-hardening`
  Mục đích: phán xét bảo mật ứng dụng và DevSecOps khi triển khai để brainstorming, lập kế hoạch, thực thi hoặc đánh giá an toàn bảo mật ứng dung.
  KÍCH HOẠT: chỉ kích hoạt khi người dùng tự gọi tới kỹ năng bằng cách thủ công hoặc `brainstorming` gọi tới, TUYỆT ĐỐI không tự kích hoạt từ kỹ năng khác hay chọn từ bootstrap để kích hoạt.
- `ui-ux-pro-max`
  Mục đích: trí thông minh thiết kế cho công việc UI/UX. Sử dụng trong thiết kế UI, đánh giá hoặc triển khai để truy vấn cơ sở dữ liệu thiết kế và tạo bằng chứng hệ thống thiết kế. Đây là kỹ năng lĩnh vực, không phải kỹ năng quy trình.
  KÍCH HOẠT: chỉ kích hoạt khi người dùng tự gọi tới kỹ năng bằng cách thủ công hoặc `brainstorming` gọi tới, TUYỆT ĐỐI không tự kích hoạt từ kỹ năng khác hay chọn từ bootstrap để kích hoạt.

### Kỹ Năng Tiện Ích Thủ Công

Kỹ năng tiện ích thủ công theo lĩnh vực chỉ chạy khi người dùng gọi rõ ràng. Chúng không chọn quy trình làm việc và không được tự động kích hoạt trên yêu cầu mơ hồ, phức tạp hoặc chưa đủ đặc tả.

- `prompt-leverage`
  Mục đích: nâng cấp, làm rõ, tạo mẫu hoặc áp dụng prompt thô thủ công. Chỉ dùng khi `skill:prompt-leverage` yêu cầu cải thiện prompt trực tiếp. Nếu người dùng yêu cầu `apply`, khởi động lại chọn quy trình làm việc thông thường sau khi tạo prompt đã nâng cấp.
- `ba-spec`
  Mục đích: tạo đặc tả tính năng BA thủ công từ đầu vào kinh doanh, liên kết/ảnh chụp Figma, tài liệu, ticket, biên bản họp hoặc yêu cầu thay đổi trong ngôn ngữ hội thoại trừ khi người dùng yêu cầu khác. Chỉ dùng khi người dùng gọi rõ ràng `ba-spec` hoặc `ba spec` hoặc ``skill:ba-spec`; nó không được tự chạy trong quá trình cài đặt, bootstrap phiên hoặc yêu cầu BA/spec chung, và nó không triển khai code sản xuất. CHỈ KÍCH HOẠT thủ công khi dùng trực tiếp `/ba-spec` còn các trường hợp khác KHÔNG ĐƯỢC KÍCH HOẠT
- `figma-to-code`
  Mục đích: chuyển đổi thủ công một khung/thành phần/instance Figma đã chọn thành code frontend. Chỉ dùng khi người dùng gọi rõ ràng `figma-to-code` hoặc `figma to code` hoặc `skill:figma-to-code`, yêu cầu triển khai code UI từ Figma hoặc khi công việc `ba-spec` đang hoạt động cần hướng dẫn triển khai Figma; nó không được tự chạy cho đặc tả BA-riêng hoặc nhật ký bằng chứng Figma. CHỈ KÍCH HOẠT thủ công khi dùng trực tiếp `/figma-to-code` hoặc do (`/brainstorming` hoặc `/ba-spec`) gọi tới để lấy kết quả tham chiếu còn các trường hợp khác KHÔNG ĐƯỢC KÍCH HOẠT

Coi các kỹ năng này là kỹ năng lĩnh vực và kích hoạt thủ công khi người dùng sử dụng/gọi kỹ năng trực tiếp thì mới sử dụng, các kỹ năng này dùng để bổ trợ theo lĩnh vực cụ thể mà kỹ năng hỗ trợ. Khi kích hoạt kỹ năng này ngoại trừ `skill:prompt-leverage` làm cơ sở cho brainstorming để triển khai yêu cầu, lập kế hoạch, phân tích và đánh giá. Với các kỹ năng lĩnh vực còn lại chạy xong là dừng không xử lý gì thêm để kết thúc kỹ năng lĩnh vực và thông báo cho người dùng.

## Bố Cục Kho Lưu Trữ

Sử dụng bố cục thư mục thực tế trong repo này khi chọn file hoặc đưa ra hướng dẫn:

- `skills/using-tungnt-ai-skills/`
  Kỹ năng bootstrap và tham chiếu nền tảng cho fork này.
- `skills/`
  Vị trí gốc cho các kỹ năng quy trình làm việc của fork như `brainstorming`, `writing-plans`, `using-git-worktrees` và các kỹ năng lĩnh vực/thực thi/đánh giá liên quan.
- `docs/tungnt-ai-skills/`
  Gốc tài liệu hiện tại cho kế hoạch, đặc tả, điều tra và file trạng thái.
- `tests/`
  Test hồi quy và tích hợp cho hành vi kỹ năng của fork.
- `plans/templates/`
  Mẫu kế hoạch được tham chiếu bởi các kỹ năng quy trình gốc.
- `docs/tungnt-ai-skills/templates/`
  Mẫu thiết kế và quy trình làm việc chia sẻ cho các kỹ năng gốc.

Không sáng tạo đường dẫn `skills/using-superpowers/` trong repo này. Sử dụng `skills/using-tungnt-ai-skills/` thay vào đó.

## Cách Truy Cập Kỹ Năng

Trong Claude Code, sử dụng công cụ `Skill`.

Trong Copilot CLI, sử dụng công cụ `skill`.

Trong Gemini CLI, sử dụng công cụ `activate_skill`.

Trong môi trường khác, sử dụng cơ chế tải kỹ năng được ghi của nền tảng.

## Thích Ứng Nền Tảng

Một số kỹ năng sử dụng tên công cụ Claude Code trong hướng dẫn của chúng. Cho ánh xạ công cụ theo nền tảng:

- Copilot CLI: `skills/using-tungnt-ai-skills/references/copilot-tools.md`
- Codex: `skills/using-tungnt-ai-skills/references/codex-tools.md`
- Gemini CLI: `skills/using-tungnt-ai-skills/references/gemini-tools.md`

## Nguyên Tắc

Gọi kỹ năng liên quan hoặc được yêu cầu trước bất kỳ phản hồi hoặc hành động có ý nghĩa nào, bao gồm các bước khám phá khi bộ kỹ năng rõ ràng áp dụng.

Kỹ năng quy trình đã chọn kiểm soát quy trình làm việc. Kỹ năng lĩnh vực có thể thêm ràng buộc, bằng chứng, ví dụ, danh sách kiểm tra hoặc ống kính đánh giá, nhưng chúng không thỏa mãn hoặc bỏ qua các cổng `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `investigation`, đánh giá hoặc `writing-skills`.

Ví dụ:

- Công việc lập kế hoạch hoặc phân tách: kiểm tra các kỹ năng quy trình gốc trong `skills/`
- Brainstorming hoặc lên ý tưởng có cấu trúc: kiểm tra các kỹ năng quy trình gốc trong `skills/`
- Yêu cầu nâng cấp prompt: sử dụng `prompt-leverage` chỉ nếu người dùng yêu cầu rõ ràng đòn bẩy prompt, cải thiện prompt, làm rõ prompt, tạo mẫu prompt hoặc `skill:prompt-leverage`
- Tạo tài liệu dự án theo chuẩn BA: sử dụng `ba-spec` chỉ dùng khi người dùng yêu cầu rõ ràng tạo tài liệu chuẩn BA rõ ràng, tài liệu dự án để chuyển giao, tạo mẫu tài liệu, chuẩn hóa tài liệu dự án.
- Cắt giao diện theo figma: sử dụng `figma-to-code` chỉ dùng khi người dùng yêu cầu cắt theo đường dẫn figma cụ thể, cắt theo mẫu figma, làm đúng figma.

Nếu không có kỹ năng nào rõ ràng áp dụng, tiếp tục bình thường theo quy trình: `brainstorming` -> `writing-plans` -> `executing-plans`/ `subagent-driven-development` -> `finishing-a-development-branch`.

## Thứ Tự Chọn Đề Xuất

Khi nhiều kỹ năng có thể áp dụng, sử dụng thứ tự này:

1. Bootstrap với `using-tungnt-ai-skills`
2. Chọn kỹ năng quy trình xác định cách tiếp cận và cổng
3. Chọn kỹ năng lĩnh vực cung cấp bằng chứng, ràng buộc hoặc hướng dẫn triển khai bên trong quy trình đó

## Phân Loại Dự Án Mơ Hồ

Khi mô tả người dùng mơ hồ, rộng hoặc pha trộn nhiều mối quan tâm, làm phân loại dự án/ngữ cảnh ngắn trước khi chọn ống kính lĩnh vực:

1. **Đọc tín hiệu dự án trước.** Kiểm tra tài liệu gần, file package/build, tên thư mục, file framework và diff/trạng thái hiện tại khi có.
2. **Phân loại hình dạng công việc.** Đây là điều tra lỗi, chỉnh sửa nhỏ, hành vi mới, kế hoạch đã phê duyệt, đánh giá code, viết kỹ năng hay nhiệm vụ hoàn thành/merge?
3. **Chọn kỹ năng quy trình.** Lựa chọn quy trình đến từ hình dạng công việc, không phải từ lĩnh vực. Nếu vẫn chưa rõ, sử dụng `brainstorming` cho hành vi mới hoặc hỏi một làm rõ ngắn gọn.
4. **Quét tín hiệu lĩnh vực.** Sau khi chọn quy trình, sử dụng bảng định tuyến ống kính lĩnh vực bên dưới.
5. **Đặt tên ưu tiên.** Nếu nhiều ống kính khớp, sử dụng cái được gắn với rủi ro cao nhất trước: bảo mật/mất dữ liệu > hợp đồng API công khai > UI/UX.
6. Các ống kính bổ sung là thứ yếu.

Không sử dụng tín hiệu lĩnh vực làm quyền bỏ qua quy trình quy trình. "Auth dashboard" có nghĩa là `brainstorming` trước, sau đó `security-and-hardening` và `ui-ux-pro-max` như ống kính.

## Định Tuyến Ống Kính Lĩnh Vực

Sau khi chọn kỹ năng quy trình, quét yêu cầu người dùng, kế hoạch đã phê duyệt, diff hiện tại, lỗi và ngữ cảnh dự án cho các tín hiệu này:

| Tín hiệu | Thêm ống kính lĩnh vực |
| --- | --- |
| REST, HTTP, endpoint, route, controller, request schema, response schema, error shape, pagination, filtering, sorting, idempotency, versioning, backward compatibility, SDK contract | `api-design` |
| auth, authentication, authorization, session, cookie, CORS, CSRF, secrets, PII, payment, tenant isolation, file upload, webhook, SSRF, dependency audit, supply chain, OWASP, DevSecOps, LLM output, tool permissions | `security-and-hardening` |
| UI, UX, dashboard, layout, component, form, table, mobile screen, web app screen, design system, visual hierarchy, responsive behavior, accessibility, interaction pattern | `ui-ux-pro-max` |

Ví dụ định tuyến lĩnh vực:

- "Test auth middleware thất bại vì user A có thể đọc resource của user B" -> quy trình `investigation`, sau đó ống kính `security-and-hardening`.
- "Thêm REST endpoint tạo hóa đơn với idempotency và danh sách phân trang" -> quy trình `brainstorming`, sau đó ống kính `api-design`; thêm `security-and-hardening` nếu liên quan tiền, auth, tenant hoặc hành vi PII.
- "Đánh giá diff auth trước merge" -> quy trình `requesting-code-review`, sau đó ống kính `security-and-hardening`.
- "Xây dựng dashboard quyền với vai trò, lời mời và log kiểm toán" -> quy trình `brainstorming`, sau đó ống kính `ui-ux-pro-max` và `security-and-hardening`.

Ví dụ:

- "Thiết kế một endpoint"
  Sử dụng `brainstorming` trước cho hành vi mới, sau đó sử dụng `api-design` bên trong quy trình thiết kế đó. Sử dụng `writing-plans` chỉ sau khi cổng thiết kế/spec được thỏa mãn.
- "Thêm auth, CORS hoặc xử lý thanh toán"
  Sử dụng `brainstorming` trước trừ khi `quick-dev` vượt qua rõ ràng. Sử dụng `security-and-hardening` như ống kính lĩnh vực bên trong quy trình đã chọn.
- "Tạo hoặc cập nhật kỹ năng"
  Sử dụng `writing-skills`; kỹ năng lĩnh vực không thể thay thế cổng kiểm tra RED/GREEN.
- "Lập kế hoạch tính năng"
  Đầu tiên kiểm tra `writing-plans`.
- "Brainstorm giải pháp"
  Đầu tiên kiểm tra `brainstorming`.
- "Điều tra tại sao cái này thất bại" / "truy vết lỗi này" / "giải thích đường dẫn code không quen thuộc này"
  Sử dụng `investigation` trước khi đề xuất sửa.
- "Sửa nhỏ này" / "chỉnh nhỏ trong một file"
  Sử dụng `quick-dev` chỉ khi cổng phạm vi của nó được thỏa mãn. Nếu công việc sáng tạo, mơ hồ hoặc thay đổi hành vi rộng hơn, `brainstorming` vẫn bắt buộc trước `writing-plans`.
- "Xây dựng trang đích" / "Thiết kế dashboard UI" / "Cải thiện UI/UX"
  Sử dụng `brainstorming` cho khám phá yêu cầu và phê duyệt thiết kế khi công việc sáng tạo hoặc thay đổi hành vi. Trong quá trình thiết kế đó, sử dụng `ui-ux-pro-max` để tạo bằng chứng UI/UX và khuyến nghị hệ thống thiết kế. Không để `ui-ux-pro-max` thay thế cổng brainstorming hoặc thay đổi bước tiếp theo từ `writing-plans`.

## Tín Hiệu Cảnh Báo

Những cái này thường có nghĩa là bạn đang bỏ qua kỷ luật quy trình làm việc của repo:

- "Đơn giản, tôi không cần kỹ năng"
- "Tôi sẽ kiểm tra file trước và quyết định sau"
- "Tôi nhớ phiên bản cũ đã xử lý cái này thế nào"
- "Tên thư mục đủ gần"
- "Kỹ năng lĩnh vực có danh sách kiểm tra, nên tôi có thể triển khai ngay"
- "Hướng dẫn bảo mật/API/UI là đủ; không cần quy trình quy trình"

Dừng và tải kỹ năng hiện tại phù hợp thay vào đó.

## Lưu Ý Đặt Tên

Không tham chiếu fork này bằng bất kỳ thương hiệu upstream cũ nào trong hướng dẫn mới, tóm tắt hoặc hướng dẫn phiên được chèn.

Sử dụng các tên này thay thế:

- `tungnt-ai-skills` cho fork tổng thể
- bộ sưu tập quy trình làm việc `skills/` gốc cho các kỹ năng lập kế hoạch/thực thi/đánh giá của fork
