import bcrypt from 'bcryptjs';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { users, sessions } from '@shared/schema';
import type { User, LoginData, RegisterData } from '@shared/schema';

export class AuthService {
  // Generate random token
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Generate reset token
  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Register user
  async register(data: RegisterData): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('Email já está sendo usado');
    }

    const existingUsername = await db.select().from(users).where(eq(users.username, data.username)).limit(1);
    if (existingUsername.length > 0) {
      throw new Error('Nome de usuário já está sendo usado');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const [user] = await db.insert(users).values({
      ...data,
      password: hashedPassword,
    }).returning();

    // Create session
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // Login user
  async login(data: LoginData): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou senha incorretos');
    }

    // Create new session
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(sessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // Logout user
  async logout(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  // Get user by token
  async getUserByToken(token: string): Promise<Omit<User, 'password'> | null> {
    const [session] = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .where(and(
        eq(sessions.token, token),
      ))
      .limit(1);

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.delete(sessions).where(eq(sessions.token, token));
      return null;
    }

    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<string> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new Error('Email não encontrado');
    }

    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.id, user.id));

    return resetToken;
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const [user] = await db.select().from(users).where(
      and(
        eq(users.resetToken, token),
      )
    ).limit(1);

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new Error('Token de reset inválido ou expirado');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await db.update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    // Invalidate all sessions for this user
    await db.delete(sessions).where(eq(sessions.userId, user.id));
  }

  // Middleware to authenticate requests
  async authenticateRequest(authHeader?: string): Promise<Omit<User, 'password'> | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return this.getUserByToken(token);
  }
}

export const authService = new AuthService();