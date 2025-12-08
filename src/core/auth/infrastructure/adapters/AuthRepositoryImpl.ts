import { supabase } from '@/lib/supabase';
import type { IAuthRepository } from '../../domain/ports/IAuthRepository';
import type { AuthSession } from '../../domain/models/User';

export class AuthRepositoryImpl implements IAuthRepository {
  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata.full_name,
        avatarUrl: session.user.user_metadata.avatar_url,
        provider: 'google',
      },
      accessToken: session.access_token,
      expiresAt: session.expires_at || 0,
    };
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }
}
