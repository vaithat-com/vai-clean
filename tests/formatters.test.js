import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber, truncate } from '../src/utils/formatters.js';

describe('Formatters Test Suite', () => {
  it('formatNumber định dạng đúng dấu phẩy hàng nghìn', () => {
    assert.equal(formatNumber(14600), '14,600');
    assert.equal(formatNumber(1000000), '1,000,000');
    assert.equal(formatNumber(0), '0');
  });

  it('truncate rút gọn chuỗi quá dài kèm dấu …', () => {
    assert.equal(truncate('Short', 10), 'Short');
    assert.equal(truncate('This is a very long string that needs truncation', 15), 'This is a very…');
  });
});
