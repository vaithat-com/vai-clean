/**
 * VaiClean - Popup Controller
 * Manages UI interactions, Chrome APIs integration, real-time metrics, and animations.
 */

import {
  findDuplicates,
  groupTabsByDomain,
  calculateRamSavings,
  pickGroupColor,
} from '../src/engine/tabCleaner.js';
import {
  validateGeminiApiKey,
  clusterTabsWithAI,
  sanitizeTabsForAI,
  recordWorkspaceMemory,
} from '../src/engine/aiOrganizer.js';
import {
  extractNotificationCount,
  createHistoryEntry,
  pushCleanupHistory,
  inspectTabAttention,
  searchTabs,
  paginateList,
  buildTabHierarchy,
} from '../src/engine/historyTracker.js';
import { formatNumber, truncate } from '../src/utils/formatters.js';

// Elements
const totalTabsCountEl = document.getElementById('totalTabsCount');
const duplicateTabsCountEl = document.getElementById('duplicateTabsCount');
const potentialRamSavedEl = document.getElementById('potentialRamSaved');
const ramProgressBarEl = document.getElementById('ramProgressBar');
const ramLoadStatusEl = document.getElementById('ramLoadStatus');
const lifetimeRamSavedEl = document.getElementById('lifetimeRamSaved');

const btnCleanDuplicates = document.getElementById('btnCleanDuplicates');
const btnCleanSubtext = document.getElementById('btnCleanSubtext');
const btnGroupDomains = document.getElementById('btnGroupDomains');
const btnDiscardIdle = document.getElementById('btnDiscardIdle');
const btnAIGroup = document.getElementById('btnAIGroup');
const btnAISubtext = document.getElementById('btnAISubtext');
const btnToggleList = document.getElementById('btnToggleList');
const btnToggleListText = document.getElementById('btnToggleListText');


const btnOpenAISettings = document.getElementById('btnOpenAISettings');
const aiSettingsModal = document.getElementById('aiSettingsModal');
const btnCloseAISettings = document.getElementById('btnCloseAISettings');
const txtGeminiApiKey = document.getElementById('txtGeminiApiKey');
const btnToggleKeyVisibility = document.getElementById('btnToggleKeyVisibility');
const iconEyeOpen = document.getElementById('iconEyeOpen');
const iconEyeClosed = document.getElementById('iconEyeClosed');
const btnValidateKey = document.getElementById('btnValidateKey');
const btnValidateKeyText = document.getElementById('btnValidateKeyText');
const iconValidateSpin = document.getElementById('iconValidateSpin');
const keyValidationStatus = document.getElementById('keyValidationStatus');
const selGeminiModel = document.getElementById('selGeminiModel');
const chkEnableAISmartGroup = document.getElementById('chkEnableAISmartGroup');
const btnSaveAISettings = document.getElementById('btnSaveAISettings');

const duplicateListSection = document.getElementById('duplicateListSection');
const duplicateTabsList = document.getElementById('duplicateTabsList');
const dupCountBadge = document.getElementById('dupCountBadge');

const statusToast = document.getElementById('statusToast');
const toastMessage = document.getElementById('toastMessage');

// Segmented Navigation & Panels
const tabNavDashboard = document.getElementById('tabNavDashboard');
const tabNavAlerts = document.getElementById('tabNavAlerts');
const tabNavHistory = document.getElementById('tabNavHistory');
const alertsBadge = document.getElementById('alertsBadge');

const panelDashboard = document.getElementById('panelDashboard');
const panelAlerts = document.getElementById('panelAlerts');
const panelHistory = document.getElementById('panelHistory');

// Attention Elements
const audioTabsContainer = document.getElementById('audioTabsContainer');
const audioCountBadge = document.getElementById('audioCountBadge');
const notifTabsContainer = document.getElementById('notifTabsContainer');
const notifCountBadge = document.getElementById('notifCountBadge');

// Search & History Elements
const txtSearchTabs = document.getElementById('txtSearchTabs');
const btnClearSearch = document.getElementById('btnClearSearch');
const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchResultCount = document.getElementById('searchResultCount');
const cleanupHistorySection = document.getElementById('cleanupHistorySection');
const btnClearHistory = document.getElementById('btnClearHistory');
const historyEntriesContainer = document.getElementById('historyEntriesContainer');

// Sub-navigation & Groups Management Elements
const historySubNav = document.getElementById('historySubNav');
const subTabOpenGroups = document.getElementById('subTabOpenGroups');
const subTabHistory = document.getElementById('subTabHistory');
const openGroupsCountBadge = document.getElementById('openGroupsCountBadge');
const historyCountBadge = document.getElementById('historyCountBadge');
const openGroupsSection = document.getElementById('openGroupsSection');
const tabGroupsContainer = document.getElementById('tabGroupsContainer');
const groupsPaginationBar = document.getElementById('groupsPaginationBar');
const searchPaginationBar = document.getElementById('searchPaginationBar');
const historyPaginationBar = document.getElementById('historyPaginationBar');
const btnUngroupAll = document.getElementById('btnUngroupAll');

const chkIgnorePinned = document.getElementById('chkIgnorePinned');
const chkPreferActive = document.getElementById('chkPreferActive');
const chkAutoGroup = document.getElementById('chkAutoGroup');
const chkAIAutoRouting = document.getElementById('chkAIAutoRouting');
const chkAutoCollapse = document.getElementById('chkAutoCollapse');
const chkGroupSingleTabs = document.getElementById('chkGroupSingleTabs');
const chkNotifications = document.getElementById('chkNotifications');
const btnToggleSettings = document.getElementById('btnToggleSettings');
const settingsGridDrawer = document.getElementById('settingsGridDrawer');

// State
let currentTabs = [];
let currentDuplicates = { toKeep: [], toClose: [], duplicateCount: 0 };
let lifetimeData = { totalRamSavedMB: 0, totalTabsClosed: 0 };
let cleanupHistory = [];
let activePanel = 'dashboard';
let activeHistorySubTab = 'groups'; // 'groups' | 'history'
let groupsCurrentPage = 1;
let historyCurrentPage = 1;
let searchCurrentPage = 1;
let currentAttention = { audibleTabs: [], notificationTabs: [], totalAttentionCount: 0 };
let aiConfig = {
  geminiApiKey: '',
  aiModel: '',
  aiSmartGroupEnabled: true,
  aiAutoRouting: true,
  autoCollapseInactive: true,
  workspaceMemory: {},
  cachedModels: [],
};

/**
 * Hiển thị thông báo Toast nhanh
 */
function showToast(msg, duration = 3000) {
  if (!statusToast || !toastMessage) return;
  toastMessage.textContent = msg;
  statusToast.classList.remove('hidden');
  setTimeout(() => {
    statusToast.classList.add('hidden');
  }, duration);
}

/**
 * Tải cài đặt và số liệu tích lũy từ chrome.storage.local
 */
