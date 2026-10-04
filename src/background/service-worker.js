/**
 * VaiClean - Background Service Worker
 * Real-time tab monitoring, auto-grouping by domain, group warning tags, and toolbar badge indicator.
 */

import {
  planAutoGroupActionsWithWarning,
  findDuplicates,
  calculateRamSavings,
  shouldSkipAutoGroup,
} from '../engine/tabCleaner.js';
import {
  routeTabWithWorkspaceMemory,
  autoCollapseInactiveGroups,
  recordWorkspaceMemory,
  clusterTabsWithAI,
  sanitizeTabsForAI,
} from '../engine/aiOrganizer.js';

// Quản lý debounce riêng cho từng cửa sổ để không bao giờ bị huỷ chéo
const debounceTimers = new Map();
let lastNotifiedDuplicateCount = 0;

/**
 * Lên lịch tự động gom nhóm tab và cập nhật badge sau khoảng hoãn nhịp (debounce 250ms)
 * @param {number} windowId
 */
function scheduleAutoGroup(windowId) {
  if (!windowId) return;

  if (debounceTimers.has(windowId)) {
    clearTimeout(debounceTimers.get(windowId));
  }

  const timer = setTimeout(async () => {
    debounceTimers.delete(windowId);
    await performAutoGroup(windowId);
  }, 250);

  debounceTimers.set(windowId, timer);
}

/**
 * Thực thi kiểm tra và gom nhóm tab thời gian thực
 * @param {number} windowId
 */
