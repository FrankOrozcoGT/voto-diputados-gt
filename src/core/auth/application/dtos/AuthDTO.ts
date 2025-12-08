export interface AuthDTO {
  user: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
  accessToken: string;
  expiresAt: number;
}
