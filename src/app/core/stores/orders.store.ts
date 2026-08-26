import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AuthStore } from './auth.store';
import { CartStore } from './cart.store';
import { Order, OrderStatus } from '../models';
import { Router } from '@angular/router';

export interface OrdersState {
  orders: Order[];
  activeOrder: Order | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialOrdersState: OrdersState = {
  orders: [],
  activeOrder: null,
  loading: false,
  submitting: false,
  error: null,
};

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState(initialOrdersState),
  withComputed((store) => ({
    pendingOrders: computed(() => store.orders().filter((o) => o.status === OrderStatus.PENDING)),
    deliveredOrders: computed(() => store.orders().filter((o) => o.status === OrderStatus.DELIVERED)),
    totalSpent: computed(() => store.orders().reduce((sum, o) => sum + (o.totalPrice || 0), 0)),
  })),
  withMethods(
    (
      store,
      api = inject(ApiService),
      toast = inject(ToastService),
      auth = inject(AuthStore),
      cart = inject(CartStore),
      router = inject(Router)
    ) => ({
      async loadOrders() {
        if (!auth.isAuthenticated()) return;
        patchState(store, { loading: true, error: null });
        try {
          const res = await api.getOrders().toPromise();
          let orders: Order[] = [];
          const raw = res as any;

          if (Array.isArray(raw)) {
            orders = raw;
          } else if (Array.isArray(raw?.orders?.data)) {
            orders = raw.orders.data;
          } else if (Array.isArray(raw?.Orders?.data)) {
            orders = raw.Orders.data;
          } else if (Array.isArray(raw?.orders)) {
            orders = raw.orders;
          } else if (Array.isArray(raw?.Orders)) {
            orders = raw.Orders;
          } else if (Array.isArray(raw?.data?.orders?.data)) {
            orders = raw.data.orders.data;
          } else if (Array.isArray(raw?.data?.orders)) {
            orders = raw.data.orders;
          } else if (Array.isArray(raw?.data)) {
            orders = raw.data;
          }
          patchState(store, { orders, loading: false });
        } catch (err: any) {
          patchState(store, { loading: false, error: err.message });
        }
      },
      async createOrder(data: { coupon?: string; phone: string; address: string; paymentMethod: string }) {
        patchState(store, { submitting: true, error: null });
        try {
          const res = await api.createOrder(data).toPromise();
          let createdOrder: Order | null = null;
          const raw = res as any;

          if (raw?.order?._id) {
            createdOrder = raw.order;
          } else if (raw?._id) {
            createdOrder = raw;
          } else if (raw?.data?.order?._id) {
            createdOrder = raw.data.order;
          } else if (raw?.data?._id) {
            createdOrder = raw.data;
          }

          patchState(store, { submitting: false });
          toast.success('Order placed successfully!', 'Order Confirmed');
          cart.clearCart();

          // If paymentMethod is CARD, trigger pay/:id to get Paymob checkout URL
          if (data.paymentMethod === 'card' && createdOrder?._id) {
            try {
              const payRes = await api.payOrder(createdOrder._id).toPromise();
              const payRaw = payRes as any;
              const link = payRaw?.paymentLink || payRaw?.data?.paymentLink || payRaw?.paymentUrl || payRaw?.data?.paymentUrl;
              if (link && typeof link === 'string') {
                window.location.href = link;
                return;
              }
            } catch (payErr: any) {
              toast.error(payErr.error?.message || 'Payment gateway initiation failed', 'Payment Error');
            }
          }

          router.navigate(['/orders']);
        } catch (err: any) {
          patchState(store, { submitting: false, error: err.message });
          toast.error(err.error?.message || 'Failed to place order', 'Order Error');
        }
      },
      async payExistingOrder(orderId: string) {
        try {
          const payRes = await api.payOrder(orderId).toPromise();
          const payRaw = payRes as any;
          const link = payRaw?.paymentLink || payRaw?.data?.paymentLink || payRaw?.paymentUrl || payRaw?.data?.paymentUrl;
          if (link && typeof link === 'string') {
            window.location.href = link;
          } else {
            toast.error('Unable to retrieve payment checkout URL', 'Payment Error');
          }
        } catch (err: any) {
          toast.error(err.error?.message || 'Failed to initiate payment', 'Payment Error');
        }
      },
      async refundOrder(orderId: string) {
        try {
          await api.refundOrder(orderId).toPromise();
          toast.success('Order marked for refund successfully', 'Refund Initiated');
          await this.loadOrders();
        } catch (err: any) {
          toast.error(err.error?.message || 'Failed to refund order', 'Refund Error');
        }
      },
      async updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
        try {
          const res = await api.updateOrderStatus(orderId, { status, paymentStatus }).toPromise();
          const raw = res as any;
          const updatedOrder: Order = raw?.order || raw?.data?.order || raw;
          if (updatedOrder && updatedOrder._id) {
            patchState(store, {
              orders: store.orders().map((o) => (o._id === orderId ? { ...o, ...updatedOrder } : o)),
            });
            return updatedOrder;
          }
          await this.loadOrders();
          return store.orders().find((o) => o._id === orderId) || null;
        } catch (err: any) {
          toast.error(err.error?.message || 'Failed to update order status', 'Error');
          throw err;
        }
      },
    })
  )
);
