/**
 * Encryption Service
 * Data encryption, key management, and cryptographic operations
 */

import crypto from 'crypto';

export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';

export interface EncryptedData {
  algorithm: EncryptionAlgorithm;
  ciphertext: string; // hex encoded
  iv: string; // hex encoded
  authTag?: string; // hex encoded (for GCM/ChaCha20)
  salt: string; // hex encoded
  timestamp: number;
}

export interface EncryptionKey {
  id: string;
  key: Buffer;
  algorithm: EncryptionAlgorithm;
  createdAt: number;
  rotatedAt: number | null;
  active: boolean;
}

export interface KeyRotationPolicy {
  interval: number; // ms
  maxKeyAge: number; // ms
  autoRotate: boolean;
}

/**
 * Encryption Service
 */
export class EncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private activeKeyId: string | null = null;
  private keyRotationPolicy: KeyRotationPolicy;

  constructor(rotationPolicy: KeyRotationPolicy = {
    interval: 90 * 24 * 60 * 60 * 1000, // 90 days
    maxKeyAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    autoRotate: true,
  }) {
    this.keyRotationPolicy = rotationPolicy;
  }

  /**
   * Generate encryption key
   */
  generateKey(algorithm: EncryptionAlgorithm = 'aes-256-gcm'): EncryptionKey {
    const keyLength = algorithm === 'aes-256-gcm' || algorithm === 'aes-256-cbc' ? 32 : 32;
    const key = crypto.randomBytes(keyLength);
    const keyId = `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    const encryptionKey: EncryptionKey = {
      id: keyId,
      key,
      algorithm,
      createdAt: Date.now(),
      rotatedAt: null,
      active: true,
    };

    this.keys.set(keyId, encryptionKey);

    if (!this.activeKeyId) {
      this.activeKeyId = keyId;
    }

    return encryptionKey;
  }

  /**
   * Import key
   */
  importKey(keyId: string, keyData: Buffer, algorithm: EncryptionAlgorithm = 'aes-256-gcm'): EncryptionKey {
    const encryptionKey: EncryptionKey = {
      id: keyId,
      key: keyData,
      algorithm,
      createdAt: Date.now(),
      rotatedAt: null,
      active: true,
    };

    this.keys.set(keyId, encryptionKey);

    if (!this.activeKeyId) {
      this.activeKeyId = keyId;
    }

    return encryptionKey;
  }

  /**
   * Rotate key
   */
  rotateKey(): EncryptionKey {
    const oldKeyId = this.activeKeyId;

    // Deactivate old key
    if (oldKeyId) {
      const oldKey = this.keys.get(oldKeyId);
      if (oldKey) {
        oldKey.active = false;
      }
    }

    // Generate new key
    const newKey = this.generateKey((oldKeyId ? this.keys.get(oldKeyId)?.algorithm : 'aes-256-gcm') as EncryptionAlgorithm);
    this.activeKeyId = newKey.id;

    return newKey;
  }

  /**
   * Set active key
   */
  setActiveKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;

    // Deactivate previous active key
    if (this.activeKeyId) {
      const previousKey = this.keys.get(this.activeKeyId);
      if (previousKey) {
        previousKey.active = false;
      }
    }

    key.active = true;
    this.activeKeyId = keyId;

    return true;
  }

  /**
   * Encrypt data
   */
  encrypt(data: string, keyId?: string): EncryptedData {
    const key = keyId ? this.keys.get(keyId) : this.keys.get(this.activeKeyId!);

    if (!key) {
      throw new Error('No encryption key available');
    }

    const salt = crypto.randomBytes(32);
    const derivedKey = crypto.pbkdf2Sync(key.key, salt, 100000, 32, 'sha256');

    let result: EncryptedData;

    switch (key.algorithm) {
      case 'aes-256-gcm': {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);

        let ciphertext = cipher.update(data, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        result = {
          algorithm: key.algorithm,
          ciphertext,
          iv: iv.toString('hex'),
          authTag: authTag.toString('hex'),
          salt: salt.toString('hex'),
          timestamp: Date.now(),
        };
        break;
      }

      case 'aes-256-cbc': {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);

        let ciphertext = cipher.update(data, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        result = {
          algorithm: key.algorithm,
          ciphertext,
          iv: iv.toString('hex'),
          salt: salt.toString('hex'),
          timestamp: Date.now(),
        };
        break;
      }

      case 'chacha20-poly1305': {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('chacha20-poly1305', derivedKey, iv);

        let ciphertext = cipher.update(data, 'utf8', 'hex');
        ciphertext += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        result = {
          algorithm: key.algorithm,
          ciphertext,
          iv: iv.toString('hex'),
          authTag: authTag.toString('hex'),
          salt: salt.toString('hex'),
          timestamp: Date.now(),
        };
        break;
      }

      default:
        throw new Error(`Unknown algorithm: ${key.algorithm}`);
    }

    return result;
  }

  /**
   * Decrypt data
   */
  decrypt(encrypted: EncryptedData, keyId?: string): string {
    const key = keyId ? this.keys.get(keyId) : this.keys.get(this.activeKeyId!);

    if (!key) {
      throw new Error('No decryption key available');
    }

    const salt = Buffer.from(encrypted.salt, 'hex');
    const derivedKey = crypto.pbkdf2Sync(key.key, salt, 100000, 32, 'sha256');

    switch (encrypted.algorithm) {
      case 'aes-256-gcm': {
        const iv = Buffer.from(encrypted.iv, 'hex');
        const authTag = Buffer.from(encrypted.authTag || '', 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
        decipher.setAuthTag(authTag);

        let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        return plaintext;
      }

      case 'aes-256-cbc': {
        const iv = Buffer.from(encrypted.iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);

        let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        return plaintext;
      }

      case 'chacha20-poly1305': {
        const iv = Buffer.from(encrypted.iv, 'hex');
        const authTag = Buffer.from(encrypted.authTag || '', 'hex');

        const decipher = crypto.createDecipheriv('chacha20-poly1305', derivedKey, iv);
        decipher.setAuthTag(authTag);

        let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');

        return plaintext;
      }

      default:
        throw new Error(`Unknown algorithm: ${encrypted.algorithm}`);
    }
  }

  /**
   * Hash data with salt
   */
  hash(data: string, saltRounds: number = 10): string {
    // Using PBKDF2 instead of bcrypt for consistency
    const salt = crypto.randomBytes(32);
    const iterations = Math.pow(2, saltRounds);
    const hash = crypto.pbkdf2Sync(data, salt, iterations, 64, 'sha256');

    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  /**
   * Verify hash
   */
  verifyHash(data: string, hash: string, saltRounds: number = 10): boolean {
    const [salt, storedHash] = hash.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    const iterations = Math.pow(2, saltRounds);
    const computed = crypto.pbkdf2Sync(data, Buffer.from(salt, 'hex'), iterations, 64, 'sha256');

    return computed.toString('hex') === storedHash;
  }

  /**
   * Generate HMAC
   */
  generateHMAC(data: string, keyId?: string): string {
    const key = keyId ? this.keys.get(keyId) : this.keys.get(this.activeKeyId!);

    if (!key) {
      throw new Error('No key available for HMAC');
    }

    const hmac = crypto.createHmac('sha256', key.key);
    hmac.update(data);

    return hmac.digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data: string, hmac: string, keyId?: string): boolean {
    const computed = this.generateHMAC(data, keyId);
    return computed === hmac;
  }

  /**
   * Generate random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Get active key
   */
  getActiveKey(): EncryptionKey | null {
    return this.activeKeyId ? (this.keys.get(this.activeKeyId) || null) : null;
  }

  /**
   * Get all keys
   */
  getKeys(): EncryptionKey[] {
    return Array.from(this.keys.values());
  }

  /**
   * Get key by ID
   */
  getKey(keyId: string): EncryptionKey | null {
    return this.keys.get(keyId) || null;
  }

  /**
   * Check if key rotation is needed
   */
  isKeyRotationNeeded(): boolean {
    if (!this.activeKeyId) return true;

    const key = this.keys.get(this.activeKeyId);
    if (!key) return true;

    const age = Date.now() - key.createdAt;
    return age > this.keyRotationPolicy.maxKeyAge;
  }

  /**
   * Auto-rotate key if needed
   */
  autoRotateIfNeeded(): boolean {
    if (!this.keyRotationPolicy.autoRotate) return false;

    if (this.isKeyRotationNeeded()) {
      this.rotateKey();
      return true;
    }

    return false;
  }

  /**
   * Destroy key
   */
  destroyKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;

    if (keyId === this.activeKeyId) {
      throw new Error('Cannot destroy active key');
    }

    // Securely clear key data
    key.key.fill(0);

    return this.keys.delete(keyId);
  }
}

/**
 * Create encryption service
 */
export function createEncryptionService(rotationPolicy?: KeyRotationPolicy): EncryptionService {
  return new EncryptionService(rotationPolicy);
}
