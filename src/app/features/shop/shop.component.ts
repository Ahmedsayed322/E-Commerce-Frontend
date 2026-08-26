import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsStore } from '../../core/stores/products.store';
import { CategoryBrandStore } from '../../core/stores/category-brand.store';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './shop.component.html',
})
export class ShopComponent implements OnInit {
  productsStore = inject(ProductsStore);
  categoryBrandStore = inject(CategoryBrandStore);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.categoryBrandStore.init();
    this.productsStore.loadProducts();
    this.productsStore.syncWithQueryParams(this.route.queryParams);
  }
}
