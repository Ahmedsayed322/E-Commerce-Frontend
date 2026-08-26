import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersStore } from '../../core/stores/orders.store';
import { AuthStore } from '../../core/stores/auth.store';
import { OrderStatus } from '../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  ordersStore = inject(OrdersStore);
  authStore = inject(AuthStore);

  ngOnInit() {
    this.ordersStore.loadOrders();
    this.authStore.loadProfile();
  }
}
