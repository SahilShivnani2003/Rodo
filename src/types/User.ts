export type UserRole = 'customer' | 'restaurant' | 'admin';

export interface User {
  _id?: string;
  name?: string;
  phone: string;
  email?: string;
  password?: string;

  role: UserRole;
  isActive?: boolean;

  profileImage?: string;
  fcmToken?: string;
  lastLogin?: string;

  otp?: string;
  otpExpiry?: string;
  otpAttempts: number;


  isEmailVerified?: boolean;
  emailOtp?: string;
  emailOtpExpiry?: Date;

  createdAt: string;
  updatedAt: string;
  _v?: number;
}