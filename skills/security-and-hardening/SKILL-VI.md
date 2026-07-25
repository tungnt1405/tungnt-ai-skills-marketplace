---
name: security-and-hardening
description: Chỉ sử dụng sau khi using-tungnt-ai-skills đã chọn quy trình làm việc, như một ống kính hỗ trợ bên trong brainstorming, lập kế hoạch, thực thi hoặc đánh giá
---

# Bảo Mật và Gia Cố

## Tổng Quan

Coi bảo mật là ràng buộc thiết kế, không phải công việc phát hành. Mọi ranh giới chấp nhận dữ liệu, danh tính, code, đầu ra mô hình hoặc cấu hình cơ sở hạ tầng cần xác thực, phân quyền rõ ràng, quan sátability và test lạm dụng rõ ràng.

Sử dụng tiêu chuẩn bảo mật cục bộ nghiêm ngặt hơn trước.

## Khi Nào Sử Dụng

- Xây dựng hoặc đánh giá xác thực, phân quyền, phiên bản, cô lập tenant hoặc hành vi quản trị.
- Chấp nhận đầu vào không đáng tin: form, API, file, URL, webhook, callback, hàng đợi, nhập, phản hồi bên thứ ba hoặc đầu ra LLM.
- Xử lý bí mật, thông tin xác thực, PII, dữ liệu thanh toán, token, mã hóa, log kiểm toán hoặc tiết lộ lỗi.
- Thay đổi CORS, quyền truy cập trình duyệt cross-origin, thông tin xác thực cookie, yêu cầu nhạy cảm CSRF hoặc chính sách origin frontend/backend.
- Thêm phụ thuộc, container, quy trình CI/CD, tự động triển khai, IaC hoặc cổng bảo mật.
- Ánh xạ code sang OWASP Top 10, OWASP Cheat Sheet Series, DevSecOps, SAST, DAST, IAST, SCA hoặc quét bí mật.

Không sử dụng cái này để thay thế đánh giá bảo mật đủ trình độ, mô hình đe dọa, kiểm tra xâm nhập hoặc đánh giá tuân thủ.

## Kích Hoạt Theo Quy Trình Lĩnh Vực

Không gọi kỹ năng này trước `using-tungnt-ai-skills` và quy trình làm việc đang hoạt động. Nếu kỹ năng này được tải trước, ngay lập tức tải `using-tungnt-ai-skills`, chọn kỹ năng quy trình và quay lại đây chỉ như ống kính hỗ trợ.

Đây là kỹ năng lĩnh vực cho bảo mật ứng dụng và DevSecOps. Nó cung cấp đánh giá bảo mật bên trong quy trình làm việc đã chọn; nó không thay thế `brainstorming`, `writing-plans`, `executing-plans`, `subagent-driven-development` hoặc kỹ năng đánh giá.

Gọi kỹ năng này trong quy trình làm việc khi công việc bao gồm hành vi nhạy cảm bảo mật:

- Trong `brainstorming`, sử dụng để xác định tài sản, ranh giới tin cậy, trường hợp lạm dụng và tiêu chí chấp thuận bảo mật.
- Trong `writing-plans`, sử dụng để chuyển đổi phát hiện mô hình đe dọa thành test fail, kiểm tra CI, cổng đánh giá và phi mục tiêu rõ ràng.
- Trong thực thi, sử dụng trước khi thay đổi code nhạy cảm bảo mật; nếu triển khai phát hiện rủi ro chưa được mô hình hóa, dừng và sửa đổi spec hoặc kế hoạch thay vì sáng tạo hành vi bảo mật trong code.
- Trong đánh giá, sử dụng như ống kính bảo mật cho diff chạm xử lý đầu vào, kiểm soát truy cập, bí mật, thay đổi phụ thuộc, CI/CD, cơ sở hạ tầng, gọi bên ngoài hoặc đầu ra LLM/công cụ.

## Phủ Định Kịch Bản RED

Đây là các kịch bản RED mà kỹ năng này phải ngăn chặn:

