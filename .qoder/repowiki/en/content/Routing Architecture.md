# Routing Architecture

<cite>
**Referenced Files in This Document**
- [web.php](file://routes/web.php)
- [auth.php](file://routes/auth.php)
- [settings.php](file://routes/settings.php)
- [app.php](file://bootstrap/app.php)
- [HandleInertiaRequests.php](file://app/Http/Middleware/HandleInertiaRequests.php)
- [app.blade.php](file://resources/views/app.blade.php)
- [app.tsx](file://resources/js/app.tsx)
- [dashboard.tsx](file://resources/js/pages/dashboard.tsx)
- [welcome.tsx](file://resources/js/pages/welcome.tsx)
- [AuthenticatedSessionController.php](file://app/Http/Controllers/Auth/AuthenticatedSessionController.php)
- [PayrollController.php](file://app/Http/Controllers/PayrollController.php)
- [EmployeeController.php](file://app/Http/Controllers/EmployeeController.php)
- [ManageEmployeeController.php](file://app/Http/Controllers/ManageEmployeeController.php)
- [EmployeeManage.php](file://app/Http/Controllers/EmployeeManage.php)
- [Manage.tsx](file://resources/js/pages/Employees/Manage/Manage.tsx)
- [Compensation.tsx](file://resources/js/pages/Employees/Manage/Compensation.tsx)
- [Settings.tsx](file://resources/js/pages/Employees/Manage/Settings.tsx)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive documentation for new Manage Employee routing structure
- Updated employee management routes section to reflect new manage.employees routes
- Added new Manage Employee Controller documentation
- Updated navigation structure to include employee management tabs
- Enhanced dependency analysis to include new employee management components

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the routing architecture of a Laravel-based payroll management application using Inertia.js for seamless single-page application behavior. The system separates concerns between server-side routing and client-side navigation, leveraging Laravel routes to render React pages via Inertia middleware. Authentication routes are isolated under dedicated route groups, while feature-specific routes are grouped by domain areas such as payroll, employees, and settings. The architecture now includes a comprehensive employee management system with dedicated routes for managing employee compensation, benefits, and settings.

## Project Structure
The routing architecture spans three primary layers:
- Server-side routing: Laravel routes define endpoints and attach controllers for rendering Inertia pages.
- Middleware layer: Inertia middleware manages the root template and shared data for React pages.
- Client-side routing: Inertia handles navigation between React pages without full page reloads.

```mermaid
graph TB
Browser["Browser"]
Laravel["Laravel Application"]
Routes["Routes<br/>web.php, auth.php, settings.php"]
Middleware["Middleware<br/>HandleInertiaRequests"]
Controllers["Controllers<br/>PayrollController, EmployeeController,<br/>ManageEmployeeController, EmployeeManage"]
Views["Blade Template<br/>app.blade.php"]
React["React Pages<br/>dashboard.tsx, welcome.tsx, EmployeeManage"]
Browser --> Laravel
Laravel --> Routes
Routes --> Controllers
Controllers --> Middleware
Middleware --> Views
Views --> React
```

**Diagram sources**
- [web.php:1-110](file://routes/web.php#L1-L110)
- [auth.php:1-57](file://routes/auth.php#L1-L57)
- [settings.php:1-22](file://routes/settings.php#L1-L22)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)

**Section sources**
- [web.php:1-110](file://routes/web.php#L1-L110)
- [auth.php:1-57](file://routes/auth.php#L1-L57)
- [settings.php:1-22](file://routes/settings.php#L1-L22)
- [app.php:1-24](file://bootstrap/app.php#L1-L24)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)

## Core Components
- Route registration: Laravel registers routes in web.php, auth.php, and settings.php, grouping routes by domain and middleware.
- Inertia middleware: HandleInertiaRequests sets the root template and shares application-wide data (authentication, flash messages).
- Blade template: app.blade.php integrates Vite and Inertia to mount React pages.
- Frontend entry: app.tsx configures Inertia with page resolution and progress indicators.
- Controllers: Controllers handle request processing and render Inertia pages with appropriate data.

Key routing patterns:
- Authentication routes are guarded by guest middleware for registration/login and auth middleware for verification and logout.
- Feature routes are grouped under prefixes (e.g., payroll, employees, settings) and use controller actions to render React pages.
- Settings routes provide profile and password management under an authenticated context.
- **Updated** Employee management routes now include dedicated manage.employees routes for comprehensive employee administration.

**Section sources**
- [web.php:1-110](file://routes/web.php#L1-L110)
- [auth.php:1-57](file://routes/auth.php#L1-L57)
- [settings.php:1-22](file://routes/settings.php#L1-L22)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)

## Architecture Overview
The routing architecture follows a layered pattern:
- HTTP requests enter Laravel via web routes.
- Controllers process requests and return Inertia responses.
- Inertia middleware prepares the root view and shared data.
- The Blade template renders the React application with resolved pages.

```mermaid
sequenceDiagram
participant Client as "Client Browser"
participant Laravel as "Laravel Router"
participant Controller as "Controller Action"
participant Middleware as "Inertia Middleware"
participant Blade as "Blade Template"
participant React as "React Page"
Client->>Laravel : HTTP Request
Laravel->>Controller : Route dispatch
Controller->>Middleware : Return Inertia response
Middleware->>Blade : Render root template with shared data
Blade->>React : Mount page component
React-->>Client : Interactive SPA page
```

**Diagram sources**
- [web.php:1-110](file://routes/web.php#L1-L110)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)

## Detailed Component Analysis

### Authentication Routing
Authentication routes are defined under guest middleware for registration and login, and under auth middleware for verification and logout. These routes render React pages via Inertia.

```mermaid
sequenceDiagram
participant Client as "Client"
participant AuthRoutes as "Auth Routes"
participant AuthController as "AuthenticatedSessionController"
participant Middleware as "Inertia Middleware"
participant Blade as "Blade Template"
participant React as "React Login Page"
Client->>AuthRoutes : GET /login
AuthRoutes->>AuthController : Dispatch create action
AuthController->>Middleware : Return Inertia response
Middleware->>Blade : Render root template
Blade->>React : Mount login page
React-->>Client : Login form
```

**Diagram sources**
- [auth.php:13-35](file://routes/auth.php#L13-L35)
- [AuthenticatedSessionController.php:19-25](file://app/Http/Controllers/Auth/AuthenticatedSessionController.php#L19-L25)
- [HandleInertiaRequests.php:18-53](file://app/Http/Middleware/HandleInertiaRequests.php#L18-L53)
- [app.blade.php:12-20](file://resources/views/app.blade.php#L12-L20)

**Section sources**
- [auth.php:1-57](file://routes/auth.php#L1-L57)
- [AuthenticatedSessionController.php:1-52](file://app/Http/Controllers/Auth/AuthenticatedSessionController.php#L1-L52)

### Payroll Feature Routing
Payroll routes are grouped under the payroll prefix and handled by PayrollController. The controller queries related models and computes derived values for rendering.

```mermaid
sequenceDiagram
participant Client as "Client"
participant PayrollRoutes as "Payroll Routes"
participant PayrollController as "PayrollController"
participant Middleware as "Inertia Middleware"
participant Blade as "Blade Template"
participant React as "React Payroll Page"
Client->>PayrollRoutes : GET /payroll
PayrollRoutes->>PayrollController : Dispatch index action
PayrollController->>Middleware : Return Inertia response
Middleware->>Blade : Render root template
Blade->>React : Mount payroll index page
React-->>Client : Payroll listing with filters
```

**Diagram sources**
- [web.php:27-30](file://routes/web.php#L27-L30)
- [PayrollController.php:13-81](file://app/Http/Controllers/PayrollController.php#L13-L81)
- [HandleInertiaRequests.php:18-53](file://app/Http/Middleware/HandleInertiaRequests.php#L18-L53)
- [app.blade.php:12-20](file://resources/views/app.blade.php#L12-L20)

**Section sources**
- [web.php:26-54](file://routes/web.php#L26-L54)
- [PayrollController.php:1-125](file://app/Http/Controllers/PayrollController.php#L1-L125)

### Employee Management Routing
**Updated** Employee routes are now organized into two distinct management systems:
- Basic employee CRUD operations under employees prefix
- Comprehensive employee management under manage.employees prefix

```mermaid
sequenceDiagram
participant Client as "Client"
participant EmployeeRoutes as "Employee Routes"
participant EmployeeController as "EmployeeController"
participant ManageEmployeeController as "ManageEmployeeController"
participant Middleware as "Inertia Middleware"
participant Blade as "Blade Template"
participant React as "React Employee Management Page"
Client->>EmployeeRoutes : GET /manage/employees/{employee}
EmployeeRoutes->>ManageEmployeeController : Dispatch index action
ManageEmployeeController->>Middleware : Return Inertia response
Middleware->>Blade : Render root template
Blade->>React : Mount employee management page
React-->>Client : Comprehensive employee management interface
```

**Diagram sources**
- [web.php:77-81](file://routes/web.php#L77-L81)
- [ManageEmployeeController.php:16-50](file://app/Http/Controllers/ManageEmployeeController.php#L16-L50)
- [HandleInertiaRequests.php:18-53](file://app/Http/Middleware/HandleInertiaRequests.php#L18-L53)
- [app.blade.php:12-20](file://resources/views/app.blade.php#L12-L20)

**Section sources**
- [web.php:66-81](file://routes/web.php#L66-L81)
- [ManageEmployeeController.php:1-86](file://app/Http/Controllers/ManageEmployeeController.php#L1-L86)
- [EmployeeManage.php:1-42](file://app/Http/Controllers/EmployeeManage.php#L1-L42)

### Settings Routing
Settings routes provide profile and password management under authenticated context, redirecting to profile editing by default.

```mermaid
sequenceDiagram
participant Client as "Client"
participant SettingsRoutes as "Settings Routes"
participant Middleware as "Inertia Middleware"
participant Blade as "Blade Template"
participant React as "React Settings Page"
Client->>SettingsRoutes : GET /settings
SettingsRoutes->>Middleware : Redirect to profile edit
Middleware->>Blade : Render root template
Blade->>React : Mount profile edit page
React-->>Client : Profile settings form
```

**Diagram sources**
- [settings.php:8-21](file://routes/settings.php#L8-L21)
- [HandleInertiaRequests.php:18-53](file://app/Http/Middleware/HandleInertiaRequests.php#L18-L53)
- [app.blade.php:12-20](file://resources/views/app.blade.php#L12-L20)

**Section sources**
- [settings.php:1-22](file://routes/settings.php#L1-L22)

### Frontend Integration
The frontend integrates with Laravel through Inertia:
- app.tsx configures Inertia with page resolution and progress indicators.
- React pages receive shared props from the Inertia middleware.
- The Blade template mounts the React application and injects assets.

```mermaid
flowchart TD
Start(["App Initialization"]) --> Config["Configure Inertia in app.tsx"]
Config --> Resolve["Resolve Page Components"]
Resolve --> Mount["Mount to Blade Template"]
Mount --> SharedProps["Share Props via Middleware"]
SharedProps --> Render["Render React Page"]
Render --> End(["Interactive SPA"])
```

**Diagram sources**
- [app.tsx:15-26](file://resources/js/app.tsx#L15-L26)
- [HandleInertiaRequests.php:37-53](file://app/Http/Middleware/HandleInertiaRequests.php#L37-L53)
- [app.blade.php:12-20](file://resources/views/app.blade.php#L12-L20)

**Section sources**
- [app.tsx:1-30](file://resources/js/app.tsx#L1-L30)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)

### Employee Management Interface
**New** The employee management interface provides a comprehensive tabbed system for managing employee details:

```mermaid
flowchart TD
EmployeePage["Employee Management Page"] --> OverviewTab["Overview Tab"]
EmployeePage --> CompensationTab["Compensation Tab"]
EmployeePage --> ReportsTab["Reports Tab"]
EmployeePage --> SettingsTab["Settings Tab"]
CompensationTab --> SalarySubtab["Salary Subtab"]
CompensationTab --> PERASubtab["PERA Subtab"]
CompensationTab --> RATASubtab["RATA Subtab"]
CompensationTab --> DeductionsSubtab["Deductions Subtab"]
```

**Diagram sources**
- [Manage.tsx:88-115](file://resources/js/pages/Employees/Manage/Manage.tsx#L88-L115)
- [Compensation.tsx:17-40](file://resources/js/pages/Employees/Manage/Compensation.tsx#L17-L40)

**Section sources**
- [Manage.tsx:1-120](file://resources/js/pages/Employees/Manage/Manage.tsx#L1-L120)
- [Compensation.tsx:1-46](file://resources/js/pages/Employees/Manage/Compensation.tsx#L1-L46)
- [Settings.tsx:1-265](file://resources/js/pages/Employees/Manage/Settings.tsx#L1-L265)

## Dependency Analysis
The routing architecture exhibits clear separation of concerns:
- Routes depend on controllers for business logic.
- Controllers depend on middleware for shared data and root template rendering.
- Middleware depends on the Blade template for mounting React pages.
- Frontend pages depend on Inertia for navigation and data sharing.
- **Updated** Employee management routes now depend on both ManageEmployeeController and EmployeeManage for different management contexts.

```mermaid
graph TB
Routes["Routes<br/>web.php, auth.php, settings.php"]
Controllers["Controllers<br/>PayrollController, EmployeeController,<br/>ManageEmployeeController, EmployeeManage"]
Middleware["HandleInertiaRequests"]
Blade["app.blade.php"]
ReactPages["React Pages<br/>dashboard.tsx, welcome.tsx, EmployeeManage"]
Routes --> Controllers
Controllers --> Middleware
Middleware --> Blade
Blade --> ReactPages
```

**Diagram sources**
- [web.php:1-110](file://routes/web.php#L1-L110)
- [auth.php:1-57](file://routes/auth.php#L1-L57)
- [settings.php:1-22](file://routes/settings.php#L1-L22)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)

**Section sources**
- [web.php:1-110](file://routes/web.php#L1-L110)
- [auth.php:1-57](file://routes/auth.php#L1-L57)
- [settings.php:1-22](file://routes/settings.php#L1-L22)
- [HandleInertiaRequests.php:1-55](file://app/Http/Middleware/HandleInertiaRequests.php#L1-L55)
- [app.blade.php:1-21](file://resources/views/app.blade.php#L1-L21)

## Performance Considerations
- Route grouping reduces overhead by organizing related endpoints under shared prefixes.
- Inertia middleware shares minimal data to reduce payload sizes.
- Frontend page resolution leverages Vite for efficient asset loading.
- Pagination in controllers limits data transfer for large datasets.
- **Updated** Employee management routes optimize data loading by preloading related models and using efficient query relationships.

## Troubleshooting Guide
Common issues and resolutions:
- Authentication redirects: Ensure guest/auth middleware groups are correctly applied to avoid login loops.
- Inertia rendering errors: Verify the root template path and shared data keys in middleware.
- Asset loading problems: Confirm Vite configuration and Blade @vite directives are present.
- Route not found: Check route group prefixes and controller method signatures.
- **Updated** Employee management issues: Verify manage.employees routes are properly nested and controller methods match route parameters.

**Section sources**
- [auth.php:13-35](file://routes/auth.php#L13-L35)
- [HandleInertiaRequests.php:18-53](file://app/Http/Middleware/HandleInertiaRequests.php#L18-L53)
- [app.blade.php:12-20](file://resources/views/app.blade.php#L12-L20)
- [web.php:77-81](file://routes/web.php#L77-L81)

## Conclusion
The routing architecture combines Laravel's structured routing with Inertia.js to deliver a responsive, SPA-like experience. Routes are cleanly organized by domain, controllers encapsulate business logic, and middleware ensures consistent data sharing and template rendering. The recent major routing restructuring introduces comprehensive employee management capabilities with dedicated routes for managing employee compensation, benefits, and settings. This enhanced architecture enables maintainable development and predictable navigation across authentication, payroll, employee management, and settings domains, providing a robust foundation for the payroll management application.