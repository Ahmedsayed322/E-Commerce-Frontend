import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { AuthStore } from '../../../core/stores/auth.store';
import { CartStore } from '../../../core/stores/cart.store';
import { WishlistStore } from '../../../core/stores/wishlist.store';
import { CategoryBrandStore } from '../../../core/stores/category-brand.store';
import { ProductsStore } from '../../../core/stores/products.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  authStore = inject(AuthStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);
  categoryBrandStore = inject(CategoryBrandStore);
  productsStore = inject(ProductsStore);
  router = inject(Router);

  searchQuery = signal('');
  isUserMenuOpen = signal(false);

  private readonly navEnd$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event) => event.urlAfterRedirects || event.url),
  );

  readonly currentUrl = toSignal(this.navEnd$, {
    initialValue: this.router.url,
  });

  isAdminRoute = computed(() => (this.currentUrl() || '').includes('/admin'));

  onSearch() {
    const q = this.searchQuery().trim();
    this.productsStore.setSearch(q);
    this.router.navigate(['/shop']);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.productsStore.setSearch('');
  }
}