| Kích hoạt | Thất bại cơ sở | Đối phó kỹ năng |
| --- | --- | --- |
| "Chỉ thêm endpoint; xác thực đã xử lý" | Thiếu phân quyền cấp đối tượng hoặc kiểm tra tenant | Test quyền sở hữu, vai trò và đường dẫn phủ định mặc định |
| "Framework xác thực đầu vào" | Tin dữ liệu body/query/path/file/URL ngoài schema | Xác thực mọi biên bên ngoài với allowlist và giới hạn kích thước/loại |
| "URL này từ người dùng đáng tin" | SSRF tới localhost, metadata cloud hoặc mạng riêng | Allowlist host, giới hạn scheme, chặn IP riêng và chuyển hướng |
| "Cập nhật phụ thuộc là thông thường" | Rủi ro chuỗi cung ứng qua package, lockfile, script hoặc CI | Đánh giá phụ thuộc mới, khóa cài đặt, chạy SCA, kiểm tra script cài đặt |
| "Có thể thêm kiểm tra bảo mật sau khi xong tính năng" | Không có trường hợp lạm dụng, log, giới hạn rate hoặc test tiêu cực | Mô hình đe dọa trước và mã hóa trường hợp lạm dụng thành test |
| "Đầu ra LLM chỉ là văn bản" | Đầu ra mô hình tới SQL, shell, DOM, công cụ hoặc đường dẫn file | Coi đầu ra LLM là đầu vào không đáng tin; phân tích, xác thực, phân quyền, mã hóa |

## Mẫu Cốt Lõi

| Vấn đề | Quy tắc |
| --- | --- |
| Ranh giới tin cậy | Nêu mọi nơi dữ liệu không đáng tin vào hệ thống trước khi code. |
| Tài sản | Xác định thông tin xác thực, PII, chuyển tiền, hành vi quản trị, dữ liệu tenant và quyền triển khai. |
| Trường hợp lạm dụng | Viết đường dẫn lạm dụng bên cạnh trường hợp sử dụng và test đường dẫn phủ định trước. |
| Đầu vào | Xác thực tham số đường dẫn, query, header, body, file, webhook, bên thứ ba và dữ liệu đầu ra mô hình tại biên. |
| Phân quyền | Kiểm tra quyền tại biên đối tượng/hành động; chỉ xác thực không bao giờ là đủ. |
| Bí mật | Giữ bí mật khỏi source, log, prompt, đầu ra build và lưu trữ có thể truy cập khách hàng. Quay vòng mọi bí mật bị lộ. |
| Đầu ra | Mã hóa cho ngữ cảnh mục tiêu: HTML, SQL, shell, JSON, URL, file, log và công cụ LLM là các hố khác nhau. |
| Phụ thuộc | Commit lockfile, sử dụng cài đặt có thể tái tạo, đánh giá package mới và phân loại lỗ hổng có thể tiếp cận. |
| Quan sátability | Ghi log sự kiện bảo mật không chứa giá trị nhạy cảm; cảnh báo trên mẫu lỗi có ý nghĩa. |
| Đường ống | Thêm kiểm tra cục bộ nhanh trước, sau đó cổng CI cho SCA, SAST, bí mật, quét IaC/container, test và chính sách phát hành. |
| CORS | Sử dụng allowlist origin chính xác, thông tin xác thực chỉ khi cần, `Vary: Origin` cho origin động và phân quyền trên mọi tài nguyên được bảo vệ. |

## Bản Đồ Nhanh OWASP Top 10:2025

Sử dụng các danh mục 2025 làm bản đồ mặc định cho công việc ứng dụng web hiện đại:

