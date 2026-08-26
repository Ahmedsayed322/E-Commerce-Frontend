import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AuthStore } from './auth.store';
import { Cart, Coupon } from '../models';

export interface CartState {
  cart: Cart | null;
  appliedCoupon: Coupon | null;
  loading: boolean;
  isDrawerOpen: boolean;
  couponCodeInput: string;
  isApplyingCoupon: boolean;
}

const initialCartState: CartState = {
  cart: null,
  appliedCoupon: null,
  loading: false,
  isDrawerOpen: false,
  couponCodeInput: '',
  isApplyingCoupon: false,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialCartState),
  withComputed((store) => ({
    itemCount: computed(() => {
      const c = store.cart();
      if (!c || !c.products) return 0;
      return c.products.reduce((sum, item) => sum + item.quantity, 0);
    }),
    subtotal: computed(() => {
      const c = store.cart();
      if (!c || !c.products) return 0;
      return c.products.reduce((sum, item) => {
        const p = item.product;
        const price = item.finalPrice || (p ? (p.priceAfterDiscount ?? p.price) : 0);
        return sum + price * item.quantity;
      }, 0);
    }),
    discountAmount: computed(() => {
      const coupon = store.appliedCoupon();
      const subtotal = store.cart()?.products?.reduce((sum, item) => {
        const p = item.product;
        const price = item.finalPrice || (p ? (p.priceAfterDiscount ?? p.price) : 0);
        return sum + price * item.quantity;
      }, 0) || 0;

      if (!coupon) return 0;
      return (subtotal * coupon.amount) / 100;
    }),
    finalTotal: computed(() => {
      const sub = store.cart()?.products?.reduce((sum, item) => {
        const p = item.product;
        const price = item.finalPrice || (p ? (p.priceAfterDiscount ?? p.price) : 0);
        return sum + price * item.quantity;
      }, 0) || 0;

      const coupon = store.appliedCoupon();
      if (!coupon) return sub;
      const disc = (sub * coupon.amount) / 100;
      return Math.max(0, sub - disc);
    }),
    isCartDrawerOpen: computed(() => store.isDrawerOpen()),
  })),
  withMethods((store, api = inject(ApiService), toast = inject(ToastService), auth = inject(AuthStore)) => ({
    openDrawer() {
      patchState(store, { isDrawerOpen: true });
    },
    closeDrawer() {
      patchState(store, { isDrawerOpen: false });
    },
    toggleDrawer() {
      patchState(store, { isDrawerOpen: !store.isDrawerOpen() });
    },
    setCouponInput(code: string) {
      patchState(store, { couponCodeInput: code });
    },
    async loadCart() {
      if (!auth.isAuthenticated()) return;
      patchState(store, { loading: true });
      try {
        const res = await api.getMyCart().toPromise();
        let cart: Cart | null = null;
        if ((res as any)?.cart) {
          cart = (res as any).cart;
        } else if ((res as any)?.products) {
          cart = res as any;
        } else if (res?.data && (res.data as any).cart) {
          cart = (res.data as any).cart;
        } else if (res?.data && (res.data as any).products) {
          cart = res.data as any;
        }
        patchState(store, { cart, loading: false });
      } catch (err: any) {
        patchState(store, { loading: false });
      }
    },
    async addItem(productId: string, quantity = 1) {
      if (!auth.isAuthenticated()) {
        auth.openAuthModal('signin');
        toast.info('Please sign in to add products to your cart.', 'Sign In Required');
        return;
      }
      patchState(store, { loading: true });
      try {
        const res = await api.addToCart(productId, quantity).toPromise();
        let cart: Cart | null = null;
        if ((res as any)?.cart) {
          cart = (res as any).cart;
        } else if (res?.data && (res.data as any).cart) {
          cart = (res.data as any).cart;
        } else if (res?.data) {
          cart = res.data as any;
        }
        if (cart) {
          patchState(store, { cart, loading: false });
        } else {
          await this.loadCart();
        }
        toast.success('Product added to your cart!', 'Cart Updated');
        this.openDrawer();
      } catch (err: any) {
        patchState(store, { loading: false });
        toast.error(err.error?.message || 'Failed to add item to cart', 'Error');
      }
    },
    async adjustQuantity(productId: string | undefined, quantity: number) {
      if (!productId) return;
      if (quantity < 1) {
        await this.removeItem(productId);
        return;
      }
      try {
        const res = await api.adjustCartQuantity(productId, quantity).toPromise();
        let cart: Cart | null = null;
        if ((res as any)?.cart) {
          cart = (res as any).cart;
        } else if (res?.data && (res.data as any).cart) {
          cart = (res.data as any).cart;
        } else if (res?.data) {
          cart = res.data as any;
        }
        if (cart) {
          patchState(store, { cart });
        } else {
          await this.loadCart();
        }
      } catch (err: any) {
        toast.error(err.error?.message || 'Failed to update quantity', 'Error');
      }
    },
    async removeItem(productId: string | undefined) {
      if (!productId) return;
      try {
        const res = await api.removeFromCart(productId).toPromise();
        let cart: Cart | null = null;
        if ((res as any)?.cart) {
          cart = (res as any).cart;
        } else if (res?.data && (res.data as any).cart) {
          cart = (res.data as any).cart;
        }
        if (cart) {
          patchState(store, { cart });
        } else {
          await this.loadCart();
        }
        toast.info('Item removed from cart', 'Cart Updated');
      } catch (err: any) {
        toast.error(err.error?.message || 'Failed to remove item', 'Error');
      }
    },
    async applyCoupon(code: string) {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return;
      patchState(store, { isApplyingCoupon: true });
      try {
        const res = await api.checkCoupon(cleanCode).toPromise();
        let coupon: Coupon | null = null;
        const raw = res as any;
        if (raw?.coupon) {
          coupon = raw.coupon;
        } else if (raw?.data?.coupon) {
          coupon = raw.data.coupon;
        } else if (raw?._id) {
          coupon = raw;
        } else if (raw?.data?._id) {
          coupon = raw.data;
        }

        if (coupon) {
          patchState(store, { appliedCoupon: coupon, isApplyingCoupon: false, couponCodeInput: cleanCode });
          toast.success(`Coupon ${cleanCode} applied! (${coupon.amount}% OFF)`, 'Discount Applied');
        } else {
          patchState(store, { isApplyingCoupon: false });
          toast.error('Invalid or expired coupon code', 'Coupon Error');
        }
      } catch (err: any) {
        patchState(store, { isApplyingCoupon: false });
        toast.error(err.error?.message || 'Invalid or expired coupon code', 'Coupon Error');
      }
    },
    removeCoupon() {
      patchState(store, { appliedCoupon: null, couponCodeInput: '' });
      toast.info('Coupon discount removed', 'Cart Updated');
    },
    clearCart() {
      patchState(store, {
        cart: store.cart() ? { ...store.cart()!, products: [] } : null,
        appliedCoupon: null,
      });
    },
    resetCart() {
      patchState(store, {
        cart: null,
        appliedCoupon: null,
        couponCodeInput: '',
        isDrawerOpen: false,
        loading: false,
      });
    },
  }))
);
