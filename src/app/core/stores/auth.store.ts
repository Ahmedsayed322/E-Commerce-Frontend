import { computed, inject, Injector } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { TokenService } from '../services/token.service';
import { User } from '../models';
import { Router } from '@angular/router';
import { CartStore } from './cart.store';
import { WishlistStore } from './wishlist.store';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
}

const initialAuthState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'signin',
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withComputed((store, tokenService = inject(TokenService)) => ({
    token: computed(() => tokenService.accessToken()),
    role: computed(() => tokenService.role()),
    isAuthenticated: computed(() => tokenService.isAuthenticated()),
    isAdmin: computed(() => tokenService.isAdmin()),
    displayName: computed(() => {
      const u = store.user();
      if (!u) return 'Guest';
      return u.fullName || `${u.firstName} ${u.lastName}`.trim();
    }),
    userFullName: computed(() => {
      const u = store.user();
      if (!u) return 'Guest';
      return u.fullName || `${u.firstName} ${u.lastName}`.trim();
    }),
    initials: computed(() => {
      const u = store.user();
      if (!u) return 'G';
      return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'U';
    }),
    userInitials: computed(() => {
      const u = store.user();
      if (!u) return 'G';
      return `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'U';
    }),
  })),
  withMethods((
    store,
    api = inject(ApiService),
    tokenService = inject(TokenService),
    toast = inject(ToastService),
    router = inject(Router),
    injector = inject(Injector)
  ) => ({
    openAuthModal(mode: 'signin' | 'signup' = 'signin') {
      patchState(store, { isAuthModalOpen: true, authModalMode: mode, error: null });
    },
    closeAuthModal() {
      patchState(store, { isAuthModalOpen: false, error: null });
    },
    setAuthModalMode(mode: 'signin' | 'signup') {
      patchState(store, { authModalMode: mode, error: null });
    },
    async signin(credentials: { email: string; password: string }) {
      patchState(store, { loading: true, error: null });
      try {
        const res = await api.signin(credentials).toPromise();
        const token = (res as any)?.accessToken || (res as any)?.data?.accessToken;
        const refreshToken = (res as any)?.refreshToken || (res as any)?.data?.refreshToken;
        if (token) {
          const role = credentials.email.toLowerCase().includes('admin') ? 'admin' : 'user';
          tokenService.setTokens(token, refreshToken, role);

          patchState(store, {
            loading: false,
            isAuthModalOpen: false,
          });

          toast.success(`Welcome back! Logged in as ${role}.`, 'Sign In Successful');
          await this.loadProfile();

          // Sync user cart and wishlist
          try {
            const cartStore = injector.get(CartStore);
            cartStore.loadCart();
          } catch {}
          try {
            const wishlistStore = injector.get(WishlistStore);
            wishlistStore.loadWishlist();
          } catch {}
        } else {
          throw new Error(res?.message || 'Login failed');
        }
      } catch (err: any) {
        const msg = err.error?.message || err.message || 'Invalid credentials';
        patchState(store, { loading: false, error: msg });
        toast.error(msg, 'Sign In Error');
      }
    },
    setToken(token: string) {
      tokenService.setAccessToken(token);
    },
    async signup(data: {
      email: string;
      password: string;
      cPassword?: string;
      firstName: string;
      lastName: string;
      phone: string;
      gender: 'male' | 'female';
    }) {
      patchState(store, { loading: true, error: null });
      try {
        await api.signup({
          ...data,
          cPassword: data.cPassword || data.password,
        }).toPromise();
        patchState(store, { loading: false });
        toast.success('Account created successfully! Please sign in.', 'Registration Complete');
        this.setAuthModalMode('signin');
      } catch (err: any) {
        const msg = err.error?.message || err.message || 'Registration failed';
        patchState(store, { loading: false, error: msg });
        toast.error(msg, 'Sign Up Error');
      }
    },
    async loadProfile() {
      if (!tokenService.isAuthenticated()) return;
      try {
        const res = await api.getProfile().toPromise();
        const user = (res as any)?.user || (res as any)?.data?.user;
        if (user) {
          const role = user.role || tokenService.getRole() || 'user';
          tokenService.setTokens(tokenService.getAccessToken() || '', tokenService.getRefreshToken() || undefined, role);
          patchState(store, { user });
        }
      } catch (err) {
        // Token might be expired or refresh in progress
      }
    },
    logout() {
      tokenService.clear();
      patchState(store, {
        user: null,
      });

      // Clear & reset active Cart and Wishlist on logout
      try {
        const cartStore = injector.get(CartStore);
        cartStore.resetCart();
      } catch {}

      try {
        const wishlistStore = injector.get(WishlistStore);
        wishlistStore.clearWishlist();
      } catch {}

      toast.info('You have been signed out.', 'Goodbye');
      router.navigate(['/']);
    },
  }))
);
