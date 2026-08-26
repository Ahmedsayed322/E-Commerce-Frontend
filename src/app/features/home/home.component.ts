import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsStore } from '../../core/stores/products.store';
import { CategoryBrandStore } from '../../core/stores/category-brand.store';
import { CartStore } from '../../core/stores/cart.store';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, ImageUrlPipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  productsStore = inject(ProductsStore);
  categoryBrandStore = inject(CategoryBrandStore);
  cartStore = inject(CartStore);

  activeHeroIndex = signal<number>(0);

  heroProducts = computed<Product[]>(() => {
    const list = this.productsStore.products();
    if (!list || list.length === 0) return [];
    return list.slice(0, 4);
  });

  currentHeroProduct = computed<Product | null>(() => {
    const list = this.heroProducts();
    if (list.length === 0) return null;
    const idx = this.activeHeroIndex();
    return list[idx < list.length ? idx : 0];
  });

  ngOnInit() {
    this.categoryBrandStore.init();
    this.productsStore.loadProducts();
  }

  setHeroIndex(index: number) {
    this.activeHeroIndex.set(index);
  }

  handleHeroAddToBag(product: Product | null) {
    if (product) {
      if (product.stock <= 0) return;
      this.cartStore.addItem(product._id, 1);
    }
  }
}