async function loadStoredData() {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  try {
    const data = await chrome.storage.local.get([
      'totalRamSavedMB',
      'totalTabsClosed',
      'ignorePinned',
      'preferActive',
      'autoGroupEnabled',
      'aiAutoRouting',
      'autoCollapseInactive',
      'workspaceMemory',
      'groupSingleTabs',
      'notificationsEnabled',
      'geminiApiKey',
      'aiModel',
      'aiSmartGroupEnabled',
      'cachedModels',
      'cleanupHistory',
    ]);

    if (data.totalRamSavedMB !== undefined) {
      lifetimeData.totalRamSavedMB = data.totalRamSavedMB;
    }
    if (data.totalTabsClosed !== undefined) {
      lifetimeData.totalTabsClosed = data.totalTabsClosed;
    }
    if (Array.isArray(data.cleanupHistory)) {
      cleanupHistory = data.cleanupHistory;
    }
    if (data.ignorePinned !== undefined && chkIgnorePinned) {
      chkIgnorePinned.checked = data.ignorePinned;
    }
    if (data.preferActive !== undefined && chkPreferActive) {
      chkPreferActive.checked = data.preferActive;
    }
    if (data.autoGroupEnabled !== undefined && chkAutoGroup) {
      chkAutoGroup.checked = data.autoGroupEnabled;
    }
    if (chkAIAutoRouting) {
      chkAIAutoRouting.checked = data.aiAutoRouting ?? true;
    }
    if (chkAutoCollapse) {
      chkAutoCollapse.checked = data.autoCollapseInactive ?? true;
    }
    if (data.workspaceMemory) {
      aiConfig.workspaceMemory = data.workspaceMemory;
    }
    if (chkGroupSingleTabs) {
      chkGroupSingleTabs.checked = data.groupSingleTabs ?? false;
    }
    if (data.notificationsEnabled !== undefined && chkNotifications) {
      chkNotifications.checked = data.notificationsEnabled;
    }

    if (data.geminiApiKey) {
      aiConfig.geminiApiKey = data.geminiApiKey;
      if (txtGeminiApiKey) txtGeminiApiKey.value = data.geminiApiKey;
    }
    if (data.aiModel) {
      aiConfig.aiModel = data.aiModel;
    }
    if (data.aiSmartGroupEnabled !== undefined && chkEnableAISmartGroup) {
      aiConfig.aiSmartGroupEnabled = data.aiSmartGroupEnabled;
      chkEnableAISmartGroup.checked = data.aiSmartGroupEnabled;
    }
    if (Array.isArray(data.cachedModels) && data.cachedModels.length > 0) {
      aiConfig.cachedModels = data.cachedModels;
      renderModelOptions(data.cachedModels, aiConfig.aiModel);
      if (selGeminiModel) selGeminiModel.disabled = false;
    }

    renderLifetimeStats();
  } catch (err) {
    console.error('Error loading stored settings:', err);
  }
}

/**
 * Hiển thị số liệu RAM đã cứu tích lũy
 */
function renderLifetimeStats() {
  if (!lifetimeRamSavedEl) return;
  const mb = lifetimeData.totalRamSavedMB || 0;
  if (mb >= 1024) {
    lifetimeRamSavedEl.textContent = `${(mb / 1024).toFixed(2).replace(/\.00$/, '')} GB`;
  } else {
    lifetimeRamSavedEl.textContent = `${formatNumber(mb)} MB`;
  }
}

/**
 * Quét toàn bộ tab của cửa sổ hiện tại và phân tích trùng lặp
 */
async function scanTabs() {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.warn('Chrome Tabs API is not available.');
    return;
  }

  try {
    currentTabs = await chrome.tabs.query({ currentWindow: true });
    const ignorePinned = chkIgnorePinned.checked;
    const preferActive = chkPreferActive.checked;

    currentDuplicates = findDuplicates(currentTabs, {
      ignorePinned,
      preferActive,
      stripTracking: true,
      ignoreHash: true,
    });

    currentAttention = inspectTabAttention(currentTabs);
    updateAlertsBadge();
    updateDashboardUI();
    renderDuplicatesList();

    if (activePanel === 'alerts') {
      renderAlertsPanel();
    } else if (activePanel === 'history' && txtSearchTabs && txtSearchTabs.value.trim()) {
      executeSearch(txtSearchTabs.value.trim());
    } else if (activePanel === 'history' && activeHistorySubTab === 'groups') {
      await renderGroupsManager();
    } else if (activePanel === 'history') {
      renderHistoryPanel();
    }
  } catch (err) {
    console.error('Error scanning tabs:', err);
  }
}

/**
 * Cập nhật giao diện Dashboard trạng thái RAM
 */
function updateDashboardUI() {
  const totalTabs = currentTabs.length;
  const dupCount = currentDuplicates.duplicateCount;
  const savings = calculateRamSavings(dupCount);

  totalTabsCountEl.textContent = formatNumber(totalTabs);
  duplicateTabsCountEl.textContent = formatNumber(dupCount);
  potentialRamSavedEl.textContent = savings.formatted;

  // Cập nhật thanh áp lực bộ nhớ RAM
  let pressurePercent = Math.min(100, Math.round((totalTabs / 35) * 100));
  if (pressurePercent < 15) pressurePercent = 15;
  ramProgressBarEl.style.width = `${pressurePercent}%`;

  if (totalTabs >= 30 || dupCount >= 5) {
    ramLoadStatusEl.textContent = 'Báo động RAM!';
    ramLoadStatusEl.className = 'load-pill pill-high';
  } else if (totalTabs >= 12 || dupCount > 0) {
    ramLoadStatusEl.textContent = 'Cần dọn dẹp';
    ramLoadStatusEl.className = 'load-pill pill-moderate';
  } else {
    ramLoadStatusEl.textContent = 'RAM Ổn định';
    ramLoadStatusEl.className = 'load-pill pill-low';
  }

  // Cập nhật văn bản nút chính
  if (dupCount > 0) {
    btnCleanSubtext.textContent = `Đóng ngay ${dupCount} tab trùng & giải phóng ~${savings.formatted}`;
  } else {
    btnCleanSubtext.textContent = `Đang tối ưu! Không có tab trùng lặp`;
  }

  dupCountBadge.textContent = `${dupCount} tab`;
}

/**
 * Hiển thị danh sách các tab trùng lặp sắp bị đóng
 */
function renderDuplicatesList() {
  duplicateTabsList.innerHTML = '';
  const toClose = currentDuplicates.toClose;

  if (toClose.length === 0) {
    duplicateTabsList.innerHTML = `
      <div style="text-align: center; color: var(--text-dim); padding: 12px; font-size: 11px;">
        Tuyệt vời! Không phát hiện tab trùng lặp nào.
      </div>
    `;
    return;
  }

  for (const tab of toClose) {
    const item = document.createElement('div');
    item.className = 'dup-item';

    const info = document.createElement('div');
    info.className = 'dup-item-info';

    const title = document.createElement('span');
    title.className = 'dup-item-title';
    title.textContent = truncate(tab.title || tab.url || 'Tab không tên', 36);

    const domain = document.createElement('span');
    domain.className = 'dup-item-domain';
    domain.textContent = tab.url ? new URL(tab.url).hostname : '';

    info.appendChild(title);
    info.appendChild(domain);

    const btnClose = document.createElement('button');
    btnClose.className = 'btn-close-single';
    btnClose.title = 'Đóng tab này ngay';
    btnClose.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    btnClose.addEventListener('click', async (e) => {
      e.stopPropagation();
      await closeSingleTab(tab.id);
    });

    item.appendChild(info);
    item.appendChild(btnClose);
    duplicateTabsList.appendChild(item);
  }
}

/**
 * Đóng 1 tab cụ thể
 */
