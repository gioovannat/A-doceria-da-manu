import { AppDatabase, OrderEvent } from '../types';
import { INITIAL_DATABASE } from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';

const DRAFT_STORAGE_KEY = 'doceria_manu_db_draft_v1';
const PUBLISHED_STORAGE_KEY = 'doceria_manu_db_published_v1';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

class StoreService {
  private draftData: AppDatabase;
  private publishedData: AppDatabase;
  private listeners: Array<() => void> = [];
  private saveStatus: SaveStatus = 'idle';
  private errorMessage: string | null = null;
  private hasUnsavedDraft: boolean = false;
  private hasStaffDraftSubscription = false;

  constructor() {
    this.publishedData = this.loadFromStorage(PUBLISHED_STORAGE_KEY, INITIAL_DATABASE);
    this.draftData = this.loadFromStorage(DRAFT_STORAGE_KEY, this.publishedData);
    this.initStorageSync();
    this.initSupabaseSync();
  }

  /**
   * Mantém o painel de visitante atualizado quando a gestão publica alterações
   * em outra aba ou janela do mesmo navegador.
   */
  private initStorageSync(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key !== PUBLISHED_STORAGE_KEY || !event.newValue) return;

      try {
        this.publishedData = this.loadFromStorage(PUBLISHED_STORAGE_KEY, INITIAL_DATABASE);
        this.notify();
      } catch (error) {
        console.warn('Não foi possível atualizar o conteúdo publicado:', error);
      }
    });
  }

  private loadFromStorage(key: string, fallback: AppDatabase): AppDatabase {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // 1. Process specialties: a category can contain many catalog items.
        const rawSpecialties: any[] = Array.isArray(parsed.specialties)
          ? parsed.specialties
          : fallback.specialties;
        
        const dedupedSpecialties: any[] = [];
        for (const spec of rawSpecialties) {
          const existingIndex = dedupedSpecialties.findIndex(
            (s) => s.id === spec.id || (s.slug && spec.slug && s.slug === spec.slug)
          );
          if (existingIndex >= 0) {
            dedupedSpecialties[existingIndex] = { ...dedupedSpecialties[existingIndex], ...spec };
          } else {
            dedupedSpecialties.push(spec);
          }
        }
        if (!Array.isArray(parsed.specialties)) {
          for (const fs of fallback.specialties) {
            const exists = dedupedSpecialties.some((s) => s.id === fs.id || (s.slug && fs.slug && s.slug === fs.slug));
            if (!exists) dedupedSpecialties.push(fs);
          }
        }

        // 2. Products are unique by identity, never by category: a category may
        // contain several products (for example, Petit and Bolo Redondo).
        const rawProducts: any[] = Array.isArray(parsed.products)
          ? parsed.products
          : fallback.products;

        const dedupedProducts: any[] = [];
        for (const prod of rawProducts) {
          const existingIndex = dedupedProducts.findIndex((p) => {
            if (p.id === prod.id) return true;
            if (p.slug && prod.slug && p.slug === prod.slug) return true;
            if (p.name && prod.name && p.name.trim().toLowerCase() === prod.name.trim().toLowerCase()) return true;
            return false;
          });

          const fallbackProd = fallback.products.find(
            (fp) => fp.id === prod.id || (fp.slug && prod.slug && fp.slug === prod.slug)
          );

          const fullProd = {
            ...prod,
            batters: Array.isArray(prod.batters) ? prod.batters : (fallbackProd?.batters || []),
            variations: Array.isArray(prod.variations) ? prod.variations : (fallbackProd?.variations || []),
            flavors: Array.isArray(prod.flavors) ? prod.flavors : (fallbackProd?.flavors || []),
            packaging: Array.isArray(prod.packaging) ? prod.packaging : (fallbackProd?.packaging || []),
            addons: Array.isArray(prod.addons) ? prod.addons : (fallbackProd?.addons || []),
          };

          if (existingIndex >= 0) {
            const ex = dedupedProducts[existingIndex];
            dedupedProducts[existingIndex] = {
              ...ex,
              ...fullProd,
              batters: Array.isArray(prod.batters) ? prod.batters : (ex.batters || fullProd.batters),
              variations: Array.isArray(prod.variations) ? prod.variations : (ex.variations || fullProd.variations),
              flavors: Array.isArray(prod.flavors) ? prod.flavors : (ex.flavors || fullProd.flavors),
              packaging: Array.isArray(prod.packaging) ? prod.packaging : (ex.packaging || fullProd.packaging),
              addons: Array.isArray(prod.addons) ? prod.addons : (ex.addons || fullProd.addons),
            };
          } else {
            dedupedProducts.push(fullProd);
          }
        }

        if (!Array.isArray(parsed.products)) {
          for (const fp of fallback.products) {
            const exists = dedupedProducts.some(
              (p) => p.id === fp.id || (p.slug && fp.slug && p.slug === fp.slug)
            );
            if (!exists) dedupedProducts.push(fp);
          }
        }

        // Legacy specialty records enrich their matching product only.
        for (const spec of dedupedSpecialties) {
          const prodIndex = dedupedProducts.findIndex(
            (p) => p.id === spec.id || (p.slug && spec.slug && p.slug === spec.slug)
          );
          if (prodIndex >= 0) {
            const product = dedupedProducts[prodIndex];
            dedupedProducts[prodIndex] = {
              ...product,
              name: product.name || spec.title,
              card_subtitle: product.card_subtitle || spec.subtitle,
              card_tag: product.card_tag || spec.seoTag,
              card_highlights: Array.isArray(product.card_highlights) ? product.card_highlights : (spec.highlights || []),
            };
          }
        }

        const resolved: AppDatabase = {
          ...fallback,
          ...parsed,
          specialties: dedupedSpecialties,
          products: dedupedProducts,
          settings: { ...fallback.settings, ...(parsed.settings || {}) },
          home: { ...fallback.home, ...(parsed.home || {}) },
          chef: { ...fallback.chef, ...(parsed.chef || {}) },
          policies: { ...fallback.policies, ...(parsed.policies || {}) },
        };

        // Cache clean, deduplicated version
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // ignore
        }

        return resolved;
      }
    } catch (e) {
      console.warn(`Failed to parse ${key} from storage:`, e);
    }
    return JSON.parse(JSON.stringify(fallback));
  }

  private saveToStorage(key: string, data: AppDatabase): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key} to storage:`, e);
    }
  }

  private async initSupabaseSync(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const loadDraftForStaff = async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;

      const { data } = await client
        .from('site_content')
        .select('content')
        .eq('id', 'draft_main')
        .maybeSingle();

      if (!data?.content) return;
      this.draftData = data.content as AppDatabase;
      this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);
      this.notify();

      if (this.hasStaffDraftSubscription) return;
      this.hasStaffDraftSubscription = true;
      client.channel('site-content-draft-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'id=eq.draft_main' }, (payload) => {
          const changed = payload.new as { content?: AppDatabase };
          if (!changed.content) return;
          this.draftData = changed.content;
          this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);
          this.notify();
        })
        .subscribe();
    };

    try {
      const { data, error } = await client
        .from('site_content')
        .select('content')
        .eq('id', 'published_main')
        .single();

      if (!error && data?.content) {
        this.publishedData = data.content as AppDatabase;
        this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);
        this.notify();
      }
      await loadDraftForStaff();

      // Every device receives published changes immediately; staff receive the
      // shared draft through a separate RLS-protected subscription above.
      client.channel('site-content-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content', filter: 'id=eq.published_main' }, (payload) => {
          const changed = payload.new as { content?: AppDatabase };
          if (!changed.content) return;
          this.publishedData = changed.content;
          this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);
          this.notify();
        })
        .subscribe();

      client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') void loadDraftForStaff();
      });
    } catch {
      // Supabase table might not exist yet; schema.sql is provided for setup
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  // Public website uses published data
  public getPublished(): AppDatabase {
    return this.publishedData;
  }

  // Admin panel views and edits draft data
  public getDraft(): AppDatabase {
    return this.draftData;
  }

  public getSaveStatus(): SaveStatus {
    return this.saveStatus;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public hasPendingPublish(): boolean {
    // Returns true if draft differs from published
    return JSON.stringify(this.draftData) !== JSON.stringify(this.publishedData);
  }

  public setSaveStatus(status: SaveStatus, error: string | null = null): void {
    this.saveStatus = status;
    this.errorMessage = error;
    this.notify();
  }

  /**
   * Save changes to Draft without touching the public site
   */
  public async saveDraft(updater: (current: AppDatabase) => AppDatabase): Promise<boolean> {
    this.setSaveStatus('saving');
    try {
      const updated = updater(JSON.parse(JSON.stringify(this.draftData)));
      updated.updated_at = new Date().toISOString();
      this.draftData = updated;
      this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);

      // If connected to Supabase, also sync to draft table
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('site_content').upsert({
          id: 'draft_main',
          content: this.draftData,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }

      this.setSaveStatus('saved');
      this.notify();
      return true;
    } catch (err: any) {
      this.setSaveStatus('error', err.message || 'Falha ao salvar rascunho.');
      return false;
    }
  }

  /**
   * Save and immediately publish so changes reflect on the visitor page
   */
  public async saveAndPublish(updater: (current: AppDatabase) => AppDatabase, authorName: string = 'Administrador'): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const updated = updater(JSON.parse(JSON.stringify(this.draftData)));
      updated.updated_at = now;
      updated.published_at = now;
      updated.published_by = authorName;

      this.draftData = JSON.parse(JSON.stringify(updated));
      this.publishedData = JSON.parse(JSON.stringify(updated));

      this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);
      this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);

      if (isSupabaseConfigured && supabase) {
        const { error: publishError } = await supabase.from('site_content').upsert({
          id: 'published_main',
          content: this.publishedData,
          published_at: now,
          published_by: authorName,
        });
        if (publishError) throw publishError;
        const { error: draftError } = await supabase.from('site_content').upsert({
          id: 'draft_main',
          content: this.draftData,
          updated_at: now,
        });
        if (draftError) throw draftError;
      }

      this.setSaveStatus('saved');
      this.notify();
      return true;
    } catch (err: any) {
      this.setSaveStatus('error', err.message || 'Falha ao salvar e publicar.');
      return false;
    }
  }

  /**
   * Publish the current draft to the public live website
   */
  public async publishDraft(authorName: string = 'Administrador'): Promise<boolean> {
    this.setSaveStatus('saving');
    try {
      const now = new Date().toISOString();
      const publishedVersion: AppDatabase = {
        ...JSON.parse(JSON.stringify(this.draftData)),
        published_at: now,
        published_by: authorName,
        updated_at: now,
      };

      this.publishedData = publishedVersion;
      this.draftData = JSON.parse(JSON.stringify(publishedVersion));

      this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);
      this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);

      // If Supabase is connected, write to published_main
      if (isSupabaseConfigured && supabase) {
        const { error: publishError } = await supabase.from('site_content').upsert({
          id: 'published_main',
          content: this.publishedData,
          published_at: now,
          published_by: authorName,
        });
        if (publishError) throw publishError;

        // Also record publish history log
        const { error: historyError } = await supabase.from('publish_history').insert({
          published_by: authorName,
          created_at: now,
          summary: 'Publicação completa do catálogo e conteúdo do site',
        });
        if (historyError) throw historyError;
      }

      this.setSaveStatus('saved');
      this.notify();
      return true;
    } catch (err: any) {
      this.setSaveStatus('error', err.message || 'Falha ao publicar no site.');
      return false;
    }
  }

  /**
   * Discard draft and revert to published version
   */
  public discardDraft(): void {
    this.draftData = JSON.parse(JSON.stringify(this.publishedData));
    this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);
    this.setSaveStatus('idle');
    this.notify();
  }

  /**
   * Reset all data to the pristine initial state
   */
  public resetToFactory(): void {
    this.publishedData = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.draftData = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);
    this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);
    this.setSaveStatus('idle');
    this.notify();
  }

  /**
   * Record new customer order attempt from the website simulator
   */
  public recordOrder(order: Omit<OrderEvent, 'id' | 'created_at'>): OrderEvent {
    const newOrder: OrderEvent = {
      ...order,
      id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
    };

    this.draftData.orders = [newOrder, ...this.draftData.orders];
    this.publishedData.orders = [newOrder, ...this.publishedData.orders];
    this.saveToStorage(DRAFT_STORAGE_KEY, this.draftData);
    this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);
    this.notify();

    // Public quote telemetry is sent through the Vercel function. The browser
    // never receives a privileged key and the endpoint applies rate limits.
    void fetch('/api/orders', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(newOrder),
    }).catch(() => undefined);

    return newOrder;
  }
}

export const store = new StoreService();
