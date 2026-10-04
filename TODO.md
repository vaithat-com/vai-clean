# 🚀 FUTURE ROADMAP & TODO (VaiClean)

Kế hoạch phát triển và mở rộng tính năng cho các phiên bản tiếp theo của **Vãi Cả Dọn Tab**:

---

## 📌 Phiên bản v1.1.0 (Đã hoàn thành - 10/2026)
- [x] **Background Service Worker**: Chạy ngầm tự động theo dõi mở/tải tab trong thời gian thực.
- [x] **Auto Domain Grouping Real-time**: Tự động gom nhóm các tab cùng website ngay trên thanh tab trình duyệt Chrome (Zero-click workflow).
- [x] **Toolbar Badge Alert**: Hiển thị số lượng tab trùng lặp trực tiếp trên icon tiện ích.

## 📌 Phiên bản v1.2.0 (Đã hoàn thành - 10/2026)
- [x] **Cảnh báo Group Tab Đỏ**: Gắn nhãn `⚠️ (X trùng)` và chuyển màu đỏ cảnh báo trên thanh tab.
- [x] **Thông Báo Hệ Thống (Chrome Notifications)**: Báo động desktop và nhấp chuột để cứu RAM tức thì.
- [x] **Đóng Băng Tab Nhàn Rỗi (Discard Idle Tabs)**: Giải phóng RAM các tab nền không dùng.
- [x] **Gom Tab Đơn Lẻ (Single Tabs Bucket)**: Gom toàn bộ tab lẻ vào nhóm "Tác vụ khác".

## 📌 Phiên bản v1.3.0 (Đã hoàn thành - 10/2026)
- [x] **Trợ lý Gom Nhóm AI (Google Gemini Workspaces)**: Phân tích ngữ cảnh công việc và gom tab thành các không gian làm việc chuyên biệt (Research, Coding, Social, Work).
- [x] **Tự Động Phát Hiện Mô Hình Khả Dụng (Dynamic Model Discovery)**: Quét trực tiếp danh sách mô hình từ Google AI API, không cấu hình cứng model.
- [x] **Hiển Thị Tiến Trình Tư Duy AI (Thinking & Reasoning UI)**: Card hiển thị lý do và bước suy luận phân loại tab.
- [x] **Modal Cài Đặt Khóa Bảo Mật**: Kiểm tra tính hợp lệ của API Key và lưu an toàn trong local storage.

## 📌 Phiên bản v1.4.0 (Đã hoàn thành - 10/2026)
- [x] **Zero-Click AI Routing (Workspace Memory)**: Tự động đưa tab mới vào nhóm AI Workspaces chỉ trong 0ms không tốn quota API.
- [x] **Tự Động Thu Gọn Nhóm Không Dùng (Auto-Collapse Inactive Groups)**: Tự gập các nhóm tab rảnh để giải phóng diện tích thanh tab theo phong cách Arc Browser.
- [x] **Phím Tắt Toàn Cục (Global Shortcuts)**: Bổ sung `Cmd+Shift+A` (Gom nhóm AI) và `Cmd+Shift+C` (Cứu RAM ngay).
- [x] **Menu Chuột Phải Nhanh (Context Menus)**: Hỗ trợ đóng tab trùng, gom AI và đóng băng tab từ click chuột phải.
- [x] **Tùy Chọn Bật/Tắt Linh Hoạt**: Cung cấp toggle *"Điều hướng AI 0ms"* và *"Tự thu gọn nhóm rảnh"* ngay trong popup.

## 📌 Phiên bản v1.5.0 (Đã hoàn thành - 10/2026)
- [x] **AI Speedup Pipeline**: Triệt tiêu độ trễ Gemini 2.5 Flash (`thinkingBudget: 0`) phản hồi dưới 1 giây.
- [x] **Compact Token Prompting**: Nén 75% dữ liệu tab gửi lên API, tăng tốc độ xử lý mạng.
- [x] **Tránh Cắt Cụt Tên Nhóm Tab**: Tinh chỉnh prompt sinh tên nhóm ngắn gọn (8–12 ký tự) không bị `...` trên Chrome tab bar.
- [x] **Đại tu UI/UX Cyber Glassmorphism**:
  - Gỡ bỏ badge đánh giá thừa thãi, mở rộng không gian sử dụng.
  - Thay nút ngôi sao thành nút cài đặt AI Sparkles chuẩn Retina.
  - Chuyển đổi khung AI Thinking khổng lồ thành dải AI Insight Strip siêu gọn.
  - Bố trí lưới cài đặt 2 cột chống tràn giao diện (anti-overflow).