| Rủi ro | Trọng tâm phòng ngừa |
| --- | --- |
| A01:2025 Kiểm Soát Truy Cập Bị Phá Vỡ | Phân quyền cấp đối tượng, cô lập tenant, chính sách phủ định mặc định. |
| A02:2025 Cấu Hình Bảo Mật Sai | Gia cố mặc định, header, CORS, xử lý lỗi, cấu hình cloud/dịch vụ. |
| A03:2025 Thất Bại Chuỗi Cung Ứng Phần Mềm | Đánh giá phụ thuộc, SCA, lockfile, build có chữ ký/nhận thức nguồn gốc, gia cố CI. |
| A04:2025 Thất Bại Mã Hóa | Thuật toán mạnh, quản lý khóa, TLS, quay vòng bí mật, không mã hóa tùy chỉnh. |
| A05:2025 Tiêm | Query tham số hóa, allowlist lệnh, mã hóa ngữ cảnh, xác thực schema. |
| A06:2025 Thiết Kế Không An Toàn | Mô hình đe dọa, trường hợp lạm dụng, giới hạn rate, quy trình an toàn, mặc định an toàn. |
| A07:2025 Thất Bại Xác Thực | MFA khi cần, phiên an toàn, băm mật khẩu, hết hạn token đặt lại, giới hạn rate. |
| A08:2025 Thất Bại Tính Toàn Vẹn Phần Mềm Hoặc Dữ Liệu | Đường dẫn cập nhật đáng tin, tính toàn vẹn sản phẩm, giải mã an toàn, CI/CD được bảo vệ. |
| A09:2025 Thất Bại Ghi Nhật Ký và Cảnh Báo Bảo Mật | Dấu vết kiểm toán, phát hiện, cảnh báo, log sẵn sàng sự cố không chứa bí mật. |
| A10:2025 Xử Lý Sai Điều Kiện Bình Thường | Lỗi người dùng tổng quát, thử lại bị giới hạn, dự phòng an toàn, không stack trace hoặc rò rỉ bí mật. |

Để bản đồ chi tiết hơn và hướng dẫn cheat sheet, đọc `references/owasp-2025-map.md`.

## Đánh Giá CORS

Đọc `references/cors.md` trước khi thay đổi header `Access-Control-*`, middleware CORS framework, yêu cầu trình duyệt có thông tin xác thực, API dựa trên cookie hoặc tích hợp frontend/backend cross-origin. CORS không phải phân quyền và không thay thế bảo vệ CSRF.

## Cổng Đường ống DevSecOps

Sử dụng cổng tiến bộ thay vì một giai đoạn bảo mật muộn:

| Giai đoạn | Cổng tối thiểu |
| --- | --- |
| Thiết kế | Ranh giới tin cậy mô hình đe dọa, tài sản, trường hợp lạm dụng và tác động quyền riêng tư. |
| Pre-commit | Quét bí mật, lint, test tập trung và quét khói cục bộ bảo mật khi hữu ích. |
| Build | SCA/kiểm toán phụ thuộc, SAST hoặc quét code, cài đặt tái tạo từ lockfile. |
| Package | Quét container/image/IaC khi các sản phẩm đó tồn tại. |
| Test | Test bảo mật tiêu cực, test auth API, DAST/IAST khi môi trường tồn tại. |
| Phát hành | Đánh giá phát hiện cao/nghiêm trọng, hoãn đã ghi, chủ sở hữu và ngày đánh giá. |
| Vận hành | Log bảo mật, cảnh báo, quản lý lỗ hổng, hook ứng sự cố. |

Để chi tiết đường ống, đọc `references/devsecops-gates.md`.

## Quét Khói Cục Bộ

Sử dụng `scripts/security-smoke-scan.mjs` cho lượt kiểm tra heuristic nhanh khi repo có JavaScript/TypeScript hoặc file cấu hình văn bản:

```bash
node skills/security-and-hardening/scripts/security-smoke-scan.mjs --path . --fail-on high
node skills/security-and-hardening/scripts/security-smoke-scan.mjs --path . --json
```

Script phát hiện cờ đỏ phổ biến như bí mật có thể có, `eval`, hố HTML không an toàn, CORS wildcard, cookie không an toàn, nội suy SQL chuỗi, fetch URL rủi ro, thiếu lockfile và quy trình CI cài đặt không có lockfile. Nó cố ý zero-phụ thuộc và bảo thủ. Nó không thay thế SAST, SCA, DAST, IAST, quét bí mật hoặc đánh giá con người.

## Danh Sách Kiểm Tra Đánh Giá Bảo Mật

