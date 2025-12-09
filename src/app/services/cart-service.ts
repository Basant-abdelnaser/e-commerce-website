import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  constructor(private http: HttpClient, private auth: AuthService) {}
  getCartItems(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }
  deleteCartItem(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  checkaddToCart(data: any) {
    if (!this.auth.isLoggedIn()) {
      this.addToLocalCart(data);
    } else {
      this.addToCart(data);
    }
  }

  addToCart(data: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(this.apiUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  addToLocalCart(data: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existing = cart.find((item: any) => item._id === data._id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...data, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
  }

  updateCartItem(id: string, data: any): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/update`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  clearCart(): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/clear`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }
  mergeLocalCartWithBackend() {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length > 0) {
      const token = this.getToken();
      this.http
        .post(`${this.apiUrl}/merge`, localCart, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .subscribe({
          next: (res) => {
            localStorage.removeItem('cart');
            this.getCartItems();
          },
          error: (err) => {
            console.log('error', err);
          },
        });
    }
  }
}
