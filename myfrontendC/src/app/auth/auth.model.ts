export interface Auth{}

export interface LoginResponse {
  user: any;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}
