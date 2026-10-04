import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatGroupTitleWithWarning,
  pickGroupColorWithWarning,
  countDuplicatesInTabs,
  planAutoGroupActionsWithWarning,
} from '../src/engine/tabCleaner.js';

describe('Warning & Idle Tab Engine - TDD Test Suite', () => {
  describe('formatGroupTitleWithWarning()', () => {
    it('trả về tên domain thông thường khi không có tab trùng lặp', () => {
      assert.equal(formatGroupTitleWithWarning('facebook.com', 0), 'facebook.com');
    });

    it('gắn nhãn cảnh báo trực tiếp vào tên nhóm khi có tab trùng lặp', () => {
      assert.equal(formatGroupTitleWithWarning('facebook.com', 1), 'facebook.com ⚠️ (1 trùng)');
      assert.equal(formatGroupTitleWithWarning('github.com', 3), 'github.com ⚠️ (3 trùng)');
    });
  });

  describe('pickGroupColorWithWarning()', () => {
    it('đổi màu nhóm sang ĐỎ (red) cảnh báo khi phát hiện có tab trùng', () => {
      const colorWithDup = pickGroupColorWithWarning('facebook.com', 1);
      assert.equal(colorWithDup, 'red');
    });

    it('giữ màu nhận diện thương hiệu thông thường khi không có tab trùng', () => {
      const colorNoDup = pickGroupColorWithWarning('facebook.com', 0);
      assert.notEqual(colorNoDup, 'red');
    });
  });

  describe('countDuplicatesInTabs()', () => {
    const tabs = [
      { id: 1, url: 'https://facebook.com/watch?v=1', pinned: false, active: true },
      { id: 2, url: 'https://facebook.com/watch?v=1&utm_source=fb', pinned: false, active: false },
      { id: 3, url: 'https://facebook.com/messages', pinned: false, active: false },
    ];

    it('đếm chính xác số lượng tab trùng lặp trong nhóm', () => {
      const dupCount = countDuplicatesInTabs(tabs);
      assert.equal(dupCount, 1);
    });

    it('trả về 0 khi không có tab trùng lặp', () => {
      const uniqueTabs = [
        { id: 1, url: 'https://github.com/repo1', pinned: false },
        { id: 2, url: 'https://github.com/repo2', pinned: false },
      ];
      assert.equal(countDuplicatesInTabs(uniqueTabs), 0);
    });
  });

  describe('planAutoGroupActionsWithWarning()', () => {
    const existingGroups = [
      { id: 10, title: 'facebook.com' },
    ];

    const currentTabs = [
      // 2 tab trùng lặp facebook.com
      { id: 1, url: 'https://facebook.com/feed', groupId: 10, pinned: false },
      { id: 2, url: 'https://facebook.com/feed?ref=bookmark', groupId: -1, pinned: false },
      // 2 tab github.com không trùng
      { id: 3, url: 'https://github.com/a', groupId: -1, pinned: false },
      { id: 4, url: 'https://github.com/b', groupId: -1, pinned: false },
      // 1 tab đơn lẻ Scrum
      { id: 5, url: 'https://scrum.org/board', groupId: -1, pinned: false },
    ];

    it('tính toán cảnh báo trùng lặp và gom tab đơn lẻ vào nhóm Khác nếu bật groupSingleTabs', () => {
      const plan = planAutoGroupActionsWithWarning(currentTabs, existingGroups, {
        minTabsForNewGroup: 2,
        groupSingleTabs: true,
      });

      // Nhóm facebook.com phải có cập nhật cảnh báo trùng lặp
      const fbUpdate = plan.groupUpdates.find(g => g.groupId === 10);
      assert.ok(fbUpdate);
      assert.equal(fbUpdate.title, 'facebook.com ⚠️ (1 trùng)');
      assert.equal(fbUpdate.color, 'red');

      // Tab đơn lẻ (Scrum) được gom vào nhóm 'Tác vụ khác'
      const singleGroup = plan.createNewGroups.find(g => g.domain === 'Tác vụ khác');
      assert.ok(singleGroup);
      assert.deepEqual(singleGroup.tabIds, [5]);
    });

    it('tái sử dụng nhóm Tác vụ khác đã có sẵn thay vì tạo thêm nhóm mới trùng tên', () => {
      const groupsWithOther = [
        { id: 99, title: 'Tác vụ khác' },
      ];
      const tabs = [
        { id: 1, url: 'https://zalo.me', groupId: 99, pinned: false },
        { id: 2, url: 'https://scrum.org/board', groupId: -1, pinned: false }, // tab đơn lẻ mới
      ];

      const plan = planAutoGroupActionsWithWarning(tabs, groupsWithOther, {
        minTabsForNewGroup: 2,
        groupSingleTabs: true,
      });

      // Không được tạo thêm nhóm 'Tác vụ khác' mới
      const newOther = plan.createNewGroups.find(g => g.domain === 'Tác vụ khác');
      assert.equal(newOther, undefined);

      // Tab đơn lẻ phải được thêm vào nhóm 99 có sẵn
      const addedToOther = plan.addToExistingGroup.find(a => a.tabId === 2 && a.groupId === 99);
      assert.ok(addedToOther);
    });

    it('tự động gộp tất cả các nhóm Tác vụ khác bị trùng lặp vào 1 nhóm duy nhất', () => {
      const duplicateOtherGroups = [
        { id: 99, title: 'Tác vụ khác' },
        { id: 100, title: 'Tác vụ khác' },
      ];
      const tabs = [
        { id: 1, url: 'https://zalo.me', groupId: 99, pinned: false },
        { id: 2, url: 'https://tabcleaner.app', groupId: 100, pinned: false },
      ];

      const plan = planAutoGroupActionsWithWarning(tabs, duplicateOtherGroups, {
        minTabsForNewGroup: 2,
        groupSingleTabs: true,
      });

      // Tab từ nhóm 100 phải được chuyển sang nhóm 99 để gộp thành 1 nhóm duy nhất
      const moved = plan.addToExistingGroup.find(a => a.tabId === 2 && a.groupId === 99);
      assert.ok(moved);
    });

    it('tự động rã nhóm (ungroup) các tab trong nhóm Tác vụ khác khi tắt groupSingleTabs: false', () => {
      const existingOther = [
        { id: 99, title: 'Tác vụ khác' },
        { id: 100, title: 'Tác vụ khác' },
      ];
      const tabs = [
        { id: 1, url: 'https://zalo.me', groupId: 99, pinned: false },
        { id: 2, url: 'https://tabcleaner.app', groupId: 100, pinned: false },
      ];

      const plan = planAutoGroupActionsWithWarning(tabs, existingOther, {
        minTabsForNewGroup: 2,
        groupSingleTabs: false,
      });

      // Toàn bộ tab trong các nhóm Tác vụ khác phải được rã nhóm
      assert.ok(plan.ungroupTabIds.includes(1));
      assert.ok(plan.ungroupTabIds.includes(2));
    });
  });
});
