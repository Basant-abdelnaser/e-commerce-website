import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubcategoriesService {
  private apiUrl = 'http://localhost:3000/api/subcategory';
  constructor(private http: HttpClient) {}
  getSubcategories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  deleteSubcategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  addNewSubcategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  updateSubcategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
