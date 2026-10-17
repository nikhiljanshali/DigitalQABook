export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'reader' | 'editor';
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}
