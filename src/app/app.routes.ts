import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ShopComponent } from './features/shop/shop.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { OrdersComponent } from './features/orders/orders.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
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
    title: 'Shop Curated Luxury Electronics & High-End Tech | OWEL',
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    title: 'Product Details — OWEL',
  },
  {
    path: 'cart',
    component: CartComponent,
    title: 'Shopping Bag & Member Privileges | OWEL',
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard],
    title: 'Secure Concierge Checkout | OWEL',
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard],
    title: 'Saved Wishlist & Favorite Luxury Products | OWEL',
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
    component: NotFoundComponent,
    title: '404 Page Not Found — OWEL',
  },
];
