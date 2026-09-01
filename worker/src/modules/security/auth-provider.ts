/**
 * Auth Provider
 * OAuth2, JWT, and authentication mechanisms
 */

import crypto from 'crypto';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiry: number; // ms
  refreshTokenExpiry: number; // ms
  oauth2ClientId: string;
  oauth2ClientSecret: string;
  oauth2RedirectUri: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  scope: string[];
  iat: number; // issued at
  exp: number; // expiration
  aud: string; // audience
  sub: string; // subject
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  scope: string;
}

export interface OAuth2State {
  stateToken: string;
  nonce: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Auth Provider
 */
export class AuthProvider {
  private config: AuthConfig;
  private sessions: Map<string, AuthSession> = new Map();
  private oauth2States: Map<string, OAuth2State> = new Map();
  private tokenBlacklist: Set<string> = new Set();

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Generate JWT token
   */
  generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'aud'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + Math.floor(this.config.jwtExpiry / 1000),
      aud: 'headband-app',
      sub: payload.userId,
    };

    // JWT header
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const headerEncoded = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadEncoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

    // Sign
    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64url');

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  /**
   * Verify JWT token
   */
  verifyJWT(token: string): JWTPayload | null {
    // Check blacklist
    if (this.tokenBlacklist.has(token)) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Parse payload
    try {
      const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8')) as JWTPayload;

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create auth tokens
   */
  createAuthTokens(
    userId: string,
    email: string,
    roles: string[] = [],
    permissions: string[] = [],
    scope: string[] = []
  ): AuthToken {
    const accessToken = this.generateJWT({
      userId,
      email,
      roles,
      permissions,
      scope,
    });

    const refreshToken = this.generateRefreshToken();

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.jwtExpiry,
      tokenType: 'Bearer',
      scope: scope.join(' '),
    };
  }

  /**
   * Revoke token
   */
  revokeToken(token: string): void {
    this.tokenBlacklist.add(token);
  }

  /**
   * Generate OAuth2 state
   */
  generateOAuth2State(): OAuth2State {
    const stateToken = crypto.randomBytes(32).toString('hex');
    const nonce = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    const state: OAuth2State = {
      stateToken,
      nonce,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000, // 10 minutes
    };

    this.oauth2States.set(stateToken, state);

    return state;
  }

  /**
   * Verify OAuth2 state
   */
  verifyOAuth2State(stateToken: string): OAuth2State | null {
    const state = this.oauth2States.get(stateToken);

    if (!state) return null;

    if (Date.now() > state.expiresAt) {
      this.oauth2States.delete(stateToken);
      return null;
    }

    this.oauth2States.delete(stateToken); // One-time use
    return state;
  }

  /**
   * Create session
   */
  createSession(
    userId: string,
    email: string,
    roles: string[] = [],
    permissions: string[] = [],
    ipAddress?: string,
    userAgent?: string
  ): AuthSession {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    const session: AuthSession = {
      sessionId,
      userId,
      email,
      roles,
      permissions,
      createdAt: now,
      expiresAt: now + this.config.jwtExpiry,
      lastActivityAt: now,
      ipAddress,
      userAgent,
      isActive: true,
    };

    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Get session
   */
  getSession(sessionId: string): AuthSession | null {
    const session = this.sessions.get(sessionId);

    if (!session) return null;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Check if active
    if (!session.isActive) {
      return null;
    }

    // Update last activity
    session.lastActivityAt = Date.now();

    return session;
  }

  /**
   * Invalidate session
   */
  invalidateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) return false;

    session.isActive = false;

    return true;
  }

  /**
   * Invalidate user sessions
   */
  invalidateUserSessions(userId: string): number {
    let count = 0;

    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        session.isActive = false;
        count++;
      }
    }

    return count;
  }

  /**
   * Verify OAuth2 code
   */
  verifyOAuth2Code(
    code: string,
    state: string,
    redirectUri: string
  ): { userId: string; email: string } | null {
    // In production, this would verify with OAuth2 provider
    // For now, just validate redirect URI
    if (redirectUri !== this.config.oauth2RedirectUri) {
      return null;
    }

    // Verify state
    const oauthState = this.verifyOAuth2State(state);
    if (!oauthState) {
      return null;
    }

    // In production, exchange code for tokens with OAuth2 provider
    return {
      userId: `oauth_${Date.now()}`,
      email: 'user@oauth.provider',
    };
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(userId?: string): number {
    let count = 0;

    for (const session of this.sessions.values()) {
      if (!session.isActive) continue;
      if (Date.now() > session.expiresAt) continue;

      if (userId) {
        if (session.userId === userId) count++;
      } else {
        count++;
      }
    }

    return count;
  }

  /**
   * Get all user sessions
   */
  getUserSessions(userId: string): AuthSession[] {
    const userSessions: AuthSession[] = [];

    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.isActive && Date.now() <= session.expiresAt) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): number {
    let count = 0;
    const now = Date.now();

    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt || !session.isActive) {
        this.sessions.delete(sessionId);
        count++;
      }
    }

    return count;
  }

  /**
   * Check permission
   */
  hasPermission(session: AuthSession, permission: string): boolean {
    return session.permissions.includes(permission);
  }

  /**
   * Check role
   */
  hasRole(session: AuthSession, role: string): boolean {
    return session.roles.includes(role);
  }

  /**
   * Check any role
   */
  hasAnyRole(session: AuthSession, roles: string[]): boolean {
    return roles.some(role => session.roles.includes(role));
  }

  /**
   * Check all roles
   */
  hasAllRoles(session: AuthSession, roles: string[]): boolean {
    return roles.every(role => session.roles.includes(role));
  }
}

/**
 * Create auth provider
 */
export function createAuthProvider(config: AuthConfig): AuthProvider {
  return new AuthProvider(config);
}
