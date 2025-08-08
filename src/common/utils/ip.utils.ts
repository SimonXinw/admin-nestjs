/**
 * IP地址处理工具函数
 * 提供IPv4/IPv6地址解析、格式化等通用功能
 */

/**
 * 提取真实客户端IP，自动兼容IPv4和IPv6，并区分类型
 * @param rawIp 原始IP字符串，可能为 ::ffff:112.120.114.93、IPv6（如 2001:db8::1）或普通IPv4
 * @returns { ip: string, ipType: 'IPv4' | 'IPv6' }
 */
export function extractRealIp(rawIp: string): { ip: string; ipType: 'IPv4' | 'IPv6' } {
  let ip = rawIp;
  let ipType: 'IPv4' | 'IPv6' = 'IPv4';

  // 处理 ::ffff: 前缀的 IPv4 映射
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
    ipType = 'IPv4';
  } else if (ip.includes(':')) {
    // 包含 : 说明是 IPv6（如 2001:db8::1 这种格式也会被识别为 IPv6）
    ipType = 'IPv6';
  } else {
    ipType = 'IPv4';
  }

  return { ip, ipType };
} 