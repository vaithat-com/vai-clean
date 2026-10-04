/**
 * VaiClean - AI Smart Tab Organizer Engine
 * Connects with Gemini API, validates keys dynamically, clusters tabs semantically with thinking process.
 */

import { extractDomain, CHROME_GROUP_COLORS } from './tabCleaner.js';

/**
 * Lọc sạch danh sách tab gửi lên AI để đảm bảo an toàn bảo mật thông tin
 * @param {Array<object>} tabs
 * @returns {Array<{ id: number, title: string, domain: string }>}
 */
export function sanitizeTabsForAI(tabs = []) {
  if (!Array.isArray(tabs)) return [];

  const sanitized = [];
  for (const tab of tabs) {
    if (!tab || !tab.url) continue;

    const url = tab.url.toLowerCase();
    // Bỏ qua các tab hệ thống hoặc tab nội bộ
    if (
      url.startsWith('chrome://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('chrome-extension://')
    ) {
      continue;
    }

    const domain = extractDomain(tab.url);
    const title = (tab.title || domain || 'Trang web').trim();

    sanitized.push({
      id: tab.id,
      title: title.length > 45 ? title.slice(0, 44) + '…' : title,
      domain,
    });
  }

  return sanitized;
}

/**
 * Xây dựng prompt có cấu trúc siêu nén và tối ưu tốc độ cho mô hình AI
 * @param {Array<{ id: number, title: string, domain: string }>} sanitizedTabs
 * @returns {string}
 */
export function buildAIPrompt(sanitizedTabs = []) {
  const tabsSummary = sanitizedTabs
    .map((t) => `[#${t.id}] ${t.domain} | ${t.title}`)
    .join('\n');

  return `Bạn là Trợ lý Quản lý Tab Trình duyệt siêu tốc (VaiClean AI).
Nhiệm vụ: Phân tích danh sách tab và gom nhóm chúng thành các Workspaces có ý nghĩa thực tế.

DANH SÁCH TAB:
${tabsSummary}

YÊU CẦU ĐẦU RA (Trả về DUY NHẤT một đối tượng JSON chuẩn RFC):
{
  "thinking": "1 câu cực ngắn dưới 15 từ tóm tắt tiêu chí gom nhóm (ví dụ: Phân loại theo Coding, Vận hành và Tra cứu)",
  "groups": [
    {
      "name": "Tên nhóm cực ngắn tối đa 8-12 ký tự kèm 1 icon (ví dụ: '💻 Code', '📧 Mail', '🛠️ DevOps', '🌐 Social', '🔍 Tra cứu') để không bị Chrome cắt ngắn thành '...' trên thanh tab",
      "color": "Chọn 1 trong các màu: blue, cyan, green, yellow, orange, red, pink, purple, grey",
      "tabIds": [danh sách id tab]
    }
  ]
}`;
}

/**
 * Làm sạch và sửa chữa các lỗi cú pháp JSON thường gặp từ LLM
 * (trailing commas, thiếu dấu ngoặc đóng do token cutoff, comments, unescaped characters)
 * @param {string} raw
 * @returns {any}
 */
function cleanAndRepairJSON(raw) {
  let cleaned = raw.trim();

  // 1. Bóc tách nếu được bọc trong markdown code fence
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) {
    cleaned = fence[1].trim();
  }

  // 2. Tìm điểm mở JSON đầu tiên
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    cleaned = cleaned.slice(firstBrace);
  }

  // 3. Loại bỏ comments
  cleaned = cleaned.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // 4. Loại bỏ trailing commas trước } hoặc ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  // Thử parse thông thường trước
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    // Tiếp tục các bước sửa lỗi tự động
  }

  // 5. Cắt bỏ phần cụt cuối chuỗi nếu bị đứt đoạn sau dấu } cuối cùng
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace !== -1) {
    const candidate = cleaned.slice(0, lastBrace + 1).replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(candidate);
    } catch (e) {}
  }

  // 6. Xử lý thiếu dấu đóng do token bị ngắt: Dùng stack để đóng đúng thứ tự lồng nhau
  let patched = cleaned.trim();
  patched = patched.replace(/,\s*$/, ''); // Bỏ dấu phẩy thừa ở cuối

  const stack = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < patched.length; i++) {
    const ch = patched[i];
    if (ch === '\\' && !escape) {
      escape = true;
      continue;
    }
    if (ch === '"' && !escape) {
      inString = !inString;
    } else if (!inString) {
      if (ch === '{') {
        stack.push('}');
      } else if (ch === '[') {
        stack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }
    escape = false;
  }

  if (inString) {
    patched += '"';
  }

  patched = patched.replace(/,\s*$/, '');

  // Đóng theo đúng thứ tự stack lồng nhau
  while (stack.length > 0) {
    patched += stack.pop();
  }

  patched = patched.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(patched);
  } catch (err2) {
    // 7. Fallback Regex: Trích xuất các nhóm tab hợp lệ đã sinh ra
    const groups = [];
    const groupRegex = /"name"\s*:\s*"([^"]+)"[\s\S]*?"color"\s*:\s*"([^"]+)"[\s\S]*?"tabIds"\s*:\s*\[([^\]]*)\]/g;
    let match;
    while ((match = groupRegex.exec(cleaned)) !== null) {
      const name = match[1];
      const color = match[2];
      const tabIdsRaw = match[3];
      const tabIds = tabIdsRaw
        .split(/[\s,]+/)
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (tabIds.length > 0) {
        groups.push({ name, color, tabIds });
      }
    }

    if (groups.length > 0) {
      return { thinking: 'AI đã phân loại các nhóm tab.', groups };
    }

    throw new Error('Cú pháp JSON không hợp lệ');
  }
}

