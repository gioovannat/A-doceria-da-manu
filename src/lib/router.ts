import { ADMIN_BASE_PATH, ADMIN_ROUTES, isAdminRoute, isLoginRoute } from '../config/admin';
import { auth } from './auth';

class RouterService {
  private currentPath: string;
  private listeners: Array<(path: string) => void> = [];

  constructor() {
    this.currentPath = window.location.pathname || '/';
    window.addEventListener('popstate', () => {
      this.handlePathChange(window.location.pathname);
    });
  }

  public getPath(): string {
    return this.currentPath;
  }

  public navigate(path: string, replace = false): void {
    if (this.currentPath === path) return;

    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }

    this.handlePathChange(path);
  }

  private handlePathChange(rawPath: string): void {
    let targetPath = rawPath || '/';

    // Route Protection Guard
    if (isAdminRoute(targetPath)) {
      const isLogin = isLoginRoute(targetPath);
      const isAuth = auth.isAuthenticated();

      if (!isAuth && !isLogin) {
        // Unauthenticated access blocked -> redirect to login
        this.navigate(ADMIN_ROUTES.LOGIN, true);
        return;
      }

      if (isAuth && isLogin) {
        // Already authenticated -> redirect to dashboard
        this.navigate(ADMIN_ROUTES.DASHBOARD, true);
        return;
      }
    }

    this.currentPath = targetPath;
    this.notify();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public subscribe(callback: (path: string) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentPath);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb(this.currentPath));
  }
}

export const router = new RouterService();