async function closeSingleTab(tabId) {
  try {
    const tabToClose = currentTabs.find((t) => t.id === tabId);
    await chrome.tabs.remove(tabId);
    lifetimeData.totalRamSavedMB += 80;
    lifetimeData.totalTabsClosed += 1;

    if (tabToClose) {
      const entry = createHistoryEntry('SINGLE', [tabToClose], 80);
      cleanupHistory = pushCleanupHistory(cleanupHistory, entry);
    }

    await chrome.storage.local.set({
      ...lifetimeData,
      cleanupHistory,
    });
    renderLifetimeStats();
    if (activePanel === 'history') {
      renderHistoryPanel();
    }
    showToast('Đã đóng 1 tab (+80 MB RAM)');
    await scanTabs();
  } catch (err) {
    console.error('Error closing tab:', err);
  }
}

/**
 * Đóng toàn bộ tab trùng lặp
 */
async function cleanAllDuplicates() {
  const toClose = currentDuplicates.toClose;
  if (!toClose || toClose.length === 0) {
    showToast('Không có tab trùng lặp để dọn!');
    return;
  }

  const tabIds = toClose.map((t) => t.id);
  const savings = calculateRamSavings(tabIds.length);

  try {
    await chrome.tabs.remove(tabIds);

    // Lưu lịch sử dọn dẹp để hỗ trợ khôi phục (Undo/Restore)
    const historyEntry = createHistoryEntry('DUPLICATES', toClose, savings.ramMB);
    cleanupHistory = pushCleanupHistory(cleanupHistory, historyEntry);

    // Cập nhật số liệu tích lũy & lưu trữ local
    lifetimeData.totalRamSavedMB += savings.ramMB;
    lifetimeData.totalTabsClosed += tabIds.length;
    await chrome.storage.local.set({
      ...lifetimeData,
      cleanupHistory,
    });

    renderLifetimeStats();
    if (activePanel === 'history') {
      renderHistoryPanel();
    }
    showToast(`Đã cứu ${savings.formatted} & dọn ${tabIds.length} tab!`);

    await scanTabs();
  } catch (err) {
    console.error('Error removing duplicate tabs:', err);
    showToast('Có lỗi xảy ra khi đóng tab.');
  }
}

/**
 * Gom nhóm toàn bộ tab theo tên miền (Domain Grouping)
 */
async function groupTabsSmartly() {
  if (typeof chrome === 'undefined' || !chrome.tabs?.group || !chrome.tabGroups) {
    showToast('Tính năng Gom nhóm yêu cầu quyền Chrome Tab Groups.');
    return;
  }

  try {
    const groups = groupTabsByDomain(currentTabs, { skipInternalUrls: true });
    let groupedCount = 0;

    for (const [domain, groupData] of Object.entries(groups)) {
      if (groupData.tabIds.length >= 2) {
        const groupId = await chrome.tabs.group({ tabIds: groupData.tabIds });
        const color = pickGroupColor(domain);
        await chrome.tabGroups.update(groupId, {
          title: domain,
          color: color,
          collapsed: false,
        });
        groupedCount++;
      }
    }

    if (groupedCount > 0) {
      showToast(`Đã gom thành ${groupedCount} nhóm domain!`);
    } else {
      showToast('Không có đủ tab cùng domain (tối thiểu 2 tab/nhóm).');
    }

    await scanTabs();
  } catch (err) {
    console.error('Error grouping tabs:', err);
    showToast('Có lỗi khi gom nhóm tab.');
  }
}

// Event Listeners
btnCleanDuplicates?.addEventListener('click', cleanAllDuplicates);
btnGroupDomains?.addEventListener('click', groupTabsSmartly);

btnToggleList?.addEventListener('click', () => {
  const isHidden = duplicateListSection.classList.contains('hidden');
  if (isHidden) {
    duplicateListSection.classList.remove('hidden');
    btnToggleListText.textContent = 'Thu gọn danh sách';
  } else {
    duplicateListSection.classList.add('hidden');
    btnToggleListText.textContent = 'Chi tiết tab trùng';
  }
});

chkIgnorePinned?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ ignorePinned: chkIgnorePinned.checked });
  }
  await scanTabs();
});

chkPreferActive?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ preferActive: chkPreferActive.checked });
  }
  await scanTabs();
});

chkAutoGroup?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const isEnabled = chkAutoGroup.checked;
    await chrome.storage.local.set({ autoGroupEnabled: isEnabled });
    if (isEnabled) {
      chrome.runtime?.sendMessage?.({ action: 'TRIGGER_AUTO_GROUP' });
      showToast('Đã bật tự động gom nhóm ngầm!');
    } else {
      showToast('Đã tắt tự động gom nhóm ngầm.');
    }
  }
});

btnDiscardIdle?.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ action: 'DISCARD_IDLE_TABS' }, (res) => {
      const count = res?.discardedCount || 0;
      if (count > 0) {
        showToast(`Đã đóng băng ${count} tab rảnh (+${count * 80} MB RAM)!`);
      } else {
        showToast('Không có tab nền nào đang rảnh để đóng băng.');
      }
    });
  }
});

chkGroupSingleTabs?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const isEnabled = chkGroupSingleTabs.checked;
    await chrome.storage.local.set({ groupSingleTabs: isEnabled });
    chrome.runtime?.sendMessage?.({ action: 'TRIGGER_AUTO_GROUP' });
    showToast(isEnabled ? 'Đã bật gom tab đơn lẻ vào nhóm Khác!' : 'Đã tắt gom tab đơn lẻ.');
  }
});

// Mở / đóng ngăn kéo tùy chọn tự động (Settings Drawer)
btnToggleSettings?.addEventListener('click', () => {
  if (!settingsGridDrawer) return;
  const isCollapsed = settingsGridDrawer.classList.toggle('collapsed');
  btnToggleSettings.setAttribute('aria-expanded', !isCollapsed ? 'true' : 'false');
});

chkNotifications?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const isEnabled = chkNotifications.checked;
    await chrome.storage.local.set({ notificationsEnabled: isEnabled });
    showToast(isEnabled ? 'Đã bật thông báo hệ thống!' : 'Đã tắt thông báo hệ thống.');
  }
});

chkAIAutoRouting?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const isEnabled = chkAIAutoRouting.checked;
    await chrome.storage.local.set({ aiAutoRouting: isEnabled });
    showToast(isEnabled ? 'Đã bật điều hướng AI 0ms cho tab mới!' : 'Đã tắt điều hướng AI tab mới.');
  }
});

chkAutoCollapse?.addEventListener('change', async () => {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const isEnabled = chkAutoCollapse.checked;
    await chrome.storage.local.set({ autoCollapseInactive: isEnabled });
    showToast(isEnabled ? 'Đã bật tự động thu gọn nhóm tab rảnh!' : 'Đã tắt tự động thu gọn nhóm tab.');
  }
});

/**
 * Điền danh sách model hỗ trợ vào thẻ select
 */
function renderModelOptions(models = [], selectedModel = '') {
  if (!selGeminiModel) return;
  selGeminiModel.innerHTML = '';

  if (!models || models.length === 0) {
    selGeminiModel.innerHTML = '<option value="">-- Chưa tải mô hình (Vui lòng kiểm tra Key) --</option>';
    selGeminiModel.disabled = true;
    return;
  }

  for (const m of models) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    if (m === selectedModel) {
      opt.selected = true;
    }
    selGeminiModel.appendChild(opt);
  }

  if (!selectedModel || !models.includes(selectedModel)) {
    selGeminiModel.value = models[0];
    aiConfig.aiModel = models[0];
  } else {
    selGeminiModel.value = selectedModel;
  }
  selGeminiModel.disabled = false;
}

