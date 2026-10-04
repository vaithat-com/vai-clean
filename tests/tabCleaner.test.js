import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  extractDomain,
  findDuplicates,
  groupTabsByDomain,
  calculateRamSavings,
  pickGroupColor,
} from '../src/engine/tabCleaner.js';

describe('TabCleaner Engine - TDD Test Suite', () => {
  describe('normalizeUrl()', () => {
    it('chuẩn hóa url cơ bản: xóa trailing slash và chuyển lowercase scheme/host', () => {
      const url1 = 'https://Example.com/path/';
      const url2 = 'https://example.com/path';
      assert.equal(normalizeUrl(url1), normalizeUrl(url2));
    });

    it('loại bỏ các tracking query params (utm_*, fbclid, gclid, ref)', () => {
      const cleanUrl = 'https://antigravity.google.com/docs?lang=vi';
      const trackedUrl = 'https://antigravity.google.com/docs?utm_source=facebook&utm_medium=cpc&fbclid=XYZ123&lang=vi';
      assert.equal(normalizeUrl(trackedUrl), normalizeUrl(cleanUrl));
    });

    it('giữ nguyên query params nghiệp vụ quan trọng', () => {
      const search1 = 'https://google.com/search?q=ram';
      const search2 = 'https://google.com/search?q=cpu';
      assert.notEqual(normalizeUrl(search1), normalizeUrl(search2));
    });

    it('loại bỏ hash fragments theo mặc định', () => {
      const withHash = 'https://vnexpress.net/thoi-su#comment-box';
      const withoutHash = 'https://vnexpress.net/thoi-su';
      assert.equal(normalizeUrl(withHash), normalizeUrl(withoutHash));
    });

    it('xử lý an toàn khi URL rỗng hoặc không hợp lệ', () => {
      assert.equal(normalizeUrl(''), '');
      assert.equal(normalizeUrl('not-a-valid-url'), 'not-a-valid-url');
    });
  });

  describe('extractDomain()', () => {
    it('trích xuất root/subdomain sạch sẽ và bỏ tiền tố www', () => {
      assert.equal(extractDomain('https://www.youtube.com/watch?v=123'), 'youtube.com');
      assert.equal(extractDomain('https://github.com/google/gemini'), 'github.com');
      assert.equal(extractDomain('https://sub.domain.vn/test'), 'sub.domain.vn');
    });

    it('đặt tên thân thiện cho các trang nội bộ Chrome', () => {
      assert.equal(extractDomain('chrome://extensions/'), 'Chrome Extensions');
      assert.equal(extractDomain('chrome://settings/'), 'Chrome Settings');
      assert.equal(extractDomain('chrome://newtab/'), 'Tab mới');
    });

    it('xử lý an toàn khi url rỗng', () => {
      assert.equal(extractDomain(''), 'Khác');
    });
  });

  describe('findDuplicates()', () => {
    const mockTabs = [
      { id: 1, url: 'https://github.com/google/ai', title: 'Google AI', pinned: false, active: false, windowId: 10 },
      { id: 2, url: 'https://github.com/google/ai?utm_source=twitter', title: 'Google AI Copy', pinned: false, active: false, windowId: 10 },
      { id: 3, url: 'https://youtube.com/watch?v=abc', title: 'Video 1', pinned: false, active: true, windowId: 10 },
      { id: 4, url: 'https://youtube.com/watch?v=abc#t=10s', title: 'Video 1 Dup', pinned: false, active: false, windowId: 10 },
      { id: 5, url: 'https://news.ycombinator.com', title: 'Hacker News', pinned: true, active: false, windowId: 10 },
      { id: 6, url: 'https://news.ycombinator.com?ref=hn', title: 'Hacker News Dup', pinned: false, active: false, windowId: 10 },
    ];

    it('phát hiện chính xác tab trùng lặp dựa trên URL đã chuẩn hóa', () => {
      const result = findDuplicates(mockTabs);
      // id 2 là trùng với 1
      // id 4 là trùng với 3
      // id 6 là trùng với 5
      assert.equal(result.toClose.length, 3);
      assert.equal(result.toKeep.length, 3);
      assert.deepEqual(result.toClose.map(t => t.id).sort(), [2, 4, 6]);
    });

    it('luôn giữ lại tab đang Active (ưu tiên người dùng)', () => {
      const tabs = [
        { id: 101, url: 'https://example.com', title: 'Tab 1', active: false, pinned: false },
        { id: 102, url: 'https://example.com', title: 'Tab 2 Active', active: true, pinned: false },
      ];
      const result = findDuplicates(tabs, { preferActive: true });
      assert.equal(result.toKeep[0].id, 102);
      assert.equal(result.toClose[0].id, 101);
    });

    it('bỏ qua không đóng tab đã Ghim (pinned tabs) khi ignorePinned: true', () => {
      const tabs = [
        { id: 201, url: 'https://slack.com', title: 'Slack Pinned', pinned: true, active: false },
        { id: 202, url: 'https://slack.com', title: 'Slack Unpinned', pinned: false, active: false },
      ];
      const result = findDuplicates(tabs, { ignorePinned: true });
      // Tab 201 được ghim nên không bao giờ bị đóng, tab 202 trùng sẽ bị đóng
      assert.equal(result.toKeep[0].id, 201);
      assert.equal(result.toClose[0].id, 202);
    });

    it('không bao giờ đóng tab ghim ngay cả khi phát hiện trùng', () => {
      const tabs = [
        { id: 301, url: 'https://mail.google.com', title: 'Mail 1', pinned: true, active: false },
        { id: 302, url: 'https://mail.google.com', title: 'Mail 2', pinned: true, active: false },
      ];
      const result = findDuplicates(tabs, { ignorePinned: true });
      // Cả 2 tab đều ghim nên toClose phải là rỗng để bảo vệ người dùng
      assert.equal(result.toClose.length, 0);
      assert.equal(result.toKeep.length, 2);
    });
  });

  describe('groupTabsByDomain()', () => {
    const sampleTabs = [
      { id: 1, url: 'https://github.com/repo1', windowId: 1 },
      { id: 2, url: 'https://github.com/repo2', windowId: 1 },
      { id: 3, url: 'https://facebook.com/feed', windowId: 1 },
      { id: 4, url: 'chrome://newtab', windowId: 1 },
    ];

    it('gom các tab có cùng domain vào chung một nhóm', () => {
      const groups = groupTabsByDomain(sampleTabs);
      assert.ok(groups['github.com']);
      assert.equal(groups['github.com'].tabIds.length, 2);
      assert.deepEqual(groups['github.com'].tabIds, [1, 2]);
    });

    it('bỏ qua tab nội bộ trống khi skipInternalUrls: true', () => {
      const groups = groupTabsByDomain(sampleTabs, { skipInternalUrls: true });
      assert.equal(groups['Tab mới'], undefined);
    });
  });

  describe('calculateRamSavings()', () => {
    it('ước tính dung lượng RAM tiết kiệm chính xác theo số tab', () => {
      // Giả sử trung bình 80MB / tab
      const savings = calculateRamSavings(5, 80);
      assert.equal(savings.ramMB, 400);
      assert.equal(savings.formatted, '400 MB');
    });

    it('tự động format sang GB khi RAM giải phóng >= 1024MB', () => {
      const savings = calculateRamSavings(15, 100);
      assert.equal(savings.ramMB, 1500);
      assert.equal(savings.formatted, '1.46 GB');
    });

    it('trả về 0 MB khi số tab là 0', () => {
      const savings = calculateRamSavings(0);
      assert.equal(savings.ramMB, 0);
      assert.equal(savings.formatted, '0 MB');
    });
  });

  describe('pickGroupColor()', () => {
    it('gán màu nhất quán và hợp lệ với Chrome Tab Groups API', () => {
      const validChromeColors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];
      const color1 = pickGroupColor('github.com');
      const color2 = pickGroupColor('github.com');
      assert.equal(color1, color2);
      assert.ok(validChromeColors.includes(color1));
    });
  });
});
