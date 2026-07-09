export interface UserModel {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  calendlyConnected: boolean;
  profilePicture?: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  calendlyConnected: boolean;
  googleLinked: boolean;
  profilePicture?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserProfileRequest {
  fullName: string;
  profilePicture?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SetupPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface UserSecurityStatus {
  googleLinked: boolean;
  hasLocalPassword: boolean;
  canChangePassword: boolean;
  canSetupPassword: boolean;
  canLinkGoogle: boolean;
  canUnlinkGoogle: boolean;
  passwordChangeBlockedReason?: string | null;
  passwordSetupBlockedReason?: string | null;
  googleLinkBlockedReason?: string | null;
  googleUnlinkBlockedReason?: string | null;
}
