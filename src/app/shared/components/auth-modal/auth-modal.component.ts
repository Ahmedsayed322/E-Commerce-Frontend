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

  // Signin fields
  email = signal('user@ecommerce.com');
  password = signal('User@123456');

  // Signup fields
  firstName = signal('Sarah');
  lastName = signal('Ahmed');
  signupEmail = signal('');
  signupPassword = signal('User@123456');
  signupCPassword = signal('User@123456');
  phone = signal('01112345678');
  gender = signal<'male' | 'female'>('female');

  handleSignin() {
    this.authStore.signin({
      email: this.email(),
      password: this.password(),
    });
  }

  handleSignup() {
    this.authStore.signup({
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.signupEmail(),
      password: this.signupPassword(),
      cPassword: this.signupCPassword() || this.signupPassword(),
      phone: this.phone(),
      gender: this.gender(),
    });
  }
}
