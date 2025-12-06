import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestmonialService {
  private apiUrl = 'http://localhost:3000/api/testmonials';
  constructor(private http: HttpClient) {}
  getAllTestmonials(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
  }
  // deleteTestmonial(id: string): Observable<any> {
  //   const token = this.getToken();
  //   return this.http.delete(`${this.apiUrl}/${id}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  // }
  getAllTestmonialsForAdmin(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}/admin`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  addNewTestmonial(data: any): Observable<any> {
    const token = this.getToken();
    return this.http.post(this.apiUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  updateTestmonial(id: string, data: any): Observable<any> {
    const token = this.getToken();
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  delteTestmonial(id: string): Observable<any> {
    const token = this.getToken();
    return this.http.delete(`${this.apiUrl}/${id}`, {
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
