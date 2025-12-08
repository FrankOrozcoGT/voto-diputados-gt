import type { AuthSession } from '../models/User';

export interface IAuthRepository {
  signInWithGoogle(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}
