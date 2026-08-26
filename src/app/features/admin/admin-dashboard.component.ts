import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsStore } from '../../core/stores/products.store';
import { CategoryBrandStore } from '../../core/stores/category-brand.store';
import { OrdersStore } from '../../core/stores/orders.store';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, Category, Brand, Coupon, Order } from '../../core/models';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageUrlPipe],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  productsStore = inject(ProductsStore);
  categoryBrandStore = inject(CategoryBrandStore);
  ordersStore = inject(OrdersStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);

  activeTab = signal<'products' | 'orders' | 'categories' | 'brands' | 'coupons'>('products');
  coupons = signal<Coupon[]>([]);
  isSubmitting = signal(false);

  // Order Details Modal Signal
  selectedOrder = signal<Order | null>(null);
  isOrderDetailsModalOpen = signal(false);

  // Product Form Signals
  isCreateProductModalOpen = signal(false);
  editingProductId = signal<string | null>(null);
  prodFormTitle = signal('');
  prodFormPrice = signal(0);
  prodFormDiscount = signal(0);
  prodFormStock = signal(10);
  prodFormCategory = signal('');
  prodFormBrand = signal('');
  prodFormDesc = signal('');
  selectedProductFile: File | null = null;
  selectedSubFiles = signal<File[]>([]);

  // Category Form Signals
  isCategoryModalOpen = signal(false);
  editingCategoryId = signal<string | null>(null);
  catFormName = signal('');
  selectedCatFile: File | null = null;

  // Brand Form Signals
  isBrandModalOpen = signal(false);
  editingBrandId = signal<string | null>(null);
  brandFormName = signal('');
  brandFormDesc = signal('');
  selectedBrandFile: File | null = null;

  // Coupon Form Signals
  isCreateCouponModalOpen = signal(false);
  newCouponAmount = signal(20);
  newCouponStartDate = signal(new Date().toISOString().split('T')[0]);
  newCouponEndDate = signal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  totalRevenue = computed(() => {
    return this.ordersStore.orders().reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);
  });

  ngOnInit() {
    this.productsStore.loadProducts();
    this.categoryBrandStore.init();
    this.ordersStore.loadOrders();
    this.loadCoupons();
  }

  async loadCoupons() {
    try {
      const res = await this.api.getCoupons().toPromise();
      const raw = res as any;
      let list: Coupon[] = [];
      if (Array.isArray(raw?.coupons?.data)) list = raw.coupons.data;
      else if (Array.isArray(raw?.coupons)) list = raw.coupons;
      else if (Array.isArray(raw?.data)) list = raw.data;
      this.coupons.set(list);
    } catch {}
  }

  // --- PRODUCT HANDLERS ---
  openCreateProductModal() {
    this.editingProductId.set(null);
    this.prodFormTitle.set('');
    this.prodFormPrice.set(100);
    this.prodFormDiscount.set(0);
    this.prodFormStock.set(20);
    this.prodFormDesc.set('');
    const firstCat = this.categoryBrandStore.categories()[0]?._id || '';
    const firstBrand = this.categoryBrandStore.brands()[0]?._id || '';
    this.prodFormCategory.set(firstCat);
    this.prodFormBrand.set(firstBrand);
    this.selectedProductFile = null;
    this.selectedSubFiles.set([]);
    this.isCreateProductModalOpen.set(true);
  }

  openEditProductModal(prod: Product) {
    this.editingProductId.set(prod._id);
    this.prodFormTitle.set(prod.title);
    this.prodFormPrice.set(prod.price);
    this.prodFormDiscount.set(prod.discount || 0);
    this.prodFormStock.set(prod.stock || 0);
    this.prodFormDesc.set(prod.description || '');
    const catId = typeof prod.category === 'object' ? prod.category?._id : prod.category;
    const brandId = typeof prod.brand === 'object' ? prod.brand?._id : prod.brand;
    this.prodFormCategory.set(catId || '');
    this.prodFormBrand.set(brandId || '');
    this.selectedProductFile = null;
    this.selectedSubFiles.set([]);
    this.isCreateProductModalOpen.set(true);
  }

  onProductFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedProductFile = input.files[0];
    }
  }

  onSubFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const filesArray = Array.from(input.files).slice(0, 5);
      this.selectedSubFiles.set(filesArray);
    }
  }

  removeSubFile(index: number) {
    this.selectedSubFiles.update((files) => files.filter((_, i) => i !== index));
  }

  async handleSaveProduct() {
    if (!this.prodFormTitle() || this.prodFormTitle().length < 2 || this.prodFormTitle().length > 50) {
      this.toast.error('Title must be between 2 and 50 characters', 'Validation');
      return;
    }
    if (this.prodFormPrice() <= 0) {
      this.toast.error('Price must be greater than 0', 'Validation');
      return;
    }
    if (!this.prodFormDesc() || this.prodFormDesc().length < 25) {
      this.toast.error('Description must be at least 25 characters', 'Validation');
      return;
    }
    if (!this.editingProductId() && !this.selectedProductFile) {
      this.toast.error('Main product image is required', 'Validation');
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.editingProductId()) {
        const prodId = this.editingProductId()!;
        
        // 1. Update text/string attributes via PATCH /api/products/:id
        const textPayload: any = {
          title: this.prodFormTitle(),
          price: Number(this.prodFormPrice()),
          discount: Number(this.prodFormDiscount()),
          stock: Number(this.prodFormStock()),
          description: this.prodFormDesc(),
        };
        if (this.prodFormCategory()) textPayload.category = this.prodFormCategory();
        if (this.prodFormBrand()) textPayload.brand = this.prodFormBrand();

        await this.api.updateProduct(prodId, textPayload).toPromise();

        // 2. If new images were selected, update images via PATCH /api/products/:id/images
        if (this.selectedProductFile || this.selectedSubFiles().length > 0) {
          const imgFormData = new FormData();
          if (this.selectedProductFile) {
            imgFormData.append('main_image', this.selectedProductFile);
          }
          this.selectedSubFiles().forEach((file) => {
            imgFormData.append('sub_images', file);
          });
          await this.api.updateProductImages(prodId, imgFormData).toPromise();
        }

        this.toast.success('Product updated successfully!', 'Catalog Updated');
      } else {
        // Create product via POST /api/products with full multipart data
        const formData = new FormData();
        formData.append('title', this.prodFormTitle());
        formData.append('price', this.prodFormPrice().toString());
        formData.append('discount', this.prodFormDiscount().toString());
        formData.append('stock', this.prodFormStock().toString());
        formData.append('description', this.prodFormDesc());
        if (this.prodFormCategory()) formData.append('category', this.prodFormCategory());
        if (this.prodFormBrand()) formData.append('brand', this.prodFormBrand());
        if (this.selectedProductFile) {
          formData.append('main_image', this.selectedProductFile);
        }
        if (this.selectedSubFiles().length > 0) {
          this.selectedSubFiles().forEach((file) => {
            formData.append('sub_images', file);
          });
        }

        await this.api.createProduct(formData).toPromise();
        this.toast.success('Product created successfully with gallery images!', 'Product Added');
      }

      this.isCreateProductModalOpen.set(false);
      this.productsStore.loadProducts();
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to save product', 'Error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteProduct(id: string) {
    if (confirm('Are you sure you want to remove this product from the catalog?')) {
      await this.productsStore.deleteProduct(id);
    }
  }

  // --- CATEGORY HANDLERS ---
  openCreateCategoryModal() {
    this.editingCategoryId.set(null);
    this.catFormName.set('');
    this.selectedCatFile = null;
    this.isCategoryModalOpen.set(true);
  }

  openEditCategoryModal(cat: Category) {
    this.editingCategoryId.set(cat._id);
    this.catFormName.set(cat.name);
    this.selectedCatFile = null;
    this.isCategoryModalOpen.set(true);
  }

  onCatFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedCatFile = input.files[0];
    }
  }

  async handleSaveCategory() {
    if (!this.catFormName() || this.catFormName().length < 2) {
      this.toast.error('Category name is required (min 2 chars)', 'Validation');
      return;
    }
    if (!this.editingCategoryId() && !this.selectedCatFile) {
      this.toast.error('Category image is required', 'Validation');
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.editingCategoryId()) {
        const catId = this.editingCategoryId()!;
        // 1. Update text name via PATCH /api/category/:id
        await this.api.updateCategory(catId, { name: this.catFormName() }).toPromise();

        // 2. If new image selected, update image via PATCH /api/category/:id/image
        if (this.selectedCatFile) {
          const imgFormData = new FormData();
          imgFormData.append('image', this.selectedCatFile);
          await this.api.updateCategoryImage(catId, imgFormData).toPromise();
        }
        this.toast.success('Category updated successfully!', 'Category Updated');
      } else {
        const formData = new FormData();
        formData.append('name', this.catFormName());
        if (this.selectedCatFile) {
          formData.append('image', this.selectedCatFile);
        }
        await this.api.createCategory(formData).toPromise();
        this.toast.success('Category created successfully!', 'Category Added');
      }
      this.isCategoryModalOpen.set(false);
      this.categoryBrandStore.init();
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to save category', 'Error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await this.api.deleteCategory(id).toPromise();
        this.toast.success('Category deleted', 'Store Updated');
        this.categoryBrandStore.init();
      } catch (err: any) {
        this.toast.error(err.error?.message || 'Failed to delete category', 'Error');
      }
    }
  }

  // --- BRAND HANDLERS ---
  openCreateBrandModal() {
    this.editingBrandId.set(null);
    this.brandFormName.set('');
    this.brandFormDesc.set('');
    this.selectedBrandFile = null;
    this.isBrandModalOpen.set(true);
  }

  openEditBrandModal(brand: Brand) {
    this.editingBrandId.set(brand._id);
    this.brandFormName.set(brand.name);
    this.brandFormDesc.set(brand.description || '');
    this.selectedBrandFile = null;
    this.isBrandModalOpen.set(true);
  }

  onBrandFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedBrandFile = input.files[0];
    }
  }

  async handleSaveBrand() {
    if (!this.brandFormName() || this.brandFormName().length < 2) {
      this.toast.error('Brand name is required (min 2 chars)', 'Validation');
      return;
    }
    if (!this.editingBrandId() && !this.selectedBrandFile) {
      this.toast.error('Brand logo is required', 'Validation');
      return;
    }

    this.isSubmitting.set(true);

    try {
      if (this.editingBrandId()) {
        const brandId = this.editingBrandId()!;
        // 1. Update text data via PATCH /api/brands/:id
        await this.api.updateBrand(brandId, {
          name: this.brandFormName(),
          description: this.brandFormDesc() || undefined,
        }).toPromise();

        // 2. If new logo selected, update logo via PATCH /api/brands/:id/logo
        if (this.selectedBrandFile) {
          const logoFormData = new FormData();
          logoFormData.append('logo', this.selectedBrandFile);
          await this.api.updateBrandLogo(brandId, logoFormData).toPromise();
        }
        this.toast.success('Brand updated successfully!', 'Brand Updated');
      } else {
        const formData = new FormData();
        formData.append('name', this.brandFormName());
        if (this.brandFormDesc()) formData.append('description', this.brandFormDesc());
        if (this.selectedBrandFile) {
          formData.append('logo', this.selectedBrandFile);
        }
        await this.api.createBrand(formData).toPromise();
        this.toast.success('Brand registered successfully!', 'Brand Registered');
      }
      this.isBrandModalOpen.set(false);
      this.categoryBrandStore.init();
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to save brand', 'Error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteBrand(id: string) {
    if (confirm('Are you sure you want to delete this brand?')) {
      try {
        await this.api.deleteBrand(id).toPromise();
        this.toast.success('Brand deleted', 'Store Updated');
        this.categoryBrandStore.init();
      } catch (err: any) {
        this.toast.error(err.error?.message || 'Failed to delete brand', 'Error');
      }
    }
  }

  // --- ORDER HANDLERS ---
  openOrderDetails(order: Order) {
    this.selectedOrder.set(order);
    this.isOrderDetailsModalOpen.set(true);
  }

  closeOrderDetails() {
    this.selectedOrder.set(null);
    this.isOrderDetailsModalOpen.set(false);
  }

  getOrderProducts(order: Order | null): any[] {
    if (!order) return [];
    const cart = order.cart as any;
    if (cart && Array.isArray(cart.products)) {
      return cart.products;
    }
    return [];
  }

  getOrderCustomerName(order: Order | null): string {
    if (!order) return 'Client';
    const u = order.user as any;
    if (typeof u === 'object' && u !== null) {
      if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
      if (u.fullName) return u.fullName;
      if (u.email) return u.email;
    }
    return 'Registered Customer';
  }

  getOrderCustomerEmail(order: Order | null): string {
    if (!order) return '';
    const u = order.user as any;
    if (typeof u === 'object' && u?.email) return u.email;
    return '';
  }

  async refundOrder(orderId: string) {
    if (confirm('Are you sure you want to process a full refund for this order?')) {
      try {
        await this.ordersStore.refundOrder(orderId);
        this.toast.success('Order refunded successfully', 'Refund Issued');
        this.closeOrderDetails();
      } catch (err: any) {
        this.toast.error(err.error?.message || 'Refund failed', 'Error');
      }
    }
  }

  async handleUpdateOrderStatus(orderId: string, newStatus: string) {
    try {
      const updated = await this.ordersStore.updateOrderStatus(orderId, newStatus);
      if (this.selectedOrder() && this.selectedOrder()?._id === orderId && updated) {
        this.selectedOrder.set(updated);
      }
      this.toast.success(`Order status set to ${newStatus.toUpperCase()}`, 'Status Updated');
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to update order status', 'Error');
    }
  }

  async handleUpdatePaymentStatus(orderId: string, newPaymentStatus: string) {
    try {
      const currentStatus = this.selectedOrder()?.status || 'pending';
      const updated = await this.ordersStore.updateOrderStatus(orderId, currentStatus, newPaymentStatus);
      if (this.selectedOrder() && this.selectedOrder()?._id === orderId && updated) {
        this.selectedOrder.set(updated);
      }
      this.toast.success(`Payment status set to ${newPaymentStatus.toUpperCase()}`, 'Status Updated');
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to update payment status', 'Error');
    }
  }

  async deleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await this.api.deleteOrder(orderId).toPromise();
        this.toast.success('Order deleted', 'Store Updated');
        this.ordersStore.loadOrders();
        this.closeOrderDetails();
      } catch (err: any) {
        this.toast.error(err.error?.message || 'Failed to delete order', 'Error');
      }
    }
  }

  // --- COUPON HANDLERS ---
  async handleCreateCoupon() {
    this.isSubmitting.set(true);
    try {
      await this.api.createCoupon({
        amount: this.newCouponAmount(),
        startDate: this.newCouponStartDate(),
        endDate: this.newCouponEndDate(),
      }).toPromise();
      this.toast.success('Promo coupon created successfully!', 'Coupon Created');
      this.isCreateCouponModalOpen.set(false);
      this.loadCoupons();
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Failed to create coupon', 'Error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteCoupon(id: string) {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await this.api.deleteCoupon(id).toPromise();
        this.toast.success('Coupon removed', 'Coupon Deleted');
        this.loadCoupons();
      } catch (err: any) {
        this.toast.error(err.error?.message || 'Failed to delete coupon', 'Error');
      }
    }
  }
}
