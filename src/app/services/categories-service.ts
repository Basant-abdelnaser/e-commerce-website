import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private apiUrl = 'http://localhost:3000/api/category';
  constructor(private http: HttpClient) {}
  getCatories(): Observable<any> {
    console.log('from  category service', this.http.get(this.apiUrl));
    return this.http.get(this.apiUrl);
  }
  deleteCategories(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  addNewCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
