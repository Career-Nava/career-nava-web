import { UserModel } from "../user/user.model";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

// Auth payload returned by API
export interface AuthPayload {
  token: string;
  user: UserModel;
}
