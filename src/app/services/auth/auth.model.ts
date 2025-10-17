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
  idToken: string; // Google credential token
}


export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    token: string;
    user: UserModel;
  };
}
