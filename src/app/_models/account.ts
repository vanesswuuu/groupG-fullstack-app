// _models/account.ts

import { Role } from './role';

export class Account {
    id: string;
    title: string | null;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    status: string;
    jwtToken?: string;
    isVerified?: boolean;
    refreshTokens?: string[];
    dateCreated?: Date;
    dateUpdated?: Date;

    constructor(init?: Partial<Account>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}