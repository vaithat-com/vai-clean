# 📝 CHANGELOG - VÃI CẢ DỌN TAB (VaiClean)

Mọi thay đổi đáng chú ý của dự án sẽ được ghi nhận tại tài liệu này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-10-02

### 🌐 Mã Nguồn Mở & Tiêu Chuẩn Cộng Đồng GitHub (Community & Open Source Standards)
- **Thiết lập kho mã nguồn mở chính thức**: Phát hành toàn bộ mã nguồn dự án lên GitHub tại [vaithat-com/vai-clean](https://github.com/vaithat-com/vai-clean).
- **Quy chuẩn đóng góp quốc tế (`CONTRIBUTING.md`)**: Hướng dẫn chi tiết thiết lập môi trường phát triển (load unpacked), chạy test TDD, quy chuẩn commit Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`) và quy trình mở Pull Request.
- **Quy tắc ứng xử văn minh (`CODE_OF_CONDUCT.md`)**: Áp dụng chuẩn quốc tế Contributor Covenant v2.1 bảo vệ môi trường cộng đồng cởi mở, an toàn và thân thiện.
- **Chính sách báo cáo bảo mật (`SECURITY.md`)**: Quy trình báo cáo lỗ hổng có trách nhiệm (Responsible Disclosure) qua email an toàn.
- **GitHub Issue & PR Templates (`.github/`)**: Tích hợp sẵn form mẫu chuẩn hóa cho Báo cáo lỗi (`bug_report.md`), Đề xuất tính năng (`feature_request.md`) và Checklist kiểm tra chất lượng Pull Request (`PULL_REQUEST_TEMPLATE.md`).
- **Rà soát bảo mật & Làm sạch dữ liệu nội bộ (Security & Privacy Sanitization)**: Loại bỏ hoàn toàn các file ảnh chụp màn hình chứa dữ liệu thật/domain nội bộ khỏi Git, đưa `dist/` vào `.gitignore`, chuẩn hóa toàn bộ đường dẫn cục bộ máy cá nhân và domain kiểm thử thành mẫu chung chuẩn mở.

### 🗂️ Quản Lý Cấu Trúc Nhóm ➔ Tab Đang Mở (Tab Groups Explorer & Manager)
- **Sub-navigation 2 phân hệ tại Tab "Tìm & Lịch sử" (`#historySubNav`)**:
  - Tích hợp 2 thẻ chọn con (`Nhóm & Tab` và `Lịch sử dọn`) với huy hiệu đếm số lượng thời gian thực, giữ chiều ngang popup luôn chuẩn 360px mà không bị vỡ layout hay co chữ.
- **Bộ ảnh chụp màn hình Chrome Web Store chuẩn 1280x800 px (24-bit RGB)**:
  - Tự động sinh trọn bộ 4 ảnh chụp màn hình độ phân giải cao giới thiệu 4 phân hệ: Tổng quan (Cứu RAM), Quản lý nhóm & tab, Trung tâm chú ý (Tắt tiếng tab & Thông báo) và Tự động hóa AI 0ms kèm ảnh quảng bá nhỏ (440x280 px) đạt chuẩn kiểm duyệt của Google Store.
- **Khắc phục lỗi kiểm duyệt Yellow Argon (Keyword Stuffing Compliance)**:
  - Loại bỏ hoàn toàn danh sách các tên thương hiệu bên thứ ba (Zalo, Facebook, Gmail, Slack, GitHub...) trong phần mô tả Store, thay bằng các danh từ mô tả tính năng trung tính tuân thủ 100% chính sách chống spam từ khóa của Google.
- **Quản lý thẻ nhóm tab thời gian thực (Interactive Group Cards)**:
  - Hiển thị trực quan từng nhóm Chrome Tab Group với dải màu nhận diện đặc trưng của Chrome (`blue`, `red`, `purple`, `green`, `cyan`...), tiêu đề nhóm và số lượng tab bên trong.
  - Hỗ trợ đóng mở danh sách tab con trong nhóm (Accordion Collapse / Expand) đồng bộ với trạng thái gập mở của Chrome Tab Groups API.
- **Thao tác nhanh trên nhóm**:
  - **Rã nhóm (Ungroup)**: Đưa các tab trong nhóm trở lại trạng thái tab bình thường chỉ với 1 cú nhấp chuột.
  - **Đóng nhóm (Close Group)**: Đóng toàn bộ các tab nằm trong nhóm tab đó tức thì.
  - **Rã mọi nhóm (Ungroup All)**: Nút thao tác nhanh trên thanh tiêu đề giúp rã tất cả các nhóm trên Chrome khi muốn đưa thanh tab về trạng thái phẳng.
- **Khắc phục triệt để lỗi không nhận diện Tab Groups (Bugfix)**:
  - Khắc phục lỗi truyền sai thuộc tính `currentWindow: true` sang `chrome.tabGroups.query` (API của Chrome chỉ chấp nhận `windowId: number`).
  - Bổ sung cơ chế fallback đa tầng (`query({})` và `chrome.tabGroups.get(gid)`) kết hợp tạo nhóm dự phòng trong `buildTabHierarchy()` đảm bảo 100% các nhóm tab trên Chrome được nhận diện và hiển thị đầy đủ.
  - Thu gọn mặc định nhóm "Chưa gom nhóm" (`collapsed: true`) giúp giao diện luôn tinh tế, không chiếm tràn màn hình khi có nhiều tab lẻ.

### 📄 Động Cơ Phân Trang Đa Tầng (Multi-Tier Pagination Engine)
- **Kiểm soát chiều cao popup chống tràn màn hình**:
  - Tích hợp thanh phân trang (`< Trước`, `Trang X / Y`, `Sau >`) với hiệu ứng Cyber Cyan phát sáng nhẹ và vô hiệu hóa nút bấm thông minh khi ở trang đầu/cuối.
  - Áp dụng phân trang tự động trên cả 3 khu vực:
    1. **Danh sách Nhóm & Tab**: 3 nhóm mỗi trang.
    2. **Kết quả Tìm kiếm Live Search**: 5 kết quả mỗi trang.
    3. **Lịch sử Dọn dẹp & Khôi phục**: 3 phiên dọn dẹp mỗi trang.
- **TDD 100% Khép Kín (79/79 Tests GREEN)**:
  - Bổ sung unit tests cho thuật toán `paginateList()` và `buildTabHierarchy()` đảm bảo tính toán an toàn các trường hợp biên, danh sách rỗng, tab đơn lẻ và nhóm thiếu.

### 🛠️ Khắc Phục Lỗi Phân Tích JSON AI & Tự Động Phục Hồi (Resilient JSON Repair Engine)
- **Triệt tiêu hiện tượng ngắt token giữa chừng**:
  - Nâng giới hạn `maxOutputTokens` từ `600` lên `4096` tokens trong cấu hình Gemini API, ngăn chặn hoàn toàn việc mô hình bị đứt gãy JSON khi người dùng mở nhiều tab.
- **Bộ tự động phục hồi cấu hình JSON (Stack-based Auto-Repair & Regex Fallback)**:
  - Tự động phát hiện và sửa các lỗi cú pháp thường gặp từ LLM: loại bỏ trailing comma trước dấu đóng, bóc tách comment, và tự động bù các cặp ngoặc nhọn/ngoặc vuông lồng nhau `]`, `}` bằng thuật toán Bracket Stack Tracker khi phản hồi bị cắt cụt.
  - Tích hợp bộ trích xuất Regex dự phòng khôi phục các khối nhóm tab hợp lệ ngay cả khi cấu trúc bao bọc bị lỗi cú pháp.

### 🎨 Tinh Gọn Hàng Đôi 2 Nút Chính & Loại Bỏ AI Insight Thừa (Compact 2-Button Grid)
- **Đưa 2 nút chính vào chung 1 hàng đối xứng (`.main-actions-row`)**:
  - Gom nút `CỨU RAM NGAY` (xanh ngọc) và nút `GOM NHÓM AI` (tím điện) vào cùng 1 hàng 2 cột cân đối, tiết kiệm thêm 40px chiều cao cho màn hình popup.
- **Loại bỏ khối AI Insight thừa**:
  - Bỏ hoàn toàn thẻ `AI INSIGHT` chiếm diện tích, chuyển toàn bộ thông báo trạng thái suy luận và kết quả gom nhóm sang hệ thống Toast trực quan siêu nhẹ.

### ⚡ Tối Ưu Chiều Cao Giao Diện & Ngăn Kéo Cài Đặt (Collapsible Settings Drawer)
- **Tối ưu chiều cao popup ngoạn mục (~580px ➔ ~340px - 420px)**:
  - Thu gọn 7 công tắc cấu hình tự động vào ngăn kéo trượt thông minh (`#settingsGridDrawer` kết hợp nút bấm `#btnToggleSettings` có icon bánh răng và chevron xoay động), đóng mặc định để giao diện Tổng quan cực kỳ tinh gọn.
  - Tinh chỉnh padding cho nút chính, triệt tiêu hoàn toàn cảm giác cồng kềnh, không bao giờ bị tràn đáy màn hình.

### 🔔 Sửa Lỗi & Nâng Cấp Huy Hiệu "Chú Ý" (Tab Attention Badge Fix & Real-Time Sync)
- **Khắc phục triệt để lỗi số lượng huy hiệu**:
  - Sửa lỗi phân giải thuộc tính `totalAttentionCount` trong `updateAlertsBadge()` giúp huy hiệu hiển thị chuẩn xác ngay cả khi chỉ có đúng 1 tab phát âm thanh hoặc có thông báo chưa đọc (`count >= 1`).
  - Thiết kế huy hiệu dạng pill bo tròn có hiệu ứng phát sáng cảnh báo đỏ (`pulseBadgeGlow`) nổi bật trên thanh điều hướng, thu hút thị giác tức thì mà không gây chói mắt.
- **Đồng bộ thời gian thực (Reactive Listeners)**:
  - Bổ sung bộ lắng nghe sự kiện `chrome.tabs.onUpdated`, `chrome.tabs.onRemoved`, `chrome.tabs.onCreated` giúp huy hiệu Chú ý tự động nhảy số theo thời gian thực khi tab bắt đầu phát nhạc hoặc nhận tin nhắn mới mà không cần mở lại popup.

### ✨ Quản Lý Lịch Sử Dọn Dẹp & Khôi Phục 1 Chạm (Cleanup History & 1-Click Restore)
- **Ghi nhận lịch sử dọn dẹp tự động**:
  - Lưu trữ chi tiết từng phiên dọn dẹp tab trùng lặp hoặc đóng tab đơn lẻ với nhãn hành động, dung lượng RAM đã giải phóng (+MB) và dấu thời gian chính xác.
  - Hàng đợi FIFO tối đa 30 phiên gần nhất, lưu trữ an toàn trong `chrome.storage.local` với dung lượng siêu nhẹ (< 15KB).
- **Khôi phục tab 1 chạm (Instant Undo / Restore)**:
  - Cho phép người dùng mở lại ngay toàn bộ các tab đã đóng trong một phiên dọn dẹp chỉ với 1 cú nhấp chuột.
  - Tab được mở trong chế độ nền (`active: false`) giúp tiết kiệm tài nguyên và không gây giật lag trình duyệt.
- **Xóa sạch lịch sử**:
  - Nút dọn sạch lịch sử dọn dẹp bất cứ lúc nào để bảo mật quyền riêng tư tối đa.

### 🔍 Tìm Kiếm Tab Chi Tiết & Tức Thời (Instant Search Across Open & Closed Tabs)
- **Tìm kiếm đa năng thời gian thực**:
  - Quét và lọc tức thì theo cả Tên miền (Domain) và Tiêu đề trang (Title) mà không cần nhấn phím Enter.
  - Tìm kiếm đồng thời trên cả **Tab đang mở** (`Đang mở`) và **Tab đã đóng trong lịch sử** (`Đã đóng`).
- **Tương tác linh hoạt**:
  - Nhấp vào tab đang mở để lập tức chuyển vùng nhìn (Focus & Jump) tới tab đó trên bất kỳ cửa sổ nào.
  - Nhấp vào tab lịch sử để mở lại tab đó tức thì.
- **Sửa lỗi hiển thị kết quả tìm kiếm (Bugfix)**:
  - Khắc phục triệt để lỗi phân giải đối tượng kết quả tìm kiếm trong `executeSearch()`, giải quyết tình trạng badge hiển thị `undefined` và gián đoạn danh sách kết quả khi gõ từ khóa. Hiển thị badge số lượng màu Cyber Cyan chuẩn nhận diện.

### 🔔 Trung Tâm Chú Ý: Quản Lý Âm Thanh & Thông Báo Chưa Đọc (Tab Attention Hub)
- **Quản lý tab phát âm thanh & Tắt tiếng 1 chạm (1-Click Mute / Unmute)**:
  - Phát hiện chính xác các tab đang phát âm thanh (`tab.audible`) như YouTube, Spotify, Podcast, họp trực tuyến...
  - Nút Mute/Unmute 1 chạm giúp tắt tiếng tab ồn ào ngay lập tức mà không cần đi tìm tab đó.
- **Bắt thông báo chưa đọc từ các nền tảng chat & email**:
  - Thuật toán bóc tách huy hiệu thông báo chưa đọc từ tiêu đề trang (`(3) Zalo`, `(1) Facebook`, `[2] Gmail`, `(•) Slack`, `(*) GitHub`...).
  - Nút chuyển nhanh (Focus) giúp vào ngay cuộc trò chuyện mà không bỏ lỡ tin nhắn công việc.
- **Huy hiệu số đếm thông minh trên thanh điều hướng**:
  - Huy hiệu đỏ phát sáng đếm tổng số tab cần chú ý theo thời gian thực.

### 🎨 Thanh Điều Hướng Segmented Navigation & Nâng Cấp Giao Diện
- **Segmented Navigation 3 phân hệ**:
  - Chuyển đổi linh hoạt giữa: **Tổng quan** (RAM Meter, Dọn dẹp, AI), **Chú ý** (Âm thanh & Thông báo), **Tìm & Lịch sử** (Search & History).
  - Thiết kế Cyber Glassmorphism cao cấp, chuẩn Retina 100% SVG Vector (tuân thủ nghiêm ngặt Quy tắc không dùng emoji nghiệp dư).
- **Tối ưu hóa diện tích & Bố cục phân hệ (Layout Space Optimization)**:
  - Di chuyển khối 7 cài đặt (`.settings-grid`) và số liệu RAM tích lũy vào riêng phân hệ **Tổng quan** (nơi người dùng cấu hình hệ thống), trả lại không gian tối đa cho các phân hệ **Chú ý** và **Tìm & Lịch sử**.
  - Thiết kế lại trạng thái rỗng (Empty state) của phân hệ **Chú ý** thành các thẻ compact dạng pill siêu gọn gàng (32px) thay vì các khối card khổng lồ chiếm 240px, giúp màn hình popup giảm hơn 50% diện tích thừa khi không có cảnh báo.
- **Bảo toàn chất lượng kiểm thử TDD**:
  - Bổ sung `tests/historyAndNotifications.test.js` với 13 bài test mới. Nâng tổng số bài test lên **72/72 tests pass 100% GREEN**.

### 🎨 Tái Thiết Kế Toàn Diện Logo & Bộ Nhận Diện Thương Hiệu Siêu Nổi Bật
- **Khắc phục triệt để lỗi logo bị tối đen, mờ nhạt khó thấy**:
  - Thiết kế lại hoàn toàn `icons/icon.svg` với phông nền xanh điện rực rỡ Electric Blue (`#0284c7` -> `#0369a1` -> `#0f172a`) cùng viền bo tròn phát sáng neon Cyber Cyan, tạo độ tương phản vượt trội trên thẻ quản lý `chrome://extensions/` màu trắng cũng như thanh công cụ trình duyệt.
  - Thanh RAM tản nhiệt kim loại được căn chỉnh cân đối chính giữa, tích hợp dải đèn LED RGB gradient sống động cùng 12 chân tiếp xúc vàng (Gold Contact Pins) chân thực.
  - Biểu tượng tia sét năng lượng vàng kim (Electric Amber) nổi bật ở trung tâm với đường viền đen đậm ngăn cách khối 3D, giúp logo hiển thị cực kỳ rõ nét ở mọi kích thước từ 16px đến 128px.
- **Nâng cấp công cụ sinh ảnh Vector độ phân giải cao**:
  - Tối ưu `scripts/generate-icons.sh` ưu tiên sử dụng `rsvg-convert` (chuẩn SVG 2.0 / librsvg), khắc phục hoàn toàn lỗi phân giải gradient của ImageMagick MSVG cũ.
  - Tái tạo trọn bộ `icon-16.png`, `icon-48.png`, `icon-128.png` với độ trong suốt sắc sảo và dung lượng siêu tối ưu.
- **Tích hợp Website Nhà Phát Triển `vaithat.com`**:
  - Bổ sung trường `"homepage_url": "https://vaithat.com"` vào `manifest.json`.
  - Cập nhật footer popup với liên kết trực tiếp tới `vaithat.com` kèm hiệu ứng hover neon cyan bắt mắt.
  - Đồng bộ thông tin nhà phát triển trên `package.json` và `CHROMEWEBSTORE.md`.

## [1.5.0] - 2026-10-01

### ⚡ Tối ưu hóa hiệu năng & Tốc độ AI (Speedup Pipeline)
- **Triệt tiêu độ trễ Gemini 2.5 Flash (Thinking Budget = 0)**:
  - Cấu hình `thinkingConfig: { thinkingBudget: 0 }` tự động cho dòng mô hình Gemini 2.5 Flash, bỏ qua vòng lặp suy luận CoT ngầm kéo dài 3–6s, giảm thời gian phản hồi từ ~5s xuống dưới 1s.
  - Cơ chế tự động fallback thông minh: Tự động thử lại không kèm `thinkingConfig` nếu tài khoản người dùng sử dụng model tùy chỉnh chưa hỗ trợ.
- **Tối ưu hóa Token Prompt siêu nén (Giảm 75% dung lượng truyền tải)**:
  - Chuyển đổi dữ liệu tab từ JSON lồng nhau sang cấu trúc nén nhẹ dạng dòng: `[#id] domain | title (tối đa 40 ký tự)`.
  - Giới hạn `maxOutputTokens: 600` ngăn ngừa mô hình sinh chữ lan man.
- **Khắc phục triệt để lỗi tên nhóm tab bị cắt ngắn (`...`)**:
  - Tinh chỉnh Prompt ép AI đặt tên nhóm ngắn gọn súc tích (8–12 ký tự) kèm 1 biểu tượng (ví dụ: `💻 Code`, `📧 Mail`, `🛠️ DevOps`, `🌐 Social`, `🔍 Tra cứu`), giúp các tab group hiển thị trọn vẹn và đẹp mắt trên thanh tab của Chrome.

### 🎨 Tái thiết kế toàn diện Giao diện (UI/UX Cyber Glassmorphism Overhaul)
- **Khung AI Insight Strip siêu gọn**:
  - Thay thế khối văn bản suy luận AI khổng lồ chiếm 200px bằng dải trạng thái **AI Insight Strip** gọn gàng, hiển thị 1 câu tóm tắt súc tích cùng đèn nhấp nháy AI.
- **Loại bỏ thành phần thừa thãi**:
  - Gỡ bỏ hàng badge "4.9 Đánh giá / 14,600+ Người dùng" để trả lại không gian cho các công cụ điều khiển chức năng.
  - Thay thế nút ngôi sao tím khó hiểu bằng nút **AI Sparkles Settings** chuẩn Retina với hiệu ứng hover kính mờ.
  - Thay icon bộ não răng cưa bằng vector SVG AI Sparkle phát sáng hiện đại.
- **Lưới Cài Đặt Gọn Gàng & Chống Tràn (Anti-Overflow)**:
  - Bố trí 7 công tắc cài đặt vào lưới 2 cột (`settings-grid`) ngăn nắp, thanh lịch.
  - Cố định chiều cao tối ưu (`max-height: 580px; overflow-y: auto`) cùng thanh cuộn siêu mỏng (custom micro-scrollbar), đảm bảo giao diện luôn hiển thị trọn vẹn 100%, không bị cắt ngang đáy màn hình.

## [1.4.0] - 2026-10-01

### ✨ Tính năng mới (Added)
- **Tự Động Điều Hướng AI 0ms (Zero-Click AI Routing & Workspace Memory)**:
  - Tự động ghi nhớ ánh xạ giữa tên miền website và Không gian làm việc AI (`Workspace Memory`) sau mỗi lần AI phân loại.
  - Khi người dùng mở tab mới thuộc các domain đã biết (GitHub, Jira, YouTube, Facebook...), Background Service Worker tự động định tuyến ngay tab đó vào đúng nhóm AI Workspace trong 0ms mà không tốn thêm bất kỳ lượt gọi API hay hạn ngạch quota nào.
- **Tự Động Thu Gọn Nhóm Không Hoạt Động (Auto-Collapse Inactive Groups - Arc Browser Style)**:
  - Khi chuyển sang một tab bất kỳ (`chrome.tabs.onActivated`), chỉ nhóm chứa tab đang xem được mở rộng (`collapsed: false`), toàn bộ các nhóm tab rảnh khác sẽ tự động thu gọn lại (`collapsed: true`).
  - Giúp thanh tab nằm ngang của Chrome luôn gọn gàng, rộng rãi, tránh bị chèn ép khi mở nhiều nhóm.
- **Phím Tắt Nhanh Toàn Cục (Chrome Global Commands)**:
  - `Command + Shift + A` (Mac) / `Alt + Shift + A` (Windows): Gom nhóm AI thông minh tức thì.
  - `Command + Shift + C` (Mac) / `Alt + Shift + C` (Windows): Cứu RAM ngay — đóng sạch toàn bộ tab trùng lặp kèm thông báo hệ thống.
  - Hiển thị huy hiệu phím tắt (`⌘⇧C`, `⌘⇧A`) trực quan, sắc nét ngay trên các nút bấm chính của popup.
- **Menu Chuột Phải Nhanh (Context Menus Integration)**:
  - Tích hợp menu ngữ cảnh chuột phải trên trang web:
    - *"⚡ Cứu RAM ngay: Đóng tab trùng"*
    - *"🧠 Gom nhóm AI thông minh (Workspaces)"*
    - *"💤 Đóng băng tab này (Tiết kiệm RAM)"*
- **Công Tắc Điều Khiển Linh Hoạt Trên Giao Diện**:
  - Bổ sung tùy chọn *"Điều hướng AI 0ms"* (`chkAIAutoRouting`) và *"Tự thu gọn nhóm rảnh"* (`chkAutoCollapse`) trong chân trang popup.
- **Mở rộng Test Suite TDD**:
  - Tạo mới `tests/workspaceMemory.test.js` kiểm thử toàn diện 4 khía cạnh: Workspace Memory, 0ms Auto Routing, Auto Collapse Inactive Groups, Incremental AI Prompt. Nâng tổng số bài test lên **59 tests pass 100% GREEN**.

## [1.3.1] - 2026-10-01

### 🐛 Sửa lỗi & Tối ưu (Fixed & Optimized)
- **Khắc phục triệt để lỗi tạo nhiều nhóm "Tác vụ khác" riêng rẽ**:
  - Sửa lỗi trong thuật toán tự động gom nhóm khiến mỗi tab đơn lẻ (Zalo, Tab Cleaner, Komiya...) bị tạo thành một nhóm *"Tác vụ khác"* độc lập thay vì gom chung vào 1 nhóm duy nhất.
  - Tự động gộp tất cả các nhóm *"Tác vụ khác"* bị trùng lặp trên thanh tab trình duyệt về 1 nhóm chính duy nhất.
  - Tái sử dụng nhóm *"Tác vụ khác"* đã có sẵn trong cửa sổ khi có tab mới phát sinh, tuyệt đối không tạo thêm nhóm mới trùng tên.
- **Tắt mặc định gom tab đơn lẻ (`groupSingleTabs: false`)**:
  - Chuyển chế độ gom tab đơn lẻ thành tùy chọn không bắt buộc (opt-in) để các tab riêng lẻ như Zalo, Facebook, YouTube được hiển thị tự nhiên, không bị bó buộc vào group.
  - Tự động rã nhóm (`chrome.tabs.ungroup`) các tab đang nằm trong nhóm *"Tác vụ khác"* nếu người dùng tắt tính năng này, trả lại thanh tab gọn gàng ngay lập tức.
- **Mở rộng Test Suite TDD**:
  - Bổ sung 3 bài kiểm thử đơn vị cho logic tái sử dụng, gộp nhóm trùng lặp và rã nhóm, nâng tổng số lên 49 tests pass 100%.

## [1.3.0] - 2026-10-01

### ✨ Tính năng mới (Added)
- **Gom nhóm AI Thông Minh (Smart Workspaces Clustering với Google Gemini)**:
  - Cho phép người dùng kết nối API Key Google Gemini (lấy miễn phí từ Google AI Studio) để phân tích ngữ cảnh các tab và tự động gom nhóm thành các không gian làm việc chuyên nghiệp (Lập trình, Nghiên cứu AI, Công việc, Giải trí...).
- **Khám phá Mô hình Động (Dynamic Model Discovery - Không Hardcode)**:
  - Hệ thống tự động truy vấn trực tiếp danh sách mô hình từ endpoint `/v1beta/models` của tài khoản người dùng thông qua API Key.
  - Lọc chính xác các mô hình hỗ trợ phương thức `generateContent`, tự động chọn mô hình tối ưu nhất (`gemini-2.5-flash` > `gemini-1.5-flash` > fallback).
  - Điền danh sách vào menu lựa chọn động, tuyệt đối không cấu hình cứng model giúp tránh lỗi phân quyền hoặc model ngừng hỗ trợ.
- **Khối Hiển thị Tư duy & Suy luận AI (AI Thinking & Reasoning Card)**:
  - Hiển thị trực quan quá trình suy luận của AI (Reasoning Steps) giải thích lý do phân loại các tab vào từng nhóm ngay trên giao diện tiện ích.
- **Hộp thoại Cấu hình AI Cyber Glassmorphism**:
  - Modal cài đặt hiện đại, nút bật/tắt hiển thị khóa bảo mật, nút *"Kiểm tra Key & Tải Models"* với phản hồi trạng thái thời gian thực.
- **Cấp quyền mạng Manifest V3**:
  - Bổ sung `host_permissions: ["https://generativelanguage.googleapis.com/*"]` chuẩn Manifest V3.
- **Mở rộng Test Suite TDD**:
  - Bổ sung `tests/aiOrganizer.test.js`, nâng tổng số bài kiểm thử lên 46 tests pass 100%.

## [1.2.0] - 2026-10-01

### ✨ Tính năng mới (Added)
- **Cảnh báo trực quan trên Group Tab khi có tab trùng lặp**:
  - Tự động gắn nhãn cảnh báo trực tiếp vào tiêu đề nhóm: `${domain} ⚠️ (${count} trùng)`.
  - Tự động chuyển màu nhóm sang **Màu Đỏ (`red`)** khi phát hiện bên trong nhóm có tab trùng lặp, giúp người dùng nhận diện ngay trên thanh tab trình duyệt.
- **Tích hợp Thông Báo Hệ Thống Chrome Desktop (System Notifications)**:
  - Bắn thông báo desktop khi xuất hiện tab trùng lặp mới làm lãng phí RAM.
  - Tương tác 1-Click: Nhấp chuột trực tiếp vào thông báo để dọn sạch toàn bộ tab trùng lặp và nhận thông báo kết quả giải phóng RAM.
- **Tính năng Đóng băng Tab Nhàn Rỗi (Discard Idle Tabs)**:
  - Bổ sung nút *"💤 Đóng băng tab rảnh"* sử dụng native API `chrome.tabs.discard` để giải phóng RAM các tab nền không dùng mà không cần đóng tab.
- **Tự động gom tab đơn lẻ (Single Tabs Bucket)**:
  - Tùy chọn gom toàn bộ các tab đơn lẻ rải rác vào nhóm *"Tác vụ khác"* giúp thanh tab luôn gọn gàng 100%.
- **Mở rộng Test Suite TDD**:
  - Bổ sung `tests/warningAndIdle.test.js`, nâng tổng số bài test lên 35 tests passed 100%.

## [1.1.0] - 2026-10-01

### ✨ Tính năng mới (Added)
- **Tự động gom nhóm thời gian thực (Real-time Auto Tab Grouping)**:
  - Tích hợp **Background Service Worker** module (`src/background/service-worker.js`) chạy ngầm thông minh.
  - Lắng nghe sự kiện `tabs.onCreated` và `tabs.onUpdated`: Tự động nhận diện và gom các tab cùng tên miền vào các nhóm Tab Group trên thanh tab trình duyệt theo thời gian thực mà không cần người dùng phải bấm mở popup.
  - Cơ chế **Debounce (400ms)** bảo vệ hiệu năng máy tính, không gây giật lag khi mở nhiều tab đồng thời.
- **Badge Toolbar Thông Minh**:
  - Tự động hiển thị huy hiệu (Badge) số lượng tab trùng lặp trực tiếp trên icon tiện ích ở thanh công cụ Chrome.
- **Công tắc điều khiển trong Popup**:
  - Bổ sung tùy chọn *"⚡ Tự động gom nhóm Real-time"* giúp người dùng chủ động bật/tắt tính năng theo ý muốn.
- **Mở rộng Unit Tests (TDD)**:
  - Tăng tổng số test cases lên 28 tests pass 100% bao phủ logic `matchTabToGroup`, `shouldSkipAutoGroup`, `planAutoGroupActions`.

## [1.0.0] - 2026-10-01

### ✨ Tính năng mới (Added)
- **Manifest V3 Core**: Hoàn thiện cấu hình chuẩn Manifest V3 cho Chrome Extension hiện đại.
- **Thuật toán Chuẩn hóa URL & Lọc trùng**:
  - Tự động bóc tách các tham số theo dõi phiền toái (`utm_source`, `utm_medium`, `fbclid`, `gclid`, `ref`...).
  - Xử lý hash fragment `#...` và trailing slashes để định danh chính xác tab trùng nội dung.
- **Tính năng Cứu RAM 1-Click (Duplicate Tab Closer)**:
  - Tự động đóng tất cả bản sao tab trùng lặp, bảo toàn tab đang kích hoạt (active) hoặc tab mở sớm nhất.
  - Tùy chọn bảo vệ tuyệt đối các tab đã ghim (`pinned: true`).
- **Gom nhóm Tab thông minh theo tên miền (Smart Domain Grouping)**:
  - Tích hợp Chrome `tabGroups` API.
  - Tự động gom các tab cùng website vào nhóm, gán tiêu đề ngắn gọn và màu sắc thương hiệu tương ứng.
- **Thống kê RAM & Áp lực bộ nhớ thời gian thực**:
  - Ước tính số MB/GB RAM được giải phóng sau mỗi lần dọn.
  - Lưu trữ tổng dung lượng RAM đã cứu tích lũy qua `chrome.storage.local`.
- **Thiết kế & Giao diện Đẳng cấp**:
  - Giao diện Popup phong cách **Cyber Neon Glassmorphism** với bảng màu Slate Dark, Emerald, Cyan và Rose.
  - Logo Vector SVG Retina biểu tượng thanh RAM bọc giáp tản nhiệt và tia chớp dọn dẹp năng lượng.
  - Sử dụng 100% biểu tượng SVG chuyên nghiệp, nói không với emoji nghiệp dư.
- **Bộ Kiểm thử Khép kín TDD**:
  - 20 bài kiểm thử đơn vị bao phủ toàn bộ engine chuẩn hóa, gom nhóm và tính toán RAM.
