export type UserRole = 'admin' | 'editor';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export type AtelierStatus = 
  | 'aberto' 
  | 'fechado' 
  | 'somente_encomendas' 
  | 'agenda_lotada' 
  | 'pronta_entrega';

export interface SiteSettings {
  company_name: string;
  short_name: string;
  instagram: string;
  instagram_handle: string;
  whatsapp_number: string;
  whatsapp_display: string;
  whatsapp_default_message: string;
  email: string;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  area_served: string[];
  institutional_text: string;
  copyright: string;
  atelier_status: AtelierStatus;
  status_custom_message: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    og_title: string;
    og_description: string;
    og_image: string;
    canonical: string;
  };
}

export interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
  active: boolean;
}

export interface HeroStat {
  id: string;
  number: string;
  label: string;
}

export interface FeaturedCake {
  active: boolean;
  title: string;
  badge: string;
  description: string;
  price_display: string;
  image: string;
  cta_text: string;
}

export interface HomeContent {
  logo_url: string;
  logo_alt: string;
  hero_top_badge: string;
  hero_title: string;
  hero_highlight_text: string;
  hero_subtitle: string;
  hero_main_image: string;
  hero_mobile_image?: string;
  hero_cta_text: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  hero_animation_active: boolean;
  hero_stats: HeroStat[];
  featured_cake: FeaturedCake;
}

export interface SpecialtyItem {
  id: string;
  category: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  serves: string;
  badge: string;
  seoTag: string;
  startingPrice: string;
  highlights: string[];
  sort_order: number;
  active: boolean;
  featured: boolean;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image?: string;
  lead_time: string;
  active: boolean;
}

export interface CakeBatter {
  id: string;
  name: string;
  description?: string;
  additional_price?: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** Conteúdo exclusivo do cartão público do cardápio. */
  card_subtitle?: string;
  card_tag?: string;
  card_highlights?: string[];
  short_description?: string;
  full_description: string;
  category: string;
  main_image: string;
  gallery: string[];
  starting_price: number;
  starting_price_display: string;
  unit: string;
  minimum_notice: string;
  badge: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
  requires_batter?: boolean;
  min_flavors?: number;
  max_flavors?: number;
  min_addons?: number;
  batters?: CakeBatter[];
  variations?: ProductVariation[];
  flavors?: Flavor[];
  packaging?: PackagingOption[];
  addons?: Addon[];
}

export interface Flavor {
  id: string;
  name: string;
  description: string;
  additional_price: number;
  category?: string;
  active: boolean;
}

export interface PackagingOption {
  id: string;
  name: string;
  description: string;
  additional_price: number;
  image?: string;
  is_required: boolean;
  active: boolean;
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image?: string;
  active: boolean;
}

export interface ChefProfile {
  name: string;
  role: string;
  photo: string;
  bio: string;
  main_story: string[];
  highlight_quote: string;
  instagram: string;
  experience_years: string;
  coverage_region: string;
  checkpoints: string[];
}

export interface Course {
  id: string;
  title: string;
  badge: string;
  image: string;
  description: string;
  price: string;
  benefits: string[];
  platform: string;
  checkout_link: string;
  active: boolean;
  sort_order: number;
}

export interface BusinessHours {
  weekday: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  day_label: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

export interface PickupWindow {
  id: string;
  label: string;
  time_range: string;
  active: boolean;
}

export interface CancellationRule {
  id: string;
  days_range: string;
  rule_title: string;
  description: string;
  badge_color: 'green' | 'amber' | 'rose';
}

export interface Policies {
  cancellation_rules: CancellationRule[];
  care_guidelines: string[];
  transport_guidelines: string[];
  order_notice: string;
  payment_terms: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
}

export interface OrderEvent {
  id: string;
  created_at: string;
  customer_name?: string;
  product_name: string;
  batter?: string;
  variation?: string;
  quantity?: string;
  flavors: string[];
  packaging?: string;
  addons: string[];
  date: string;
  delivery_type: string;
  location?: string;
  notes?: string;
  inspiration_photo?: string;
  estimated_total: number;
  formatted_message: string;
}

export interface AppDatabase {
  settings: SiteSettings;
  home: HomeContent;
  benefits: BenefitItem[];
  specialties: SpecialtyItem[];
  products: Product[];
  variations: ProductVariation[];
  flavors: Flavor[];
  packaging: PackagingOption[];
  addons: Addon[];
  chef: ChefProfile;
  courses: Course[];
  business_hours: BusinessHours[];
  pickup_windows: PickupWindow[];
  policies: Policies;
  faqs: FAQItem[];
  orders: OrderEvent[];
  updated_at: string;
  published_at?: string;
  published_by?: string;
}
