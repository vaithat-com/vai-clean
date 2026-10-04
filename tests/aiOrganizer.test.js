import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeTabsForAI,
  buildAIPrompt,
  parseAIResponse,
  validateGeminiApiKey,
  clusterTabsWithAI,
} from '../src/engine/aiOrganizer.js';

describe('AI Organizer Engine - TDD Test Suite', () => {
  describe('sanitizeTabsForAI()', () => {
    const rawTabs = [
      { id: 1, title: 'Antigravity IDE - Code Editor', url: 'https://github.com/google/ai', pinned: false },
      { id: 2, title: 'Scrum Board Sprint 24', url: 'https://scrum.org/board', pinned: false },
      { id: 3, title: 'Internal Settings', url: 'chrome://settings', pinned: false },
      { id: 4, title: 'New Tab', url: 'about:blank', pinned: false },
    ];

    it('loại bỏ các tab hệ thống và chỉ giữ lại dữ liệu tối thiểu, an toàn', () => {
      const sanitized = sanitizeTabsForAI(rawTabs);
      assert.equal(sanitized.length, 2);
      assert.deepEqual(sanitized[0], {
        id: 1,
        title: 'Antigravity IDE - Code Editor',
        domain: 'github.com',
      });
      assert.deepEqual(sanitized[1], {
        id: 2,
        title: 'Scrum Board Sprint 24',
        domain: 'scrum.org',
      });
    });
  });

  describe('buildAIPrompt()', () => {
    it('tạo prompt có chứa danh sách tab và yêu cầu định dạng JSON', () => {
      const tabs = [
        { id: 1, title: 'PR #10', domain: 'github.com' },
        { id: 2, title: 'Inbox', domain: 'mail.google.com' },
      ];
      const prompt = buildAIPrompt(tabs);
      assert.ok(prompt.includes('PR #10'));
      assert.ok(prompt.includes('mail.google.com'));
      assert.ok(prompt.includes('thinking'));
      assert.ok(prompt.includes('groups'));
    });
  });

  describe('parseAIResponse()', () => {
    it('bóc tách JSON hợp lệ từ chuỗi raw', () => {
      const rawText = JSON.stringify({
        thinking: 'Đã gom 2 tab lập trình và 1 tab email',
        groups: [
          { name: '💻 Lập trình', color: 'blue', tabIds: [1, 2] },
          { name: '📊 Công việc', color: 'green', tabIds: [3] },
        ],
      });
      const parsed = parseAIResponse(rawText);
      assert.equal(parsed.thinking, 'Đã gom 2 tab lập trình và 1 tab email');
      assert.equal(parsed.groups.length, 2);
      assert.equal(parsed.groups[0].name, '💻 Lập trình');
    });

    it('bóc tách được JSON ngay cả khi được bọc trong markdown code fence (```json ... ```)', () => {
      const markdownWrapped = "```json\n" + JSON.stringify({
        thinking: 'Suy luận thành công',
        groups: [{ name: '🤖 AI Research', color: 'purple', tabIds: [10] }],
      }) + "\n```";
      const parsed = parseAIResponse(markdownWrapped);
      assert.equal(parsed.thinking, 'Suy luận thành công');
      assert.equal(parsed.groups[0].name, '🤖 AI Research');
    });

    it('tự động sửa lỗi trailing comma và comments trong JSON từ mô hình', () => {
      const dirtyJSON = `{
        // AI generated
        "thinking": "Gom tab",
        "groups": [
          { "name": "💻 Dev", "color": "blue", "tabIds": [1, 2, ], },
        ],
      }`;
      const parsed = parseAIResponse(dirtyJSON);
      assert.equal(parsed.groups.length, 1);
      assert.equal(parsed.groups[0].name, '💻 Dev');
      assert.deepEqual(parsed.groups[0].tabIds, [1, 2]);
    });

    it('tự động phục hồi JSON bị đứt đoạn do chạm ngưỡng maxOutputTokens', () => {
      const truncatedJSON = `{"thinking": "Gom tab", "groups": [{"name": "🌐 Web", "color": "cyan", "tabIds": [10, 20`;
      const parsed = parseAIResponse(truncatedJSON);
      assert.equal(parsed.groups.length, 1);
      assert.equal(parsed.groups[0].name, '🌐 Web');
      assert.deepEqual(parsed.groups[0].tabIds, [10, 20]);
    });

    it('ném lỗi an toàn khi phản hồi không đúng cấu trúc', () => {
      assert.throws(() => parseAIResponse('Invalid JSON content'), /Không thể phân tích phản hồi JSON từ AI/);
    });
  });

  describe('validateGeminiApiKey()', () => {
    it('xác thực thành công và tự động tìm danh sách model hỗ trợ generateContent', async () => {
      const mockFetch = async (url) => {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            models: [
              { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
              { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
              { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
            ],
          }),
        };
      };

      const result = await validateGeminiApiKey('AIzaSyValidKey123', mockFetch);
      assert.equal(result.valid, true);
      assert.ok(result.models.includes('gemini-2.5-flash'));
      assert.ok(result.models.includes('gemini-1.5-flash'));
      assert.ok(!result.models.includes('text-embedding-004')); // Loại bỏ model không hỗ trợ generateContent
      assert.equal(result.defaultModel, 'gemini-2.5-flash');
    });

    it('trả về lỗi khi API key không hợp lệ hoặc bị từ chối 400/403', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: { message: 'API key not valid. Please pass a valid API key.' },
        }),
      });

      const result = await validateGeminiApiKey('invalid-key', mockFetch);
      assert.equal(result.valid, false);
      assert.ok(result.error.includes('API key không hợp lệ'));
    });

    it('trả về lỗi ngay lập tức nếu API key rỗng hoặc quá ngắn mà không cần gọi network', async () => {
      const result = await validateGeminiApiKey('');
      assert.equal(result.valid, false);
      assert.ok(result.error.includes('Vui lòng nhập API Key'));

      const resultShort = await validateGeminiApiKey('123');
      assert.equal(resultShort.valid, false);
    });

    it('chọn fallback model đầu tiên nếu tài khoản không có gemini-2.5 hay gemini-1.5', async () => {
      const mockFetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            { name: 'models/gemini-custom-pro', supportedGenerationMethods: ['generateContent'] },
          ],
        }),
      });

      const result = await validateGeminiApiKey('AIzaSyValidCustomKey', mockFetch);
      assert.equal(result.valid, true);
      assert.equal(result.defaultModel, 'gemini-custom-pro');
      assert.deepEqual(result.models, ['gemini-custom-pro']);
    });

    it('báo lỗi nếu key hợp lệ nhưng không có model nào hỗ trợ generateContent', async () => {
      const mockFetch = async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            { name: 'models/embedding-only', supportedGenerationMethods: ['embedContent'] },
          ],
        }),
      });

      const result = await validateGeminiApiKey('AIzaSyValidNoGenKey', mockFetch);
      assert.equal(result.valid, false);
      assert.ok(result.error.includes('không tìm thấy mô hình nào hỗ trợ tạo nội dung'));
    });
  });

  describe('clusterTabsWithAI()', () => {
    it('gọi API thành công và trả về thinking kèm nhóm tab', async () => {
      const mockFetch = async () => ({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      thinking: 'Phân tích xong 2 tab',
                      groups: [
                        { name: '💻 Dev', color: 'blue', tabIds: [1, 2] },
                      ],
                    }),
                  },
                ],
              },
            },
          ],
        }),
      });

      const tabs = [
        { id: 1, title: 'Code', domain: 'github.com' },
        { id: 2, title: 'Docs', domain: 'github.com' },
      ];

      const result = await clusterTabsWithAI('valid-key', 'gemini-2.5-flash', tabs, mockFetch);
      assert.equal(result.thinking, 'Phân tích xong 2 tab');
      assert.equal(result.groups.length, 1);
      assert.deepEqual(result.groups[0].tabIds, [1, 2]);
    });
  });
});
