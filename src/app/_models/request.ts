// _models/request.ts
import { Employee } from './employee';

export class Request {
    id: number;
    type: string;
    items: any[];
    status: string;
    created: Date;
    updated: Date;
    employeeId: number;
    employee: {
        id: number;
        employeeId: string;
    };

    constructor(init?: Partial<Request>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}