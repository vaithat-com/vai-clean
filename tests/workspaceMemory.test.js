import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  recordWorkspaceMemory,
  routeTabWithWorkspaceMemory,
  autoCollapseInactiveGroups,
  buildIncrementalAIPrompt,
} from '../src/engine/aiOrganizer.js';

describe('AI Workspace Memory & Auto-Routing - TDD Test Suite', () => {
  describe('recordWorkspaceMemory()', () => {
    it('ghi nhớ ánh xạ giữa domain và Workspace AI từ kết quả gom nhóm', () => {
      const groups = [
        { name: '💻 Lập trình & Quản lý', color: 'blue', tabIds: [1, 2] },
        { name: '💬 Giao tiếp & Mail', color: 'yellow', tabIds: [3] },
      ];
      const tabs = [
        { id: 1, url: 'https://github.com/google/ai' },
        { id: 2, url: 'https://stackoverflow.com/questions/1' },
        { id: 3, url: 'https://mail.google.com/mail/u/0' },
      ];

      const memory = recordWorkspaceMemory(groups, tabs);
      assert.deepEqual(memory['github.com'], { workspaceName: '💻 Lập trình & Quản lý', color: 'blue' });
      assert.deepEqual(memory['stackoverflow.com'], { workspaceName: '💻 Lập trình & Quản lý', color: 'blue' });
      assert.deepEqual(memory['mail.google.com'], { workspaceName: '💬 Giao tiếp & Mail', color: 'yellow' });
    });

    it('bảo toàn bộ nhớ cũ khi có kết quả gom nhóm mới (incremental update)', () => {
      const existingMemory = {
        'figma.com': { workspaceName: '🎨 Thiết kế', color: 'purple' },
      };
      const groups = [
        { name: '💻 Lập trình', color: 'blue', tabIds: [1] },
      ];
      const tabs = [
        { id: 1, url: 'https://github.com/google' },
      ];

      const updated = recordWorkspaceMemory(groups, tabs, existingMemory);
      assert.deepEqual(updated['figma.com'], { workspaceName: '🎨 Thiết kế', color: 'purple' });
      assert.deepEqual(updated['github.com'], { workspaceName: '💻 Lập trình', color: 'blue' });
    });
  });

  describe('routeTabWithWorkspaceMemory()', () => {
    const memory = {
      'github.com': { workspaceName: '💻 Lập trình', color: 'blue' },
      'zalo.me': { workspaceName: '💬 Giao tiếp', color: 'yellow' },
    };

    const existingGroups = [
      { id: 101, title: '💻 Lập trình' },
      { id: 102, title: '💬 Giao tiếp' },
    ];

    it('định tuyến tab mới vào đúng nhóm AI có sẵn chỉ trong 0ms dựa trên bộ nhớ', () => {
      const newTab = { id: 99, url: 'https://github.com/trending' };
      const route = routeTabWithWorkspaceMemory(newTab, existingGroups, memory);

      assert.ok(route);
      assert.equal(route.tabId, 99);
      assert.equal(route.groupId, 101);
      assert.equal(route.workspaceName, '💻 Lập trình');
    });

    it('khớp chính xác ngay cả khi tên nhóm trên Chrome có nhãn cảnh báo (⚠️)', () => {
      const groupsWithWarning = [
        { id: 101, title: '💻 Lập trình ⚠️ (2 trùng)' },
      ];
      const newTab = { id: 99, url: 'https://github.com/issues' };
      const route = routeTabWithWorkspaceMemory(newTab, groupsWithWarning, memory);

      assert.ok(route);
      assert.equal(route.groupId, 101);
    });

    it('trả về null nếu domain của tab chưa có trong bộ nhớ', () => {
      const unknownTab = { id: 88, url: 'https://wikipedia.org/wiki/AI' };
      const route = routeTabWithWorkspaceMemory(unknownTab, existingGroups, memory);
      assert.equal(route, null);
    });

    it('trả về null nếu domain có trong bộ nhớ nhưng nhóm tương ứng không còn tồn tại trên Chrome', () => {
      const newTab = { id: 77, url: 'https://zalo.me/chat' };
      const emptyGroups = [{ id: 101, title: '💻 Lập trình' }]; // Nhóm 102 Giao tiếp đã bị đóng
      const route = routeTabWithWorkspaceMemory(newTab, emptyGroups, memory);
      assert.equal(route, null);
    });
  });

  describe('autoCollapseInactiveGroups()', () => {
    const allGroups = [
      { id: 10, title: '💻 Lập trình', collapsed: false },
      { id: 20, title: '💬 Giao tiếp', collapsed: false },
      { id: 30, title: '☕ Xã hội', collapsed: false },
    ];

    it('tự động gập các nhóm không hoạt động và chỉ mở bung nhóm đang active', () => {
      const actions = autoCollapseInactiveGroups(10, allGroups, true);

      assert.equal(actions.length, 3);
      // Nhóm active (10) phải mở
      const activeGroup = actions.find(a => a.groupId === 10);
      assert.equal(activeGroup.collapsed, false);

      // Các nhóm còn lại (20, 30) phải gập
      const inactive20 = actions.find(a => a.groupId === 20);
      assert.equal(inactive20.collapsed, true);

      const inactive30 = actions.find(a => a.groupId === 30);
      assert.equal(inactive30.collapsed, true);
    });

    it('không làm gì nếu tab active không thuộc bất kỳ nhóm nào (activeGroupId <= 0)', () => {
      const actions = autoCollapseInactiveGroups(-1, allGroups, true);
      assert.deepEqual(actions, []);
    });

    it('trả về rỗng nếu tính năng auto-collapse bị tắt', () => {
      const actions = autoCollapseInactiveGroups(10, allGroups, false);
      assert.deepEqual(actions, []);
    });
  });

  describe('buildIncrementalAIPrompt()', () => {
    it('tạo prompt yêu cầu AI phân loại các tab mới vào các workspaces sẵn có hoặc tạo mới', () => {
      const newTabs = [{ id: 50, title: 'Docker Docs', domain: 'docs.docker.com' }];
      const existingWorkspaces = ['💻 Lập trình', '💬 Giao tiếp'];

      const prompt = buildIncrementalAIPrompt(newTabs, existingWorkspaces);
      assert.ok(prompt.includes('docs.docker.com'));
      assert.ok(prompt.includes('💻 Lập trình'));
      assert.ok(prompt.includes('💬 Giao tiếp'));
    });
  });
});
