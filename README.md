# ⚡ VÃI CẢ DỌN TAB (VaiClean - Tab & RAM Saver)

> **Cứu sống thanh RAM máy tính của bạn!** Tự động quét và đóng toàn bộ tab trùng lặp, gom nhóm thông minh theo tên miền chỉ với 1 cú nhấp chuột.

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-38bdf8?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/Version-v1.6.0-cyan?style=flat-square)](#)
[![Tests Passing](https://img.shields.io/badge/Tests-79%2F79%20Passing-emerald?style=flat-square&logo=node.js)](tests/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg?style=flat-square)](CODE_OF_CONDUCT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-vaithat--com%2Fvai--clean-181717?style=flat-square&logo=github)](https://github.com/vaithat-com/vai-clean)
[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Pending_Review-orange?style=flat-square&logo=googlechrome)](https://chromewebstore.google.com/detail/mkcakonmfnjaellpjgannlcnhjjphjhp)



---

## 🌟 ĐIỂM NỔI BẬT

- 🗂️ **Quản Lý Nhóm & Tab Đang Mở (Tab Groups Explorer & Manager)**: Trình khám phá trực quan toàn bộ các nhóm tab đang hoạt động trên Chrome ngay tại Tab "Tìm & Lịch sử". Hiển thị thẻ nhóm card tương ứng màu Chrome, hỗ trợ đóng/mở danh sách tab con, Rã nhóm (Ungroup), Đóng toàn bộ nhóm, hoặc Rã mọi nhóm (Ungroup All) chỉ với 1 chạm.
- 📄 **Phân Trang Đa Tầng Chống Tràn Popup (Pagination Engine)**: Hỗ trợ phân trang mượt mà (`< Trước`, `Trang X / Y`, `Sau >`) cho cả 3 khu vực: Danh sách Nhóm tab, Kết quả Tìm kiếm Live Search và Lịch sử Dọn dẹp, giữ popup luôn thanh thoát, không bao giờ phải cuộn trang vô tận.
- 🕒 **Quản Lý Lịch Sử Dọn Dẹp & Khôi Phục 1 Chạm (Undo / Restore)**: Ghi lại từng phiên dọn dẹp tab trùng hoặc đóng tab lẻ. Nhấp **Khôi phục tab** để mở lại toàn bộ tab trong nền bất cứ lúc nào, an tâm 100% không sợ mất tab!
- 🔍 **Tìm Kiếm Tab Chi Tiết & Tức Thời (Instant Search Across Tabs & History)**: Tìm kiếm thời gian thực theo cả Tên miền & Tiêu đề trang. Quét song song cả **Tab đang mở** (click để chuyển ngay) và **Tab trong lịch sử** (click để mở lại).
- 🔊 **Quản Lý Tab Âm Thanh & Tắt Tiếng 1 Chạm (1-Click Mute Hub)**: Nhận diện chính xác các tab đang phát nhạc/âm thanh (YouTube, Spotify, họp Meet/Zoom...). Tắt tiếng tab ồn ào tức thì bằng nút Mute chuyên dụng.
- 🔔 **Quản Lý Thông Báo Chưa Đọc (Tab Attention Hub)**: Tự động phân tích huy hiệu thông báo chưa đọc từ tiêu đề trang (`(3) Zalo`, `(1) Facebook`, `[2] Gmail`, `(•) Slack`, `(*) GitHub`...), đếm tổng cảnh báo trên badge và hỗ trợ 1 chạm chuyển nhanh (Focus) tới tab có tin nhắn.
- 🗂️ **Thanh Điều Hướng 3 Phân Hệ (Segmented Navigation)**: Chuyển đổi mượt mà giữa **Tổng quan** (RAM Meter, Dọn dẹp, AI), **Chú ý** (Âm thanh & Thông báo), **Tìm & Lịch sử** (Search & History).
- 🧠 **Gom Nhóm AI Thông Minh (Google Gemini Workspaces)**: Tự động phân tích ngữ cảnh, tiêu đề trang web và gom các tab thành các Không gian làm việc (Workspaces / Projects) có ý nghĩa thực tế (Lập trình, Nghiên cứu AI, Vận hành, Giải trí).
- ⚡ **Xử Lý AI Siêu Tốc (< 1 giây)**: Triệt tiêu độ trễ CoT ngầm với `thinkingBudget: 0`, nén 75% dữ liệu token đầu vào. Tên nhóm được ép ngắn gọn (8–12 ký tự) không bao giờ bị cắt cụt `...` trên thanh tab!
- ⚡ **Điều Hướng AI 0ms Tự Động (Workspace Memory)**: Tự động ghi nhớ phân loại domain -> workspace. Tab mới mở thuộc domain đã biết sẽ tự động vào đúng nhóm AI chỉ trong 0ms mà không tốn quota API hay độ trễ!
- 🗂️ **Tự Động Thu Gọn Nhóm Rảnh (Auto-Collapse - Arc Browser Style)**: Chỉ mở rộng nhóm tab bạn đang xem, tự động thu nhỏ các nhóm tab rảnh để giải phóng tối đa diện tích thanh tab nằm ngang.
- 🎨 **Giao Diện Cyber Glassmorphism Chống Tràn**: Thiết kế tinh tế chuẩn Retina, dải **AI Insight Strip** siêu nhỏ gọn, lưới cài đặt 2 cột ngăn nắp không bao giờ bị cắt đáy màn hình!
- ⌨️ **Phím Tắt Nhanh Toàn Cục (Global Shortcuts)**:
  - `Command + Shift + A` (Mac) / `Alt + Shift + A` (Win): Gom nhóm AI tức thì.
  - `Command + Shift + C` (Mac) / `Alt + Shift + C` (Win): Cứu RAM ngay — đóng sạch tab trùng lặp.
- 🖱️ **Tích Hợp Menu Chuột Phải (Context Menus)**: Click chuột phải bất kỳ đâu để đóng tab trùng, gom AI hoặc đóng băng tab.
- 🔍 **Khám Phá Mô Hình Động (Dynamic Model Discovery)**: Tự động quét và liệt kê danh sách mô hình từ tài khoản Google AI của bạn thông qua API Key, lọc chính xác các model hỗ trợ `generateContent` (như `gemini-2.5-flash`, `gemini-1.5-flash`...). Tuyệt đối không cấu hình cứng model!
- 💡 **Khung Hiển Thị Tư Duy AI (Thinking & Reasoning UI)**: Minh bạch hóa quá trình suy luận của AI, giải thích rõ lý do phân loại tab để người dùng an tâm quản lý.
- ⚡ **Tự Động Gom Nhóm Thời Gian Thực (Real-time Auto Grouping)**: Chạy ngầm 100% qua Background Service Worker. Ngay khi bạn mở tab mới (như nhiều tab GitHub, Mail, Facebook...), tiện ích sẽ tự động nhận diện và gom ngay vào các khối Tab Group có nhãn màu sắc trên thanh tab trình duyệt mà bạn không cần phải bấm gì cả!
- 🚨 **Cảnh Báo Đỏ Trực Quan Trên Group Tab**: Khi một nhóm phát hiện có tab trùng lặp (ví dụ 2 tab Facebook giống nhau), tiêu đề nhóm sẽ tự động chuyển thành **`facebook.com ⚠️ (1 trùng)`** và đổi sang **MÀU ĐỎ** để bạn nhận diện tức thì ngay trên thanh tab!
- 📢 **Thông Báo Hệ Thống (Chrome Notifications)**: Tự động gửi thông báo desktop cảnh báo khi phát hiện tab trùng lặp ngốn RAM. Bạn chỉ cần **nhấp vào thông báo** là tiện ích sẽ tự động đóng sạch tab trùng và giải phóng RAM tức thì!
- 💤 **Đóng Băng Tab Nhàn Rỗi (Discard Idle Tabs)**: Giải phóng bộ nhớ RAM của các tab nền đang rảnh mà **không cần đóng tab** — tab vẫn nằm nguyên trên thanh tab và sẵn sàng nạp lại khi bạn nhấp vào.
- 📁 **Gom Cả Tab Đơn Lẻ (Single Tabs Bucket)**: Tự động gom các tab rải rác một mình (`Mail`, `Scrum`, `AI-Driven`...) vào nhóm `Tác vụ khác` giúp thanh tab luôn tinh tươm.
- 🛡️ **Cứu Sống Thanh RAM**: Phát hiện tức thì các tab trùng lặp (kể cả tab có gắn mã theo dõi `utm_*`, `fbclid`, hash fragment), đóng nhanh và giải phóng ngay từ **200MB đến 1GB+ RAM**.
- 🔔 **Badge Thông Minh Trực Quan**: Tự động hiển thị số lượng tab trùng lặp và mức độ áp lực RAM ngay trên icon tiện ích ở thanh công cụ Chrome.
- 🚀 **Siêu Nhẹ & Tốc Độ 0ms**: Dung lượng mã nguồn tối ưu triệt để (dưới 15KB), không sử dụng framework nặng nề, khởi động tức thì, không ngốn CPU hay tài nguyên nền.
- 🎨 **Visual & Branding Đỉnh Cao**: Thiết kế giao diện **Cyber Neon Glassmorphism**, logo vector SVG chuẩn Retina sắc nét với độ tương phản cao (thanh RAM bọc giáp LED RGB kết hợp tia sét vàng rực trên nền xanh điện), nổi bật trên cả Light/Dark Mode, **100% sử dụng icon SVG chuyên nghiệp**, phát triển bởi [vaithat.com](https://vaithat.com).
- 🔒 **Bảo Vệ Quyền Riêng Tư Tuyệt Đối**: Toàn bộ thao tác xử lý 100% nội bộ trong trình duyệt máy bạn (Local-only), dữ liệu gửi lên Gemini AI được lọc sạch hoàn toàn các thông tin nhạy cảm.

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT NHANH (UNPACKED MODE)

1. Mở trình duyệt Google Chrome (hoặc Brave, Edge, Cốc Cốc, Opera).
2. Truy cập vào đường dẫn: `chrome://extensions/`
3. Bật công tắc **Developer mode (Chế độ dành cho nhà phát triển)** ở góc trên bên phải.
4. Bấm vào nút **Load unpacked (Tải tiện ích đã giải nén)** ở góc trên bên trái.
5. Chọn thư mục chứa mã nguồn của tiện ích (thư mục gốc `vai-clean`).
6. Ghim biểu tượng **Vãi Cả Dọn Tab** lên thanh tiện ích Chrome để sẵn sàng cứu RAM bất kỳ lúc nào!

---

## 📁 CẤU TRÚC THƯ MỤC

```text
extension-tab-clean/
├── manifest.json              # Khai báo cấu hình Chrome Extension Manifest V3
├── package.json               # Script chạy kiểm thử native Node 20
├── icons/
│   ├── icon.svg               # Logo vector SVG gốc chuẩn Retina 128x128
│   ├── icon-16.png            # Icon 16x16 px cho favicon/toolbar
│   ├── icon-48.png            # Icon 48x48 px cho trang quản lý extension
│   └── icon-128.png           # Icon 128x128 px cho Chrome Web Store
├── src/
│   ├── engine/
│   │   ├── tabCleaner.js      # Thuật toán chuẩn hóa URL, lọc tab trùng lặp, gom nhóm, tính RAM
│   │   ├── aiOrganizer.js     # Tích hợp Gemini API, validate key, dynamic model discovery, thinking logic
│   │   └── historyTracker.js  # Quản lý lịch sử dọn dẹp, Undo/Restore, bắt thông báo & tìm kiếm tab
│   ├── background/
│   │   └── service-worker.js  # Background worker giám sát tab thời gian thực & thông báo
│   └── utils/
│       └── formatters.js      # Hàm tiện ích định dạng số, chuỗi
├── popup/
│   ├── popup.html             # Giao diện Popup người dùng với icon SVG inline & 3 tab điều hướng
│   ├── popup.css              # Styling Cyberpunk Glassmorphism hiện đại
│   └── popup.js               # Controller tương tác Chrome Tabs, Attention Hub & Search History
├── tests/
│   ├── tabCleaner.test.js     # Bộ test TDD cho engine tabCleaner
│   ├── autoGroup.test.js      # Bộ test TDD cho engine auto-group
│   ├── warningAndIdle.test.js # Bộ test TDD cho warning red group & idle tabs
│   ├── aiOrganizer.test.js    # Bộ test TDD cho engine Gemini AI
│   ├── workspaceMemory.test.js# Bộ test TDD cho Workspace Memory, Auto Routing & Auto Collapse
│   ├── historyAndNotifications.test.js # Bộ test TDD cho History, Undo, Tab Attention & Search
│   └── formatters.test.js     # Bộ test TDD cho formatters
├── scripts/
│   └── generate-icons.sh      # Script tự động tạo các kích thước icon PNG từ SVG
├── README.md                  # Tài liệu giới thiệu & hướng dẫn
├── CHANGELOG.md               # Lịch sử thay đổi các phiên bản
├── TODO.md                    # Lộ trình tính năng tương lai
└── CHROMEWEBSTORE.md          # Tài liệu chuẩn bị niêm yết lên Chrome Web Store
```

---

## 🧪 CHẠY KIỂM THỬ TỰ ĐỘNG (TDD)

Dự án áp dụng quy trình kiểm thử khép kín **TDD (Test-Driven Development)** với Node.js Native Test Runner (không cần cài thêm dependencies):

```bash
npm test
```

Kết quả:
```text
✔ History Tracker & Tab Attention Engine - TDD Test Suite (20 tests passed)
✔ TabCleaner Engine - TDD Test Suite (18 tests passed)
✔ Warning & Idle Tab Engine - TDD Test Suite (13 tests passed)
✔ AI Workspace Memory & Auto-Routing - TDD Test Suite (10 tests passed)
✔ AutoGroup Engine - TDD Test Suite (8 tests passed)
✔ AI Organizer Engine - TDD Test Suite (8 tests passed)
✔ Formatters Test Suite (2 tests passed)
ℹ pass 79 / fail 0 (100% GREEN)
```

---

## 🛡️ CAM KẾT AN TOÀN DỮ LIỆU
- Tiện ích chỉ sử dụng các quyền tối thiểu cần thiết: `tabs`, `tabGroups`, `storage`, `notifications`, `contextMenus`.
- Tiện ích tích hợp sẵn công tắc **"Bảo vệ tab ghim" (Ignore Pinned Tabs)** và **"Ưu tiên tab active" (Prefer Active Tab)** để người dùng không bao giờ bị đóng nhầm công việc đang làm dở.

---

## 🤝 ĐÓNG GÓP CHO CỘNG ĐỒNG (CONTRIBUTING)

Dự án **Vãi Cả Dọn Tab (VaiClean)** là phần mềm mã nguồn mở miễn phí 100%. Mọi đóng góp từ cộng đồng đều được hoan nghênh nồng nhiệt!

- 📘 **Hướng dẫn đóng góp**: Đọc kỹ [CONTRIBUTING.md](CONTRIBUTING.md) để biết cách fork, cài đặt môi trường và mở Pull Request.
- 📜 **Quy tắc ứng xử**: Tuân thủ [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) để cùng xây dựng cộng đồng văn minh, hòa nhã.
- 🛡️ **Bảo mật**: Báo cáo lỗ hổng qua hướng dẫn trong [SECURITY.md](SECURITY.md).
- 🐛 **Báo lỗi & Đề xuất tính năng**: [Mở Issue mới trên GitHub](https://github.com/vaithat-com/vai-clean/issues).

---

## 📄 GIẤY PHÉP (LICENSE)

Phát hành dưới giấy phép [MIT License](LICENSE). Bản quyền (c) 2026 thuộc về [vaithat.com](https://vaithat.com) và các cộng tác viên cộng đồng.