/**
 * Kiểm tra API Key và tự động lấy danh sách Model
 */
async function validateAndPopulateModels(apiKey) {
  if (!apiKey || apiKey.length < 10) {
    if (keyValidationStatus) {
      keyValidationStatus.className = 'validation-status-box status-error';
      keyValidationStatus.textContent = 'Vui lòng nhập API Key hợp lệ của Google Gemini (bắt đầu bằng AIzaSy...)';
      keyValidationStatus.classList.remove('hidden');
    }
    return false;
  }

  if (iconValidateSpin) iconValidateSpin.classList.add('spin');
  if (btnValidateKeyText) btnValidateKeyText.textContent = 'Đang quét models qua Google AI...';
  if (btnValidateKey) btnValidateKey.disabled = true;

  if (keyValidationStatus) {
    keyValidationStatus.className = 'validation-status-box status-loading';
    keyValidationStatus.textContent = 'Đang kết nối đến máy chủ Google AI và quét danh sách mô hình...';
    keyValidationStatus.classList.remove('hidden');
  }

  try {
    const res = await validateGeminiApiKey(apiKey);
    if (res.valid) {
      keyValidationStatus.className = 'validation-status-box status-success';
      keyValidationStatus.textContent = `✓ Key hợp lệ! Đã tìm thấy ${res.models.length} mô hình hỗ trợ generateContent. Tự động chọn: ${res.defaultModel}`;
      aiConfig.cachedModels = res.models;
      const targetModel = aiConfig.aiModel && res.models.includes(aiConfig.aiModel) ? aiConfig.aiModel : res.defaultModel;
      renderModelOptions(res.models, targetModel);
      aiConfig.aiModel = targetModel;
      return true;
    } else {
      keyValidationStatus.className = 'validation-status-box status-error';
      keyValidationStatus.textContent = `✗ ${res.error}`;
      if (selGeminiModel) selGeminiModel.disabled = true;
      return false;
    }
  } catch (err) {
    if (keyValidationStatus) {
      keyValidationStatus.className = 'validation-status-box status-error';
      keyValidationStatus.textContent = `✗ Lỗi kiểm tra API Key: ${err.message}`;
    }
    return false;
  } finally {
    if (iconValidateSpin) iconValidateSpin.classList.remove('spin');
    if (btnValidateKeyText) btnValidateKeyText.textContent = 'Kiểm tra Key & Tải Models';
    if (btnValidateKey) btnValidateKey.disabled = false;
  }
}

/**
 * Mở modal cấu hình AI
 */
function openAISettingsModal() {
  if (!aiSettingsModal) return;
  aiSettingsModal.classList.remove('hidden');
  if (txtGeminiApiKey) {
    txtGeminiApiKey.focus();
    if (txtGeminiApiKey.value) txtGeminiApiKey.select();
  }
}

/**
 * Đóng modal cấu hình AI
 */
function closeAISettingsModal() {
  if (!aiSettingsModal) return;
  aiSettingsModal.classList.add('hidden');
}

/**
 * Xử lý gom nhóm bằng trí tuệ nhân tạo Gemini
 */
async function handleAIGrouping() {
  if (!aiConfig.geminiApiKey) {
    showToast('Chưa cấu hình Gemini API Key. Đang mở cài đặt...');
    openAISettingsModal();
    return;
  }

  if (typeof chrome === 'undefined' || !chrome.tabs?.group || !chrome.tabGroups) {
    showToast('Tính năng Gom nhóm AI yêu cầu quyền Chrome Tab Groups.');
    return;
  }

  const sanitized = sanitizeTabsForAI(currentTabs);
  if (sanitized.length < 2) {
    showToast('Cần tối thiểu 2 tab web hợp lệ để gom nhóm AI!');
    return;
  }

  if (btnAIGroup) btnAIGroup.disabled = true;
  if (btnAISubtext) btnAISubtext.textContent = 'Đang gom...';
  showToast('✨ AI đang phân tích và gom nhóm tab...');

  try {
    const selectedModel = aiConfig.aiModel || 'gemini-2.5-flash';
    const result = await clusterTabsWithAI(aiConfig.geminiApiKey, selectedModel, sanitized);

    let groupedCount = 0;
    for (const group of result.groups) {
      if (Array.isArray(group.tabIds) && group.tabIds.length > 0) {
        const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
        await chrome.tabGroups.update(groupId, {
          title: group.name,
          color: group.color || 'blue',
          collapsed: false,
        });
        groupedCount++;
      }
    }

    // Ghi nhớ phân loại domain -> workspace để định tuyến 0ms cho các tab mới
    const updatedMemory = recordWorkspaceMemory(result.groups, currentTabs, aiConfig.workspaceMemory);
    aiConfig.workspaceMemory = updatedMemory;
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ workspaceMemory: updatedMemory });
    }

    if (groupedCount > 0) {
      showToast(`✨ AI đã gom thành công ${groupedCount} nhóm Workspaces!`);
    } else {
      showToast('AI không tìm thấy nhóm nào phù hợp.');
    }

    await scanTabs();
  } catch (err) {
    console.error('Error during AI tab clustering:', err);
    showToast(`⚠️ Lỗi AI: ${err.message}`);
  } finally {
    if (btnAIGroup) btnAIGroup.disabled = false;
    if (btnAISubtext) btnAISubtext.textContent = 'Workspaces';
  }
}

// AI Settings & Grouping Event Listeners
btnOpenAISettings?.addEventListener('click', openAISettingsModal);
btnCloseAISettings?.addEventListener('click', closeAISettingsModal);

aiSettingsModal?.addEventListener('click', (e) => {
  if (e.target === aiSettingsModal) {
    closeAISettingsModal();
  }
});

btnToggleKeyVisibility?.addEventListener('click', () => {
  if (!txtGeminiApiKey) return;
  const isPassword = txtGeminiApiKey.type === 'password';
  txtGeminiApiKey.type = isPassword ? 'text' : 'password';
  if (iconEyeOpen && iconEyeClosed) {
    if (isPassword) {
      iconEyeOpen.classList.add('hidden');
      iconEyeClosed.classList.remove('hidden');
    } else {
      iconEyeOpen.classList.remove('hidden');
      iconEyeClosed.classList.add('hidden');
    }
  }
});

btnValidateKey?.addEventListener('click', async () => {
  const key = txtGeminiApiKey?.value?.trim() || '';
  await validateAndPopulateModels(key);
});

txtGeminiApiKey?.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const key = txtGeminiApiKey?.value?.trim() || '';
    await validateAndPopulateModels(key);
  }
});

selGeminiModel?.addEventListener('change', () => {
  aiConfig.aiModel = selGeminiModel.value;
});

btnSaveAISettings?.addEventListener('click', async () => {
  const key = txtGeminiApiKey?.value?.trim() || '';
  if (!key) {
    if (keyValidationStatus) {
      keyValidationStatus.className = 'validation-status-box status-error';
      keyValidationStatus.textContent = 'Vui lòng nhập API Key trước khi lưu!';
      keyValidationStatus.classList.remove('hidden');
    }
    return;
  }

  // Nếu chưa có models nào được nạp, tự động validate trước
  if (!aiConfig.cachedModels || aiConfig.cachedModels.length === 0) {
    const ok = await validateAndPopulateModels(key);
    if (!ok) return;
  }

  aiConfig.geminiApiKey = key;
  aiConfig.aiModel = selGeminiModel?.value || aiConfig.aiModel;
  aiConfig.aiSmartGroupEnabled = chkEnableAISmartGroup?.checked ?? true;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({
      geminiApiKey: aiConfig.geminiApiKey,
      aiModel: aiConfig.aiModel,
      aiSmartGroupEnabled: aiConfig.aiSmartGroupEnabled,
      cachedModels: aiConfig.cachedModels,
    });
  }

  showToast('Đã lưu cấu hình Google Gemini AI!');
  closeAISettingsModal();
});

