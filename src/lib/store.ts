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

  constructor() {
    this.publishedData = this.loadFromStorage(PUBLISHED_STORAGE_KEY, INITIAL_DATABASE);
    this.draftData = this.loadFromStorage(DRAFT_STORAGE_KEY, this.publishedData);
    this.initSupabaseSync();
  }

  private loadFromStorage(key: string, fallback: AppDatabase): AppDatabase {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure products have their sub-arrays if migrating from earlier schema
        const mergedProducts = (parsed.products || fallback.products).map((p: any) => {
          const fallbackProd = fallback.products.find((fp) => fp.id === p.id);
          return {
            ...p,
            batters: p.batters && p.batters.length > 0 ? p.batters : (fallbackProd?.batters || []),
            variations: p.variations && p.variations.length > 0 ? p.variations : (fallbackProd?.variations || []),
            flavors: p.flavors && p.flavors.length > 0 ? p.flavors : (fallbackProd?.flavors || []),
            packaging: p.packaging && p.packaging.length > 0 ? p.packaging : (fallbackProd?.packaging || []),
            addons: p.addons && p.addons.length > 0 ? p.addons : (fallbackProd?.addons || []),
          };
        });

        return {
          ...fallback,
          ...parsed,
          products: mergedProducts,
          settings: { ...fallback.settings, ...(parsed.settings || {}) },
          home: { ...fallback.home, ...(parsed.home || {}) },
          chef: { ...fallback.chef, ...(parsed.chef || {}) },
          policies: { ...fallback.policies, ...(parsed.policies || {}) },
        };
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
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 'published_main')
        .single();

      if (!error && data?.content) {
        this.publishedData = data.content;
        this.saveToStorage(PUBLISHED_STORAGE_KEY, this.publishedData);
        this.notify();
      }
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
        await supabase.from('site_content').upsert({
          id: 'draft_main',
          content: this.draftData,
          updated_at: new Date().toISOString(),
        });
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
        await supabase.from('site_content').upsert({
          id: 'published_main',
          content: this.publishedData,
          published_at: now,
          published_by: authorName,
        });

        // Also record publish history log
        await supabase.from('publish_history').insert({
          published_by: authorName,
          created_at: now,
          summary: 'Publicação completa do catálogo e conteúdo do site',
        });
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

    if (isSupabaseConfigured && supabase) {
      supabase.from('order_events').insert(newOrder).then();
    }

    return newOrder;
  }
}

export const store = new StoreService();
