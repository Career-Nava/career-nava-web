export interface UserModel {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  calendlyConnected: boolean;
  googleId?: string;
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