/**
 * Bóc tách và kiểm tra JSON trả về từ mô hình AI
 * @param {string} rawText
 * @returns {{ thinking: string, groups: Array<{ name: string, color: string, tabIds: number[] }> }}
 */
export function parseAIResponse(rawText = '') {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Không thể phân tích phản hồi JSON từ AI: Phản hồi trống');
  }

  try {
    const parsed = cleanAndRepairJSON(rawText);
    const thinking = typeof parsed.thinking === 'string' ? parsed.thinking.trim() : 'AI đã phân tích và phân loại các tab.';
    const rawGroups = Array.isArray(parsed.groups) ? parsed.groups : [];

    const validColors = new Set(CHROME_GROUP_COLORS);
    const cleanGroups = [];

    for (const g of rawGroups) {
      if (!g || !Array.isArray(g.tabIds) || g.tabIds.length === 0) continue;
      const validTabIds = g.tabIds.filter((id) => typeof id === 'number' && !isNaN(id));
      if (validTabIds.length === 0) continue;

      const name = typeof g.name === 'string' && g.name.trim() ? g.name.trim().slice(0, 30) : 'Nhóm tab';
      const color = validColors.has(g.color?.toLowerCase()) ? g.color.toLowerCase() : 'blue';

      cleanGroups.push({
        name,
        color,
        tabIds: validTabIds,
      });
    }

    return {
      thinking,
      groups: cleanGroups,
    };
  } catch (err) {
    throw new Error(`Không thể phân tích phản hồi JSON từ AI: ${err.message}`);
  }
}

/**
 * Kiểm tra tính hợp lệ của API Key và tự động lấy danh sách Model hỗ trợ từ Google Gemini
 * @param {string} apiKey
 * @param {typeof fetch} fetchFn
 * @returns {Promise<{ valid: boolean, models?: string[], defaultModel?: string, error?: string }>}
 */
