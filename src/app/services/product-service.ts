import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  constructor(private http: HttpClient) {}
  getProducts(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }
  addProduct(data: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(this.apiUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  deleteProduct(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  updateProduct(id: string, data: any): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  getProductBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${slug}`);
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }
}
