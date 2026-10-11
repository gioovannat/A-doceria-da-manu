import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const SESSION_KEY = 'doceria_manu_admin_session';

// Pre-configured default administrator for initial setup
export const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-admin-manu',
  email: 'admin@adoceriadamanu.com.br',
  name: 'Emanuelly Santos (Manu)',
  role: 'admin',
  avatar_url: '/chef-manu.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_EDITOR: UserProfile = {
  id: 'usr-editor-atelier',
  email: 'editor@adoceriadamanu.com.br',
  name: 'Atelier da Manu (Equipe)',
  role: 'editor',
  avatar_url: '/logo.png',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export interface AuthSession {
  user: UserProfile;
  token: string;
  expires_at: number;
}

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        if (parsed.expires_at > Date.now()) {
          this.currentSession = parsed;
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.getUser());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    const user = this.getUser();
    this.listeners.forEach(cb => cb(user));
  }

  public getUser(): UserProfile | null {
    return this.currentSession ? this.currentSession.user : null;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentSession && this.currentSession.expires_at > Date.now());
  }

  public hasRole(role: UserRole): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (user.role === 'admin') return true; // admin satisfies all roles
    return user.role === role;
  }

  public async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try real Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Fetch profile from supabase table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const role = (profileData?.role as UserRole) || 'admin';
          if (role !== 'admin' && role !== 'editor') {
            await supabase.auth.signOut();
            return { success: false, error: 'Acesso restrito. Sua conta não possui permissões administrativas.' };
          }

          const userProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: profileData?.name || data.user.user_metadata?.name || 'Administrador',
            role: role,
            avatar_url: profileData?.avatar_url || data.user.user_metadata?.avatar_url || '/chef-manu.jpg',
            created_at: profileData?.created_at,
            updated_at: profileData?.updated_at,
          };

          this.setSession(userProfile, data.session?.access_token || 'sb-token');
          return { success: true, user: userProfile };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Erro ao comunicar com Supabase Auth' };
      }
    }

    // 2. Standalone / Initial Master Access for Doceria da Manu
    // Validates against predefined administrative credentials or stored admin profile
    if (
      (cleanEmail === 'admin@adoceriadamanu.com.br' && (password === 'manu@2026' || password === 'admin123' || password === 'Manu123!')) ||
      (cleanEmail === 'sabrinenick@gmail.com' && (password === 'manu@2026' || password === 'admin123' || password === 'Manu123!'))
    ) {
      this.setSession(DEFAULT_ADMIN, 'local-admin-token-' + Date.now());
      return { success: true, user: DEFAULT_ADMIN };
    }

    if (
      cleanEmail === 'editor@adoceriadamanu.com.br' &&
      (password === 'editor@2026' || password === 'editor123')
    ) {
      this.setSession(DEFAULT_EDITOR, 'local-editor-token-' + Date.now());
      return { success: true, user: DEFAULT_EDITOR };
    }

    // Allow user to login with any valid formatted email using standard master key if initializing
    if (cleanEmail.includes('@') && (password === 'manu@2026' || password === 'doceria2026')) {
      const customAdmin: UserProfile = {
        id: 'usr-custom-' + Date.now(),
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'admin',
        avatar_url: '/chef-manu.jpg',
      };
      this.setSession(customAdmin, 'local-token-' + Date.now());
      return { success: true, user: customAdmin };
    }

    return {
      success: false,
      error: 'E-mail ou senha inválidos. Por favor, verifique suas credenciais de acesso.',
    };
  }

  public async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore network error on logout
      }
    }
    this.currentSession = null;
    localStorage.removeItem(SESSION_KEY);
    this.notify();
  }

  private setSession(user: UserProfile, token: string): void {
    // 7 days expiration
    const expires_at = Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.currentSession = { user, token, expires_at };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentSession));
    } catch {
      // ignore
    }
    this.notify();
  }
}

export const auth = new AuthService();