btnAIGroup?.addEventListener('click', handleAIGrouping);

/* ==========================================================================
   Panel Navigation, Tab Attention, Search & History Controller
   ========================================================================== */

/**
 * Cập nhật số đếm badge Chú ý trên thanh điều hướng
 */
function updateAlertsBadge() {
  if (!alertsBadge) return;
  const count = currentAttention?.totalAttentionCount ?? currentAttention?.totalDistinctCount ?? 0;
  if (count > 0) {
    alertsBadge.textContent = count > 99 ? '99+' : count;
    alertsBadge.classList.remove('hidden');
  } else {
    alertsBadge.classList.add('hidden');
  }
}

/**
 * Chuyển đổi giữa các tab điều hướng (Tổng quan / Chú ý / Tìm & Lịch sử)
 */
function switchPanel(panelName) {
  activePanel = panelName;

  tabNavDashboard?.classList.toggle('active', panelName === 'dashboard');
  tabNavAlerts?.classList.toggle('active', panelName === 'alerts');
  tabNavHistory?.classList.toggle('active', panelName === 'history');

  tabNavDashboard?.setAttribute('aria-selected', panelName === 'dashboard' ? 'true' : 'false');
  tabNavAlerts?.setAttribute('aria-selected', panelName === 'alerts' ? 'true' : 'false');
  tabNavHistory?.setAttribute('aria-selected', panelName === 'history' ? 'true' : 'false');

  panelDashboard?.classList.toggle('hidden', panelName !== 'dashboard');
  panelAlerts?.classList.toggle('hidden', panelName !== 'alerts');
  panelHistory?.classList.toggle('hidden', panelName !== 'history');

  if (panelName === 'alerts') {
    renderAlertsPanel();
  } else if (panelName === 'history') {
    const query = txtSearchTabs?.value?.trim() || '';
    if (query) {
      executeSearch(query);
    } else if (activeHistorySubTab === 'groups') {
      renderGroupsManager();
    } else {
      renderHistoryPanel();
    }
  }
}

tabNavDashboard?.addEventListener('click', () => switchPanel('dashboard'));
tabNavAlerts?.addEventListener('click', () => switchPanel('alerts'));
tabNavHistory?.addEventListener('click', () => switchPanel('history'));

/**
 * Kích hoạt tab và cửa sổ chứa tab
 */
async function activateTab(tabId, windowId) {
  if (typeof chrome === 'undefined' || !chrome.tabs) return;
  try {
    await chrome.tabs.update(tabId, { active: true });
    if (windowId) {
      await chrome.windows.update(windowId, { focused: true });
    }
  } catch (err) {
    console.error('Error activating tab:', err);
  }
}

/**
 * Hiển thị danh sách các tab đang phát âm thanh & tab có thông báo chưa đọc
 */
function renderAlertsPanel() {
  if (!audioTabsContainer || !notifTabsContainer) return;

  const audible = currentAttention.audibleTabs || [];
  const notifs = currentAttention.notificationTabs || [];

  if (audioCountBadge) audioCountBadge.textContent = `${audible.length} tab`;
  if (notifCountBadge) notifCountBadge.textContent = `${notifs.length} tab`;

  // 1. Render Tab phát âm thanh
  audioTabsContainer.innerHTML = '';
  if (audible.length === 0) {
    audioTabsContainer.innerHTML = `
      <div class="empty-state-compact">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
        <span>Không có tab nào đang phát âm thanh</span>
      </div>
    `;
  } else {
    for (const tab of audible) {
      const isMuted = Boolean(tab.mutedInfo?.muted);
      const card = document.createElement('div');
      card.className = 'attention-card attention-card-audio';

      const info = document.createElement('div');
      info.className = 'attention-info';

      const img = document.createElement('img');
      img.className = 'attention-favicon';
      img.src = tab.favIconUrl || '../icons/icon.svg';
      img.onerror = () => { img.src = '../icons/icon.svg'; };

      const texts = document.createElement('div');
      texts.className = 'attention-texts';

      const title = document.createElement('span');
      title.className = 'attention-title';
      title.textContent = tab.title || tab.url || 'Tab không tên';

      const meta = document.createElement('div');
      meta.className = 'attention-meta';

      const domain = document.createElement('span');
      try {
        domain.textContent = tab.url ? new URL(tab.url).hostname : '';
      } catch {
        domain.textContent = '';
      }

      const statusBadge = document.createElement('span');
      statusBadge.className = `attention-badge ${isMuted ? 'badge-muted' : 'badge-playing'}`;
      statusBadge.textContent = isMuted ? 'Đã tắt tiếng' : 'Đang phát';

      meta.appendChild(domain);
      meta.appendChild(statusBadge);

      texts.appendChild(title);
      texts.appendChild(meta);

      info.appendChild(img);
      info.appendChild(texts);

      const actions = document.createElement('div');
      actions.className = 'attention-actions';

      // Nút tắt / bật âm thanh
      const btnMute = document.createElement('button');
      btnMute.className = `btn-action-sm ${isMuted ? 'btn-mute-active' : ''}`;
      btnMute.title = isMuted ? 'Bật lại tiếng' : 'Tắt tiếng tab này';
      btnMute.innerHTML = isMuted
        ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`
        : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

      btnMute.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await chrome.tabs.update(tab.id, { muted: !isMuted });
          showToast(isMuted ? 'Đã bật lại tiếng tab' : 'Đã tắt tiếng tab');
          await scanTabs();
        } catch (err) {
          console.error('Error toggling mute:', err);
        }
      });

      // Nút chuyển tới tab
      const btnFocus = document.createElement('button');
      btnFocus.className = 'btn-action-sm';
      btnFocus.title = 'Chuyển ngay tới tab này';
      btnFocus.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
      btnFocus.addEventListener('click', async (e) => {
        e.stopPropagation();
        await activateTab(tab.id, tab.windowId);
      });

      actions.appendChild(btnMute);
      actions.appendChild(btnFocus);

      card.appendChild(info);
      card.appendChild(actions);
      card.addEventListener('click', () => activateTab(tab.id, tab.windowId));

      audioTabsContainer.appendChild(card);
    }
  }

  // 2. Render Tab có thông báo chưa đọc
  notifTabsContainer.innerHTML = '';
  if (notifs.length === 0) {
    notifTabsContainer.innerHTML = `
      <div class="empty-state-compact">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span>Không có thông báo chưa đọc</span>
      </div>
    `;
  } else {
    for (const tab of notifs) {
      const card = document.createElement('div');
      card.className = 'attention-card attention-card-notif';

      const info = document.createElement('div');
      info.className = 'attention-info';

      const img = document.createElement('img');
      img.className = 'attention-favicon';
      img.src = tab.favIconUrl || '../icons/icon.svg';
      img.onerror = () => { img.src = '../icons/icon.svg'; };

      const texts = document.createElement('div');
      texts.className = 'attention-texts';

      const title = document.createElement('span');
      title.className = 'attention-title';
      title.textContent = tab.title || tab.url || 'Tab không tên';

      const meta = document.createElement('div');
      meta.className = 'attention-meta';

      const domain = document.createElement('span');
      try {
        domain.textContent = tab.url ? new URL(tab.url).hostname : '';
      } catch {
        domain.textContent = '';
      }

      const notifBadge = document.createElement('span');
      notifBadge.className = 'attention-badge badge-unread';
      notifBadge.textContent = tab.notificationBadge ? `${tab.notificationBadge} mới` : 'Có tin mới';

      meta.appendChild(domain);
      meta.appendChild(notifBadge);

      texts.appendChild(title);
      texts.appendChild(meta);

      info.appendChild(img);
      info.appendChild(texts);

      const actions = document.createElement('div');
      actions.className = 'attention-actions';

      const btnFocus = document.createElement('button');
      btnFocus.className = 'btn-action-sm';
      btnFocus.title = 'Xem thông báo tab này ngay';
      btnFocus.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
      btnFocus.addEventListener('click', async (e) => {
        e.stopPropagation();
        await activateTab(tab.id, tab.windowId);
      });

      actions.appendChild(btnFocus);

      card.appendChild(info);
      card.appendChild(actions);
      card.addEventListener('click', () => activateTab(tab.id, tab.windowId));

      notifTabsContainer.appendChild(card);
    }
  }
}

/**
 * Định dạng thời gian tương đối thân thiện (VD: "Vừa xong", "5 phút trước")
 */
function formatTimeAgo(isoString) {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} ${day}/${month}`;
  } catch {
    return 'Gần đây';
  }
}

/**
 * Render thanh điều hướng phân trang (Pagination Bar)
 */
function renderPaginationBar(containerEl, pagination, onPageChange) {
  if (!containerEl) return;
  if (!pagination || pagination.totalPages <= 1) {
    containerEl.innerHTML = '';
    containerEl.classList.add('hidden');
    return;
  }

  containerEl.classList.remove('hidden');
  containerEl.innerHTML = `
    <button class="btn-page-nav btn-prev" ${!pagination.hasPrev ? 'disabled' : ''} type="button">
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      <span>Trước</span>
    </button>
    <span class="page-indicator">Trang ${pagination.currentPage} / ${pagination.totalPages}</span>
    <button class="btn-page-nav btn-next" ${!pagination.hasNext ? 'disabled' : ''} type="button">
      <span>Sau</span>
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>
  `;

  const btnPrev = containerEl.querySelector('.btn-prev');
  const btnNext = containerEl.querySelector('.btn-next');
  btnPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pagination.hasPrev) onPageChange(pagination.currentPage - 1);
  });
  btnNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pagination.hasNext) onPageChange(pagination.currentPage + 1);
  });
}

