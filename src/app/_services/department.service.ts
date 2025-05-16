// _services/department.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Department } from '@app/_models';

const baseUrl = `${environment.apiUrl}/departments`;

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Department[]> {
        return this.http.get<Department[]>(baseUrl);
    }

    getById(id: number): Observable<Department> {
        return this.http.get<Department>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<Department> {
        return this.http.post<Department>(baseUrl, params);
    }

    update(id: number, params: any): Observable<Department> {
        return this.http.put<Department>(`${baseUrl}/${id}`, params);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${baseUrl}/${id}`);
    }
}