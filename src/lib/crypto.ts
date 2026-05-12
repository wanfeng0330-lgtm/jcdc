// API 密钥加密工具
// 使用 AES-256-GCM 加密敏感 API Key，防止明文存储

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// 从环境变量获取加密主密钥，如果没有则使用默认值（仅开发环境）
function getMasterKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_MASTER_KEY must be set in production');
    }
    // 开发环境使用默认密钥（不安全，仅用于本地开发）
    return 'dev-only-master-key-change-in-production-32ch';
  }
  return key;
}

// 从主密钥派生加密密钥
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, 32);
}

export interface EncryptedData {
  encrypted: string;   // Base64 编码的密文
  iv: string;          // Base64 编码的初始化向量
  tag: string;         // Base64 编码的认证标签
  salt: string;        // Base64 编码的盐
}

/**
 * 加密 API Key 或其他敏感数据
 */
export function encrypt(plaintext: string): EncryptedData {
  const masterKey = getMasterKey();
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(masterKey, salt);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    salt: salt.toString('base64'),
  };
}

/**
 * 解密 API Key 或其他敏感数据
 */
export function decrypt(data: EncryptedData): string {
  const masterKey = getMasterKey();
  const salt = Buffer.from(data.salt, 'base64');
  const key = deriveKey(masterKey, salt);
  const iv = Buffer.from(data.iv, 'base64');
  const tag = Buffer.from(data.tag, 'base64');
  const encrypted = Buffer.from(data.encrypted, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * 验证加密数据是否可正确解密
 */
export function verifyEncrypted(data: EncryptedData): boolean {
  try {
    decrypt(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * 将 EncryptedData 序列化为字符串（用于存储）
 */
export function serializeEncrypted(data: EncryptedData): string {
  return JSON.stringify(data);
}

/**
 * 从字符串反序列化 EncryptedData
 */
export function deserializeEncrypted(json: string): EncryptedData {
  return JSON.parse(json) as EncryptedData;
}
