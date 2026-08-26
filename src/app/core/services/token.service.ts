import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private accessTokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  private roleSignal = signal<'user' | 'admin' | null>(null);

  readonly accessToken = computed(() => this.accessTokenSignal());
  readonly refreshToken = computed(() => this.refreshTokenSignal());
  readonly role = computed(() => this.roleSignal());
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal() || !!this.refreshTokenSignal());
  readonly isAdmin = computed(() => this.roleSignal() === 'admin');

  constructor() {
    if (this.isBrowser) {
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      const role = localStorage.getItem('user_role') as 'user' | 'admin' | null;

      if (access) this.accessTokenSignal.set(access);
      if (refresh) this.refreshTokenSignal.set(refresh);
      if (role) this.roleSignal.set(role);
    }
  }

  setTokens(accessToken: string, refreshToken?: string, role?: 'user' | 'admin') {
    this.accessTokenSignal.set(accessToken);
    if (this.isBrowser) {
      localStorage.setItem('access_token', accessToken);
    }

    if (refreshToken) {
      this.refreshTokenSignal.set(refreshToken);
      if (this.isBrowser) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
    if (role) {
      this.roleSignal.set(role);
      if (this.isBrowser) {
        localStorage.setItem('user_role', role);
      }
    }
  }

  setAccessToken(token: string) {
    this.accessTokenSignal.set(token);
    if (this.isBrowser) {
      localStorage.setItem('access_token', token);
    }
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  getRole(): 'user' | 'admin' {
    return this.roleSignal() || 'user';
  }

  getAuthHeader(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return `${this.getRole()} ${token}`;
  }

  getRefreshAuthHeader(): string | null {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;
    return `${this.getRole()} ${refresh}`;
  }

  hasRefreshToken(): boolean {
    return !!this.refreshTokenSignal();
  }

  clear() {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.roleSignal.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
    }
  }
}
