// _services/workflow.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Workflow } from '@app/_models';

const baseUrl = `${environment.apiUrl}/workflows`;

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    constructor(private http: HttpClient) { }

    create(params: any): Observable<Workflow> {
        console.log('Sending workflow create request with params:', params);
        return this.http.post<Workflow>(baseUrl, params);
    }

    getByEmployee(employeeId: number): Observable<Workflow[]> {
        return this.http.get<Workflow[]>(`${baseUrl}/employee/${employeeId}`);
    }

    updateStatus(id: number, status: string): Observable<Workflow> {
        return this.http.put<Workflow>(`${baseUrl}/${id}/status`, { status });
    }

    initiateOnboarding(params: any): Observable<Workflow> {
        return this.http.post<Workflow>(`${baseUrl}/onboarding`, params);
    }
}