- [ ] Ranh giới tin cậy và tài sản được nêu.
- [ ] Trường hợp lạm dụng có test, bao gồm đường dẫn phủ định.
- [ ] Đầu vào do người dùng kiểm soát được xác thực theo schema tại biên.
- [ ] Phân quyền được kiểm tra cho mọi đối tượng/hành động được bảo vệ.
- [ ] SQL, NoSQL, shell, DOM, URL, file và hố LLM/công cụ được tham số hóa, allowlist hoặc mã hóa.
- [ ] Phiên sử dụng `httpOnly`, `secure`, `sameSite`, hết hạn và quay vòng khi phù hợp.
- [ ] Bí mật được tải từ kho bí mật hoặc môi trường, không bao giờ commit, log hoặc đẩy vào LLM.
- [ ] Phụ thuộc được khóa, đánh giá và kiểm toán; lỗ hổng cao/nghiêm trọng có thể tiếp cận được sửa hoặc hoãn chính thức.
- [ ] Header bảo mật, CORS, xử lý lỗi và giới hạn rate khớp với ngữ cảnh triển khai.
- [ ] Log ghi lại sự kiện bảo mật không chứa dữ liệu nhạy cảm và có cảnh báo cho mẫu có ý nghĩa.

## Sai Lầm Phổ Biến

| Sai lầm | Sửa |
| --- | --- |
| Coi xác thực là phân quyền | Thêm kiểm tra quyền đối tượng/hành động và test cho truy cập liên người dùng. |
| Chỉ xác thực phía client | Xác thực lại tại server hoặc biên dịch vụ. |
| Log toàn bộ body request | Che token, mật khẩu, cookie, header phân quyền, PII và dữ liệu thanh toán. |
| Cho phép URL outbound tùy ý | Sử dụng allowlist scheme/host và chặn IP riêng/dự phòng và chuyển hướng. |
| Hoãn lỗ hổng phụ thuộc cao/nghiêm trọng không có ngữ cảnh | Xác định khả năng tiếp cận, giảm thiểu, chủ sở hữu và ngày đánh giá. |
| Dựa vào prompt làm ranh giới bảo mật | Áp dụng phân quyền và xác thực trong code, không phải hướng dẫn mô hình. |

## Tín Hiệu Cảnh Báo

- Endpoint API, hành động, job hoặc resolver có xác thực nhưng không có phân quyền cấp tài nguyên.
- Nối chuỗi tới SQL, NoSQL, LDAP, shell, đường dẫn file, HTML, markdown-to-HTML hoặc template.
- Server fetch URL bị ảnh hưởng bởi người dùng, bên thứ ba hoặc đầu ra mô hình.
- CORS cho phép `*` với thông tin xác thực, hoặc cookie thiếu `httpOnly`, `secure` hoặc `sameSite`.
- Phụ thuộc mới, image container, hành động workflow hoặc script cài đặt vào mà không qua đánh giá.
- Bí mật, token, cookie, header phân quyền, stack trace hoặc PII xuất hiện trong log hoặc lỗi.
- Qu trình CI/CD có thể triển khai từ nhánh không đáng tin, hành động có thể thay đổi hoặc sản phẩm không kiểm tra.
- Đầu ra LLM gọi công cụ, query database, ghi file hoặc hiển thị HTML không qua xác minh.

## Xác Minh

Sau các thay đổi nhạy cảm bảo mật:

- [ ] Chạy test tiêu cực tập trung cho kiểm soát truy cập, xác thực, giới hạn rate và hành vi lỗi.
- [ ] Chạy lệnh kiểm toán/quét dự án có sẵn trong repo (`npm audit`, SCA, SAST, quét bí mật, quét IaC/container).
- [ ] Chạy `node skills/security-and-hardening/scripts/security-smoke-scan.mjs --path . --fail-on high` khi áp dụng.
- [ ] Đánh giá diff cho hố mới, phụ thuộc, bí mật và quyền triển khai.
- [ ] Ghi lại mọi rủi ro được chấp nhận với mức độ nghiêm trọng, khả năng tiếp cận, giảm thiểu, chủ sở hữu và ngày đánh giá.

## Nguồn Tham Khảo

Dựa trên OWASP Top 10:2025, OWASP Cheat Sheet Series, OWASP DevSecOps Guideline, OWASP Top 10 cho Ứng Dụng LLM và thực hành đánh giá mã hóa an toàn phổ biến.