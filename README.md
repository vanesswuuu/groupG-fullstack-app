# User Management System

A full-stack application for managing employee information, department details, tracking workflows, and equipment requests. The system includes features like user signup, authentication, role-based access control, and CRUD operations across various modules.

## Table of Contents
- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Team Members](#team-members-and-assigned-tasks)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

The **User Management System** is a web-based application designed to streamline organizational tasks by providing modules for:
- Employee management
- Department management
- Workflow tracking
- Equipment request handling

This project involves both frontend and backend development, along with comprehensive testing and deployment strategies.

---

## Project Overview

### Team Members and Assigned Tasks

#### 1. Benitez  
- **Role:** Frontend Developer  
- **Assigned Tasks:**  
  - Develop the frontend components for **department management** UI  
- **Assigned Branch:**  
  - `benitez_department` creating the frontend component for department management  

#### 2. Alin  
- **Role:** Project Manager/Full Stack Developer (Frontend & Backend)  
- **Assigned Tasks:**
  - Managing the team
  - CI/CD & DevOps
  - Work on **requests management** module (both frontend and backend)  
  - Set up the development environment  
  - Responsible for deploying the application  
- **Assigned Branches:**  
  - `main` creating the frontend and backend components for requests management  

#### 3. Licanda  
- **Role:** Tester  
- **Assigned Tasks:**  
  - Perform functional and security testing on the system  
  - Manage testing for **workflow management** functionality
  - Creating the workflows management functionality 
- **Assigned Branches:**  
  - `licanda_workflows` initiates functional and security testing of the systems  

#### 4. Guinto  
- **Role:** Backend Developer  
- **Assigned Tasks:**  
  - Focus on the backend, developing **employee management** services  
- **Assigned Branch:**  
  - `guinto_employee` creating the backend component for employee management  

### Branch Information

| Member      | Branch Name                         | Assigned Task                        |
|-------------|-------------------------------------|--------------------------------------|
| Benitez     | `benitez_department`              | Frontend - Department Management     |
| Alin        | `main`    | Full Stack - Requests Management & Application Deployment |
| Licanda     | `licanda_workflows`             | Functional & Security Testing & Workflows Management        |
| Guinto      | `guinto_employee`  | Backend - Employee Management        |

---

## Installation

### Prerequisites
- [PostgreSQL](https://www.postgresql.org/download/) (For local development/testing)
- [Node.js](https://nodejs.org/  ) (Latest LTS version)
- IDE of your choice (VS Code recommended)

> ⚠️ Note: The production database uses PostgreSQL deployed via Railway.

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/VulpritProoze/user-management-system.git  
   cd user-management-system
   ```

2. **Install and configure PostgreSQL**:
   - Download and install PostgreSQL
   - Remember your password during installation
   - Verify PostgreSQL service is running

3. **Initialize the project**:
   - Open the project in your IDE
   - Install dependencies:
     ```bash
     npm install
     ```

---

## Usage

Follow these steps to set up and run the application:

1. **Database Setup (Local Development):**
   - Open a PostgreSQL instance and note your credentials
   - Update `config.json` with your database credentials:
     ```json
     "database": {
         "host": "localhost",
         "port": 5432,
         "user": "postgres",
         "password": "[SET PostgreSQL Password here]",
         "database": "user_management_db"
     }
     ```

2. **Email Configuration (Test Environment):**
   - Use Gmail's SMTP server for sending verification and notification emails.
   - You may need to generate an **App Password** if 2FA is enabled on your account.
   - Configure SMTP settings in `config.json`:
     ```json
     "smtpOptions": {
         "host": "smtp.gmail.com",
         "port": 465,
         "secure": true,
         "auth": {
             "user": "[YOUR_GMAIL_ADDRESS]",
             "pass": "[YOUR_GMAIL_APP_PASSWORD]"
         },
         "from": "User Management System <raileyalin@gmail.com>"
     }
     ```

3. **Application Startup:**
   - In the root directory, open a command prompt and install dependencies:
     ```bash
     npm install
     ```
   - Start the backend server (in first terminal):
     ```bash
     npm run start:backend
     ```
   - Start the frontend Angular app (in second terminal):
     ```bash
     npm run start:frontend
     ```

4. **Access the Application:**
   - Open your browser and navigate to:
     ```
     http://localhost:4200
     ```
   - Test features including:
     - Employee registration and management
     - Department creation and assignment
     - Request submission and approval workflow
     - Admin dashboard (if admin user)

> **Note:** Ensure you're logged into the Gmail account you used when registering a new account to check sent/received emails for account verification.

---

## Deployment

| Component   | Platform       | URL (if applicable) |
|------------|----------------|---------------------|
| Database   | Railway PostgreSQL | Auto-managed via Railway |
| Frontend   | Vercel          | [Live App](https://group-g-fullstack-app.vercel.app) |
| Backend    | Railway Node Server | [API Endpoint](https://groupg-fullstack-app-production.up.railway.app) |

---

## Testing

1. Functional testing results: [Link to test cases](https://docs.google.com/document/d/1pcmrpNUKAuFbz8pSlUhtA2zy5qdsb3n7I16VfU7aSDE/edit?usp=sharing)
2. Security testing results: [Link to test cases](https://docs.google.com/document/d/1iQvH2xut2616lbC8bNOF09OteJSJdZVrydNADv0-Zb4/edit?usp=sharing)

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository.
2. Clone your fork locally.
   ```
   git clone https://github.com/your-username/user-management-system.git  
   ```
3. Set up the development environment (see [Installation section](#installation))

### Workflow
1. Create a new branch for your feature/fix:
   ```
   git checkout -b feat/your-feature-name
   ```
   or
   ```
   git checkout -b fix/issue-description
   ```
2. Make your changes following the project's coding standards
3. Commit your changes with a descriptive message:
   ```
   git commit -m "feat: add user profile editing capability"
   ```

### Pull Requests
1. Push your branch to your fork:
   ```
   git push origin your-branch-name
   ```
2. Open a Pull Request against the `main` branch
3. Include in your PR description:
   - Purpose of the changes
   - Screenshots if applicable
   - Any relevant test results

### Guidelines
- Follow existing code style and patterns
- Write clear commit messages using Conventional Commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `chore:` for maintenance tasks
- Keep PRs focused on a single purpose
- Update documentation when adding new features

### Reporting Issues
When opening an issue, please include:
- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS version if relevant

---

## License

MIT License

<div align="justify">
Copyright (c) 2025, University of Cebu - Main

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</div>
