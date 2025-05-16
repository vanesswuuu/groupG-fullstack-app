// _models/employee.ts
import { Account } from './account';
import { Department } from './department';

export class Employee {
    id: number;
    employeeId: string;
    position: string;
    hireDate: Date;
    status: string;
    created: Date;
    updated: Date;
    account: Account;
    department: Department;

    constructor(init?: Partial<Employee>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}