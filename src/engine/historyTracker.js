/**
 * VaiClean - History & Tab Attention Engine
 * Tracks cleanup history, powers instant search, and detects audible / unread notification tabs.
 */

import { extractDomain } from './tabCleaner.js';

/**
 * Trích xuất số lượng thông báo hoặc badge chú ý từ tiêu đề tab
 * Hỗ trợ các định dạng phổ biến: (3) Facebook, [12] Gmail, (99+) Zalo, (•) Slack, (*) Notion
 * @param {string} title
 * @returns {string | null}
 */
export function extractNotificationCount(title = '') {
  if (!title || typeof title !== 'string') return null;

  const trimmed = title.trim();
  const match = trimmed.match(/^(?:\(([\d+]+|[•*])\)|\[(\d+)\])/);
  if (match) {
    return match[1] || match[2] || null;
  }

  return null;
}

/**
 * Tạo một bản ghi lịch sử dọn dẹp mới
 * @param {'CLEAN_DUPLICATES' | 'DISCARD_IDLE' | 'CLOSE_SINGLE'} actionType
 * @param {Array<{ id?: number, title?: string, url?: string }>} tabs
 * @param {number} ramSavedMB
 * @returns {object}
 */
export function createHistoryEntry(actionType = 'CLEAN_DUPLICATES', tabs = [], ramSavedMB = 0) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 7);

  const cleanTabs = (Array.isArray(tabs) ? tabs : []).map((t) => {
    const url = t.url || '';
    const domain = extractDomain(url);
    const title = t.title || domain || 'Trang web';
    return {
      title,
      url,
      domain,
    };
  });

  return {
    id: `hist_${timestamp}_${randomSuffix}`,
    timestamp,
    actionType,
    ramSavedMB: Number(ramSavedMB) || 0,
    tabs: cleanTabs,
  };
}

/**
 * Thêm bản ghi mới vào danh sách lịch sử và giữ tối đa maxEntries (mặc định 30)
 * @param {Array<object>} historyList
 * @param {object} newEntry
 * @param {number} maxEntries
 * @returns {Array<object>}
 */
export function pushCleanupHistory(historyList = [], newEntry, maxEntries = 30) {
  if (!newEntry || typeof newEntry !== 'object') {
    return Array.isArray(historyList) ? [...historyList] : [];
  }

  const list = Array.isArray(historyList) ? [...historyList] : [];
  list.unshift(newEntry);

  if (list.length > maxEntries) {
    return list.slice(0, maxEntries);
  }

  return list;
}

/**
 * Phân tích và lọc các tab đang phát âm thanh hoặc có thông báo chưa đọc
 * @param {Array<object>} tabs
 * @returns {{ audibleTabs: Array<object>, notificationTabs: Array<object>, totalAttentionCount: number }}
 */
export function inspectTabAttention(tabs = []) {
  if (!Array.isArray(tabs)) {
    return { audibleTabs: [], notificationTabs: [], totalAttentionCount: 0 };
  }

  const audibleTabs = [];
  const notificationTabs = [];
  const seenIds = new Set();

  for (const tab of tabs) {
    if (!tab || !tab.id) continue;

    const isAudible = Boolean(tab.audible);
    const isMuted = Boolean(tab.mutedInfo?.muted);
    const unreadCount = extractNotificationCount(tab.title);

    const enriched = {
      id: tab.id,
      windowId: tab.windowId,
      title: tab.title || 'Tab không tên',
      url: tab.url || '',
      domain: extractDomain(tab.url),
      favIconUrl: tab.favIconUrl || '',
      isAudible,
      isMuted,
      unreadCount,
    };

    if (isAudible || isMuted) {
      audibleTabs.push(enriched);
      seenIds.add(tab.id);
    }

    if (unreadCount !== null) {
      notificationTabs.push(enriched);
      seenIds.add(tab.id);
    }
  }

  return {
    audibleTabs,
    notificationTabs,
    totalAttentionCount: seenIds.size,
  };
}

/**
 * Tìm kiếm nhanh theo từ khóa trong danh sách tab đang mở và lịch sử dọn dẹp
 * @param {string} query
 * @param {Array<object>} currentTabs
 * @param {Array<object>} historyList
 * @returns {{ openTabMatches: Array<object>, historyMatches: Array<object> }}
 */
