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
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}`);
  }
  addProduct(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  updateProduct(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}`, data);
  }
}
