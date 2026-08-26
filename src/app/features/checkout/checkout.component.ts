import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../core/stores/cart.store';
import { AuthStore } from '../../core/stores/auth.store';
import { OrdersStore } from '../../core/stores/orders.store';
import { ToastService } from '../../core/services/toast.service';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImageUrlPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartStore = inject(CartStore);
  authStore = inject(AuthStore);
  ordersStore = inject(OrdersStore);
  private toast = inject(ToastService);
  private router = inject(Router);

  recipientName = signal('Sarah Ahmed');
  phone = signal('01112345678');
  country = signal('Egypt');
  city = signal('Cairo');
  streetAddress = signal('Smart Village, Building B12');
  paymentMethod = signal<'cash' | 'card'>('cash');

  ngOnInit() {
    this.cartStore.loadCart();
    const u = this.authStore.user();
    if (u) {
      this.recipientName.set(u.fullName || `${u.firstName} ${u.lastName}`);
      if (u.addresses && u.addresses.length > 0) {
        const def = u.addresses.find((a) => a.isDefault) || u.addresses[0];
        this.country.set(def.country || 'Egypt');
        this.city.set(def.city || 'Cairo');
        this.streetAddress.set(`${def.street}, ${def.building}`);
      }
    }
  }

  handlePlaceOrder() {
    if (!this.phone() || !this.streetAddress()) {
      this.toast.error('Please provide phone number and delivery address', 'Validation Error');
      return;
    }

    let phoneVal = this.phone().trim();
    if (phoneVal.startsWith('01')) {
      phoneVal = '+20' + phoneVal.substring(1);
    } else if (!phoneVal.startsWith('+')) {
      phoneVal = '+20' + phoneVal;
    }

    const address = `${this.streetAddress()}, ${this.city()}, ${this.country()}`;
    const couponCode = this.cartStore.appliedCoupon()?.code;

    this.ordersStore.createOrder({
      coupon: couponCode,
      phone: phoneVal,
      address: address,
      paymentMethod: this.paymentMethod(),
    });
  }
}
