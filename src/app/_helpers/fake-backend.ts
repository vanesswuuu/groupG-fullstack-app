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

const departmentsKey = 'angular-16-signup-verification-boilerplate-departments';
let departments = JSON.parse(localStorage.getItem(departmentsKey)) || [];

const employeesKey = 'angular-16-signup-verification-boilerplate-employees';
let employees = JSON.parse(localStorage.getItem(employeesKey)) || [];

const requestsKey = 'angular-16-signup-verification-boilerplate-requests';
let requests = JSON.parse(localStorage.getItem(requestsKey)) || [];

const workflowsKey = 'angular-16-signup-verification-boilerplate-workflows';
let workflows = JSON.parse(localStorage.getItem(workflowsKey)) || [];

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

                case url.endsWith('/departments') && method === 'GET':
                    return getDepartments();
                case url.endsWith('/departments') && method === 'POST':
                    return createDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'GET':
                    return getDepartmentById();
                case url.match(/\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment();
                
                case url.endsWith('/employees') && method === 'GET':
                    return getEmployees();
                case url.endsWith('/employees') && method === 'POST':
                    return createEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'GET':
                    return getEmployeeById();
                case url.match(/\/employees\/\d+$/) && method === 'PUT':
                    return updateEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'DELETE':
                    return deleteEmployee();
                case url.match(/\/employees\/\d+\/transfer$/) && method === 'POST':
                    return transferEmployee();
                
                case url.endsWith('/requests') && method === 'GET':
                    return getRequests();
                case url.endsWith('/requests') && method === 'POST':
                    return createRequest();
                case url.match(/\/requests\/\d+$/) && method === 'GET':
                    return getRequestById();
                case url.match(/\/requests\/\d+$/) && method === 'PUT':
                    return updateRequest();
                case url.match(/\/requests\/\d+$/) && method === 'DELETE':
                    return deleteRequest();
                case url.endsWith('/requests/employee') && method === 'GET':
                    return getRequestsByEmployee();
                
                case url.endsWith('/workflows') && method === 'POST':
                    return createWorkflow();
                case url.match(/\/workflows\/employee\/\d+$/) && method === 'GET':
                    return getWorkflowsByEmployee();
                case url.match(/\/workflows\/\d+\/status$/) && method === 'PUT':
                    return updateWorkflowStatus();
                case url.endsWith('/workflows/onboarding') && method === 'POST':
                    return initiateOnboarding();
                
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
        
            let isVerified = false;
            let message = 'Registration successful, please check your email for verification instructions';
        
            if (account.id === 1) {
                // First registered account is an admin
                account.role = Role.Admin;
                account.status = 'active';
                account.isVerified = true;
                isVerified = true;
                message = 'Registration successful'; // no need to verify for first user
            } else {
                account.role = Role.User;
                account.status = 'inactive';
                account.isVerified = false;
                isVerified = false;
        
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
        
            // Return success response with message and isVerified flag
            return ok({
                message: message,
                isVerified: isVerified
            });
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
            const authenticated = !!currentAccount();
            console.log(` isAuthenticated(): ${authenticated}`);
            return authenticated;
        }

        function isAuthorized(role) {
            const account = currentAccount();
            const authorized = account && account.role === role;
            console.log(` isAuthorized('${role}'): ${authorized}`);
            if (account) {
                console.log(' User Role:', account.role);
            } else {
                console.log(' No account found');
            }
            return authorized;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            console.log('Url: ', urlParts);
            const id = parseInt(urlParts[urlParts.length - 1]);
            console.log('Url ID: ', id);
            return id;
        }

        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            console.log('--- START: currentAccount() ---');
        
            const authHeader = headers.get('Authorization');
            console.log('Authorization Header:', authHeader);
        
            if (!authHeader || !authHeader.startsWith('Bearer fake-jwt-token')) {
                console.warn('No valid auth header found');
                return null;
            }
        
            try {
                const token = authHeader.split('.')[1];
                const decoded = JSON.parse(atob(token));
                console.log('Decoded JWT Token:', decoded);
        
                const tokenExpired = Date.now() > (decoded.exp * 1000);
                if (tokenExpired) {
                    console.warn('JWT Token is expired');
                    return null;
                }
        
                const account = accounts.find(x => x.id === decoded.id);
                if (!account) {
                    console.error('Account not found for id:', decoded.id);
                    return null;
                }
        
                console.log('✅ Current Account Found:', {
                    id: account.id,
                    email: account.email,
                    role: account.role
                });
        
                return account;
        
            } catch (e) {
                console.error('Error decoding JWT token', e);
                return null;
            }
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

        function getDepartments() {
            if (!isAuthenticated()) return unauthorized();
            return ok(departments);
        }
        
        function createDepartment() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const department = body;
            if (departments.find(x => x.name === department.name)) {
                return error(`Department "${department.name}" already exists`);
            }
            
            department.id = departments.length ? Math.max(...departments.map(x => x.id)) + 1 : 1;
            department.created = new Date().toISOString();
            departments.push(department);
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            
            return ok(department);
        }
        
        function getDepartmentById() {
            if (!isAuthenticated()) return unauthorized();
            
            const department = departments.find(x => x.id === idFromUrl());
            if (!department) return error('Department not found');
            
            return ok(department);
        }
        
        function updateDepartment() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const params = body;
            const department = departments.find(x => x.id === idFromUrl());
            if (!department) return error('Department not found');
            
            if (params.name && department.name !== params.name && 
                departments.find(x => x.name === params.name)) {
                return error(`Department "${params.name}" already exists`);
            }
            
            Object.assign(department, params);
            department.updated = new Date().toISOString();
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            
            return ok(department);
        }
        
        function deleteDepartment() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            departments = departments.filter(x => x.id !== idFromUrl());
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            
            return ok({ message: 'Department deleted successfully' });
        }
        
        function getEmployees() {
            if (!isAuthenticated()) return unauthorized();
            
            // Include account and department details
            const employeesWithDetails = employees.map(employee => {
                const account = accounts.find(a => a.id == employee.userId);
                const department = departments.find(d => d.id == employee.departmentId);
                return {
                    ...employee,
                    account: account ? {
                        id: account.id,
                        firstName: account.firstName,
                        lastName: account.lastName,
                        email: account.email
                    } : null,
                    department: department ? {
                        id: department.id,
                        name: department.name
                    } : null
                };
            });
            
            return ok(employeesWithDetails);
        }
        
        function createEmployee() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const employee = body;
            
            if (employees.find(x => x.employeeId == employee.employeeId)) {
                return error(`Employee ID "${employee.employeeId}" is already taken`);
            }
            
            if (!accounts.find(x => x.id == employee.userId)) {
                return error('Account not found');
            }
            
            if (employee.departmentId && !departments.find(x => x.id == employee.departmentId)) {
                return error('Department not found');
            }
            
            employee.id = employees.length ? Math.max(...employees.map(x => x.id)) + 1 : 1;
            employee.created = new Date().toISOString();
            employee.status = employee.status || 'active';
            employees.push(employee);
            localStorage.setItem(employeesKey, JSON.stringify(employees));
            
            return ok(employee);
        }
        
        function getEmployeeById() {
            if (!isAuthenticated()) return unauthorized();
            
            const employee = employees.find(x => x.id == idFromUrl());
            if (!employee) return error('Employee not found');
            
            // Include account and department details
            const account = accounts.find(a => a.id == employee.userId);
            const department = departments.find(d => d.id == employee.departmentId);
            
            const employeeWithDetails = {
                ...employee,
                account: account ? {
                    id: account.id,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    email: account.email
                } : null,
                department: department ? {
                    id: department.id,
                    name: department.name
                } : null
            };
            
            return ok(employeeWithDetails);
        }
        
        function updateEmployee() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const params = body;
            const employee = employees.find(x => x.id == idFromUrl());
            if (!employee) return error('Employee not found');
            
            if (params.employeeId && employee.employeeId !== params.employeeId && 
                employees.find(x => x.employeeId == params.employeeId)) {
                return error(`Employee ID "${params.employeeId}" is already taken`);
            }
            
            if (params.departmentId && !departments.find(x => x.id == params.departmentId)) {
                return error('Department not found');
            }
            
            Object.assign(employee, params);
            employee.updated = new Date().toISOString();
            localStorage.setItem(employeesKey, JSON.stringify(employees));
            
            return ok(employee);
        }
        
        function deleteEmployee() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            employees = employees.filter(x => x.id != idFromUrl());
            localStorage.setItem(employeesKey, JSON.stringify(employees));
            
            return ok({ message: 'Employee deleted successfully' });
        }
        
        function transferEmployee() {
            console.log('--- START: transferEmployee ---');
        
            // Check if user is admin
            if (!isAuthorized(Role.Admin)) {
                console.warn('User is not authorized (not an admin)');
                return unauthorized();
            }
            console.log('User is authorized as Admin');
        
            // Get IDs from URL and body
            const urlParts = url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);

            const employeeId = String(id);
            const departmentId = String(body.departmentId);
        
            console.log('Raw employee ID from URL:', idFromUrl());
            console.log('Converted employeeId (string):', employeeId);
            console.log('Raw departmentId from body:', body.departmentId);
            console.log('Converted departmentId (string):', departmentId);
        
            // Find the employee
            console.log('Searching for employee in:', employees);
            const employee = employees.find(x => {
                const match = x.id == employeeId;
                console.log(`Comparing employee.id='${x.id}' (type: ${typeof x.id}) vs employeeId='${employeeId}' (type: ${typeof employeeId}) → Match?`, match);
                return match;
            });
        
            if (!employee) {
                console.error('Employee not found!');
                return error('Employee not found');
            }
            console.log('✅ Employee found:', employee);
        
            // Find the department
            console.log('Searching for department in:', departments);
            const department = departments.find(x => {
                const match = x.id == departmentId;
                console.log(`Comparing department.id='${x.id}' (type: ${typeof x.id}) vs departmentId='${departmentId}' (type: ${typeof departmentId}) → Match?`, match);
                return match;
            });
        
            if (!department) {
                console.error('Department not found!');
                return error('Department not found');
            }
            console.log('✅ Department found:', department);
        
            // Update employee
            console.log('Updating employee departmentId from', employee.departmentId, 'to', departmentId);
            employee.departmentId = departmentId;
            employee.updated = new Date().toISOString();
        
            console.log('Saving updated employees to localStorage:', employees);
            localStorage.setItem(employeesKey, JSON.stringify(employees));
        
            console.log('✅ Transfer complete! Returning employee:', employee);
            return ok(employee);
        }
        
        function getRequests() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            // Include employee and account details
            const requestsWithDetails = requests.map(request => {
                const employee = employees.find(e => e.id == request.employeeId);
                const account = employee ? accounts.find(a => a.id == employee.userId) : null;
                
                return {
                    ...request,
                    employee: employee ? {
                        id: employee.id,
                        employeeId: employee.employeeId,
                        account: account ? {
                            firstName: account.firstName,
                            lastName: account.lastName,
                            email: account.email
                        } : null
                    } : null
                };
            });
            
            return ok(requestsWithDetails);
        }
        
        function createRequest() {
            if (!isAuthenticated()) return unauthorized();
            
            const request = body;
            const employee = employees.find(x => x.id == request.employeeId);
            if (!employee) return error('Employee not found');
            
            // Check if user is creating request for themselves or is admin
            const account = currentAccount();
            if (employee.userId !== account.id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }
            
            request.id = requests.length ? Math.max(...requests.map(x => x.id)) + 1 : 1;
            request.created = new Date().toISOString();
            request.status = 'pending';
            requests.push(request);
            localStorage.setItem(requestsKey, JSON.stringify(requests));
            
            return ok(request);
        }
        
        function getRequestById() {
            if (!isAuthenticated()) return unauthorized();
            
            const request = requests.find(x => x.id == idFromUrl());
            if (!request) return error('Request not found');
            
            // Check if user is authorized to view this request
            const account = currentAccount();
            const employee = employees.find(e => e.id == request.employeeId);
            if (employee?.userId !== account.id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }
            
            return ok(request);
        }
        
        function updateRequest() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const params = body;
            const request = requests.find(x => x.id == idFromUrl());
            if (!request) return error('Request not found');
            
            Object.assign(request, params);
            request.updated = new Date().toISOString();
            localStorage.setItem(requestsKey, JSON.stringify(requests));
            
            return ok(request);
        }
        
        function deleteRequest() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            requests = requests.filter(x => x.id != idFromUrl());
            localStorage.setItem(requestsKey, JSON.stringify(requests));
            
            return ok({ message: 'Request deleted successfully' });
        }
        
        function getRequestsByEmployee() {
            if (!isAuthenticated()) return unauthorized();
            
            const employeeId = body.employeeId;
            const account = currentAccount();
            
            // Check if user is requesting their own requests or is admin
            const employee = employees.find(e => e.id == employeeId);
            if (employee?.userId !== account.id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }
            
            const employeeRequests = requests.filter(x => x.employeeId == employeeId);
            return ok(employeeRequests);
        }
        
        function createWorkflow() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const workflow = body;
            const employee = employees.find(x => x.id == workflow.employeeId);
            console.log('Employee: ', employee);
            if (!employee) return error('Employee not found');
            
            workflow.id = workflows.length ? Math.max(...workflows.map(x => x.id)) + 1 : 1;
            workflow.created = new Date().toISOString();
            workflow.status = workflow.status || 'pending';
            workflows.push(workflow);
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));
            
            return ok(workflow);
        }
        
        function getWorkflowsByEmployee() {
            console.log('--- START: getWorkflowsByEmployee ---');
        
            // 1. Check if user is authorized as Admin
            console.log('Checking if user is authorized as Admin...');
            if (!isAuthorized(Role.Admin)) {
                console.warn('User is NOT authorized (not an admin)');
                return unauthorized();
            }
            console.log('✅ User is authorized as Admin');
        
            // 2. Get employeeId from URL path (since the URL pattern is /workflows/employee/{id})
            const urlParts = url.split('/');
            const employeeId = parseInt(urlParts[urlParts.length - 1]);
        
            console.log('Received employeeId:', employeeId);
            console.log('Type of employeeId:', typeof employeeId);
        
            if (!employeeId || isNaN(employeeId)) {
                console.error('❌ Missing or invalid employeeId in URL');
                return error('Missing or invalid employeeId');
            }
        
            // 3. Get current account
            const account = currentAccount();
            console.log('Current account:', account ? {
                id: account.id,
                firstName: account.firstName,
                lastName: account.lastName,
                role: account.role
            } : 'No account found');
        
            if (!account) {
                console.error('No current account found!');
                return unauthorized();
            }
        
            // 4. Find the employee by ID
            console.log('Searching for employee with id:', employeeId);
            const employee = employees.find(e => e.id == employeeId);
            
            if (!employee) {
                console.error('Employee not found for id:', employeeId);
                return error('Employee not found');
            }
        
            console.log('Found employee:', {
                id: employee.id,
                userId: employee.userId,
                accountId: account.id,
                role: account.role
            });
        
            // 5. Check ownership or admin status
            if (employee.userId !== account.id && !isAuthorized(Role.Admin)) {
                console.warn('Unauthorized access attempt:');
                console.log('employee.userId:', employee.userId);
                console.log('current account.id:', account.id);
                console.log('User role:', account.role);
                return unauthorized();
            }
        
            console.log('✅ Access granted. Fetching workflows for employeeId:', employeeId);
        
            // 6. Get workflows for the employee
            const employeeWorkflows = workflows.filter(x => x.employeeId == employeeId);
            console.log('Found workflows:', employeeWorkflows.length);
            console.log('Workflows:', employeeWorkflows);
        
            // 7. Add employee & account details to each workflow
            console.log('Enriching workflows with employee and account details...');
            const workflowsWithDetails = employeeWorkflows.map(workflow => {
                const emp = employees.find(e => e.id == workflow.employeeId);
                
                if (!emp) {
                    console.warn(`⚠️ Employee not found for workflow ID: ${workflow.id}`);
                    return {
                        ...workflow,
                        employee: null
                    };
                }
        
                const acc = accounts.find(a => a.id == emp.userId);
        
                return {
                    ...workflow,
                    employee: {
                        id: emp.id,
                        employeeId: emp.employeeId,
                        account: acc ? {
                            firstName: acc.firstName,
                            lastName: acc.lastName,
                            email: acc.email
                        } : null
                    }
                };
            });
        
            console.log('✅ Final enriched workflows:', workflowsWithDetails);
        
            return ok(workflowsWithDetails);
        }
        
        function updateWorkflowStatus() {
            console.group('updateWorkflowStatus Debug');
            
            // 1. Authorization check
            if (!isAuthorized(Role.Admin)) {
                console.error('Authorization failed');
                console.groupEnd();
                return unauthorized();
            }
        
            // 2. Workaround for idFromUrl() issue
            let workflowId;
            try {
                // First try the existing idFromUrl()
                workflowId = idFromUrl();
                
                // If NaN, try manual parsing
                if (isNaN(workflowId)) {
                    console.warn('idFromUrl() returned NaN, attempting manual parse');
                    const urlParts = url.split('/');
                    const idPart = urlParts[urlParts.length - 2]; // Get the part before "status"
                    workflowId = parseInt(idPart, 10);
                }
                
                if (isNaN(workflowId)) {
                    throw new Error('Could not parse workflow ID');
                }
            } catch (error) {
                console.error('Failed to parse workflow ID:', error);
                console.log('URL:', url);
                console.groupEnd();
                return error('Invalid workflow ID');
            }
        
            console.log('Using workflowId:', workflowId);
        
            // 3. Find workflow
            const workflow = workflows.find(x => x.id == workflowId);
            if (!workflow) {
                console.error('Workflow not found');
                console.log('Available IDs:', workflows.map(w => w.id));
                console.groupEnd();
                return error('Workflow not found');
            }
        
            // 4. Validate body
            if (!body?.status) {
                console.error('Missing status');
                console.groupEnd();
                return error('Status is required');
            }
        
            // 5. Update workflow
            workflow.status = body.status;
            workflow.updated = new Date().toISOString();
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));
        
            console.log(`Updated workflow ${workflowId} status to ${body.status}`);
            console.groupEnd();
            return ok(workflow);
        }
        
        function initiateOnboarding() {
            if (!isAuthorized(Role.Admin)) return unauthorized();
            
            const params = body;
            const employee = employees.find(x => x.id == params.employeeId);
            if (!employee) return error('Employee not found');
            
            const workflow = {
                id: workflows.length ? Math.max(...workflows.map(x => x.id)) + 1 : 1,
                type: 'Onboarding',
                details: params.details || {},
                status: 'pending',
                employeeId: params.employeeId,
                created: new Date().toISOString()
            };
            
            workflows.push(workflow);
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));
            
            return ok(workflow);
        }
    }
}

export const fakeBackendProvider = {
    // Use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};