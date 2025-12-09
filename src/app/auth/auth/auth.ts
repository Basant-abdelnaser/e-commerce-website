import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart-service';
@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  isLogin = true;
  showPassword = false;
  errorMsg: string = ' ';
  formData = {
    email: '',
    password: '',
    username: '',
    phone: '',
  };
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  login() {
    const userData = {
      email: this.formData.email,
      password: this.formData.password,
    };
    this.authService.login(userData.email, userData.password).subscribe({
      next: (res) => {
        console.log('login success ', res);
        this.authService.saveToken(res.token);
        if (res.isAdmin) {
          console.log('admin');
          this.router.navigate(['/admin/manage-categories']);
        } else {
          console.log('user');
          this.cartService.mergeLocalCartWithBackend();
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.errorMsg = err.error.message;
        console.log('error msg', this.errorMsg);
        console.log('login error ', err);
      },
    });
  }
  register() {
    const userdata = {
      email: this.formData.email,
      password: this.formData.password,
      name: this.formData.username,
      phone: this.formData.phone,
    };
    this.authService.register(userdata).subscribe({
      next: (res) => {
        console.log('register success ', res);
        this.authService.saveToken(res.token);
      },
      error: (err) => {
        this.errorMsg = err.error.message;
        console.log('error msg', this.errorMsg);
        console.log('register error ', err);
        this.cdr.detectChanges();
      },
    });
  }

  toggleView() {
    this.isLogin = !this.isLogin;
    this.resetForm();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  resetForm() {
    this.formData = {
      email: '',
      password: '',
      username: '',
      phone: '',
    };
    this.showPassword = false;
    this.errorMsg = '';
  }

  onSubmit() {
    console.log('Form submitted:', this.formData);
    if (this.isLogin) {
      this.login();
    } else {
      console.log('Registered');
      this.register();
    }
  }
}
