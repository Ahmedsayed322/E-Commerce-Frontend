import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (authStore.isAuthenticated()) {
    return true;
  }

  toast.warning('Please sign in to view this page.', 'Access Required');
  authStore.openAuthModal('signin');
  router.navigate(['/']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (authStore.isAuthenticated() && authStore.isAdmin()) {
    return true;
  }

  toast.error('Admin access required.', 'Unauthorized');
  router.navigate(['/']);
  return false;
};
