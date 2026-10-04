/**
 * VaiClean - Tab & RAM Saver Engine
 * Core business logic for duplicate tab detection, URL normalization, domain grouping & RAM analytics.
 */

// Danh sách query params chuyên dùng để theo dõi (tracking parameters)
export const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'ref',
  'referrer',
  'msclkid',
  'twclid',
  'igshid',
  'mc_eid',
  '_ga',
  '_gl',
]);

// Danh sách màu hợp lệ được hỗ trợ bởi Chrome Tab Groups API
export const CHROME_GROUP_COLORS = [
  'blue',
  'cyan',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
  'grey',
];

/**
 * Chuẩn hóa URL để so sánh chính xác hai tab có chung nội dung hay không.
 * @param {string} rawUrl
 * @param {object} options
 * @returns {string}
 */
export function normalizeUrl(rawUrl, options = {}) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const {
    stripTracking = true,
    ignoreHash = true,
    stripTrailingSlash = true,
  } = options;

  try {
    const parsed = new URL(rawUrl);

    // Bỏ hash fragment (#section, #comments...)
    if (ignoreHash) {
      parsed.hash = '';
    }

    // Bỏ tracking parameters mà không làm ảnh hưởng params nghiệp vụ
    if (stripTracking) {
      for (const param of Array.from(parsed.searchParams.keys())) {
        if (TRACKING_PARAMS.has(param.toLowerCase())) {
          parsed.searchParams.delete(param);
        }
      }
    }

    let normalized = parsed.toString();

    // Chuẩn hóa trailing slash: loại bỏ dấu / ở cuối pathname nếu không phải là root "/"
    if (stripTrailingSlash && parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
      normalized = parsed.toString();
    }

    return normalized;
  } catch {
    // Nếu URL không theo chuẩn RFC thông thường (vd: file nội bộ đặc thù), trả về nguyên bản
    return rawUrl;
  }
}

/**
 * Trích xuất tên miền hoặc danh mục ngắn gọn đại diện cho URL.
 * @param {string} url
 * @returns {string}
 */
export function extractDomain(url) {
  if (!url || typeof url !== 'string') return 'Khác';

  if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:')) {
    if (url.includes('extensions')) return 'Chrome Extensions';
    if (url.includes('settings')) return 'Chrome Settings';
    if (url.includes('newtab') || url.includes('blank')) return 'Tab mới';
    if (url.includes('history')) return 'Lịch sử duyệt web';
    if (url.includes('bookmarks')) return 'Dấu trang';
    return 'Trang hệ thống';
  }

  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname || 'Khác';
  } catch {
    return 'Khác';
  }
}

/**
 * Tìm kiếm các tab trùng lặp trong danh sách tabs được cung cấp.
 * @param {Array<object>} tabs - Danh sách tab từ chrome.tabs.query
 * @param {object} options
 * @returns {{ toClose: Array<object>, toKeep: Array<object>, duplicateCount: number }}
 */
export function findDuplicates(tabs = [], options = {}) {
  const {
    ignorePinned = true,
    preferActive = true,
    stripTracking = true,
    ignoreHash = true,
  } = options;

  const urlGroups = new Map();

  for (const tab of tabs) {
    const normalized = normalizeUrl(tab.url, { stripTracking, ignoreHash });
    if (!urlGroups.has(normalized)) {
      urlGroups.set(normalized, []);
    }
    urlGroups.get(normalized).push(tab);
  }

  const toKeep = [];
  const toClose = [];

  for (const group of urlGroups.values()) {
    if (group.length === 1) {
      toKeep.push(group[0]);
      continue;
    }

    // Nếu nhóm có tab được ghim và đang bật chế độ bảo vệ tab ghim
    const pinnedTabs = group.filter((t) => t.pinned);
    const unpinnedTabs = group.filter((t) => !t.pinned);

    if (ignorePinned && pinnedTabs.length > 0) {
      // Giữ lại TẤT CẢ các tab được ghim để đảm bảo không bao giờ vô ý đóng tab quan trọng của người dùng
      toKeep.push(...pinnedTabs);
      // Đóng toàn bộ các tab không ghim còn lại trong nhóm trùng
      toClose.push(...unpinnedTabs);
      continue;
    }

    // Không có tab ghim hoặc không ignorePinned: chọn 1 tab chiến thắng để giữ lại
    let winner = group[0];
    if (preferActive) {
      const activeTab = group.find((t) => t.active);
      if (activeTab) {
        winner = activeTab;
      }
    }

    toKeep.push(winner);
    for (const tab of group) {
      if (tab.id !== winner.id) {
        toClose.push(tab);
      }
    }
  }

  return {
    toKeep,
    toClose,
    duplicateCount: toClose.length,
  };
}