export function searchTabs(query = '', currentTabs = [], historyList = []) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return {
      openTabMatches: [],
      historyMatches: [],
    };
  }

  const openTabMatches = [];
  if (Array.isArray(currentTabs)) {
    for (const tab of currentTabs) {
      if (!tab) continue;
      const title = (tab.title || '').toLowerCase();
      const url = (tab.url || '').toLowerCase();
      const domain = extractDomain(tab.url).toLowerCase();

      if (title.includes(q) || url.includes(q) || domain.includes(q)) {
        openTabMatches.push({
          type: 'OPEN_TAB',
          tabId: tab.id,
          windowId: tab.windowId,
          title: tab.title || domain || 'Trang web',
          url: tab.url || '',
          domain,
          favIconUrl: tab.favIconUrl || '',
        });
      }
    }
  }

  const historyMatches = [];
  if (Array.isArray(historyList)) {
    for (const entry of historyList) {
      if (!entry || !Array.isArray(entry.tabs)) continue;
      for (const t of entry.tabs) {
        const title = (t.title || '').toLowerCase();
        const url = (t.url || '').toLowerCase();
        const domain = (t.domain || extractDomain(t.url)).toLowerCase();

        if (title.includes(q) || url.includes(q) || domain.includes(q)) {
          historyMatches.push({
            type: 'HISTORY_TAB',
            historyId: entry.id,
            timestamp: entry.timestamp,
            title: t.title || domain || 'Trang web',
            url: t.url || '',
            domain,
          });
        }
      }
    }
  }

  return {
    openTabMatches,
    historyMatches,
  };
}

/**
 * Phân trang danh sách tổng quát
 * @template T
 * @param {Array<T>} items
 * @param {number} currentPage
 * @param {number} pageSize
 * @returns {{ pageItems: Array<T>, totalPages: number, currentPage: number, totalItems: number, hasPrev: boolean, hasNext: boolean }}
 */
export function paginateList(items = [], currentPage = 1, pageSize = 5) {
  if (!Array.isArray(items)) {
    return { pageItems: [], totalPages: 1, currentPage: 1, totalItems: 0, hasPrev: false, hasNext: false };
  }

  const safeSize = Math.max(1, parseInt(pageSize, 10) || 5);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(Math.max(1, parseInt(currentPage, 10) || 1), totalPages);

  const startIdx = (safePage - 1) * safeSize;
  const pageItems = items.slice(startIdx, startIdx + safeSize);

  return {
    pageItems,
    totalPages,
    currentPage: safePage,
    totalItems,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}

/**
 * Xây dựng cấu trúc phân cấp Nhóm ➔ Tab
 * @param {Array<object>} tabs
 * @param {Array<object>} groups
 * @returns {{ groups: Array<{ id: number, title: string, color: string, collapsed: boolean, tabs: Array<object> }>, ungroupedTabs: Array<object> }}
 */
export function buildTabHierarchy(tabs = [], groups = []) {
  const safeTabs = Array.isArray(tabs) ? tabs : [];
  const safeGroups = Array.isArray(groups) ? groups : [];

  const groupMap = new Map();
  for (const g of safeGroups) {
    if (!g || typeof g.id !== 'number') continue;
    groupMap.set(g.id, {
      id: g.id,
      title: g.title || 'Nhóm không tên',
      color: g.color || 'blue',
      collapsed: Boolean(g.collapsed),
      tabs: [],
    });
  }

  const ungroupedTabs = [];

  for (const tab of safeTabs) {
    if (!tab || !tab.id) continue;
    const tabObj = {
      id: tab.id,
      windowId: tab.windowId,
      title: tab.title || 'Tab không tên',
      url: tab.url || '',
      domain: extractDomain(tab.url),
      favIconUrl: tab.favIconUrl || '',
      active: Boolean(tab.active),
      pinned: Boolean(tab.pinned),
      groupId: tab.groupId,
    };

    if (typeof tab.groupId === 'number' && tab.groupId > 0) {
      if (!groupMap.has(tab.groupId)) {
        groupMap.set(tab.groupId, {
          id: tab.groupId,
          title: `Nhóm #${tab.groupId}`,
          color: 'blue',
          collapsed: false,
          tabs: [],
        });
      }
      groupMap.get(tab.groupId).tabs.push(tabObj);
    } else {
      ungroupedTabs.push(tabObj);
    }
  }

  return {
    groups: Array.from(groupMap.values()),
    ungroupedTabs,
  };
}