async function performAutoGroup(windowId) {
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabGroups) return;

  try {
    const {
      autoGroupEnabled = true,
      ignorePinned = true,
      groupSingleTabs = false,
      notificationsEnabled = true,
      aiSmartGroupEnabled = false,
      aiAutoRoutingEnabled = true,
      workspaceMemory = {},
    } = await chrome.storage.local.get([
      'autoGroupEnabled',
      'ignorePinned',
      'groupSingleTabs',
      'notificationsEnabled',
      'aiSmartGroupEnabled',
      'aiAutoRoutingEnabled',
      'workspaceMemory',
    ]);

    const queryOptions = windowId ? { windowId } : {};
    const tabs = await chrome.tabs.query(queryOptions);

    if (!tabs || tabs.length === 0) return;
    const targetWindowId = windowId || tabs[0].windowId;

    // 1. Cập nhật Badge cảnh báo tab trùng lặp trên thanh công cụ
    const duplicates = findDuplicates(tabs, { ignorePinned });
    try {
      if (duplicates.duplicateCount > 0) {
        await chrome.action.setBadgeText({
          text: String(duplicates.duplicateCount),
        });
        await chrome.action.setBadgeBackgroundColor({
          color: '#f43f5e',
        });
        await chrome.action.setTitle({
          title: `Vãi Cả Dọn Tab: Đang có ${duplicates.duplicateCount} tab trùng lặp!`,
        });

        // 2. Bắn thông báo hệ thống nếu có thêm tab trùng lặp mới
        if (notificationsEnabled && duplicates.duplicateCount > lastNotifiedDuplicateCount) {
          const savings = calculateRamSavings(duplicates.duplicateCount);
          try {
            await chrome.notifications.create('duplicate-tab-warning', {
              type: 'basic',
              iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
              title: '⚠️ Vãi Cả Dọn Tab - Cảnh báo RAM!',
              message: `Phát hiện ${duplicates.duplicateCount} tab trùng lặp đang ngốn ~${savings.formatted} RAM. Nhấp vào đây để cứu RAM ngay!`,
              priority: 1,
            });
            lastNotifiedDuplicateCount = duplicates.duplicateCount;
          } catch (notifErr) {
            console.debug('Error creating system notification:', notifErr);
          }
        }
      } else {
        await chrome.action.setBadgeText({ text: '' });
        await chrome.action.setTitle({
          title: 'Vãi Cả Dọn Tab (VaiClean) - RAM Đang Rất Khỏe!',
        });
        lastNotifiedDuplicateCount = 0;
      }
    } catch (badgeErr) {
      console.debug('Badge update error:', badgeErr);
    }

    // Nếu người dùng tắt tính năng tự động gom nhóm, dừng tại đây
    if (!autoGroupEnabled) return;

    // 3. Lấy danh sách nhóm tab hiện có trong cửa sổ
    let existingGroups = await chrome.tabGroups.query({ windowId: targetWindowId });

    // 4. Định tuyến tức thì bằng Workspace Memory nếu bật chế độ AI (Zero-Click Routing)
    if (aiSmartGroupEnabled && aiAutoRoutingEnabled && workspaceMemory && Object.keys(workspaceMemory).length > 0) {
      for (const tab of tabs) {
        if (!shouldSkipAutoGroup(tab, { ignorePinned })) {
          const route = routeTabWithWorkspaceMemory(tab, existingGroups, workspaceMemory);
          if (route) {
            try {
              await chrome.tabs.group({
                tabIds: [route.tabId],
                groupId: route.groupId,
              });
              tab.groupId = route.groupId; // cập nhật cục bộ
            } catch (err) {
              console.debug('Error routing tab to AI workspace:', err);
            }
          }
        }
      }
      // Làm mới danh sách nhóm sau khi định tuyến
      existingGroups = await chrome.tabGroups.query({ windowId: targetWindowId });
    }

    // 5. Tính toán kế hoạch gom nhóm nâng cao kèm nhãn cảnh báo đỏ và gom tab đơn lẻ
    const plan = planAutoGroupActionsWithWarning(tabs, existingGroups, {
      minTabsForNewGroup: 2,
      groupSingleTabs: groupSingleTabs ?? false,
      ignorePinned,
    });

    // Rã các nhóm tab không còn hợp lệ (ví dụ: các nhóm Tác vụ khác khi tắt gom đơn lẻ)
    if (Array.isArray(plan.ungroupTabIds) && plan.ungroupTabIds.length > 0) {
      try {
        await chrome.tabs.ungroup(plan.ungroupTabIds);
      } catch (err) {
        console.debug('Error ungrouping tabs:', err);
      }
    }

    // Cập nhật cảnh báo trực tiếp lên các nhóm đang có trên thanh tab
    for (const update of plan.groupUpdates) {
      try {
        await chrome.tabGroups.update(update.groupId, {
          title: update.title,
          color: update.color,
        });
      } catch (err) {
        console.debug('Error updating existing tab group warning:', err);
      }
    }

    // Thêm các tab mới vào nhóm tên miền đã tồn tại
    for (const item of plan.addToExistingGroup) {
      try {
        await chrome.tabs.group({
          tabIds: [item.tabId],
          groupId: item.groupId,
        });
      } catch (err) {
        console.debug('Error adding tab to existing group:', err);
      }
    }

    // Tạo nhóm mới cho các domain (kèm nhãn cảnh báo đỏ nếu phát hiện trùng)
    for (const newGroup of plan.createNewGroups) {
      try {
        const groupId = await chrome.tabs.group({
          tabIds: newGroup.tabIds,
          createProperties: { windowId: targetWindowId },
        });
        await chrome.tabGroups.update(groupId, {
          title: newGroup.title,
          color: newGroup.color,
          collapsed: false,
        });
      } catch (err) {
        console.debug('Error creating new tab group:', err);
      }
    }
  } catch (err) {
    console.error('Error in performAutoGroup background process:', err);
  }
}

// Xử lý khi người dùng nhấp vào thông báo hệ thống -> Tự động đóng tab trùng và giải phóng RAM
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId === 'duplicate-tab-warning') {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const { toClose } = findDuplicates(tabs, { ignorePinned: true });
      if (toClose && toClose.length > 0) {
        const tabIds = toClose.map((t) => t.id);
        const savings = calculateRamSavings(tabIds.length);
        await chrome.tabs.remove(tabIds);

        // Cập nhật RAM đã cứu vào storage
        const current = await chrome.storage.local.get(['totalRamSavedMB', 'totalTabsClosed']);
        await chrome.storage.local.set({
          totalRamSavedMB: (current.totalRamSavedMB || 0) + savings.ramMB,
          totalTabsClosed: (current.totalTabsClosed || 0) + tabIds.length,
        });

        // Bắn thông báo chúc mừng
        await chrome.notifications.create('clean-success', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
          title: '⚡ Đã Cứu Sống Thanh RAM Thành Công!',
          message: `Đã đóng ${tabIds.length} tab trùng và giải phóng ~${savings.formatted} RAM!`,
          priority: 1,
        });

        // Quét lại nhóm
        const windows = await chrome.windows.getAll({ populate: false });
        for (const win of windows) {
          await performAutoGroup(win.id);
        }
      }
    } catch (err) {
      console.error('Error handling notification click clean:', err);
    }
  }
});

