import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AuthStore } from './auth.store';
import { Review } from '../models';

export interface ReviewState {
  reviews: Review[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialReviewState: ReviewState = {
  reviews: [],
  loading: false,
  submitting: false,
  error: null,
};

export const ReviewStore = signalStore(
  { providedIn: 'root' },
  withState(initialReviewState),
  withComputed((store, authStore = inject(AuthStore)) => ({
    userReview: computed(() => {
      const currentUserId = authStore.user()?._id;
      if (!currentUserId) return null;
      return (
        store.reviews().find((r) => {
          const uId = typeof r.user === 'object' ? r.user?._id : r.user;
          return uId === currentUserId;
        }) || null
      );
    }),
  })),
  withMethods((store, api = inject(ApiService), toast = inject(ToastService)) => ({
    loadReviews: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((productId) =>
          api.getProductReviews(productId).pipe(
            tap((res: any) => {
              let list: Review[] = [];
              if (Array.isArray(res?.reviews)) list = res.reviews;
              else if (Array.isArray(res?.data?.reviews)) list = res.data.reviews;
              else if (Array.isArray(res?.data)) list = res.data;
              else if (Array.isArray(res)) list = res;
              patchState(store, { reviews: list, loading: false });
            }),
            catchError((err) => {
              patchState(store, { reviews: [], loading: false, error: err.message });
              return of(null);
            }),
          ),
        ),
      ),
    ),
    submitReview: rxMethod<{ productId: string; rate: number; comment?: string }>(
      pipe(
        tap(() => patchState(store, { submitting: true })),
        switchMap(({ productId, rate, comment }) =>
          api.createReview({ product: productId, rate, comment }).pipe(
            tap(() => {
              toast.success('Your review has been published!', 'Review Submitted');
              patchState(store, { submitting: false });
            }),
            catchError((err) => {
              patchState(store, { submitting: false });
              toast.error(err.error?.message || 'Failed to submit review', 'Error');
              return of(null);
            }),
          ),
        ),
      ),
    ),
    deleteReview: rxMethod<{ reviewId: string; productId: string }>(
      pipe(
        switchMap(({ reviewId, productId }) =>
          api.deleteReview(reviewId).pipe(
            tap(() => {
              patchState(store, {
                reviews: store.reviews().filter((r) => r._id !== reviewId),
              });
              toast.success('Review removed successfully', 'Deleted');
            }),
            catchError((err) => {
              toast.error(err.error?.message || 'Failed to delete review', 'Error');
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
);