## 📌 Phiên bản v1.6.0 (Đã hoàn thành - 10/2026)
- [x] **Trình Quản Lý Nhóm ➔ Tab Đang Mở (Tab Groups Explorer & Manager)**: Quản lý trực quan cây phân cấp Nhóm tab -> Tab con, đóng/mở accordion, Rã nhóm (Ungroup), Đóng toàn bộ nhóm, hoặc Rã mọi nhóm (Ungroup All) 1 chạm.
- [x] **Động Cơ Phân Trang Đa Tầng (Multi-Tier Pagination Engine)**: Hỗ trợ phân trang mượt mà cho Danh sách Nhóm tab (3 nhóm/trang), Kết quả Tìm kiếm (5 mục/trang) và Lịch sử Dọn dẹp (3 phiên/trang), chống tràn màn hình popup.
- [x] **Sub-Navigation 2 Phân Hệ Tab 3**: Thẻ chọn con (`Nhóm & Tab` vs `Lịch sử dọn`) với huy hiệu đếm thời gian thực, giữ nguyên chuẩn 360px popup.
- [x] **Quản Lý Lịch Sử Dọn Dẹp (Cleanup History Tracker)**: Tự động ghi nhật ký các phiên dọn dẹp tab trùng hoặc đóng tab đơn lẻ với chi tiết thời gian và dung lượng RAM giải phóng.
- [x] **Khôi Phục Tab 1 Chạm (Instant Undo / Restore)**: Nút khôi phục mở lại toàn bộ các tab vừa đóng trong chế độ nền (`active: false`) không lo gián đoạn công việc.
- [x] **Tìm Kiếm Tab Chi Tiết & Tức Thời (Real-time Multi-source Search)**: Tìm kiếm đồng thời cả Tab đang mở và Tab trong lịch sử theo tên miền hoặc tiêu đề, 1 chạm chuyển tab hoặc mở lại.
- [x] **Quản Lý Tab Phát Âm Thanh (Audio & Mute Hub)**: Quét nhận diện tab phát tiếng (YouTube, Spotify, Meet...) và tắt tiếng 1 chạm (1-Click Mute/Unmute) ngay tại popup.
- [x] **Trung Tâm Chú Ý Tab (Tab Attention Hub)**: Nhận diện huy hiệu thông báo chưa đọc (`(3) Zalo`, `(1) Facebook`, `[2] Gmail`...), hiển thị badge cảnh báo động và hỗ trợ 1 chạm Focus tới tab.
- [x] **Segmented Navigation 3 Phân Hệ**: Chuyển đổi linh hoạt giữa Tổng quan, Chú ý, Tìm & Lịch sử với giao diện Cyber Glassmorphism chuẩn Retina 100% SVG.
- [x] **Tái Thiết Kế Logo Siêu Nổi Bật (High-Contrast Logo & Icons)**: Khắc phục lỗi logo tối đen trên nền sáng của Chrome, thiết kế lại SVG và trọn bộ icons 16/48/128px với phông nền xanh điện và tia sét vàng rực.
- [x] **Tích Hợp Website Nhà Phát Triển `vaithat.com`**: Bổ sung homepage_url trong manifest, liên kết footer popup và hồ sơ Chrome Web Store.
- [x] **TDD 79/79 Tests GREEN**: Bổ sung bộ test phân trang `paginateList()` và cấu trúc nhóm `buildTabHierarchy()`.
- [x] **Store Visual Assets 1280x800 & 440x280 px**: Sinh trọn bộ 4 ảnh chụp màn hình phân hệ (Tổng quan, Nhóm tab, Chú ý, AI) và ảnh quảng bá đạt chuẩn 24-bit RGB Chrome Web Store.
- [x] **Kho Mã Nguồn Mở & Tiêu Chuẩn Cộng Đồng GitHub**: Phát hành chính thức repo `vaithat-com/vai-clean`, tích hợp `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, GitHub Issue & PR Templates.

## 📌 Phiên bản v1.7.0 (Q4 2026)
- [ ] **Domain Whitelist / Blacklist**: Cho phép người dùng thêm danh sách các website không bao giờ được phép đóng hoặc tự động bỏ qua khi dọn dẹp.
- [ ] **Tùy chỉnh cấu hình Prompt AI**: Cho phép người dùng bổ sung các quy tắc cá nhân hóa (ví dụ: nhóm theo dự án công ty hoặc phân loại theo khách hàng).
- [ ] **Xuất & Sao lưu danh sách Tab (Export / Restore Tabs)**: Lưu nhanh toàn bộ danh sách tab đang mở thành file Markdown hoặc JSON trước khi dọn dẹp để có thể khôi phục bất cứ lúc nào.

## 📌 Phiên bản v2.0.0 (Q1 2027)
- [ ] **Đa cửa sổ (Multi-Window Cleaning)**: Thêm tùy chọn dọn dẹp tab trùng trên toàn bộ tất cả cửa sổ Chrome đang mở thay vì chỉ cửa sổ hiện tại.
- [ ] **Tìm kiếm & Lọc tab theo bộ nhớ (Memory Consumption Inspector)**: Sử dụng Chrome Processes API (nếu được hỗ trợ) để hiển thị chính xác dung lượng RAM từng tab đang chiếm dụng.