/**
 * Hiển thị danh sách lịch sử dọn dẹp và khôi phục 1 chạm (có phân trang)
 */
function renderHistoryPanel() {
  if (!historyEntriesContainer) return;
  historyEntriesContainer.innerHTML = '';

  if (historyCountBadge) {
    historyCountBadge.textContent = `${cleanupHistory.length}`;
  }

  if (!cleanupHistory || cleanupHistory.length === 0) {
    historyEntriesContainer.innerHTML = `
      <div class="empty-state-wrap">
        <svg class="empty-state-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="empty-state-title">Chưa có lịch sử dọn dẹp</span>
        <span class="empty-state-desc">Mỗi khi bạn dọn tab trùng hoặc đóng tab, phiên dọn dẹp sẽ lưu tại đây để khôi phục 1 chạm (Undo).</span>
      </div>
    `;
    renderPaginationBar(historyPaginationBar, null, null);
    return;
  }

  const pagination = paginateList(cleanupHistory, historyCurrentPage, 3);
  renderPaginationBar(historyPaginationBar, pagination, (newPage) => {
    historyCurrentPage = newPage;
    renderHistoryPanel();
  });

  for (const entry of pagination.pageItems) {
    const card = document.createElement('div');
    card.className = 'history-card';

    const header = document.createElement('div');
    header.className = 'history-header';

    const metaLeft = document.createElement('div');
    metaLeft.className = 'history-meta-left';

    const typeBadge = document.createElement('span');
    typeBadge.className = `history-type-badge ${entry.actionType === 'DUPLICATES' ? 'type-duplicates' : 'type-single'}`;
    typeBadge.textContent = entry.actionLabel || (entry.actionType === 'DUPLICATES' ? 'Dọn trùng' : 'Đóng lẻ');

    const time = document.createElement('span');
    time.className = 'history-time';
    time.textContent = formatTimeAgo(entry.timestamp);

    const ramBadge = document.createElement('span');
    ramBadge.className = 'history-badge-ram';
    ramBadge.textContent = `+${entry.ramSavedMB || 80} MB`;

    metaLeft.appendChild(typeBadge);
    metaLeft.appendChild(time);
    metaLeft.appendChild(ramBadge);

    // Nút Khôi phục các tab của phiên dọn dẹp này
    const btnRestore = document.createElement('button');
    btnRestore.className = 'btn-restore';
    btnRestore.title = 'Mở lại toàn bộ các tab này trong nền';
    btnRestore.innerHTML = `
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
      <span>Khôi phục (${entry.tabs?.length || 1})</span>
    `;

    btnRestore.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const tabsToRestore = entry.tabs || [];
        for (const t of tabsToRestore) {
          if (t.url) {
            await chrome.tabs.create({ url: t.url, active: false });
          }
        }
        showToast(`Đã khôi phục ${tabsToRestore.length} tab!`);
        await scanTabs();
      } catch (err) {
        console.error('Error restoring tabs:', err);
        showToast('Có lỗi khi khôi phục tab.');
      }
    });

    header.appendChild(metaLeft);
    header.appendChild(btnRestore);
    card.appendChild(header);

    // Danh sách tab tóm tắt (tối đa 3 tab)
    if (entry.tabs && entry.tabs.length > 0) {
      const tabList = document.createElement('div');
      tabList.className = 'history-tab-list';

      const displayTabs = entry.tabs.slice(0, 3);
      for (const t of displayTabs) {
        const tItem = document.createElement('div');
        tItem.className = 'history-tab-item';
        tItem.innerHTML = `
          <span class="history-tab-bullet"></span>
          <span style="color: var(--text-dim); margin-right: 4px;">${t.domain || ''}</span>
          <span>${truncate(t.title || t.url || 'Tab', 30)}</span>
        `;
        tabList.appendChild(tItem);
      }

      if (entry.tabs.length > 3) {
        const moreItem = document.createElement('div');
        moreItem.className = 'history-tab-item';
        moreItem.style.color = 'var(--text-dim)';
        moreItem.style.fontStyle = 'italic';
        moreItem.textContent = `... và thêm ${entry.tabs.length - 3} tab khác`;
        tabList.appendChild(moreItem);
      }

      card.appendChild(tabList);
    }

    historyEntriesContainer.appendChild(card);
  }
}


let renderGroupsRequestId = 0;

/**
 * Render Trình Quản Lý Nhóm ➔ Tab Đang Mở (Group Explorer & Manager)
 */
