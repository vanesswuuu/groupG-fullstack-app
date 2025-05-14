// _models/request.ts
import { Employee } from './employee';

export class Request {
    id: number;
    type: string;
    items: any[];
    status: string;
    created: Date;
    updated: Date;
    employee: Employee;

    constructor(init?: Partial<Request>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}