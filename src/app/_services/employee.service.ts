// _services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Employee } from '@app/_models';

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Employee[]> {
        return this.http.get<Employee[]>(baseUrl);
    }

    getById(id: number): Observable<Employee> {
        return this.http.get<Employee>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<Employee> {
        return this.http.post<Employee>(baseUrl, params);
    }

    update(id: number, params: any): Observable<Employee> {
        return this.http.put<Employee>(`${baseUrl}/${id}`, params);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${baseUrl}/${id}`);
    }

    transfer(id: number, departmentId: number): Observable<Employee> {
        return this.http.post<Employee>(`${baseUrl}/${id}/transfer`, { departmentId });
    }
}