/**
 * Enterprise Security Module Tests
 * Encryption, authentication, compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EncryptionService,
  AuthProvider,
  ComplianceManager,
  StandardComplianceRules,
  createEncryptionService,
  createAuthProvider,
  createComplianceManager,
} from '../src/modules/security';

describe('Encryption Service', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = createEncryptionService();
  });

  it('should generate encryption key', () => {
    const key = encryptionService.generateKey('aes-256-gcm');

    expect(key).toBeDefined();
    expect(key.id).toBeDefined();
    expect(key.algorithm).toBe('aes-256-gcm');
    expect(key.active).toBe(true);
  });

  it('should encrypt and decrypt data', () => {
    encryptionService.generateKey('aes-256-gcm');

    const plaintext = 'sensitive data';
    const encrypted = encryptionService.encrypt(plaintext);

    expect(encrypted).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);

    const decrypted = encryptionService.decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it('should support multiple encryption algorithms', () => {
    const algorithms = ['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305'] as const;

    for (const algo of algorithms) {
      const key = encryptionService.generateKey(algo);
      expect(key.algorithm).toBe(algo);

      const plaintext = `test data for ${algo}`;
      const encrypted = encryptionService.encrypt(plaintext);

      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    }
  });

  it('should hash and verify passwords', () => {
    const password = 'my-secure-password';
    const hash = encryptionService.hash(password);

    expect(hash).not.toBe(password);

    const isValid = encryptionService.verifyHash(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = encryptionService.verifyHash('wrong-password', hash);
    expect(isInvalid).toBe(false);
  });

  it('should generate and verify HMAC', () => {
    encryptionService.generateKey();

    const data = 'message to verify';
    const hmac = encryptionService.generateHMAC(data);

    expect(hmac).toBeDefined();

    const isValid = encryptionService.verifyHMAC(data, hmac);
    expect(isValid).toBe(true);

    const isInvalid = encryptionService.verifyHMAC('different data', hmac);
    expect(isInvalid).toBe(false);
  });

  it('should rotate keys', () => {
    const key1 = encryptionService.generateKey();
    expect(key1.active).toBe(true);

    const key2 = encryptionService.rotateKey();
    expect(key2.active).toBe(true);
    expect(key2.id).not.toBe(key1.id);

    // Original key should be inactive
    const retrievedKey1 = encryptionService.getKey(key1.id);
    expect(retrievedKey1?.active).toBe(false);
  });

  it('should detect key rotation need', () => {
    encryptionService.generateKey();

    const needed = encryptionService.isKeyRotationNeeded();
    expect(typeof needed).toBe('boolean');
  });

  it('should generate random tokens', () => {
    const token1 = encryptionService.generateToken(32);
    const token2 = encryptionService.generateToken(32);

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
  });

  it('should encrypt with specific key', () => {
    const key1 = encryptionService.generateKey('aes-256-gcm');
    const key2 = encryptionService.generateKey('aes-256-gcm');

    const plaintext = 'test data';
    const encrypted1 = encryptionService.encrypt(plaintext, key1.id);
    const encrypted2 = encryptionService.encrypt(plaintext, key2.id);

    // Different keys should produce different ciphertexts
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);

    // But both should decrypt correctly
    const decrypted1 = encryptionService.decrypt(encrypted1, key1.id);
    const decrypted2 = encryptionService.decrypt(encrypted2, key2.id);

    expect(decrypted1).toBe(plaintext);
    expect(decrypted2).toBe(plaintext);
  });
});

describe('Auth Provider', () => {
  let authProvider: AuthProvider;

  beforeEach(() => {
    authProvider = createAuthProvider({
      jwtSecret: 'test-secret-key-12345',
      jwtExpiry: 3600000, // 1 hour
      refreshTokenExpiry: 604800000, // 1 week
      oauth2ClientId: 'client-id',
      oauth2ClientSecret: 'client-secret',
      oauth2RedirectUri: 'http://localhost:3000/callback',
    });
  });

  it('should generate and verify JWT', () => {
    const jwt = authProvider.generateJWT({
      userId: 'user123',
      email: 'user@example.com',
      roles: ['admin'],
      permissions: ['read', 'write'],
      scope: ['profile', 'email'],
    });

    expect(jwt).toBeDefined();

    const verified = authProvider.verifyJWT(jwt);

    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('user123');
    expect(verified?.email).toBe('user@example.com');
  });

  it('should reject invalid JWT', () => {
    const invalidJwt = 'invalid.token.here';

    const verified = authProvider.verifyJWT(invalidJwt);

    expect(verified).toBeNull();
  });

  it('should create auth tokens', () => {
    const tokens = authProvider.createAuthTokens(
      'user123',
      'user@example.com',
      ['user'],
      ['read'],
      ['profile']
    );

    expect(tokens).toBeDefined();
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.tokenType).toBe('Bearer');
  });

  it('should revoke tokens', () => {
    const jwt = authProvider.generateJWT({
      userId: 'user123',
      email: 'user@example.com',
      roles: [],
      permissions: [],
      scope: [],
    });

    let verified = authProvider.verifyJWT(jwt);
    expect(verified).not.toBeNull();

    authProvider.revokeToken(jwt);

    verified = authProvider.verifyJWT(jwt);
    expect(verified).toBeNull();
  });

  it('should generate OAuth2 state', () => {
    const state = authProvider.generateOAuth2State();

    expect(state).toBeDefined();
    expect(state.stateToken).toBeDefined();
    expect(state.nonce).toBeDefined();
  });

  it('should verify OAuth2 state', () => {
    const state = authProvider.generateOAuth2State();
    const verified = authProvider.verifyOAuth2State(state.stateToken);

    expect(verified).not.toBeNull();
    expect(verified?.nonce).toBe(state.nonce);
  });

  it('should create and get sessions', () => {
    const session = authProvider.createSession('user123', 'user@example.com', ['user'], ['read']);

    expect(session).toBeDefined();
    expect(session.isActive).toBe(true);

    const retrieved = authProvider.getSession(session.sessionId);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.userId).toBe('user123');
  });

  it('should invalidate sessions', () => {
    const session = authProvider.createSession('user123', 'user@example.com');

    authProvider.invalidateSession(session.sessionId);

    const retrieved = authProvider.getSession(session.sessionId);

    expect(retrieved).toBeNull();
  });

  it('should check permissions', () => {
    const session = authProvider.createSession(
      'user123',
      'user@example.com',
      ['user'],
      ['read', 'write']
    );

    expect(authProvider.hasPermission(session, 'read')).toBe(true);
    expect(authProvider.hasPermission(session, 'delete')).toBe(false);
  });

  it('should check roles', () => {
    const session = authProvider.createSession(
      'user123',
      'user@example.com',
      ['admin', 'user'],
      []
    );

    expect(authProvider.hasRole(session, 'admin')).toBe(true);
    expect(authProvider.hasRole(session, 'moderator')).toBe(false);
    expect(authProvider.hasAnyRole(session, ['admin', 'moderator'])).toBe(true);
    expect(authProvider.hasAllRoles(session, ['admin', 'user'])).toBe(true);
  });

  it('should get active sessions count', () => {
    authProvider.createSession('user123', 'user@example.com');
    authProvider.createSession('user123', 'user@example.com');
    authProvider.createSession('user456', 'other@example.com');

    const totalSessions = authProvider.getActiveSessionsCount();
    const userSessions = authProvider.getActiveSessionsCount('user123');

    expect(totalSessions).toBe(3);
    expect(userSessions).toBe(2);
  });

  it('should cleanup expired sessions', async () => {
    authProvider.createSession('user123', 'user@example.com');

    let count = authProvider.getActiveSessionsCount();
    expect(count).toBeGreaterThan(0);

    // Cleanup should remove expired sessions
    const removed = authProvider.cleanupExpiredSessions();
    expect(typeof removed).toBe('number');
  });
});

describe('Compliance Manager', () => {
  let complianceManager: ComplianceManager;

  beforeEach(() => {
    complianceManager = createComplianceManager();
  });

  it('should register compliance rule', () => {
    const rule = StandardComplianceRules.gdprDataAccess();
    complianceManager.registerRule(rule);

    expect(rule.enabled).toBe(true);
  });

  it('should run compliance check', async () => {
    const rule = StandardComplianceRules.gdprDataAccess();
    complianceManager.registerRule(rule);

    const context = { dataAccessEndpoint: '/api/data' };
    const result = await complianceManager.runCheck(rule.id, context);

    expect(result).not.toBeNull();
    expect(result?.passed).toBe(true);
  });

  it('should detect compliance violations', async () => {
    const rule = StandardComplianceRules.gdprDataAccess();
    complianceManager.registerRule(rule);

    const context = {}; // Missing dataAccessEndpoint
    const result = await complianceManager.runCheck(rule.id, context);

    expect(result?.passed).toBe(false);
  });

  it('should run all compliance checks', async () => {
    complianceManager.registerRule(StandardComplianceRules.gdprDataAccess());
    complianceManager.registerRule(StandardComplianceRules.gdprDataDeletion());
    complianceManager.registerRule(StandardComplianceRules.hipaaEncryption());

    const context = {
      dataAccessEndpoint: '/api/data',
      dataDeletionEndpoint: '/api/data/delete',
      encryptionEnabled: true,
    };

    const report = await complianceManager.runAllChecks(context);

    expect(report).toBeDefined();
    expect(report.totalRules).toBe(3);
    expect(report.passedRules).toBe(3);
    expect(report.isCompliant).toBe(true);
  });

  it('should track compliance score', async () => {
    complianceManager.registerRule(StandardComplianceRules.gdprDataAccess());
    complianceManager.registerRule(StandardComplianceRules.hipaaEncryption());

    const context = {
      dataAccessEndpoint: '/api/data',
      encryptionEnabled: false, // Missing
    };

    const report = await complianceManager.runAllChecks(context);

    expect(report.complianceScore).toBeLessThan(100);
  });

  it('should set data retention policy', () => {
    complianceManager.setRetentionPolicy({
      dataType: 'user_data',
      retentionPeriod: 365 * 24 * 60 * 60 * 1000,
      archiveAfter: 180 * 24 * 60 * 60 * 1000,
      deleteAfter: 365 * 24 * 60 * 60 * 1000,
      anonymizeAfter: 180 * 24 * 60 * 60 * 1000,
    });

    const policy = complianceManager.getRetentionPolicy('user_data');

    expect(policy).not.toBeNull();
    expect(policy?.dataType).toBe('user_data');
  });

  it('should check if data should be deleted', () => {
    complianceManager.setRetentionPolicy({
      dataType: 'temp_data',
      retentionPeriod: 1000,
      archiveAfter: 500,
      deleteAfter: 1000,
      anonymizeAfter: 800,
    });

    const createdAt = Date.now() - 1500; // 1.5 seconds ago

    const shouldDelete = complianceManager.shouldDeleteData('temp_data', createdAt);

    expect(shouldDelete).toBe(true);
  });

  it('should log audit events', () => {
    complianceManager.logAuditEvent('user_login', { userId: 'user123' });
    complianceManager.logAuditEvent('data_access', { userId: 'user123', dataId: 'data456' });

    const log = complianceManager.getAuditLog();

    expect(log.length).toBeGreaterThanOrEqual(2);
  });

  it('should get compliance status', async () => {
    complianceManager.registerRule(StandardComplianceRules.gdprDataAccess());

    const context = { dataAccessEndpoint: '/api/data' };
    await complianceManager.runCheck('gdpr_data_access', context);

    const status = complianceManager.getComplianceStatus();

    expect(status).toBeDefined();
    expect(status.isCompliant).toBe(true);
    expect(status.complianceScore).toBeGreaterThanOrEqual(0);
  });

  it('should generate compliance certificate', async () => {
    complianceManager.registerRule(StandardComplianceRules.gdprDataAccess());
    complianceManager.registerRule(StandardComplianceRules.hipaaEncryption());

    const context = {
      dataAccessEndpoint: '/api/data',
      encryptionEnabled: true,
    };

    await complianceManager.runAllChecks(context);

    const certificate = complianceManager.generateComplianceCertificate();

    expect(certificate).toContain('Compliance Certificate');
    expect(certificate).toContain('GDPR');
    expect(certificate).toContain('HIPAA');
  });
});