// Khởi tạo cài đặt mặc định khi extension được cài đặt hoặc nạp lại
chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get([
    'autoGroupEnabled',
    'ignorePinned',
    'preferActive',
    'groupSingleTabs',
    'notificationsEnabled',
    'autoCollapseInactive',
    'aiAutoRoutingEnabled',
    'totalRamSavedMB',
    'totalTabsClosed',
  ]);

  await chrome.storage.local.set({
    autoGroupEnabled: current.autoGroupEnabled ?? true,
    ignorePinned: current.ignorePinned ?? true,
    preferActive: current.preferActive ?? true,
    groupSingleTabs: current.groupSingleTabs ?? false,
    notificationsEnabled: current.notificationsEnabled ?? true,
    autoCollapseInactive: current.autoCollapseInactive ?? true,
    aiAutoRoutingEnabled: current.aiAutoRoutingEnabled ?? true,
    totalRamSavedMB: current.totalRamSavedMB ?? 0,
    totalTabsClosed: current.totalTabsClosed ?? 0,
  });

  // Đăng ký Context Menus chuột phải
  if (chrome.contextMenus) {
    try {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: 'menu-clean-duplicates',
          title: '⚡ Cứu RAM: Đóng các tab trùng lặp',
          contexts: ['action', 'page'],
        });
        chrome.contextMenus.create({
          id: 'menu-ai-group',
          title: '🧠 Gom nhóm Workspaces bằng Gemini AI',
          contexts: ['action', 'page'],
        });
        chrome.contextMenus.create({
          id: 'menu-discard-idle',
          title: '💤 Đóng băng các tab rảnh để giải phóng RAM',
          contexts: ['action', 'page'],
        });
      });
    } catch (err) {
      console.debug('Context menu setup error:', err);
    }
  }

  // Quét và gom ngay lập tức các tab hiện có trên tất cả cửa sổ
  const windows = await chrome.windows.getAll({ populate: false });
  for (const win of windows) {
    await performAutoGroup(win.id);
  }
});

// Khi trình duyệt khởi động lại
chrome.runtime.onStartup.addListener(async () => {
  const windows = await chrome.windows.getAll({ populate: false });
  for (const win of windows) {
    await performAutoGroup(win.id);
  }
});

// Lắng nghe các sự kiện tab để tự động gom nhóm
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.windowId) {
    scheduleAutoGroup(tab.windowId);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.windowId && (changeInfo.status === 'complete' || changeInfo.url)) {
    scheduleAutoGroup(tab.windowId);
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (removeInfo.windowId) {
    scheduleAutoGroup(removeInfo.windowId);
  }
});

// Khi chuyển đổi tab: Lên lịch autoGroup và thực thi Auto-collapse các nhóm nhàn rỗi
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (activeInfo.windowId) {
    scheduleAutoGroup(activeInfo.windowId);
  }

  try {
    const { autoCollapseInactive = true } = await chrome.storage.local.get(['autoCollapseInactive']);
    if (!autoCollapseInactive) return;

    const activeTab = await chrome.tabs.get(activeInfo.tabId);
    if (!activeTab || !activeTab.groupId || activeTab.groupId <= 0) return;

    const groups = await chrome.tabGroups.query({ windowId: activeInfo.windowId });
    const collapsePlan = autoCollapseInactiveGroups(activeTab.groupId, groups, true);
    for (const action of collapsePlan) {
      await chrome.tabGroups.update(action.groupId, { collapsed: action.collapsed });
    }
  } catch (err) {
    console.debug('Auto-collapse inactive groups error:', err);
  }
});

/**
 * Xử lý lệnh phím tắt: Cứu RAM ngay
 */
