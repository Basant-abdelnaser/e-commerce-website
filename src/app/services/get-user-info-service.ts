import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetUserInfoService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}
  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }
  getAllUsers(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  deleteUser(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  updateUser(id: string, data: any): Observable<any> {
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
}
