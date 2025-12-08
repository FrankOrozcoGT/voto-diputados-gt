import type { IAuthRepository } from '../../infrastructure/adapters/AuthRepositoryImpl';
import type { AuthDTO } from '../dtos/AuthDTO';

export class AuthOrchestrator {
  constructor(private repository: IAuthRepository) {}

  async executeGoogleLogin(): Promise<void> {
    await this.repository.signInWithGoogle();
  }

  async handleCallback(): Promise<AuthDTO> {
    const session = await this.repository.handleCallback();
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
      },
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    };
  }

  async getCurrentSession(): Promise<AuthDTO | null> {
    const session = await this.repository.getCurrentSession();
    if (!session) return null;

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
      },
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    };
  }

  async executeLogout(): Promise<void> {
    await this.repository.signOut();
  }
}
