// fake-backend.ts

import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';

// Array in local storage for accounts
const accountsKey = 'angular-16-signup-verification-boilerplate-accounts';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;
        
        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getAccounts();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case url.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                default:
                    // Pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // Route functions
        function authenticate() {
            const { email, password } = body;
            // 1. Check if email exists
            const account = accounts.find(x => x.email === email);
            if (!account) return error('Email not found');
            
            // 2. Check if password is correct
            if (account.password !== password) return error('Password is incorrect');
            
            // 3. Check if account is verified
            if (!account.isVerified) return error('Account is not verified. Please verify your email first.');
            
            // Check if account is active
            if (account.status !== 'active') return error('Account is inactive. Please contact the administrator.');
            
            // Add refresh token to account
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();
            if (!refreshToken) return unauthorized();
            
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            if (!account) return unauthorized();
            
            // Replace old refresh token with a new one and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();

            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

            // Revoke token and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function register() {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                // Display email already registered alert
                setTimeout(() => {
                    alertService.info(`
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you forgot your password, please visit the 
                        <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div class="alert alert-warning">
                            The fake backend displayed this "email" so you can test without an API. 
                            A real backend would send a real email.
                        </div>
                    `, { autoClose: false });
                }, 1000);

                // Always return ok() response to prevent email enumeration
                return ok();
            }

            // Assign account id and a few other properties then save
            account.id = newAccountId();
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.refreshTokens = [];
            delete account.confirmPassword;
            if (account.id === 1) {
                // First registered account is an admin
                account.role = Role.Admin;
                account.status = 'active';
                account.isVerified = true;
            } else {
                account.role = Role.User;
                account.status = 'inactive';
                account.isVerified = false;
                // Display verification email in alert
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Thanks for registering!</h4>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div class="alert alert-warning">
                            The fake backend displayed this "email" so you can test without an API. 
                            A real backend would send a real email.
                        </div>
                    `, { autoClose: false });
                }, 1000);
            }
            
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);
            
            if (!account) return error("Verification failed");
            
            // Set isVerified flag to true if token is valid
            account.isVerified = true;
            account.status = 'active';
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            return ok();
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);

            // Always return ok() response to prevent email enumeration
            if (!account) return ok();

            // Create reset token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // Display password reset email in alert
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertService.info(`
                    <h4>Password Reset Email</h4>
                    <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <div class="alert alert-warning">
                        The fake backend displayed this "email" so you can test without an API. 
                        A real backend would send a real email.
                    </div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }

        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x => 
                !!x.resetToken && 
                x.resetToken === token && 
                new Date() < new Date(x.resetTokenExpires)
            );

            if (!account) return error("Invalid token");
            
            return ok();
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                !!x.resetToken && 
                x.resetToken === token && 
                new Date() < new Date(x.resetTokenExpires)
            );

            if (!account) return error('Invalid token');

            // Update password and remove reset token
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function getAccounts() {
            if (!isAuthenticated()) return unauthorized();
            return ok(accounts.map(x => basicDetails(x)));
        }

        function getAccountById() {
            if (!isAuthenticated()) return unauthorized();

            const account = accounts.find(x => x.id === idFromUrl());
            
            // User accounts can get own profile and admin accounts can get all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }
            
            return ok(basicDetails(account));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                return error(`Email ${account.email} is already registered`);
            }
            
            // Assign account id and a few other properties then save
            account.id = newAccountId();
            account.dateCreated = new Date().toISOString();
            account.isVerified = true;
            account.status = 'inactive';    // status is inactive by default
            account.refreshTokens = [];
            delete account.confirmPassword;
            
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            return ok();
        }

        function updateAccount() {
            console.log("updateAccount called");
        
            if (!isAuthenticated()) {
                console.error("Unauthorized: User not authenticated");
                return unauthorized();
            }
        
            let params = body;
            console.log("Request body:", params);
        
            let account = accounts.find(x => x.id === idFromUrl());
            console.log("Account found:", account);
        
            // User accounts can update own profile and admin accounts can update all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                console.error("Unauthorized: Insufficient permissions");
                return unauthorized();
            }
        
            // Only update password if included
            if (!params.password) {
                console.log("No password included, skipping password update");
                delete params.password;
            }
        
            // Validate status if provided
            if (params.status && !['active', 'inactive'].includes(params.status)) {
                console.error("Invalid status value:", params.status);
                return error('Invalid status value');
            }
        
            // Validate role if provided
            if (params.role && !Object.values(Role).includes(params.role)) {
                console.error("Invalid role value:", params.role);
                return error('Invalid role value');
            }
        
            // Don't save confirm password
            if (params.confirmPassword) {
                console.log("Removing confirmPassword from params");
                delete params.confirmPassword;
            }
        
            // Update and save account
            console.log("Updating account with params:", params);
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            console.log("Account updated successfully:", account);
        
            return ok(basicDetails(account));
        }
        

        function deleteAccount() {
            if (!isAuthenticated()) return unauthorized();
            
            let account = accounts.find(x => x.id === idFromUrl());
            
            // User accounts can delete own account and admin accounts can delete any account
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }
            
            // Delete account then save
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            
            return ok();
        }

        // Helper functions
        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // Delay observable to simulate server API call
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize());
            // Call materialize and dematerialize to ensure delay even if an error is thrown
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function basicDetails(account) {
            const { id, title, firstName, lastName, email, role, status, dateCreated, isVerified } = account;
            return { id, title, firstName, lastName, email, role, status, dateCreated, isVerified };
        }

        function isAuthenticated() {
            return !!currentAccount();
        }

        function isAuthorized(role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            // Check if JWT token is in auth header
            const authHeader = headers.get('Authorization');
            if (!authHeader?.startsWith('Bearer fake-jwt-token')) return;

            // Check if token is expired
            const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
            const tokenExpired = Date.now() > (jwtToken.exp * 1000);
            if (tokenExpired) return;

            const account = accounts.find(x => x.id === jwtToken.id);
            return account;
        }

        function generateJwtToken(account) {
            // Create token that expires in 15 minutes
            const tokenPayload = {
                exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
                id: account.id
            };
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

        function generateRefreshToken() {
            const token = new Date().getTime().toString();

            // Add token cookie that expires in 7 days
            const expires = new Date(Date.now() + 7*24*60*60*1000).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
            
            return token;
        }

        function getRefreshToken() {
            // Get refresh token from cookie
            return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '').split('=')[1];
        }
    }
}

export const fakeBackendProvider = {
    // Use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};