/**
 * Gom nhóm danh sách tab theo tên miền (Domain)
 * @param {Array<object>} tabs
 * @param {object} options
 * @returns {Record<string, { domain: string, tabIds: number[], tabs: object[] }>}
 */
export function groupTabsByDomain(tabs = [], options = {}) {
  const { skipInternalUrls = false } = options;
  const groups = {};

  for (const tab of tabs) {
    if (skipInternalUrls) {
      const isInternal =
        tab.url?.startsWith('chrome://newtab') ||
        tab.url?.startsWith('about:blank') ||
        tab.url?.startsWith('chrome://') ||
        !tab.url;
      if (isInternal) continue;
    }

    const domain = extractDomain(tab.url);
    if (!groups[domain]) {
      groups[domain] = {
        domain,
        tabIds: [],
        tabs: [],
      };
    }
    groups[domain].tabIds.push(tab.id);
    groups[domain].tabs.push(tab);
  }

  return groups;
}

/**
 * Tính toán dung lượng RAM tiết kiệm được dựa trên số tab đóng.
 * Cơ sở định lượng: Trung bình một tab Chrome chiếm từ 60MB - 120MB (mặc định 80MB).
 * @param {number} closedTabCount
 * @param {number} customAvgMBPerTab
 * @returns {{ ramMB: number, formatted: string }}
 */
export function calculateRamSavings(closedTabCount = 0, customAvgMBPerTab = 80) {
  if (closedTabCount <= 0) {
    return { ramMB: 0, formatted: '0 MB' };
  }

  const ramMB = Math.round(closedTabCount * customAvgMBPerTab);
  let formatted = `${ramMB} MB`;

  if (ramMB >= 1024) {
    const inGB = (ramMB / 1024).toFixed(2).replace(/\.00$/, '');
    formatted = `${inGB} GB`;
  }

  return { ramMB, formatted };
}

/**
 * Chọn màu Chrome Tab Group nhất quán dựa trên mã băm của tên miền.
 * @param {string} domain
 * @returns {string}
 */
export function pickGroupColor(domain = '') {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = (hash << 5) - hash + domain.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CHROME_GROUP_COLORS.length;
  return CHROME_GROUP_COLORS[index];
}

/**
 * So khớp một tab với danh sách nhóm tab hiện có xem có nhóm nào mang tên domain của tab không.
 * @param {object} tab
 * @param {Array<{ id: number, title: string }>} existingGroups
 * @returns {number|null}
 */
export function matchTabToGroup(tab, existingGroups = []) {
  if (!tab?.url || !Array.isArray(existingGroups) || existingGroups.length === 0) {
    return null;
  }
  const domain = extractDomain(tab.url).toLowerCase();
  for (const group of existingGroups) {
    const groupTitle = (group.title || '').trim().toLowerCase();
    if (groupTitle && groupTitle === domain) {
      return group.id;
    }
  }
  return null;
}

/**
 * Kiểm tra xem tab có cần bỏ qua khi tự động gom nhóm hay không.
 * @param {object} tab
 * @param {object} options
 * @returns {boolean}
 */
export function shouldSkipAutoGroup(tab, options = {}) {
  if (!tab || !tab.url) return true;
  const { ignorePinned = false } = options;

  if (ignorePinned && tab.pinned) {
    return true;
  }

  // Nếu tab đã nằm trong group (Chrome quy ước tab chưa trong group có groupId là -1)
  if (tab.groupId !== undefined && tab.groupId > 0) {
    return true;
  }

  const url = tab.url.toLowerCase();
  if (
    url.startsWith('chrome://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome-extension://')
  ) {
    return true;
  }

  return false;
}

/**
 * Lập kế hoạch gom nhóm tự động cho danh sách tab hiện tại
 * @param {Array<object>} tabs
 * @param {Array<{ id: number, title: string }>} existingGroups
 * @param {object} options
 * @returns {{ addToExistingGroup: Array<{ tabId: number, groupId: number }>, createNewGroups: Array<{ domain: string, tabIds: number[] }> }}
 */
