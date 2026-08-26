import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { OrdersComponent } from './features/orders/orders.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'OWEL — Premium Curated E-Commerce',
  },
  {
    path: 'shop',
    component: ShopComponent,
    title: 'Shop Catalog — OWEL',
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: 'Product Details — OWEL',
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Shopping Bag — OWEL',
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard],
    title: 'Checkout & Shipping — OWEL',
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard],
    title: 'Saved Wishlist — OWEL',
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [authGuard],
    title: 'My Orders & Receipts — OWEL',
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    title: 'Admin Control Center — OWEL',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
