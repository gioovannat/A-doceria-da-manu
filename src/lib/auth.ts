import { UserProfile, UserRole } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    void this.restoreSession();
    supabase?.auth.onAuthStateChange(() => { void this.restoreSession(); });
  }

  private async restoreSession(): Promise<void> {
    if (!supabase) return this.setUser(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this.setUser(null);
    const { data: profile } = await supabase.from('profiles')
      .select('id, email, name, role, avatar_url, created_at, updated_at')
      .eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      await supabase.auth.signOut();
      return this.setUser(null);
    }
    this.setUser(profile as UserProfile);
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => { this.listeners = this.listeners.filter((item) => item !== callback); };
  }

  private setUser(user: UserProfile | null): void {
    this.currentUser = user;
    this.listeners.forEach((callback) => callback(user));
  }

  public getUser(): UserProfile | null { return this.currentUser; }
  public isAuthenticated(): boolean { return Boolean(this.currentUser); }
  public hasRole(role: UserRole): boolean {
    return Boolean(this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === role));
  }

  public async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'O painel ainda não foi conectado ao Supabase. Configure as variáveis de ambiente.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return { success: false, error: error?.message || 'Não foi possível iniciar a sessão.' };
    const { data: profile } = await supabase.from('profiles')
      .select('id, email, name, role, avatar_url, created_at, updated_at')
      .eq('id', data.user.id).maybeSingle();
    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      await supabase.auth.signOut();
      return { success: false, error: 'Esta conta não possui acesso ao painel.' };
    }
    const user = profile as UserProfile;
    this.setUser(user);
    return { success: true, user };
  }

  public async signOut(): Promise<void> {
    await supabase?.auth.signOut();
    this.setUser(null);
  }

  public async updateCurrentProfile(updates: { name: string; avatar_url: string | null }): Promise<{ success: boolean; error?: string }> {
    if (!supabase) return { success: false, error: 'O painel ainda não foi conectado ao Supabase.' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Sua sessão expirou. Entre novamente para continuar.' };

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ name: updates.name, avatar_url: updates.avatar_url })
      .eq('id', user.id)
      .select('id, email, name, role, avatar_url, created_at, updated_at')
      .single();

    if (error || !profile) return { success: false, error: error?.message || 'Não foi possível atualizar o perfil.' };
    this.setUser(profile as UserProfile);
    return { success: true };
  }
}

export const auth = new AuthService();
