/**
 * Formatters and helper utilities for VaiClean
 */

/**
 * Định dạng số với dấu phân cách hàng nghìn (ví dụ: 14600 -> "14,600")
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

/**
 * Rút gọn chuỗi dài
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 30) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}
