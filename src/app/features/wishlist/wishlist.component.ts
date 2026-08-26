import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
  wishlistStore = inject(WishlistStore);

  ngOnInit() {
    this.wishlistStore.loadWishlist();
  }
}
