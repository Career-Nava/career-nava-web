export interface UserModel {
  userId: number;
  authUid: any;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  profilePicture?: string;
  calendlyConnected: boolean;
}
