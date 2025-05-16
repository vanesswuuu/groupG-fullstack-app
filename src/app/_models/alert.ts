// _models/alert.ts

export class Alert {
    id: string;
    type: AlertType;
    message: string;
    autoClose: boolean;
    keepAfterRouteChange: boolean;
    fade: boolean;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, {
            autoClose: true,          // Default values
            keepAfterRouteChange: false,
            fade: true,
            ...init                  // Override with provided values
        });
    }
}

export enum AlertType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Warning = 'warning'
}