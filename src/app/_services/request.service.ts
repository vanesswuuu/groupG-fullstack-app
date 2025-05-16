// _services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Request } from '@app/_models';

const baseUrl = `${environment.apiUrl}/requests`;

@Injectable({ providedIn: 'root' })
export class RequestService {
    constructor(private http: HttpClient) { }

    getAll(): Observable<Request[]> {
        return this.http.get<Request[]>(baseUrl);
    }

    getById(id: number): Observable<Request> {
        return this.http.get<Request>(`${baseUrl}/${id}`);
    }

    getByEmployee(employeeId: number): Observable<Request[]> {
        return this.http.get<Request[]>(`${baseUrl}/employee/${employeeId}`);
    }

    create(params: any): Observable<Request> {
        return this.http.post<Request>(baseUrl, params);
    }

    update(id: number, params: any): Observable<Request> {
        return this.http.put<Request>(`${baseUrl}/${id}`, params);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${baseUrl}/${id}`);
    }
}