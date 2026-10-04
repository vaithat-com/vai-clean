# 🤝 HƯỚNG DẪN ĐÓNG GÓP (CONTRIBUTING GUIDE)

Chào mừng bạn đến với dự án **Vãi Cả Dọn Tab (VaiClean)**! Cảm ơn bạn đã quan tâm và muốn chung tay xây dựng một tiện ích mở rộng Chrome mã nguồn mở mạnh mẽ, mượt mà và giúp hàng triệu người dùng "cứu sống" thanh RAM máy tính.

Tài liệu này sẽ hướng dẫn bạn toàn bộ quy trình thiết lập môi trường phát triển, quy chuẩn viết mã và cách gửi một Pull Request (PR) chất lượng cao.

---

## 🧭 Mục Lục

1. [Quy Tắc Chung](#-quy-tắc-chung)
2. [Thiết Lập Môi Trường Phát Triển](#-thiết-lập-môi-trường-phát-triển)
3. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
4. [Quy Chuẩn Viết Mã (Coding Standards)](#-quy-chuẩn-viết-mã-coding-standards)
5. [Quy Trình Tạo Nhánh & Commit](#-quy-trình-tạo-nhánh--commit)
6. [Quy Trình Mở Pull Request (PR)](#-quy-trình-mở-pull-request-pr)
7. [Báo Cáo Lỗi & Đề Xuất Tính Năng](#-báo-cáo-lỗi--đề-xuất-tính-năng)

---

## 🌟 Quy Tắc Chung

- **Tôn trọng cộng đồng**: Tuân thủ [Quy tắc ứng xử (Code of Conduct)](CODE_OF_CONDUCT.md).
- **Trọng tâm hiệu năng**: VaiClean sinh ra để tiết kiệm tài nguyên. Mọi dòng code phải tối ưu, nhẹ, không gây rò rỉ bộ nhớ (memory leak) và không chạy vòng lặp ngầm vô tận.
- **Bảo mật & Quyền riêng tư**: 100% dữ liệu xử lý cục bộ trên máy người dùng. Không bao giờ gửi URL, lịch sử hoặc thông tin cá nhân của người dùng về bất kỳ máy chủ nào.
- **Kiểm thử khép kín (TDD)**: Mọi tính năng logic mới hoặc bản sửa lỗi bắt buộc phải đi kèm Unit Test và vượt qua toàn bộ bài test hiện có trước khi mở PR.

---

## 💻 Thiết Lập Môi Trường Phát Triển

### Yêu Cầu
- **Trình duyệt**: Google Chrome, Brave, Edge hoặc bất kỳ trình duyệt Chromium nào (hỗ trợ Manifest V3).
- **Node.js**: Phiên bản 18 trở lên.
- **Git**.

### Các Bước Cài Đặt

1. **Fork Repository**:
   Nhấp nút **Fork** ở góc trên bên phải trang GitHub [vaithat-com/vai-clean](https://github.com/vaithat-com/vai-clean) để tạo bản sao vào tài khoản của bạn.

2. **Clone về máy tính**:
   ```bash
   git clone https://github.com/<your-username>/vai-clean.git
   cd vai-clean
   ```

3. **Cài đặt thư viện kiểm thử**:
   ```bash
   npm install
   ```

4. **Chạy kiểm thử (Automated Unit Tests)**:
   ```bash
   npm test
   ```
   *Đảm bảo toàn bộ 79/79 bài test đều đạt màu xanh (PASS).*

5. **Nạp tiện ích vào Chrome để thử nghiệm (Load Unpacked)**:
   - Mở trình duyệt Chrome và truy cập đường dẫn: `chrome://extensions/`
   - Bật công tắc **"Chế độ dành cho nhà phát triển" (Developer mode)** ở góc trên bên phải.
   - Nhấp vào nút **"Tải tiện ích đã giải nén" (Load unpacked)** ở góc trên bên trái.
   - Chọn thư mục gốc dự án `vai-clean`.
   - Ghim icon tiện ích lên thanh công cụ Chrome và bắt đầu trải nghiệm!

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
vai-clean/
├── .github/                 # GitHub Issue & PR Templates
├── icons/                   # Bộ icon tiện ích chuẩn Retina (16px, 48px, 128px)
├── popup/                   # Giao diện chính (Popup UI)
│   ├── popup.html           # Khung HTML ngữ nghĩa chuẩn SEO/A11y
│   ├── popup.css            # Cyber Glassmorphism Design System (CSS Vanilla)
│   └── popup.js             # Logic điều khiển giao diện & tương tác người dùng
├── src/                     # Động cơ nghiệp vụ cốt lõi (Core Business Engine)
│   ├── background.js        # Service Worker giám sát thời gian thực & phím tắt
│   ├── duplicateEngine.js   # Thuật toán phát hiện & lọc tab trùng lặp siêu tốc
│   ├── tabGroupsEngine.js   # Động cơ phân tích & quản lý cây cấu trúc Chrome Tab Groups
│   ├── geminiEngine.js      # Trí tuệ nhân tạo Gemini AI gom nhóm Workspace & Dynamic Discovery
│   ├── attentionEngine.js   # Phát hiện tab phát âm thanh & bắt huy hiệu tin nhắn chưa đọc
│   ├── memoryEngine.js      # Tính toán dung lượng RAM giải phóng & cơ chế ngủ đông
│   ├── storage.js           # Lớp lưu trữ dữ liệu chrome.storage an toàn
│   └── historyManager.js    # Quản lý nhật ký dọn dẹp & động cơ khôi phục (Undo/Restore)
├── tests/                   # Bộ kiểm thử đơn vị tự động (Unit Tests)
├── scripts/                 # Công cụ tự động hóa & tạo asset cửa hàng (Python / CLI)
├── dist/                    # Gói phát hành sản phẩm (Zip & Store Screenshots)
├── manifest.json            # Cấu hình Chrome Extension Manifest V3
├── package.json             # Cấu hình dự án & kịch bản kiểm thử
├── CONTRIBUTING.md          # Tài liệu hướng dẫn đóng góp này
├── CODE_OF_CONDUCT.md       # Bộ quy tắc ứng xử cộng đồng
├── LICENSE                  # Giấy phép nguồn mở MIT
└── README.md                # Tài liệu tổng quan dự án
```

---

## 🎨 Quy Chuẩn Viết Mã (Coding Standards)

1. **Vanilla JavaScript & CSS**:
   - Dự án ưu tiên tốc độ tối đa và kích thước siêu nhẹ (< 100KB), không sử dụng các framework nặng (React, Vue, Webpack...).
   - Viết code ES6+ rõ ràng, tường minh, có chú thích đầy đủ cho các hàm xử lý logic phức tạp.

2. **Thiết kế Đồ Họa 100% Vector SVG**:
   - Tuyệt đối không dùng emoji sơ sài làm icon tính năng trong giao diện người dùng.
   - Sử dụng các thẻ `<svg>` vector chuẩn, tỉ lệ viewBox 24x24 hoặc 16x16, hỗ trợ sắc nét trên màn hình Retina độ phân giải cao.

3. **Giao diện Cyber Glassmorphism & Tương Thích Kích Thước**:
   - Bề rộng popup chuẩn `360px`, chiều cao tối đa `600px`.
   - Mọi danh sách có thể dài (Nhóm tab, Kết quả tìm kiếm, Lịch sử) bắt buộc phải tích hợp động cơ phân trang `paginateList()` để ngăn chặn tình trạng tràn khung hình.

---

## 🌿 Quy Trình Tạo Nhánh & Commit

### 1. Đặt tên nhánh (Branch Naming)
Luôn tạo nhánh mới từ nhánh `main`:
- Tính năng mới: `feat/<ten-tinh-nang>` (Ví dụ: `feat/domain-whitelist`)
- Sửa lỗi: `fix/<ten-loi>` (Ví dụ: `fix/audio-tab-detection`)
- Tài liệu: `docs/<noi-dung>` (Ví dụ: `docs/update-readme`)
- Tối ưu mã nguồn: `refactor/<mo-ta>` (Ví dụ: `refactor/tab-groups-query`)

### 2. Quy chuẩn Commit Message (Conventional Commits)
Áp dụng định dạng chuẩn quốc tế:
```
<type>: <mô tả ngắn gọn bằng tiếng Anh hoặc tiếng Việt>
```
Các tiền tố hợp lệ:
- `feat:` Thêm một tính năng mới.
- `fix:` Khắc phục một lỗi phát sinh.
- `docs:` Cập nhật tài liệu, README, hướng dẫn.
- `refactor:` Tái cấu trúc mã nguồn mà không thay đổi tính năng bên ngoài.
- `test:` Bổ sung hoặc sửa đổi các bài kiểm thử.
- `perf:` Tối ưu hóa hiệu năng và bộ nhớ RAM.
- `chore:` Thay đổi kịch bản build, cấu hình git hoặc package.

*Ví dụ: `feat: add custom prompt template for gemini ai grouping`*

---

## 🚀 Quy Trình Mở Pull Request (PR)

1. Đẩy nhánh của bạn lên fork:
   ```bash
   git push origin feat/ten-tinh-nang
   ```
2. Truy cập kho lưu trữ [vaithat-com/vai-clean](https://github.com/vaithat-com/vai-clean).
3. Nhấp vào nút **Compare & pull request**.
4. Điền đầy đủ thông tin vào **Pull Request Template**:
   - Tóm tắt mục đích của thay đổi.
   - Các bài kiểm tra đã thực hiện (`npm test`).
   - Đính kèm ảnh chụp màn hình hoặc GIF nếu có thay đổi về giao diện người dùng (UI/UX).
5. Đội ngũ maintainers sẽ review, phản hồi và merge mã nguồn của bạn vào nhánh chính!

---

## 🐛 Báo Cáo Lỗi & Đề Xuất Tính Năng

Nếu bạn phát hiện lỗi hoặc có ý tưởng mới nhưng chưa thể viết code ngay:
- Báo cáo lỗi: Sử dụng [Bug Report Template](https://github.com/vaithat-com/vai-clean/issues/new?template=bug_report.md).
- Đề xuất tính năng: Sử dụng [Feature Request Template](https://github.com/vaithat-com/vai-clean/issues/new?template=feature_request.md).

Mọi đóng góp, dù là sửa một lỗi chính tả nhỏ hay đề xuất một thuật toán mới, đều vô cùng quý giá! Cảm ơn bạn đã là một phần của cộng đồng **VaiClean**! ❤️