export function planAutoGroupActions(tabs = [], existingGroups = [], options = {}) {
  const { minTabsForNewGroup = 2, ignorePinned = false } = options;
  const addToExistingGroup = [];
  const unassignedByDomain = {};

  for (const tab of tabs) {
    if (shouldSkipAutoGroup(tab, { ignorePinned })) {
      continue;
    }

    const matchedGroupId = matchTabToGroup(tab, existingGroups);
    if (matchedGroupId !== null) {
      addToExistingGroup.push({ tabId: tab.id, groupId: matchedGroupId });
    } else {
      const domain = extractDomain(tab.url);
      if (!unassignedByDomain[domain]) {
        unassignedByDomain[domain] = [];
      }
      unassignedByDomain[domain].push(tab.id);
    }
  }

  const createNewGroups = [];
  for (const [domain, tabIds] of Object.entries(unassignedByDomain)) {
    if (tabIds.length >= minTabsForNewGroup) {
      createNewGroups.push({ domain, tabIds });
    }
  }

  return {
    addToExistingGroup,
    createNewGroups,
  };
}

/**
 * Định dạng tiêu đề nhóm tab kèm nhãn cảnh báo nếu có tab trùng lặp
 * @param {string} domain
 * @param {number} duplicateCount
 * @returns {string}
 */
export function formatGroupTitleWithWarning(domain = '', duplicateCount = 0) {
  const cleanDomain = domain.replace(/\s*⚠️\s*\(\d+\s*trùng\)/i, '').trim();
  if (duplicateCount > 0) {
    return `${cleanDomain} ⚠️ (${duplicateCount} trùng)`;
  }
  return cleanDomain;
}

/**
 * Chọn màu nhóm tab kèm cảnh báo (ĐỎ khi có tab trùng lặp)
 * @param {string} domain
 * @param {number} duplicateCount
 * @returns {string}
 */
export function pickGroupColorWithWarning(domain = '', duplicateCount = 0) {
  if (duplicateCount > 0) {
    return 'red';
  }
  return pickGroupColor(domain);
}

/**
 * Đếm số lượng tab trùng lặp trong một tập hợp tab
 * @param {Array<object>} tabs
 * @param {object} options
 * @returns {number}
 */
export function countDuplicatesInTabs(tabs = [], options = {}) {
  const duplicates = findDuplicates(tabs, options);
  return duplicates.duplicateCount;
}

/**
 * Lập kế hoạch gom nhóm tự động nâng cao: kèm cảnh báo trùng lặp và gom tab đơn lẻ
 * @param {Array<object>} tabs
 * @param {Array<{ id: number, title: string }>} existingGroups
 * @param {object} options
 * @returns {{ addToExistingGroup: Array<{ tabId: number, groupId: number }>, createNewGroups: Array<{ domain: string, tabIds: number[], title: string, color: string, duplicateCount: number }>, groupUpdates: Array<{ groupId: number, title: string, color: string, duplicateCount: number }> }}
 */
