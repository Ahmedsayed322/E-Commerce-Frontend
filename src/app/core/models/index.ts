export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  [key: string]: any;
}

export interface UserAddress {
  _id?: string;
  title: string;
  country: string;
  city: string;
  street: string;
  building: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  role: 'user' | 'admin';
  gender: 'male' | 'female';
  avatar?: string;
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  image: string;
  brands?: string[] | Brand[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  discount: number;
  priceAfterDiscount: number;
  stock: number;
  category: string | Category;
  brand?: string | Brand;
  mainImage: string;
  images: string[];
  sold?: number;
  ratingAverage?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartProductItem {
  _id?: string;
  product: Product;
  quantity: number;
  finalPrice: number;
}

export interface Cart {
  _id: string;
  userId: string;
  products: CartProductItem[];
  grandTotal: number;
}

export interface Wishlist {
  _id: string;
  userId: string;
  products: Product[];
}

export interface Coupon {
  _id: string;
  code: string;
  amount: number;
  startDate: string;
  endDate: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPING = 'shipping',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  UNPAID = 'unpaid',
  REFUNDED = 'refunded',
}

export interface Order {
  _id: string;
  user: string | User;
  cart: string | Cart;
  coupon?: string | Coupon;
  totalPrice: number;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  arrivedAt?: string;
  paymentStatus: PaymentStatus;
  trxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface Review {
  _id: string;
  user: User | { _id: string; firstName?: string; lastName?: string; email?: string; avatar?: string };
  product: string | Product;
  rate: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

