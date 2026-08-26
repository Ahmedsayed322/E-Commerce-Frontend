import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { map, filter } from 'rxjs';
import { ProductsStore } from '../../core/stores/products.store';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { AuthStore } from '../../core/stores/auth.store';
import { ReviewStore } from '../../core/stores/review.store';
import { ToastService } from '../../core/services/toast.service';
import { Review } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent, ImageUrlPipe],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  productsStore = inject(ProductsStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);
  authStore = inject(AuthStore);
  reviewStore = inject(ReviewStore);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);

  activeImage = signal<string | null>(null);
  quantity = signal(1);
  newRating = signal(0);
  newComment = signal('');

  readonly productId$ = this.route.paramMap.pipe(
    map((params) => params.get('id')),
    filter((id): id is string => Boolean(id)),
  );

  constructor() {
    effect(() => {
      const prod = this.productsStore.activeProduct();
      if (prod) {
        this.seoService.setProductSeo(prod);
      }
    });
  }

  ngOnInit() {
    this.productsStore.loadProductById(this.productId$);
    this.reviewStore.loadReviews(this.productId$);
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  increaseQty(stock: number) {
    if (this.quantity() < stock) {
      this.quantity.update((q) => q + 1);
    }
  }

  addToCart(productId: string) {
    const prod = this.productsStore.activeProduct();
    if (prod && prod.stock <= 0) {
      this.toast.error('This product is currently out of stock', 'Sold Out');
      return;
    }
    this.cartStore.addItem(productId, this.quantity());
  }

  async buyNow(productId: string) {
    const prod = this.productsStore.activeProduct();
    if (prod && prod.stock <= 0) {
      this.toast.error('This product is currently out of stock', 'Sold Out');
      return;
    }
    await this.cartStore.addItem(productId, this.quantity());
    this.router.navigate(['/checkout']);
  }

  setRating(rating: number) {
    this.newRating.set(rating);
  }

  submitReview() {
    if (!this.authStore.isAuthenticated()) {
      this.authStore.openAuthModal('signin');
      return;
    }

    const prod = this.productsStore.activeProduct();
    if (!prod) return;

    this.reviewStore.submitReview({
      productId: prod._id,
      rate: this.newRating(),
      comment: this.newComment().trim() || undefined,
    });
    this.newComment.set('');
    this.newRating.set(0);
  }

  deleteReview(reviewId: string) {
    const prod = this.productsStore.activeProduct();
    if (!prod) return;
    if (confirm('Are you sure you want to remove this review?')) {
      this.reviewStore.deleteReview({ reviewId, productId: prod._id });
    }
  }

  getReviewerName(review: Review): string {
    const u = review.user as any;
    if (typeof u === 'object' && u !== null) {
      if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
      if (u.fullName) return u.fullName;
      if (u.email) return u.email.split('@')[0];
    }
    return 'Verified Patron';
  }

  canDeleteReview(review: Review): boolean {
    if (this.authStore.isAdmin()) return true;
    const currentUserId = this.authStore.user()?._id;
    if (!currentUserId) return false;
    const revUserId = typeof review.user === 'object' ? (review.user as any)?._id : review.user;
    return revUserId === currentUserId;
  }
}
