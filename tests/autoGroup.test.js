import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  matchTabToGroup,
  shouldSkipAutoGroup,
  planAutoGroupActions,
} from '../src/engine/tabCleaner.js';

describe('AutoGroup Engine - TDD Test Suite', () => {
  describe('matchTabToGroup()', () => {
    const existingGroups = [
      { id: 10, title: 'github.com' },
      { id: 20, title: 'facebook.com' },
      { id: 30, title: 'mail.google.com' },
    ];

    it('tìm thấy nhóm có sẵn trùng domain với tab', () => {
      const tab = { id: 101, url: 'https://github.com/capcom/repo/pull/5' };
      const matchedGroupId = matchTabToGroup(tab, existingGroups);
      assert.equal(matchedGroupId, 10);
    });

    it('bỏ qua www khi so khớp domain với nhóm có sẵn', () => {
      const tab = { id: 102, url: 'https://www.facebook.com/photo/123' };
      const matchedGroupId = matchTabToGroup(tab, existingGroups);
      assert.equal(matchedGroupId, 20);
    });

    it('trả về null nếu chưa có nhóm nào khớp domain', () => {
      const tab = { id: 103, url: 'https://vaithat.com/#chotool' };
      const matchedGroupId = matchTabToGroup(tab, existingGroups);
      assert.equal(matchedGroupId, null);
    });
  });

  describe('shouldSkipAutoGroup()', () => {
    it('bỏ qua các tab hệ thống hoặc tab trống', () => {
      assert.equal(shouldSkipAutoGroup({ url: 'chrome://newtab/' }), true);
      assert.equal(shouldSkipAutoGroup({ url: 'about:blank' }), true);
      assert.equal(shouldSkipAutoGroup({ url: '' }), true);
    });

    it('bỏ qua tab đã nằm sẵn trong group (groupId > 0 hoặc khác -1)', () => {
      assert.equal(shouldSkipAutoGroup({ url: 'https://github.com', groupId: 15 }), true);
    });

    it('bỏ qua tab đã ghim nếu bật ignorePinned: true', () => {
      assert.equal(shouldSkipAutoGroup({ url: 'https://slack.com', pinned: true, groupId: -1 }, { ignorePinned: true }), true);
      assert.equal(shouldSkipAutoGroup({ url: 'https://slack.com', pinned: false, groupId: -1 }, { ignorePinned: true }), false);
    });

    it('cho phép gom nhóm các tab web thông thường chưa vào group', () => {
      assert.equal(shouldSkipAutoGroup({ url: 'https://youtube.com', pinned: false, groupId: -1 }), false);
    });
  });

  describe('planAutoGroupActions()', () => {
    const existingGroups = [
      { id: 50, title: 'github.com' },
    ];

    const currentTabs = [
      // Đã có nhóm github.com
      { id: 1, url: 'https://github.com/pulls', groupId: -1, pinned: false },
      // Chưa có nhóm, nhưng có 2 tab vaithat.com -> đủ điều kiện tạo nhóm mới
      { id: 2, url: 'https://vaithat.com/page1', groupId: -1, pinned: false },
      { id: 3, url: 'https://vaithat.com/page2', groupId: -1, pinned: false },
      // Chỉ có 1 tab đơn lẻ facebook.com -> không tạo nhóm
      { id: 4, url: 'https://facebook.com/feed', groupId: -1, pinned: false },
    ];

    it('lập kế hoạch tự động gom: thêm vào nhóm sẵn có và tạo nhóm mới', () => {
      const plan = planAutoGroupActions(currentTabs, existingGroups, { minTabsForNewGroup: 2 });

      // Tab 1 (github) được đưa vào nhóm 50 có sẵn
      assert.equal(plan.addToExistingGroup.length, 1);
      assert.equal(plan.addToExistingGroup[0].tabId, 1);
      assert.equal(plan.addToExistingGroup[0].groupId, 50);

      // Tab 2 & 3 (vaithat.com) được tạo nhóm mới
      assert.equal(plan.createNewGroups.length, 1);
      assert.equal(plan.createNewGroups[0].domain, 'vaithat.com');
      assert.deepEqual(plan.createNewGroups[0].tabIds, [2, 3]);
    });
  });
});
