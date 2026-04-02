/**
 * AUTH UTILITIES
 * ==============
 * Password hashing, JWT tokens, session management
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from './db';
import { env } from './env';

// ============================================================
// Types
// ============================================================

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================
// Validation Schemas
// ============================================================

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

// ============================================================
// Password Hashing
// ============================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================
// JWT Tokens
// ============================================================

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function createAccessToken(userId: string): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ userId, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(env.JWT_ACCESS_TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

export async function createRefreshToken(userId: string): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(env.JWT_REFRESH_TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

export async function verifyToken(token: string): Promise<{
  userId: string;
  type: 'access' | 'refresh';
} | null> {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret);
    return verified.payload as any;
  } catch {
    return null;
  }
}

// ============================================================
// Session Management
// ============================================================

export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await createAccessToken(userId);
  const refreshToken = await createRefreshToken(userId);

  const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000 // 30 minutes
  );
  const refreshExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  );

  await prisma.session.create({
    data: {
      userId,
      token: accessToken,
      refreshToken,
      expiresAt,
      refreshExpiresAt,
      ipAddress,
      userAgent,
    },
  });

  return { accessToken, refreshToken };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

// ============================================================
// User Auth
// ============================================================

export async function loginUser(
  email: string,
  password: string,
  ipAddress: string,
  userAgent: string
): Promise<{ user: AuthUser; tokens: AuthTokens } | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return null;
  }

  const passwordMatch = await verifyPassword(password, user.passwordHash);
  if (!passwordMatch) {
    return null;
  }

  const { accessToken, refreshToken } = await createSession(
    user.id,
    ipAddress,
    userAgent
  );

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 30 * 60, // 30 minutes in seconds
    },
  };
}

export async function signupUser(
  email: string,
  password: string,
  name: string,
  ipAddress: string,
  userAgent: string
): Promise<{ user: AuthUser; tokens: AuthTokens } | null> {
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return null;
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'user',
      isActive: true,
    },
  });

  const { accessToken, refreshToken } = await createSession(
    user.id,
    ipAddress,
    userAgent
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'user',
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 30 * 60,
    },
  };
}

export async function getUserFromToken(
  token: string
): Promise<AuthUser | null> {
  const verified = await verifyToken(token);
  if (!verified || verified.type !== 'access') {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };
}

// ============================================================
// Password Reset
// ============================================================

/**
 * Generate a password reset token and store it in the database
 * Token expires in 1 hour
 */
export async function generatePasswordResetToken(
  email: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return null;
  }

  // Generate a random token (32 chars)
  const token = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    },
  });

  return token;
}

/**
 * Validate a password reset token and reset the password
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ user: AuthUser } | null> {
  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });

  if (!user || !user.isActive) {
    return null;
  }

  // Check if token expired
  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return null;
  }

  // Update password and clear reset token
  const passwordHash = await hashPassword(newPassword);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return {
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role as UserRole,
    },
  };
}