export function planAutoGroupActionsWithWarning(tabs = [], existingGroups = [], options = {}) {
  const { minTabsForNewGroup = 2, groupSingleTabs = false, ignorePinned = false } = options;

  const addToExistingGroup = [];
  const unassignedByDomain = {};
  const ungroupTabIds = [];

  // Gom các tab theo groupId sẵn có
  const tabsInExistingGroup = new Map();
  for (const group of existingGroups) {
    tabsInExistingGroup.set(group.id, []);
  }

  for (const tab of tabs) {
    if (tab.groupId && tabsInExistingGroup.has(tab.groupId)) {
      tabsInExistingGroup.get(tab.groupId).push(tab);
    }
  }

  // Nhận diện các nhóm 'Tác vụ khác' / 'Khác' hiện có
  const otherGroups = existingGroups.filter(g => {
    const cleanTitle = (g.title || '').replace(/\s*⚠️\s*\(\d+\s*trùng\)/i, '').trim().toLowerCase();
    return cleanTitle === 'tác vụ khác' || cleanTitle === 'khác';
  });

  const primaryOtherGroup = otherGroups.length > 0 ? otherGroups[0] : null;
  const duplicateOtherGroups = otherGroups.slice(1);

  // Xử lý các nhóm 'Tác vụ khác' bị trùng lặp hoặc khi tắt groupSingleTabs
  if (!groupSingleTabs) {
    // Nếu tắt gom tab đơn lẻ, rã toàn bộ tab trong các nhóm 'Tác vụ khác'
    for (const g of otherGroups) {
      const gTabs = tabsInExistingGroup.get(g.id) || [];
      for (const t of gTabs) {
        ungroupTabIds.push(t.id);
      }
    }
  } else if (duplicateOtherGroups.length > 0 && primaryOtherGroup) {
    // Nếu có nhiều nhóm 'Tác vụ khác', gộp tất cả tab từ các nhóm thừa vào nhóm chính duy nhất
    for (const dupGroup of duplicateOtherGroups) {
      const dupTabs = tabsInExistingGroup.get(dupGroup.id) || [];
      for (const t of dupTabs) {
        addToExistingGroup.push({ tabId: t.id, groupId: primaryOtherGroup.id });
        if (tabsInExistingGroup.has(primaryOtherGroup.id)) {
          tabsInExistingGroup.get(primaryOtherGroup.id).push(t);
        }
      }
      tabsInExistingGroup.set(dupGroup.id, []);
    }
  }

  // Quét các tab tự do chưa có trong group
  for (const tab of tabs) {
    if (shouldSkipAutoGroup(tab, { ignorePinned })) {
      continue;
    }

    const matchedGroupId = matchTabToGroup(tab, existingGroups);
    if (matchedGroupId !== null) {
      addToExistingGroup.push({ tabId: tab.id, groupId: matchedGroupId });
      if (tabsInExistingGroup.has(matchedGroupId)) {
        tabsInExistingGroup.get(matchedGroupId).push(tab);
      }
    } else {
      const domain = extractDomain(tab.url);
      if (!unassignedByDomain[domain]) {
        unassignedByDomain[domain] = [];
      }
      unassignedByDomain[domain].push(tab);
    }
  }

  // Cập nhật cảnh báo cho các nhóm đã tồn tại
  const groupUpdates = [];
  for (const group of existingGroups) {
    // Bỏ qua các nhóm 'Tác vụ khác' phụ đã bị gộp vào nhóm chính
    if (duplicateOtherGroups.some(dg => dg.id === group.id)) {
      continue;
    }
    // Bỏ qua nếu tắt gom đơn lẻ và đây là nhóm 'Tác vụ khác' bị rã
    if (!groupSingleTabs && otherGroups.some(og => og.id === group.id)) {
      continue;
    }

    const groupTabs = tabsInExistingGroup.get(group.id) || [];
    const dupCount = countDuplicatesInTabs(groupTabs, { ignorePinned });
    const cleanTitle = (group.title || '').replace(/\s*⚠️\s*\(\d+\s*trùng\)/i, '').trim();
    const domain = cleanTitle || 'Khác';
    groupUpdates.push({
      groupId: group.id,
      title: formatGroupTitleWithWarning(domain, dupCount),
      color: pickGroupColorWithWarning(domain, dupCount),
      duplicateCount: dupCount,
    });
  }

  const createNewGroups = [];
  const singleTabIds = [];

  for (const [domain, domainTabs] of Object.entries(unassignedByDomain)) {
    const tabIds = domainTabs.map(t => t.id);
    if (tabIds.length >= minTabsForNewGroup) {
      const dupCount = countDuplicatesInTabs(domainTabs, { ignorePinned });
      createNewGroups.push({
        domain,
        tabIds,
        title: formatGroupTitleWithWarning(domain, dupCount),
        color: pickGroupColorWithWarning(domain, dupCount),
        duplicateCount: dupCount,
      });
    } else if (groupSingleTabs) {
      singleTabIds.push(...tabIds);
    }
  }

  // Gom các tab đơn lẻ vào nhóm 'Tác vụ khác' nếu được bật
  if (groupSingleTabs && singleTabIds.length > 0) {
    if (primaryOtherGroup) {
      // ĐÃ CÓ sẵn nhóm 'Tác vụ khác' -> thêm vào nhóm hiện có, KHÔNG tạo nhóm mới!
      for (const tabId of singleTabIds) {
        addToExistingGroup.push({ tabId, groupId: primaryOtherGroup.id });
      }
    } else {
      // CHƯA CÓ nhóm nào -> tạo DUY NHẤT 1 nhóm 'Tác vụ khác'
      createNewGroups.push({
        domain: 'Tác vụ khác',
        tabIds: singleTabIds,
        title: 'Tác vụ khác',
        color: 'grey',
        duplicateCount: 0,
      });
    }
  }

  return {
    addToExistingGroup,
    createNewGroups,
    groupUpdates,
    ungroupTabIds,
  };
}

