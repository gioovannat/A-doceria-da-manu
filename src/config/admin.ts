/**
 * Centralized Administrative Path Configuration
 * 
 * To change the base path in production without altering code:
 * Set VITE_ADMIN_BASE_PATH=/central-manu or any custom path in .env.
 * 
 * Security Notice:
 * Non-standard paths are purely complementary. 
 * Real security is enforced via authenticated sessions, JWT validation, and RBAC roles.
 */

// Strip any trailing slash for consistent route composition
const envAdminPath = (import.meta.env.VITE_ADMIN_BASE_PATH as string | undefined)?.replace(/\/+$/, '');

export const ADMIN_BASE_PATH = envAdminPath || '/atelier-gestao';

export const ADMIN_ROUTES = {
  BASE: ADMIN_BASE_PATH,
  LOGIN: `${ADMIN_BASE_PATH}/acesso`,
  DASHBOARD: `${ADMIN_BASE_PATH}`,
  HOME: `${ADMIN_BASE_PATH}/inicio`,
  PRODUCTS: `${ADMIN_BASE_PATH}/produtos`,
  SPECIALTIES: `${ADMIN_BASE_PATH}/especialidades`,
  COURSES: `${ADMIN_BASE_PATH}/cursos`,
  CHEF: `${ADMIN_BASE_PATH}/sobre`,
  HOURS: `${ADMIN_BASE_PATH}/horarios`,
  POLICIES: `${ADMIN_BASE_PATH}/politicas`,
  FAQ: `${ADMIN_BASE_PATH}/duvidas`,
  ORDERS: `${ADMIN_BASE_PATH}/pedidos`,
  SETTINGS: `${ADMIN_BASE_PATH}/configuracoes`,
} as const;

export function isAdminRoute(pathname: string): boolean {
  return pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`);
}

export function isLoginRoute(pathname: string): boolean {
  return pathname === ADMIN_ROUTES.LOGIN;
}
