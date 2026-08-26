import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { Brand, Category } from '../models';

export interface CategoryBrandState {
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  error: string | null;
}

const initialCategoryBrandState: CategoryBrandState = {
  categories: [],
  brands: [],
  loading: false,
  error: null,
};

export const CategoryBrandStore = signalStore(
  { providedIn: 'root' },
  withState(initialCategoryBrandState),
  withMethods((store, api = inject(ApiService), toast = inject(ToastService)) => ({
    async loadCategories() {
      patchState(store, { loading: true, error: null });
      try {
        const res = await api.getCategories().toPromise();
        let categories: Category[] = [];
        const raw = res as any;

        if (Array.isArray(raw)) {
          categories = raw;
        } else if (Array.isArray(raw?.Categories?.data)) {
          categories = raw.Categories.data;
        } else if (Array.isArray(raw?.categories?.data)) {
          categories = raw.categories.data;
        } else if (Array.isArray(raw?.Categories)) {
          categories = raw.Categories;
        } else if (Array.isArray(raw?.categories)) {
          categories = raw.categories;
        } else if (Array.isArray(raw?.data?.Categories?.data)) {
          categories = raw.data.Categories.data;
        } else if (Array.isArray(raw?.data?.categories?.data)) {
          categories = raw.data.categories.data;
        } else if (Array.isArray(raw?.data?.Categories)) {
          categories = raw.data.Categories;
        } else if (Array.isArray(raw?.data?.categories)) {
          categories = raw.data.categories;
        } else if (Array.isArray(raw?.data)) {
          categories = raw.data;
        }

        patchState(store, { categories, loading: false });
      } catch (err: any) {
        patchState(store, { loading: false, error: err.message });
      }
    },
    async loadBrands() {
      try {
        const res = await api.getBrands({ limit: 50 }).toPromise();
        let brands: Brand[] = [];
        const raw = res as any;

        if (Array.isArray(raw)) {
          brands = raw;
        } else if (Array.isArray(raw?.brands?.data)) {
          brands = raw.brands.data;
        } else if (Array.isArray(raw?.Brands?.data)) {
          brands = raw.Brands.data;
        } else if (Array.isArray(raw?.brands)) {
          brands = raw.brands;
        } else if (Array.isArray(raw?.Brands)) {
          brands = raw.Brands;
        } else if (Array.isArray(raw?.data?.brands?.data)) {
          brands = raw.data.brands.data;
        } else if (Array.isArray(raw?.data?.Brands?.data)) {
          brands = raw.data.Brands.data;
        } else if (Array.isArray(raw?.data?.brands)) {
          brands = raw.data.brands;
        } else if (Array.isArray(raw?.data?.Brands)) {
          brands = raw.data.Brands;
        } else if (Array.isArray(raw?.data)) {
          brands = raw.data;
        }

        patchState(store, { brands });
      } catch (err: any) {
        console.error('Failed to load brands:', err);
      }
    },
    async init() {
      await Promise.all([this.loadCategories(), this.loadBrands()]);
    },
  }))
);
