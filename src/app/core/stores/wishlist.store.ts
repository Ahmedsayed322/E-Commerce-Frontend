import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AuthStore } from './auth.store';
import { Product } from '../models';

export interface WishlistState {
  products: Product[];
  productIds: string[];
  loading: boolean;
}

const initialWishlistState: WishlistState = {
  products: [],
  productIds: [],
  loading: false,
};

export const WishlistStore = signalStore(
  { providedIn: 'root' },
  withState(initialWishlistState),
  withComputed((store) => ({
    count: computed(() => store.products().length),
    isEmpty: computed(() => store.products().length === 0),
  })),
  withMethods((store, api = inject(ApiService), toast = inject(ToastService), auth = inject(AuthStore)) => ({
    async loadWishlist() {
      if (!auth.isAuthenticated()) return;
      patchState(store, { loading: true });
      try {
        const res = await api.getMyWishlist().toPromise();
        let products: any[] = [];
        if (Array.isArray((res as any)?.products)) {
          products = (res as any).products;
        } else if (Array.isArray((res as any)?.wishlist?.products)) {
          products = (res as any).wishlist.products;
        } else if (res?.data && Array.isArray((res.data as any).wishlist?.products)) {
          products = (res.data as any).wishlist.products;
        } else if (res?.data && Array.isArray((res.data as any).products)) {
          products = (res.data as any).products;
        } else if (Array.isArray(res?.data)) {
          products = res.data;
        }

        const productDocs = products.map((p) => (typeof p === 'object' && p !== null ? p : { _id: p }));
        const productIds = productDocs.map((p) => p._id);

        patchState(store, { products: productDocs, productIds, loading: false });
      } catch (err: any) {
        patchState(store, { loading: false });
      }
    },
    async toggle(product: Product) {
      if (!auth.isAuthenticated()) {
        auth.openAuthModal('signin');
        toast.info('Please sign in to save items to your wishlist.', 'Sign In Required');
        return;
      }

      const isCurrentlyIn = store.productIds().includes(product._id);
      // Optimistic update
      if (isCurrentlyIn) {
        patchState(store, {
          products: store.products().filter((p) => p._id !== product._id),
          productIds: store.productIds().filter((id) => id !== product._id),
        });
        toast.info(`Removed ${product.title.slice(0, 25)}... from wishlist`, 'Wishlist');
      } else {
        patchState(store, {
          products: [...store.products(), product],
          productIds: [...store.productIds(), product._id],
        });
        toast.success(`Added ${product.title.slice(0, 25)}... to wishlist!`, 'Wishlist');
      }

      try {
        await api.toggleWishlist(product._id).toPromise();
      } catch (err: any) {
        // Revert on error
        await this.loadWishlist();
        toast.error('Failed to update wishlist', 'Error');
      }
    },
    isItemInWishlist(productId: string): boolean {
      return store.productIds().includes(productId);
    },
    clearWishlist() {
      patchState(store, {
        products: [],
        productIds: [],
        loading: false,
      });
    },
  }))
);
