import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Voucher code generation function has been removed

// Calculate review score average
export function calculateReviewScore(scores: number[]): number {
  const sum = scores.reduce((a, b) => a + b, 0);
  return Number((sum / scores.length).toFixed(2));
}

// Calculate curator points based on product category
export function calculateCuratorPoints(category: string): number {
  const pointsMap: Record<string, number> = {
    'ebook': 300,
    'ecourse': 300,
    'resep_masakan': 200,
    'jasa_design': 200,
    'software': 200,
  };
  return pointsMap[category] || 200;
}

// Calculate seller points based on action
export function calculateSellerPoints(action: 'submit' | 'approved' | 'rejected'): number {
  const pointsMap: Record<string, number> = {
    'submit': 2,
    'approved': 10,
    'rejected': 5,
  };
  return pointsMap[action] || 0;
}

// Check if review score passes minimum threshold
export function isReviewScorePassing(averageScore: number): boolean {
  return averageScore >= 2.8;
}
