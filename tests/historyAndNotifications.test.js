import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractNotificationCount,
  createHistoryEntry,
  pushCleanupHistory,
  inspectTabAttention,
  searchTabs,
  paginateList,
  buildTabHierarchy,
} from '../src/engine/historyTracker.js';

describe('History Tracker & Tab Attention Engine - TDD Test Suite', () => {
  describe('extractNotificationCount()', () => {
    it('nhận diện chính xác số lượng thông báo trong ngoặc tròn như (1), (3), (99+)', () => {
      assert.equal(extractNotificationCount('(3) Facebook'), '3');
      assert.equal(extractNotificationCount('(99+) Zalo - Le Tien Nhat'), '99+');
      assert.equal(extractNotificationCount('(1) Thông báo mới'), '1');
    });

    it('nhận diện chính xác số thông báo trong ngoặc vuông như [12] Gmail', () => {
      assert.equal(extractNotificationCount('[12] Gmail - Inbox (3 unread)'), '12');
    });

    it('nhận diện ký tự chú ý đặc biệt như dấu chấm tròn hoặc sao: (•), (*)', () => {
      assert.equal(extractNotificationCount('(•) Slack | workspace'), '•');
      assert.equal(extractNotificationCount('(*) Notion Document'), '*');
    });

    it('trả về null nếu tiêu đề không có dấu hiệu thông báo đầu dòng', () => {
      assert.equal(extractNotificationCount('Google Search - ASC Software'), null);
      assert.equal(extractNotificationCount('YouTube - Lo-fi Radio 2026'), null);
      assert.equal(extractNotificationCount(''), null);
      assert.equal(extractNotificationCount(null), null);
    });
  });

  describe('createHistoryEntry()', () => {
    it('tạo bản ghi lịch sử dọn dẹp với đầy đủ định dạng và chuẩn hóa thông tin tab', () => {
      const tabs = [
        { id: 10, title: 'GitHub - Pull Request #42', url: 'https://github.com/google/ai/pull/42' },
        { id: 11, title: 'YouTube Video', url: 'https://www.youtube.com/watch?v=123' },
      ];

      const entry = createHistoryEntry('CLEAN_DUPLICATES', tabs, 160);

      assert.ok(entry.id.startsWith('hist_'));
      assert.equal(typeof entry.timestamp, 'number');
      assert.equal(entry.actionType, 'CLEAN_DUPLICATES');
      assert.equal(entry.ramSavedMB, 160);
      assert.equal(entry.tabs.length, 2);
      assert.equal(entry.tabs[0].domain, 'github.com');
      assert.equal(entry.tabs[1].domain, 'youtube.com');
    });
  });

  describe('pushCleanupHistory()', () => {
    it('thêm bản ghi mới lên đầu danh sách (LIFO / mới nhất trước)', () => {
      const existing = [{ id: 'old_1' }];
      const newEntry = { id: 'new_2' };
      const updated = pushCleanupHistory(existing, newEntry, 5);

      assert.equal(updated.length, 2);
      assert.equal(updated[0].id, 'new_2');
      assert.equal(updated[1].id, 'old_1');
    });

    it('tự động cắt tỉa khi vượt quá số lượng tối đa maxEntries (mặc định 30)', () => {
      const list = [];
      for (let i = 0; i < 35; i++) {
        list.push({ id: `entry_${i}` });
      }

      const updated = pushCleanupHistory(list, { id: 'entry_new' }, 30);
      assert.equal(updated.length, 30);
      assert.equal(updated[0].id, 'entry_new');
    });
  });

  describe('inspectTabAttention()', () => {
    const mockTabs = [
      {
        id: 1,
        windowId: 100,
        title: '(3) Facebook',
        url: 'https://facebook.com',
        audible: false,
        mutedInfo: { muted: false },
      },
      {
        id: 2,
        windowId: 100,
        title: 'YouTube - Relaxing Music',
        url: 'https://youtube.com/watch?v=abc',
        audible: true,
        mutedInfo: { muted: false },
      },
      {
        id: 3,
        windowId: 100,
        title: 'Spotify Web Player',
        url: 'https://spotify.com',
        audible: false,
        mutedInfo: { muted: true },
      },
      {
        id: 4,
        windowId: 100,
        title: 'Google Search',
        url: 'https://google.com',
        audible: false,
        mutedInfo: { muted: false },
      },
    ];

    it('nhận diện chính xác các tab đang phát âm thanh hoặc bị tắt tiếng', () => {
      const { audibleTabs } = inspectTabAttention(mockTabs);
      assert.equal(audibleTabs.length, 2); // Tab 2 (audible) và Tab 3 (muted)
      assert.equal(audibleTabs[0].id, 2);
      assert.equal(audibleTabs[0].isAudible, true);
      assert.equal(audibleTabs[1].id, 3);
      assert.equal(audibleTabs[1].isMuted, true);
    });

    it('nhận diện chính xác các tab có thông báo chưa đọc', () => {
      const { notificationTabs } = inspectTabAttention(mockTabs);
      assert.equal(notificationTabs.length, 1);
      assert.equal(notificationTabs[0].id, 1);
      assert.equal(notificationTabs[0].unreadCount, '3');
    });

    it('tính tổng số tab cần chú ý không bị trùng lặp (distinct tab count)', () => {
      const tabDual = [
        {
          id: 5,
          windowId: 100,
          title: '(1) Google Meet',
          url: 'https://meet.google.com',
          audible: true,
          mutedInfo: { muted: false },
        },
      ];
      const { totalAttentionCount } = inspectTabAttention(tabDual);
      assert.equal(totalAttentionCount, 1);
    });
  });

  describe('searchTabs()', () => {
    const openTabs = [
      { id: 1, title: 'GitHub - Pull Request ASC', url: 'https://github.com/google/ai' },
      { id: 2, title: 'Zalo Web Chat', url: 'https://chat.zalo.me' },
      { id: 3, title: 'Tin tức kinh tế VnExpress', url: 'https://vnexpress.net/kinh-doanh' },
    ];

    const history = [
      {
        id: 'hist_1',
        timestamp: 1700000000000,
        tabs: [
          { title: 'YouTube - Nhạc Không Lời Chill', url: 'https://youtube.com/watch?v=1' },
          { title: 'ASC Education Software', url: 'https://asc.vn' },
        ],
      },
    ];

    it('tìm thấy tab đang mở theo tên miền hoặc tiêu đề', () => {
      const result = searchTabs('github', openTabs, history);
      assert.equal(result.openTabMatches.length, 1);
      assert.equal(result.openTabMatches[0].tabId, 1);
    });

    it('tìm kiếm không phân biệt hoa thường và hỗ trợ cả lịch sử', () => {
      const result = searchTabs('ASC', openTabs, history);
      assert.equal(result.openTabMatches.length, 1);
      assert.equal(result.historyMatches.length, 1);
      assert.equal(result.historyMatches[0].title, 'ASC Education Software');
    });

    it('trả về mảng rỗng nếu từ khóa trống', () => {
      const result = searchTabs('', openTabs, history);
      assert.equal(result.openTabMatches.length, 0);
      assert.equal(result.historyMatches.length, 0);
    });
  });

  describe('paginateList()', () => {
    const sampleItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    it('chia trang chính xác theo kích thước pageSize', () => {
      const page1 = paginateList(sampleItems, 1, 5);
      assert.equal(page1.totalPages, 3);
      assert.equal(page1.currentPage, 1);
      assert.deepEqual(page1.pageItems, [1, 2, 3, 4, 5]);
      assert.equal(page1.hasPrev, false);
      assert.equal(page1.hasNext, true);

      const page3 = paginateList(sampleItems, 3, 5);
      assert.deepEqual(page3.pageItems, [11, 12]);
      assert.equal(page3.hasPrev, true);
      assert.equal(page3.hasNext, false);
    });

    it('tự động kẹp an toàn khi số trang vượt ngưỡng', () => {
      const clampedHigh = paginateList(sampleItems, 999, 5);
      assert.equal(clampedHigh.currentPage, 3);
      const clampedLow = paginateList(sampleItems, -5, 5);
      assert.equal(clampedLow.currentPage, 1);
    });

    it('xử lý an toàn khi danh sách rỗng', () => {
      const empty = paginateList([], 1, 5);
      assert.equal(empty.totalPages, 1);
      assert.equal(empty.currentPage, 1);
      assert.equal(empty.pageItems.length, 0);
    });
  });

  describe('buildTabHierarchy()', () => {
    it('nhóm các tab vào đúng tab group tương ứng trên Chrome và gom tab đơn lẻ', () => {
      const mockGroups = [
        { id: 101, title: '💻 Dev', color: 'blue', collapsed: false },
        { id: 102, title: '🌐 Social', color: 'red', collapsed: true },
      ];
      const mockTabs = [
        { id: 1, title: 'GitHub PR', url: 'https://github.com/pulls', groupId: 101 },
        { id: 2, title: 'Stack Overflow', url: 'https://stackoverflow.com', groupId: 101 },
        { id: 3, title: 'Facebook Feed', url: 'https://facebook.com', groupId: 102 },
        { id: 4, title: 'Google Search', url: 'https://google.com', groupId: -1 },
      ];

      const hierarchy = buildTabHierarchy(mockTabs, mockGroups);
      assert.equal(hierarchy.groups.length, 2);
      assert.equal(hierarchy.groups[0].title, '💻 Dev');
      assert.equal(hierarchy.groups[0].tabs.length, 2);
      assert.equal(hierarchy.groups[1].title, '🌐 Social');
      assert.equal(hierarchy.groups[1].tabs.length, 1);
      assert.equal(hierarchy.ungroupedTabs.length, 1);
      assert.equal(hierarchy.ungroupedTabs[0].domain, 'google.com');
    });

    it('tự động tạo nhóm dự phòng khi tab có groupId > 0 nhưng mảng groups bị thiếu hoặc rỗng', () => {
      const mockTabs = [
        { id: 1, title: 'Jira Ticket', url: 'https://jira.example.com', groupId: 55 },
        { id: 2, title: 'VaiThat Privacy', url: 'https://vaithat.com/privacy', groupId: -1 },
      ];

      // Giả lập groups rỗng do chrome.tabGroups.query trả về []
      const hierarchy = buildTabHierarchy(mockTabs, []);
      assert.equal(hierarchy.groups.length, 1);
      assert.equal(hierarchy.groups[0].id, 55);
      assert.equal(hierarchy.groups[0].title, 'Nhóm #55');
      assert.equal(hierarchy.groups[0].tabs.length, 1);
      assert.equal(hierarchy.ungroupedTabs.length, 1);
      assert.equal(hierarchy.ungroupedTabs[0].domain, 'vaithat.com');
    });
  });
});

