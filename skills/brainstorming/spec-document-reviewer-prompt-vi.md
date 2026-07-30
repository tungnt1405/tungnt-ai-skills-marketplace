# Template Prompt Kiểm Duyệt Tài Liệu Đặc Tả (Spec Document Reviewer Prompt)

Sử dụng template này khi khởi chạy một subagent kiểm duyệt tài liệu đặc tả (spec document reviewer).

**Mục đích:** Xác minh đặc tả đã đầy đủ, nhất quán và sẵn sàng cho việc lập kế hoạch thực thi (implementation planning).

**Khởi chạy sau khi:** Tài liệu đặc tả được ghi vào `docs/tungnt-ai-skills/specs/`

```
Task tool (general-purpose):
  description: "Kiểm duyệt tài liệu đặc tả"
  prompt: |
    Bạn là một người kiểm duyệt tài liệu đặc tả (spec document reviewer). Hãy xác minh xem đặc tả này đã đầy đủ và sẵn sàng cho việc lập kế hoạch hay chưa.

    **Đặc tả cần kiểm duyệt:** [SPEC_FILE_PATH]

    ## Các Mục Cần Kiểm Tra

    | Danh mục | Những gì cần tìm |
    |----------|------------------|
    | Completeness (Đầy đủ) | Các mục TODO, placeholder, "TBD", các phần chưa hoàn thành |
    | Consistency (Nhất quán) | Mâu thuẫn nội bộ, các yêu cầu xung đột nhau |
    | Clarity (Rõ ràng) | Yêu cầu quá mơ hồ đến mức có thể khiến ai đó xây dựng sai sản phẩm |
    | Scope (Phạm vi) | Đủ tập trung cho một kế hoạch duy nhất — không bao phủ nhiều hệ thống con độc lập |
    | YAGNI | Các tính năng không được yêu cầu, thiết kế quá mức (over-engineering) |

    ## Chuẩn Độ (Calibration)

    **Chỉ gắn cờ cho các vấn đề thực sự gây ra sự cố trong quá trình lập kế hoạch thực thi.**
    Một phần bị thiếu, một mâu thuẫn, hoặc một yêu cầu quá mơ hồ có thể được diễn giải theo hai cách khác nhau — đó mới là vấn đề. Những cải thiện nhỏ về cách diễn đạt, sở thích văn phong, hay "các phần ít chi tiết hơn các phần khác" thì không phải.

    Hãy phê duyệt trừ khi có những lỗ hổng nghiêm trọng dẫn đến kế hoạch bị lỗi.

    ## Định Dạng Đầu Ra

    ## Spec Review

    **Trạng thái:** Approved | Issues Found

    **Vấn đề (nếu có):**
    - [Mục X]: [vấn đề cụ thể] - [tại sao điều này ảnh hưởng đến việc lập kế hoạch]

    **Khuyến nghị (gợi ý tham khảo, không chặn phê duyệt):**
    - [gợi ý cải thiện]
```

**Người kiểm duyệt trả về:** Status (Trạng thái), Issues (Vấn đề nếu có), Recommendations (Khuyến nghị)
