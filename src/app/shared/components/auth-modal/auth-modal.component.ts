import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/stores/auth.store';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
})
export class AuthModalComponent {
  authStore = inject(AuthStore);

  // Password visibility state
  showSigninPassword = signal<boolean>(false);
  showSignupPassword = signal<boolean>(false);
  showSignupCPassword = signal<boolean>(false);

  // Signin fields
  email = signal('');
  password = signal('');

  // Signup fields
  firstName = signal('');
  lastName = signal('');
  signupEmail = signal('');
  signupPassword = signal('');
  signupCPassword = signal('');
  phone = signal('');
  gender = signal<'male' | 'female'>('male');

  toggleSigninPassword() {
    this.showSigninPassword.update((v) => !v);
  }

  toggleSignupPassword() {
    this.showSignupPassword.update((v) => !v);
  }

  toggleSignupCPassword() {
    this.showSignupCPassword.update((v) => !v);
  }

  handleSignin() {
    if (!this.email().trim() || !this.password()) return;
    this.authStore.signin({
      email: this.email().trim(),
      password: this.password(),
    });
  }

  handleSignup() {
    if (
      !this.firstName().trim() ||
      !this.lastName().trim() ||
      !this.signupEmail().trim() ||
      !this.signupPassword()
    ) {
      return;
    }

    this.authStore.signup({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.signupEmail().trim(),
      password: this.signupPassword(),
      cPassword: this.signupCPassword() || this.signupPassword(),
      phone: this.phone().trim() || '01000000000',
      gender: this.gender(),
    });
  }
}