export function validateGeminiApiKey(apiKey = '', fetchFn = globalThis.fetch) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
    return Promise.resolve({
      valid: false,
      error: 'Vui lòng nhập API Key hợp lệ của Google Gemini.',
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;

  return fetchFn(endpoint)
    .then(async (res) => {
      let data = {};
      try {
        data = await res.json();
      } catch {
        // bỏ qua lỗi parse json khi server trả về html
      }

      if (!res.ok) {
        const errorMsg = data?.error?.message || res.statusText || 'Lỗi kết nối';
        return {
          valid: false,
          error: `API key không hợp lệ hoặc bị từ chối (${res.status}): ${errorMsg}`,
        };
      }

      const rawModels = Array.isArray(data.models) ? data.models : [];
      // Lọc các model hỗ trợ generateContent
      const supportedModels = rawModels
        .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => (m.name || '').replace(/^models\//, ''))
        .filter(Boolean);

      if (supportedModels.length === 0) {
        return {
          valid: false,
          error: 'API Key hợp lệ nhưng không tìm thấy mô hình nào hỗ trợ tạo nội dung (generateContent).',
        };
      }

      // Chọn model mặc định tối ưu: ưu tiên gemini-2.5-flash > gemini-1.5-flash > model đầu tiên
      let defaultModel = supportedModels[0];
      if (supportedModels.includes('gemini-2.5-flash')) {
        defaultModel = 'gemini-2.5-flash';
      } else if (supportedModels.includes('gemini-1.5-flash')) {
        defaultModel = 'gemini-1.5-flash';
      }

      return {
        valid: true,
        models: supportedModels,
        defaultModel,
      };
    })
    .catch((err) => {
      return {
        valid: false,
        error: `Không thể kết nối đến máy chủ Google Gemini: ${err.message}`,
      };
    });
}

/**
 * Gom nhóm danh sách tab bằng mô hình Google Gemini
 * @param {string} apiKey
 * @param {string} model
 * @param {Array<object>} sanitizedTabs
 * @param {typeof fetch} fetchFn
 * @returns {Promise<{ thinking: string, groups: Array<{ name: string, color: string, tabIds: number[] }> }>}
 */
export async function clusterTabsWithAI(apiKey, model = 'gemini-2.5-flash', sanitizedTabs = [], fetchFn = globalThis.fetch) {
  if (!apiKey) {
    throw new Error('Vui lòng cung cấp Gemini API Key để kích hoạt gom nhóm AI.');
  }

  const prompt = buildAIPrompt(sanitizedTabs);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const isGemini25 = typeof model === 'string' && model.includes('2.5');
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
      ...(isGemini25 ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  };

  let res = await fetchFn(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // Tự động fallback nếu model không hỗ trợ thinkingConfig
  if (!res.ok && isGemini25 && payload.generationConfig.thinkingConfig) {
    delete payload.generationConfig.thinkingConfig;
    res = await fetchFn(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Lỗi từ Gemini API: ${res.statusText}`);
  }

  const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) {
    throw new Error('Mô hình AI không trả về nội dung hợp lệ.');
  }

  return parseAIResponse(rawContent);
}

/**
 * Ghi nhớ ánh xạ giữa domain và Workspace AI từ danh sách nhóm
 * @param {Array<{ name: string, color?: string, tabIds: number[] }>} groups
 * @param {Array<{ id: number, url: string }>} tabs
 * @param {Record<string, { workspaceName: string, color: string }>} existingMemory
 * @returns {Record<string, { workspaceName: string, color: string }>}
 */
export function recordWorkspaceMemory(groups = [], tabs = [], existingMemory = {}) {
  const memory = { ...(existingMemory || {}) };
  const tabMap = new Map();

  for (const t of tabs) {
    if (t && t.id !== undefined && t.url) {
      tabMap.set(t.id, t.url);
    }
  }

  for (const g of groups) {
    if (!g || !g.name || !Array.isArray(g.tabIds)) continue;
    const workspaceName = g.name.trim();
    const color = g.color || 'blue';

    for (const tabId of g.tabIds) {
      const url = tabMap.get(tabId);
      if (url) {
        const domain = extractDomain(url);
        if (domain && domain !== 'khác' && domain !== 'nội bộ') {
          memory[domain] = { workspaceName, color };
        }
      }
    }
  }

  return memory;
}

/**
 * Định tuyến tab mới vào nhóm AI có sẵn dựa trên bộ nhớ Workspace Memory (0ms, 0 Quota)
 * @param {object} tab
 * @param {Array<{ id: number, title: string }>} existingGroups
 * @param {Record<string, { workspaceName: string, color: string }>} memory
 * @returns {{ tabId: number, groupId: number, workspaceName: string } | null}
 */
export function routeTabWithWorkspaceMemory(tab, existingGroups = [], memory = {}) {
  if (!tab || !tab.url || !memory) return null;

  const domain = extractDomain(tab.url);
  const mem = memory[domain];
  if (!mem || !mem.workspaceName) return null;

  const targetCleanTitle = mem.workspaceName.replace(/\s*⚠️\s*\(\d+\s*trùng\)/i, '').trim().toLowerCase();

  for (const group of existingGroups) {
    const groupCleanTitle = (group.title || '').replace(/\s*⚠️\s*\(\d+\s*trùng\)/i, '').trim().toLowerCase();
    if (groupCleanTitle && groupCleanTitle === targetCleanTitle) {
      return {
        tabId: tab.id,
        groupId: group.id,
        workspaceName: mem.workspaceName,
      };
    }
  }

  return null;
}

/**
 * Tính toán danh sách nhóm cần gập/mở khi chuyển tab (Auto-collapse Inactive Groups)
 * @param {number} activeGroupId
 * @param {Array<{ id: number, title?: string, collapsed?: boolean }>} allGroups
 * @param {boolean} collapseInactive
 * @returns {Array<{ groupId: number, collapsed: boolean }>}
 */
export function autoCollapseInactiveGroups(activeGroupId, allGroups = [], collapseInactive = true) {
  if (!collapseInactive || !activeGroupId || activeGroupId <= 0 || !Array.isArray(allGroups) || allGroups.length === 0) {
    return [];
  }

  return allGroups.map((g) => ({
    groupId: g.id,
    collapsed: g.id !== activeGroupId,
  }));
}

/**
 * Xây dựng prompt phân loại thêm các tab mới phát sinh vào các nhóm AI hiện có
 * @param {Array<{ id: number, title: string, domain: string }>} unassignedTabs
 * @param {Array<string>} existingWorkspaces
 * @returns {string}
 */
export function buildIncrementalAIPrompt(unassignedTabs = [], existingWorkspaces = []) {
  return `Bạn là Trợ lý Quản lý Bộ nhớ & Tab Trình duyệt (VaiClean AI).
Nhiệm vụ: Phân tích ngữ cảnh các tab mới mở và xếp chúng vào 1 trong các Không gian làm việc (Workspaces) ĐÃ CÓ SẴN dưới đây. Chỉ tạo Không gian làm việc mới nếu tab hoàn toàn không thể xếp chung vào bất kỳ nhóm nào có sẵn.

CÁC KHÔNG GIAN LÀM VIỆC HIỆN CÓ:
${existingWorkspaces.map(w => `- ${w}`).join('\n')}

DANH SÁCH TAB MỚI CẦN PHÂN LOẠI:
${JSON.stringify(unassignedTabs, null, 2)}

YÊU CẦU ĐẦU RA:
Trả về duy nhất MỘ ĐỐI TƯỢNG JSON chuẩn RFC:
{
  "thinking": "Giải thích ngắn gọn lý do xếp các tab mới vào các không gian làm việc.",
  "groups": [
    {
      "name": "Tên không gian làm việc (ưu tiên dùng lại chính xác tên có sẵn ở trên)",
      "color": "blue/cyan/green/yellow/orange/red/pink/purple/grey",
      "tabIds": [danh sách id tab]
    }
  ]
}`;
}

