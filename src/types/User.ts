export type UserRole = 'customer' | 'restaurant' | 'admin';

export interface User {
  name?: string;
  phone: string;
  email?: string;

  role: UserRole;
  isActive: boolean;

  profileImage?: string;
  fcmToken?: string;
  lastLogin?: string;

  otp?: string;
  otpExpiry?: string;
  otpAttempts: number;

  createdAt: string;
  updatedAt: string;
}