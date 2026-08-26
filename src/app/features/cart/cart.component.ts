import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../core/stores/cart.store';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageUrlPipe],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartStore = inject(CartStore);

  couponCode = signal('');

  ngOnInit() {
    this.cartStore.loadCart();
  }

  async applyCoupon() {
    const code = this.couponCode().trim();
    if (!code) return;
    await this.cartStore.applyCoupon(code);
    if (this.cartStore.appliedCoupon()) {
      this.couponCode.set('');
    }
  }
}
