import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';
import { AuthStore } from './core/stores/auth.store';
import { CartStore } from './core/stores/cart.store';
import { WishlistStore } from './core/stores/wishlist.store';
import { CategoryBrandStore } from './core/stores/category-brand.store';
import { ProductsStore } from './core/stores/products.store';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    ToastContainerComponent,
    AuthModalComponent,
    CartDrawerComponent,
    ChatbotComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authStore = inject(AuthStore);
  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private categoryBrandStore = inject(CategoryBrandStore);
  private productsStore = inject(ProductsStore);
  private seoService = inject(SeoService);

  ngOnInit() {
    this.seoService.init();
    this.categoryBrandStore.init();
    this.productsStore.loadProducts();
    if (this.authStore.isAuthenticated()) {
      this.authStore.loadProfile();
      this.cartStore.loadCart();
      this.wishlistStore.loadWishlist();
    }
  }
}
