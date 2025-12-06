import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  constructor(private http: HttpClient) {}
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
  addToCart(data: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(this.apiUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
}
