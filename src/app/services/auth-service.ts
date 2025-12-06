import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BASE_URL = 'http://localhost:3000/api/auth';
  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/login`, { email, password });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/register`, data);
  }
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  isLoggedIn() {
    return this.getToken() !== null;
  }
  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
  isAdmin() {
    return this.getUser().isAdmin;
  }
}
