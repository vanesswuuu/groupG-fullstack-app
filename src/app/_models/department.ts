// _models/department.ts
export class Department {
    id: number;
    name: string;
    description: string;
    created: Date;
    updated: Date;

    constructor(init?: Partial<Department>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}