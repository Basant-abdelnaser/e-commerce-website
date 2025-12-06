import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackOrderService {
  private apiUrl = 'http://localhost:3000/api/orders';
  constructor(private http: HttpClient) {}
  getUserOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }

  deleteOrder(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  addNewOrder(data: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(this.apiUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  updateOrderStatus(id: string, data: any): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/${id}`, data, {
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

  getAllOrders(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
