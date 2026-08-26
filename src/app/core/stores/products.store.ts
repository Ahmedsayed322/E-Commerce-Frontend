import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { Product, ProductQueryParams } from '../models';

export interface ProductsState {
  products: Product[];
  activeProduct: Product | null;
  loading: boolean;
  productLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectedBrand: string | null;
  searchQuery: string;
  sortBy: string;
  minPrice: number | null;
  maxPrice: number | null;
  currentPage: number;
  pageSize: number;
}

const initialProductsState: ProductsState = {
  products: [],
  activeProduct: null,
  loading: false,
  productLoading: false,
  error: null,
  selectedCategory: null,
  selectedBrand: null,
  searchQuery: '',
  sortBy: 'featured',
  minPrice: null,
  maxPrice: null,
  currentPage: 1,
  pageSize: 6,
};

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState(initialProductsState),
  withComputed((store) => {
    const filteredProducts = computed(() => {
      let list = [...store.products()];

      if (store.selectedCategory()) {
        list = list.filter((p) => {
          const catId = typeof p.category === 'object' ? p.category._id : p.category;
          return catId === store.selectedCategory();
        });
      }

      if (store.selectedBrand()) {
        list = list.filter((p) => {
          if (!p.brand) return false;
          const brandId = typeof p.brand === 'object' ? p.brand._id : p.brand;
          return brandId === store.selectedBrand();
        });
      }

      if (store.searchQuery().trim()) {
        const q = store.searchQuery().toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.slug?.toLowerCase().includes(q)
        );
      }

      if (store.minPrice() !== null) {
        list = list.filter((p) => (p.priceAfterDiscount ?? p.price) >= store.minPrice()!);
      }

      if (store.maxPrice() !== null) {
        list = list.filter((p) => (p.priceAfterDiscount ?? p.price) <= store.maxPrice()!);
      }

      // Sort
      switch (store.sortBy()) {
        case 'price-asc':
          list.sort((a, b) => (a.priceAfterDiscount ?? a.price) - (b.priceAfterDiscount ?? b.price));
          break;
        case 'price-desc':
          list.sort((a, b) => (b.priceAfterDiscount ?? b.price) - (a.priceAfterDiscount ?? a.price));
          break;
        case 'rating':
          list.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
        default:
          break;
      }

      return list;
    });

    const totalPages = computed(() => {
      const total = filteredProducts().length;
      return Math.ceil(total / store.pageSize()) || 1;
    });

    const paginatedProducts = computed(() => {
      const list = filteredProducts();
      const page = store.currentPage();
      const size = store.pageSize();
      const start = (page - 1) * size;
      return list.slice(start, start + size);
    });

    const pagesArray = computed(() => {
      const pages: number[] = [];
      const total = totalPages();
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    });

    return {
      filteredProducts,
      totalPages,
      paginatedProducts,
      pagesArray,
      featuredProducts: computed(() => store.products().slice(0, 8)),
      discountedProducts: computed(() => store.products().filter((p) => p.discount > 0)),
      hasActiveFilters: computed(() => {
        return (
          !!store.selectedCategory() ||
          !!store.selectedBrand() ||
          !!store.searchQuery() ||
          store.minPrice() !== null ||
          store.maxPrice() !== null
        );
      }),
    };
  }),
  withMethods((store, api = inject(ApiService), toast = inject(ToastService)) => ({
    loadProducts(params?: ProductQueryParams) {
      patchState(store, { loading: true, error: null });
      const queryParams = { limit: 100, ...params };
      api.getProducts(queryParams).subscribe({
        next: (res: any) => {
          let products: Product[] = [];
          if (Array.isArray(res)) products = res;
          else if (Array.isArray(res?.products?.data)) products = res.products.data;
          else if (Array.isArray(res?.Products?.data)) products = res.Products.data;
          else if (Array.isArray(res?.products)) products = res.products;
          else if (Array.isArray(res?.Products)) products = res.Products;
          else if (Array.isArray(res?.data?.products?.data)) products = res.data.products.data;
          else if (Array.isArray(res?.data?.Products?.data)) products = res.data.Products.data;
          else if (Array.isArray(res?.data?.products)) products = res.data.products;
          else if (Array.isArray(res?.data?.Products)) products = res.data.Products;
          else if (Array.isArray(res?.data?.data)) products = res.data.data;
          else if (Array.isArray(res?.data)) products = res.data;
          patchState(store, { products, loading: false });
        },
        error: (err) => {
          patchState(store, { loading: false, error: err.message });
        },
      });
    },
    loadProductById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { productLoading: true, activeProduct: null })),
        switchMap((id) =>
          api.getProductById(id).pipe(
            tap((res: any) => {
              let product: Product | null = null;
              if (res?.product) product = res.product;
              else if (res?.data?.product) product = res.data.product;
              else if (res?._id) product = res;
              else if (res?.data?._id) product = res.data;
              patchState(store, { activeProduct: product, productLoading: false });
            }),
            catchError((err) => {
              patchState(store, { productLoading: false, error: err.message });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    syncWithQueryParams: rxMethod<Record<string, any>>(
      pipe(
        tap((params) => {
          patchState(store, {
            selectedCategory: params['category'] || null,
            selectedBrand: params['brand'] || null,
            searchQuery: params['q'] || store.searchQuery(),
            sortBy: params['sort'] || store.sortBy(),
            minPrice: params['minPrice'] ? Number(params['minPrice']) : store.minPrice(),
            maxPrice: params['maxPrice'] ? Number(params['maxPrice']) : store.maxPrice(),
            currentPage: params['page'] ? Number(params['page']) : 1,
          });
        }),
      ),
    ),
    setPage(page: number) {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    nextPage() {
      if (store.currentPage() < store.totalPages()) {
        this.setPage(store.currentPage() + 1);
      }
    },
    prevPage() {
      if (store.currentPage() > 1) {
        this.setPage(store.currentPage() - 1);
      }
    },
    setCategory(categoryId: string | null) {
      patchState(store, { selectedCategory: categoryId, currentPage: 1 });
    },
    setBrand(brandId: string | null) {
      patchState(store, { selectedBrand: brandId, currentPage: 1 });
    },
    setSearch(query: string) {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    setSort(sort: string) {
      patchState(store, { sortBy: sort, currentPage: 1 });
    },
    setPriceRange(min: number | null, max: number | null) {
      patchState(store, { minPrice: min, maxPrice: max, currentPage: 1 });
    },
    resetFilters() {
      patchState(store, {
        selectedCategory: null,
        selectedBrand: null,
        searchQuery: '',
        sortBy: 'featured',
        minPrice: null,
        maxPrice: null,
        currentPage: 1,
      });
    },
    async deleteProduct(id: string) {
      try {
        await api.deleteProduct(id, 'soft').toPromise();
        patchState(store, {
          products: store.products().filter((p) => p._id !== id),
        });
        toast.success('Product deleted successfully', 'Deleted');
      } catch (err: any) {
        toast.error('Failed to delete product', 'Error');
      }
    },
  }))
);