async function handleCleanDuplicatesCommand() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const { toClose } = findDuplicates(tabs, { ignorePinned: true });
    if (toClose && toClose.length > 0) {
      const tabIds = toClose.map((t) => t.id);
      const savings = calculateRamSavings(tabIds.length);
      await chrome.tabs.remove(tabIds);

      const current = await chrome.storage.local.get(['totalRamSavedMB', 'totalTabsClosed']);
      await chrome.storage.local.set({
        totalRamSavedMB: (current.totalRamSavedMB || 0) + savings.ramMB,
        totalTabsClosed: (current.totalTabsClosed || 0) + tabIds.length,
      });

      await chrome.notifications.create('clean-cmd-success', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: '⚡ Phím tắt: Cứu Sống Thanh RAM!',
        message: `Đã đóng ${tabIds.length} tab trùng và giải phóng ~${savings.formatted} RAM!`,
        priority: 1,
      });
    } else {
      await chrome.notifications.create('clean-cmd-none', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: '⚡ Vãi Cả Dọn Tab',
        message: 'Tuyệt vời! Không phát hiện tab trùng lặp nào trên cửa sổ này.',
        priority: 1,
      });
    }
  } catch (err) {
    console.error('Error in handleCleanDuplicatesCommand:', err);
  }
}

/**
 * Xử lý lệnh phím tắt: Gom nhóm AI thông minh
 */
async function handleAIGroupingCommand() {
  try {
    const { geminiApiKey, aiModel = 'gemini-2.5-flash', workspaceMemory = {} } = await chrome.storage.local.get([
      'geminiApiKey',
      'aiModel',
      'workspaceMemory',
    ]);

    if (!geminiApiKey) {
      await chrome.notifications.create('ai-cmd-nokey', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: '🧠 Vãi Cả Dọn Tab (AI)',
        message: 'Vui lòng mở giao diện tiện ích và nhập Gemini API Key để mở khóa gom nhóm AI!',
        priority: 1,
      });
      return;
    }

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const sanitized = sanitizeTabsForAI(tabs);
    if (sanitized.length < 2) return;

    const result = await clusterTabsWithAI(geminiApiKey, aiModel, sanitized);

    for (const group of result.groups) {
      if (Array.isArray(group.tabIds) && group.tabIds.length > 0) {
        const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
        await chrome.tabGroups.update(groupId, {
          title: group.name,
          color: group.color || 'blue',
          collapsed: false,
        });
      }
    }

    const updatedMemory = recordWorkspaceMemory(result.groups, tabs, workspaceMemory);
    await chrome.storage.local.set({ workspaceMemory: updatedMemory });

    await chrome.notifications.create('ai-cmd-success', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
      title: '✨ AI Workspaces Gom Xong!',
      message: `Đã gom thành ${result.groups.length} nhóm Workspaces thông minh!`,
      priority: 1,
    });
  } catch (err) {
    console.error('Error in handleAIGroupingCommand:', err);
  }
}

// Lắng nghe phím tắt toàn cục (Chrome Commands)
chrome.commands?.onCommand?.addListener(async (command) => {
  if (command === 'clean-duplicates') {
    await handleCleanDuplicatesCommand();
  } else if (command === 'ai-group-tabs') {
    await handleAIGroupingCommand();
  }
});

// Lắng nghe sự kiện click Context Menu chuột phải
chrome.contextMenus?.onClicked?.addListener(async (info, tab) => {
  if (info.menuItemId === 'menu-clean-duplicates') {
    await handleCleanDuplicatesCommand();
  } else if (info.menuItemId === 'menu-ai-group') {
    await handleAIGroupingCommand();
  } else if (info.menuItemId === 'menu-discard-idle') {
    if (tab?.id) {
      try {
        await chrome.tabs.discard(tab.id);
      } catch (err) {
        console.debug('Error discarding active tab via context menu:', err);
      }
    }
  }
});

// Lắng nghe thông điệp từ popup nếu cần kích hoạt quét ngay lập tức hoặc discard idle tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'TRIGGER_AUTO_GROUP') {
    (async () => {
      const windows = await chrome.windows.getAll({ populate: false });
      for (const win of windows) {
        await performAutoGroup(win.id);
      }
      sendResponse({ success: true });
    })();
    return true; // Giữ kênh kết nối phản hồi bất đồng bộ
  }

  if (message.action === 'DISCARD_IDLE_TABS') {
    (async () => {
      let discardedCount = 0;
      try {
        const tabs = await chrome.tabs.query({ active: false });
        for (const tab of tabs) {
          if (!tab.discarded && !tab.pinned) {
            try {
              await chrome.tabs.discard(tab.id);
              discardedCount++;
            } catch (err) {
              console.debug('Could not discard tab:', tab.id, err);
            }
          }
        }
      } catch (err) {
        console.error('Error discarding idle tabs:', err);
      }
      sendResponse({ discardedCount });
    })();
    return true;
  }
});