async function renderGroupsManager() {
  if (!tabGroupsContainer) return;

  const currentRequestId = ++renderGroupsRequestId;

  // Đảm bảo currentTabs luôn đầy đủ
  if (!currentTabs || currentTabs.length === 0) {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      try {
        currentTabs = await chrome.tabs.query({ currentWindow: true });
      } catch (err) {}
    }
  }

  let allGroups = [];
  try {
    if (typeof chrome !== 'undefined' && chrome.tabGroups?.query) {
      allGroups = await chrome.tabGroups.query({});
    }
  } catch (err) {
    console.warn('Error querying all tab groups:', err);
  }

  const activeWindowId = currentTabs[0]?.windowId;
  const relevantGroupIds = new Set(
    (currentTabs || []).map((t) => t.groupId).filter((gid) => gid && gid > 0)
  );

  // Lấy các nhóm thuộc cửa sổ hiện tại hoặc chứa tab trong window này
  let chromeGroups = allGroups.filter((g) => {
    if (relevantGroupIds.has(g.id)) return true;
    if (typeof activeWindowId === 'number' && g.windowId === activeWindowId) return true;
    return false;
  });

  // Quét bù nếu có tab nào thuộc groupId chưa xuất hiện trong chromeGroups
  for (const gid of relevantGroupIds) {
    if (!chromeGroups.some((g) => g.id === gid) && typeof chrome !== 'undefined' && chrome.tabGroups?.get) {
      try {
        const fetched = await chrome.tabGroups.get(gid);
        if (fetched) chromeGroups.push(fetched);
      } catch (err) {}
    }
  }

  // Khử trùng lặp: Nếu có cuộc gọi mới hơn đến trong lúc đang await, hủy bỏ cuộc gọi cũ
  if (currentRequestId !== renderGroupsRequestId) return;

  const hierarchy = buildTabHierarchy(currentTabs, chromeGroups);

  if (openGroupsCountBadge) {
    openGroupsCountBadge.textContent = `${hierarchy.groups.length}`;
  }

  // Xóa sạch nội dung cũ ngay trước khi render kết quả mới nhất
  tabGroupsContainer.innerHTML = '';

  // Khi chưa có nhóm tab nào
  if (hierarchy.groups.length === 0) {
    const ungroupedCount = hierarchy.ungroupedTabs?.length || 0;
    tabGroupsContainer.innerHTML = `
      <div class="empty-state-wrap">
        <svg class="empty-state-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>
        <span class="empty-state-title">Chưa có nhóm tab nào</span>
        <span class="empty-state-desc">${ungroupedCount > 0 ? `Có ${ungroupedCount} tab đang mở chưa được gom nhóm.` : ''} Bấm "Gom nhóm AI" hoặc "Gom Domain" ở trang Tổng quan để tự động phân loại.</span>
      </div>
    `;
    renderPaginationBar(groupsPaginationBar, null, null);
    return;
  }

  const groupCardsData = [...hierarchy.groups];
  if (hierarchy.ungroupedTabs && hierarchy.ungroupedTabs.length > 0) {
    groupCardsData.push({
      id: -1,
      title: 'Chưa gom nhóm',
      color: 'grey',
      collapsed: true,
      tabs: hierarchy.ungroupedTabs,
      isUngrouped: true,
    });
  }

  const pagination = paginateList(groupCardsData, groupsCurrentPage, 3);
  renderPaginationBar(groupsPaginationBar, pagination, (newPage) => {
    groupsCurrentPage = newPage;
    renderGroupsManager();
  });

  const colorHexMap = {
    grey: '#94a3b8',
    blue: '#38bdf8',
    red: '#f43f5e',
    yellow: '#fbbf24',
    green: '#10b981',
    pink: '#ec4899',
    purple: '#a855f7',
    cyan: '#06b6d4',
    orange: '#f97316',
  };

  for (const group of pagination.pageItems) {
    const card = document.createElement('div');
    card.className = `group-card ${group.collapsed ? 'collapsed' : ''}`;
    const hexColor = colorHexMap[group.color?.toLowerCase()] || '#38bdf8';
    card.style.setProperty('--group-color', hexColor);

    const header = document.createElement('div');
    header.className = 'group-card-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'group-card-title-wrap';

    const dot = document.createElement('span');
    dot.className = 'group-color-dot';

    const title = document.createElement('span');
    title.className = 'group-card-title';
    title.textContent = group.title;

    const countTag = document.createElement('span');
    countTag.className = 'count-tag';
    countTag.textContent = `${group.tabs.length} tab`;

    titleWrap.appendChild(dot);
    titleWrap.appendChild(title);
    titleWrap.appendChild(countTag);

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'group-actions-wrap';

    if (!group.isUngrouped) {
      const btnUngroup = document.createElement('button');
      btnUngroup.className = 'btn-group-action';
      btnUngroup.title = 'Rã nhóm (Ungroup các tab)';
      btnUngroup.type = 'button';
      btnUngroup.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
      btnUngroup.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const tabIds = group.tabs.map((t) => t.id);
          await chrome.tabs.ungroup(tabIds);
          showToast(`Đã rã nhóm "${group.title}"!`);
          await scanTabs();
        } catch (err) {
          console.error('Error ungrouping tabs:', err);
        }
      });

      const btnCloseGroup = document.createElement('button');
      btnCloseGroup.className = 'btn-group-action btn-close-group';
      btnCloseGroup.title = 'Đóng toàn bộ tab trong nhóm này';
      btnCloseGroup.type = 'button';
      btnCloseGroup.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      btnCloseGroup.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const tabIds = group.tabs.map((t) => t.id);
          await chrome.tabs.remove(tabIds);
          showToast(`Đã đóng nhóm "${group.title}" (${tabIds.length} tab)!`);
          await scanTabs();
        } catch (err) {
          console.error('Error closing group:', err);
        }
      });

      actionsWrap.appendChild(btnUngroup);
      actionsWrap.appendChild(btnCloseGroup);
    }

    const chevron = document.createElement('div');
    chevron.className = 'btn-group-action group-chevron';
    chevron.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
    actionsWrap.appendChild(chevron);

    header.appendChild(titleWrap);
    header.appendChild(actionsWrap);

    header.addEventListener('click', async () => {
      const isCollapsed = card.classList.toggle('collapsed');
      if (!group.isUngrouped && typeof chrome !== 'undefined' && chrome.tabGroups?.update) {
        try {
          await chrome.tabGroups.update(group.id, { collapsed: isCollapsed });
        } catch (err) {}
      }
    });

    const body = document.createElement('div');
    body.className = 'group-card-body';

    for (const tab of group.tabs) {
      const tabRow = document.createElement('div');
      tabRow.className = 'group-tab-row';

      const tabInfo = document.createElement('div');
      tabInfo.className = 'group-tab-info';

      const favImg = document.createElement('img');
      favImg.className = 'group-tab-favicon';
      favImg.src = tab.favIconUrl || '../icons/icon.svg';
      favImg.onerror = () => { favImg.src = '../icons/icon.svg'; };

      const tabTexts = document.createElement('div');
      tabTexts.className = 'group-tab-texts';

      const tabTitle = document.createElement('span');
      tabTitle.className = 'group-tab-title';
      tabTitle.textContent = tab.title;

      tabTexts.appendChild(tabTitle);
      tabInfo.appendChild(favImg);
      tabInfo.appendChild(tabTexts);

      const btnCloseTab = document.createElement('button');
      btnCloseTab.className = 'btn-close-tab';
      btnCloseTab.title = 'Đóng tab này';
      btnCloseTab.type = 'button';
      btnCloseTab.innerHTML = `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

      btnCloseTab.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await chrome.tabs.remove(tab.id);
          await scanTabs();
        } catch (err) {
          console.error('Error closing tab:', err);
        }
      });

      tabRow.appendChild(tabInfo);
      tabRow.appendChild(btnCloseTab);

      tabRow.addEventListener('click', async () => {
        await activateTab(tab.id, tab.windowId);
      });

      body.appendChild(tabRow);
    }

    card.appendChild(header);
    card.appendChild(body);
    tabGroupsContainer.appendChild(card);
  }
}



/**
 * Thực thi tìm kiếm tức thời trên cả tab đang mở và lịch sử dọn dẹp (có phân trang)
 */
function executeSearch(query) {
  if (!searchResultsContainer) return;
  const { openTabMatches = [], historyMatches = [] } = searchTabs(query, currentTabs, cleanupHistory);

  const allResults = [
    ...openTabMatches.map((t) => ({ ...t, source: 'OPEN', id: t.tabId })),
    ...historyMatches.map((t) => ({ ...t, source: 'HISTORY', id: t.historyId })),
  ];

  searchResultsContainer.innerHTML = '';

  if (searchResultCount) {
    searchResultCount.textContent = `${allResults.length}`;
  }

  if (allResults.length === 0) {
    searchResultsContainer.innerHTML = `
      <div class="empty-state-wrap">
        <svg class="empty-state-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span class="empty-state-title">Không tìm thấy kết quả</span>
        <span class="empty-state-desc">Thử tìm kiếm với từ khóa khác (ví dụ: youtube, github, zalo, báo cáo...).</span>
      </div>
    `;
    renderPaginationBar(searchPaginationBar, null, null);
    return;
  }

  const pagination = paginateList(allResults, searchCurrentPage, 5);
  renderPaginationBar(searchPaginationBar, pagination, (newPage) => {
    searchCurrentPage = newPage;
    executeSearch(txtSearchTabs?.value?.trim() || '');
  });

  for (const item of pagination.pageItems) {
    const el = document.createElement('div');
    el.className = 'search-item';

    const info = document.createElement('div');
    info.className = 'search-item-info';

    const img = document.createElement('img');
    img.className = 'attention-favicon';
    img.src = item.favIconUrl || '../icons/icon.svg';
    img.onerror = () => { img.src = '../icons/icon.svg'; };

    const texts = document.createElement('div');
    texts.className = 'search-item-texts';

    const title = document.createElement('span');
    title.className = 'search-item-title';
    title.textContent = item.title || item.url;

    const domain = document.createElement('span');
    domain.className = 'search-item-domain';
    domain.textContent = item.domain || '';

    texts.appendChild(title);
    texts.appendChild(domain);
    info.appendChild(img);
    info.appendChild(texts);

    const sourceBadge = document.createElement('span');
    sourceBadge.className = `search-item-source ${item.source === 'OPEN' ? 'source-open' : 'source-history'}`;
    sourceBadge.textContent = item.source === 'OPEN' ? 'Đang mở' : 'Đã đóng';

    el.appendChild(info);
    el.appendChild(sourceBadge);

    el.addEventListener('click', async () => {
      if (item.source === 'OPEN') {
        await activateTab(item.tabId || item.id, item.windowId);
      } else {
        if (item.url) {
          await chrome.tabs.create({ url: item.url, active: false });
          showToast(`Đã khôi phục: ${truncate(item.title, 25)}`);
          await scanTabs();
        }
      }
    });

    searchResultsContainer.appendChild(el);
  }
}

/**
 * Chuyển đổi giữa các phân hệ con của Tab 3 (Nhóm & Tab vs Lịch sử)
 */
function switchHistorySubTab(subTabName) {
  activeHistorySubTab = subTabName;

  subTabOpenGroups?.classList.toggle('active', subTabName === 'groups');
  subTabHistory?.classList.toggle('active', subTabName === 'history');

  openGroupsSection?.classList.toggle('hidden', subTabName !== 'groups');
  cleanupHistorySection?.classList.toggle('hidden', subTabName !== 'history');

  if (subTabName === 'groups') {
    renderGroupsManager();
  } else {
    renderHistoryPanel();
  }
}

subTabOpenGroups?.addEventListener('click', () => switchHistorySubTab('groups'));
subTabHistory?.addEventListener('click', () => switchHistorySubTab('history'));

// Rã toàn bộ nhóm trên Chrome
btnUngroupAll?.addEventListener('click', async () => {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const groupedTabIds = tabs.filter((t) => t.groupId > 0).map((t) => t.id);
    if (groupedTabIds.length > 0) {
      await chrome.tabs.ungroup(groupedTabIds);
      showToast(`Đã rã ${groupedTabIds.length} tab ra khỏi các nhóm!`);
      await scanTabs();
    } else {
      showToast('Không có nhóm tab nào để rã.');
    }
  } catch (err) {
    console.error('Error ungrouping all tabs:', err);
  }
});

// Xử lý ô tìm kiếm
txtSearchTabs?.addEventListener('input', () => {
  const val = txtSearchTabs.value.trim();
  searchCurrentPage = 1;
  if (val) {
    btnClearSearch?.classList.remove('hidden');
    historySubNav?.classList.add('hidden');
    openGroupsSection?.classList.add('hidden');
    cleanupHistorySection?.classList.add('hidden');
    searchResultsSection?.classList.remove('hidden');
    executeSearch(val);
  } else {
    btnClearSearch?.classList.add('hidden');
    searchResultsSection?.classList.add('hidden');
    historySubNav?.classList.remove('hidden');
    switchHistorySubTab(activeHistorySubTab);
  }
});

btnClearSearch?.addEventListener('click', () => {
  if (txtSearchTabs) txtSearchTabs.value = '';
  searchCurrentPage = 1;
  btnClearSearch?.classList.add('hidden');
  searchResultsSection?.classList.add('hidden');
  historySubNav?.classList.remove('hidden');
  switchHistorySubTab(activeHistorySubTab);
});

// Xóa sạch lịch sử dọn dẹp
btnClearHistory?.addEventListener('click', async () => {
  if (!cleanupHistory || cleanupHistory.length === 0) return;
  cleanupHistory = [];
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ cleanupHistory: [] });
  }
  renderHistoryPanel();
  showToast('Đã xóa sạch lịch sử dọn dẹp!');
});

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await loadStoredData();
  await scanTabs();

  // Debounce tránh bão sự kiện kích hoạt scanTabs liên tục gây giật lag
  let scanTabsTimer = null;
  const debouncedScanTabs = () => {
    if (scanTabsTimer) clearTimeout(scanTabsTimer);
    scanTabsTimer = setTimeout(() => {
      scanTabs();
    }, 120);
  };

  // Lắng nghe thay đổi tab thời gian thực khi popup đang mở (âm thanh, đổi tiêu đề, đóng/mở tab)
  if (typeof chrome !== 'undefined' && chrome.tabs?.onUpdated) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.audible !== undefined || changeInfo.title !== undefined || changeInfo.mutedInfo !== undefined) {
        debouncedScanTabs();
      }
    });
    chrome.tabs.onRemoved?.addListener(() => debouncedScanTabs());
    chrome.tabs.onCreated?.addListener(() => debouncedScanTabs());
  }

  // Lắng nghe thay đổi nhóm tab thời gian thực
  if (typeof chrome !== 'undefined' && chrome.tabGroups) {
    chrome.tabGroups.onCreated?.addListener(() => debouncedScanTabs());
    chrome.tabGroups.onRemoved?.addListener(() => debouncedScanTabs());
    chrome.tabGroups.onUpdated?.addListener(() => debouncedScanTabs());
  }
});

