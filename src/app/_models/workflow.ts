// _models/workflow.ts
import { Employee } from './employee';

export class Workflow {
    id: number;
    type: string;
    details: any;
    status: string;
    created: Date;
    updated: Date;
    employee: {
        id: number;
        employeeId: string;
        account: {
            firstName: string;
            lastName: string;
            email: string;
        }
    };

    constructor(init?: Partial<Workflow>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}