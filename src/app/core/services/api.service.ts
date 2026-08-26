import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Brand,
  Cart,
  Category,
  Coupon,
  Order,
  Product,
  ProductQueryParams,
  Review,
  User,
  Wishlist,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private baseUrl = environment.apiUrl;

  // --- AUTH / USER ---
  signup(data: {
    email: string;
    password: string;
    cPassword?: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: 'male' | 'female';
  }): Observable<ApiResponse> {
    const payload = {
      ...data,
      cPassword: data.cPassword || data.password,
    };
    return this.http.post<ApiResponse>(`${this.baseUrl}/user/signup`, payload);
  }

  signin(data: {
    email: string;
    password: string;
  }): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return this.http.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${this.baseUrl}/user/signin`,
      data,
    );
  }

  getProfile(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.baseUrl}/user/profile`);
  }

  refreshToken(): Observable<ApiResponse<{ accessToken: string }>> {
    const authHeader = this.tokenService.getRefreshAuthHeader() || '';
    return this.http.get<ApiResponse<{ accessToken: string }>>(`${this.baseUrl}/user/refresh`, {
      headers: {
        Authorization: authHeader,
      },
    });
  }

  // --- PRODUCTS ---
  getProducts(params?: ProductQueryParams): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/products`, {
      params: httpParams,
    });
  }

  getProductById(id: string): Observable<ApiResponse<{ product: Product } | Product>> {
    return this.http.get<ApiResponse<{ product: Product } | Product>>(
      `${this.baseUrl}/products/${id}`,
    );
  }

  createProduct(formData: FormData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/products`, formData);
  }

  updateProduct(id: string, data: Partial<Product> | FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/products/${id}`, data);
  }

  updateProductImages(id: string, formData: FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/products/${id}/images`, formData);
  }

  deleteProduct(id: string, method: 'soft' | 'hard' = 'soft'): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/products/${id}`, {
      params: { method },
    });
  }

  // --- CATEGORIES ---
  getCategories(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/category`);
  }

  getCategoryById(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.baseUrl}/category/${id}`);
  }

  createCategory(formData: FormData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/category`, formData);
  }

  updateCategory(id: string, data: Partial<Category> | FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/category/${id}`, data);
  }

  updateCategoryImage(id: string, formData: FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/category/${id}/image`, formData);
  }

  deleteCategory(id: string, method: 'soft' | 'hard' = 'soft'): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/category/${id}`, {
      params: { method },
    });
  }

  // --- BRANDS ---
  getBrands(params?: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/brands`, { params });
  }

  getBrandById(id: string): Observable<ApiResponse<Brand>> {
    return this.http.get<ApiResponse<Brand>>(`${this.baseUrl}/brands/${id}`);
  }

  createBrand(formData: FormData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/brands`, formData);
  }

  updateBrand(id: string, data: Partial<Brand> | FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/brands/${id}`, data);
  }

  updateBrandLogo(id: string, formData: FormData): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/brands/${id}/logo`, formData);
  }

  deleteBrand(id: string, method: 'soft' | 'hard' = 'soft'): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/brands/${id}`, {
      params: { method },
    });
  }

  // --- CART ---
  getMyCart(): Observable<ApiResponse<{ cart: Cart } | Cart>> {
    return this.http.get<ApiResponse<{ cart: Cart } | Cart>>(`${this.baseUrl}/cart`);
  }

  addToCart(productId: string, quantity = 1): Observable<ApiResponse<{ cart: Cart } | Cart>> {
    return this.http.post<ApiResponse<{ cart: Cart } | Cart>>(`${this.baseUrl}/cart/add`, {
      productId,
      quantity: Number(quantity),
    });
  }

  adjustCartQuantity(
    productId: string,
    quantity: number,
  ): Observable<ApiResponse<{ cart: Cart } | Cart>> {
    return this.http.patch<ApiResponse<{ cart: Cart } | Cart>>(
      `${this.baseUrl}/cart/${productId}/quantity`,
      {
        quantity: Number(quantity),
      },
    );
  }

  removeFromCart(productId: string): Observable<ApiResponse<{ cart: Cart } | Cart>> {
    return this.http.delete<ApiResponse<{ cart: Cart } | Cart>>(
      `${this.baseUrl}/cart/remove/${productId}`,
    );
  }

  // --- WISHLIST ---
  getMyWishlist(): Observable<ApiResponse<{ wishlist: Wishlist } | Wishlist>> {
    return this.http.get<ApiResponse<{ wishlist: Wishlist } | Wishlist>>(
      `${this.baseUrl}/wishlist`,
    );
  }

  toggleWishlist(productId: string): Observable<ApiResponse<{ wishlist: Wishlist } | Wishlist>> {
    return this.http.patch<ApiResponse<{ wishlist: Wishlist } | Wishlist>>(
      `${this.baseUrl}/wishlist`,
      {
        id: productId,
      },
    );
  }

  // --- COUPONS ---
  getCoupons(): Observable<ApiResponse<{ coupons: Coupon[] } | Coupon[]>> {
    return this.http.get<ApiResponse<{ coupons: Coupon[] } | Coupon[]>>(`${this.baseUrl}/coupon`);
  }

  validateCoupon(code: string): Observable<ApiResponse<{ coupon: Coupon } | Coupon>> {
    return this.http.get<ApiResponse<{ coupon: Coupon } | Coupon>>(
      `${this.baseUrl}/coupon/validate/${code}`,
    );
  }

  checkCoupon(code: string): Observable<ApiResponse<{ coupon: Coupon; isUsed: boolean } | Coupon>> {
    return this.http.get<ApiResponse<{ coupon: Coupon; isUsed: boolean } | Coupon>>(
      `${this.baseUrl}/coupon/check/${code}`,
    );
  }

  createCoupon(data: {
    amount: number;
    startDate: string;
    endDate: string;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/coupon`, {
      amount: Number(data.amount),
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    });
  }

  deleteCoupon(id: string, method: 'soft' | 'hard' = 'soft'): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/coupon/${id}`, {
      params: { method },
    });
  }

  // --- ORDERS ---
  createOrder(data: {
    coupon?: string;
    phone: string;
    address: string;
    paymentMethod: string;
  }): Observable<ApiResponse<{ order: Order } | Order>> {
    const payload: any = {
      phone: data.phone,
      address: data.address,
      paymentMethod: data.paymentMethod,
    };
    if (data.coupon && data.coupon.trim()) {
      payload.coupon = data.coupon.trim().toUpperCase();
    }
    return this.http.post<ApiResponse<{ order: Order } | Order>>(`${this.baseUrl}/order`, payload);
  }

  getOrders(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/order`);
  }

  payOrder(orderId: string): Observable<ApiResponse<{ paymentUrl?: string; token?: string }>> {
    return this.http.post<ApiResponse<{ paymentUrl?: string; token?: string }>>(
      `${this.baseUrl}/order/pay/${orderId}`,
      {},
    );
  }

  refundOrder(id: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/order/refund/${id}`, {});
  }

  updateOrderStatus(
    id: string,
    data: { status?: string; paymentStatus?: string },
  ): Observable<ApiResponse<{ order: Order } | Order>> {
    return this.http.patch<ApiResponse<{ order: Order } | Order>>(
      `${this.baseUrl}/order/${id}/status`,
      data,
    );
  }

  deleteOrder(id: string, method: 'soft' | 'hard' = 'soft'): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/order/${id}`, {
      params: { method },
    });
  }

  // --- REVIEWS ---
  getProductReviews(productId: string): Observable<ApiResponse<{ reviews: Review[] } | Review[]>> {
    return this.http.get<ApiResponse<{ reviews: Review[] } | Review[]>>(
      `${this.baseUrl}/review/product/${productId}`,
    );
  }

  createReview(data: {
    product: string;
    rate: number;
    comment?: string;
  }): Observable<ApiResponse<{ review: Review } | Review>> {
    return this.http.post<ApiResponse<{ review: Review } | Review>>(`${this.baseUrl}/review`, data);
  }

  updateReview(
    id: string,
    data: { rate?: number; comment?: string },
  ): Observable<ApiResponse<{ review: Review } | Review>> {
    return this.http.patch<ApiResponse<{ review: Review } | Review>>(
      `${this.baseUrl}/review/${id}`,
      data,
    );
  }

  deleteReview(id: string, method: 'soft' | 'hard' = 'soft'): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/review/${id}`, {
      params: { method },
    });
  }
}
