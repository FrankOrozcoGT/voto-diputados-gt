export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: 'google';
}

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: number;
}
