import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models';
import { CartStore } from '../../../core/stores/cart.store';
import { WishlistStore } from '../../../core/stores/wishlist.store';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageUrlPipe],
  templateUrl: './product-card.component.html',
  host: {
    class: 'h-full flex flex-col',
  },
})
export class ProductCardComponent {
  product = input.required<Product>();

  private cartStore = inject(CartStore);
  private wishlistStore = inject(WishlistStore);
  private toast = inject(ToastService);

  isInWishlist = computed(() => {
    return this.wishlistStore.isItemInWishlist(this.product()._id);
  });

  categoryName = computed(() => {
    const cat = this.product().category;
    if (!cat) return 'General';
    return typeof cat === 'object' ? cat.name : 'Category';
  });

  addToCart(e: Event) {
    e.stopPropagation();
    if (this.product().stock <= 0) {
      this.toast.error('This product is currently out of stock', 'Sold Out');
      return;
    }
    this.cartStore.addItem(this.product()._id, 1);
  }

  toggleWishlist(e: Event) {
    e.stopPropagation();
    this.wishlistStore.toggle(this.product());
  }
}
