import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RawQueryService } from '../../database/raw-query.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: RawQueryService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Map role string to uppercase
    const roleMap: Record<string, string> = {
      student: 'STUDENT',
      teacher: 'TEACHER',
      counselor: 'COUNSELOR',
      parent: 'PARENT',
      admin: 'ADMIN',
    };
    const role = dto.role ? roleMap[dto.role.toLowerCase()] : 'STUDENT';

    // Check if user exists
    const existing = await this.db.queryOne(
      'SELECT id FROM users WHERE email = $1',
      [dto.email],
    );
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const userId = uuidv4();

    // Create user
    await this.db.execute(
      `INSERT INTO users (id, email, name, "passwordHash", role, "isActive", "isVerified", locale, "createdAt")
       VALUES ($1, $2, $3, $4, $5, true, true, $6, NOW())`,
      [userId, dto.email, dto.name, passwordHash, role, dto.locale || 'id'],
    );

    // Initialize gamification for students
    if (role === 'STUDENT') {
      await this.db.execute(
        `INSERT INTO gamification (id, "userId", xp, coins, level, "createdAt")
         VALUES ($1, $2, 0, 0, 1, NOW())`,
        [uuidv4(), userId],
      );
    }

    // Get user for response
    const user = await this.db.queryOne(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [userId],
    );

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Log activity
    await this.db.execute(
      `INSERT INTO activity_logs ("userId", action, resource, "createdAt")
       VALUES ($1, $2, $3, NOW())`,
      [userId, 'register', 'auth'],
    );

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne(
      'SELECT id, email, name, role, "passwordHash", "isActive", "deletedAt" FROM users WHERE email = $1',
      [dto.email],
    );

    console.log('🔍 Login attempt:', { email: dto.email, userFound: !!user, deletedAt: user?.deletedAt });

    if (!user || user.deletedAt) {
      console.log('❌ User not found or deleted');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('🔐 Comparing password:', { email: dto.email, passwordLength: dto.password.length, hashLength: user.passwordHash?.length, hashStart: user.passwordHash?.substring(0, 20) });

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    console.log('✓ Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.db.execute(
      'UPDATE users SET "lastLoginAt" = NOW(), "updatedAt" = NOW() WHERE id = $1',
      [user.id],
    );

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Log activity
    await this.db.execute(
      `INSERT INTO activity_logs ("userId", action, resource, "createdAt")
       VALUES ($1, $2, $3, NOW())`,
      [user.id, 'login', 'auth'],
    );

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    // Find the refresh token
    const storedToken = await this.db.queryOne(
      `SELECT rt.id, rt."userId", rt.revoked, rt."expiresAt", u.id as user_id, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON rt."userId" = u.id
       WHERE rt.token = $1`,
      [dto.refreshToken],
    );

    if (
      !storedToken ||
      storedToken.revoked ||
      new Date(storedToken.expiresAt) < new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.db.execute(
      'UPDATE refresh_tokens SET revoked = true WHERE id = $1',
      [storedToken.id],
    );

    // Generate new tokens
    const tokens = await this.generateTokens(
      storedToken.user_id,
      storedToken.email,
      storedToken.role,
    );

    return tokens;
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for user
    await this.db.execute(
      'UPDATE refresh_tokens SET revoked = true WHERE "userId" = $1 AND revoked = false',
      [userId],
    );

    await this.db.execute(
      `INSERT INTO activity_logs ("userId", action, resource, "createdAt")
       VALUES ($1, $2, $3, NOW())`,
      [userId, 'logout', 'auth'],
    );

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.db.queryOne(
      'SELECT id, email, name, role, "isActive", "createdAt" FROM users WHERE id = $1',
      [userId],
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  // ─── PRIVATE HELPERS ──────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = uuidv4();
    const refreshExpiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    const expiresAt = new Date(Date.now() + refreshExpiresIn);

    // Store refresh token
    await this.db.execute(
      `INSERT INTO refresh_tokens (id, token, "userId", "expiresAt", revoked, "createdAt")
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [uuidv4(), refreshToken, userId, expiresAt],
    );

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, deletedAt, ...sanitized } = user;
    return sanitized;
  }
}
