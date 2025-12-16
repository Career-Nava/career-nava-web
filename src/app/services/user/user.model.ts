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
