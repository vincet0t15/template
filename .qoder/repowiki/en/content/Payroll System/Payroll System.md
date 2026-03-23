# Payroll System

<cite>
**Referenced Files in This Document**
- [PayrollController.php](file://app/Http/Controllers/PayrollController.php)
- [RataController.php](file://app/Http/Controllers/RataController.php)
- [PeraController.php](file://app/Http/Controllers/PeraController.php)
- [SalaryController.php](file://app/Http/Controllers/SalaryController.php)
- [Pera.php](file://app/Models/Pera.php)
- [Rata.php](file://app/Models/Rata.php)
- [Salary.php](file://app/Models/Salary.php)
- [Employee.php](file://app/Models/Employee.php)
- [DeductionType.php](file://app/Models/DeductionType.php)
- [EmployeeDeduction.php](file://app/Models/EmployeeDeduction.php)
- [payroll/index.tsx](file://resources/js/pages/payroll/index.tsx)
- [payroll/show.tsx](file://resources/js/pages/payroll/show.tsx)
- [payroll.d.ts](file://resources/js/types/payroll.d.ts)
- [2026_03_22_115109_create_peras_table.php](file://database/migrations/2026_03_22_115109_create_peras_table.php)
- [2026_03_22_115111_create_ratas_table.php](file://database/migrations/2026_03_22_115111_create_ratas_table.php)
- [2026_03_22_115112_create_employee_deductions_table.php](file://database/migrations/2026_03_22_115112_create_employee_deductions_table.php)
</cite>

## Update Summary
**Changes Made**
- Enhanced numerical precision handling in payroll calculations with explicit float casting
- Updated computation engine documentation to reflect improved accuracy in gross pay, net pay, and deduction aggregations
- Added detailed explanation of monetary precision improvements and their impact on payroll accuracy

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Numerical Precision Improvements](#numerical-precision-improvements)
7. [Dependency Analysis](#dependency-analysis)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)
11. [Appendices](#appendices)

## Introduction
This document describes the payroll system that computes employee compensation, manages payments, and maintains administrative records. It covers the salary structure, payment types (PERA and RATA), deduction management, payroll computation algorithms, tax calculations, benefit deductions, payroll generation, payment tracking, historical records, salary adjustments, payment scheduling, payroll reporting, compliance, audit trails, and the user interface for payroll management, batch processing, and payment distribution.

**Updated** Enhanced with critical numerical precision improvements ensuring accurate monetary calculations across all payroll computations.

## Project Structure
The payroll system is implemented as a Laravel backend with Inertia.js frontend:
- Backend controllers orchestrate payroll queries and transformations with enhanced numerical precision.
- Eloquent models define the data schema and relationships for employees, salaries, PERA, RATA, and deductions with decimal casting.
- Frontend pages render payroll summaries, details, and related histories with currency formatting.
- Migrations define database schemas for payroll entities with precise monetary storage.

```mermaid
graph TB
subgraph "Backend"
PC["PayrollController<br/>Enhanced Numerical Precision"]
RC["RataController"]
PEC["PeraController"]
SC["SalaryController"]
EM["Employee model"]
SM["Salary model<br/>Decimal Casting"]
PM["Pera model<br/>Decimal Casting"]
RM["Rata model<br/>Decimal Casting"]
DM["DeductionType model"]
EDM["EmployeeDeduction model<br/>Decimal Casting"]
end
subgraph "Frontend"
PI["payroll/index.tsx"]
PS["payroll/show.tsx"]
PT["payroll.d.ts"]
end
PC --> EM
PC --> SM
PC --> PM
PC --> RM
PC --> EDM
PC --> DM
RC --> RM
RC --> EM
PEC --> PM
PEC --> EM
SC --> SM
SC --> EM
PI --> PC
PS --> PC
PS --> EM
PS --> SM
PS --> PM
PS --> RM
PS --> EDM
PS --> DM
PT --> PI
PT --> PS
```

**Diagram sources**
- [PayrollController.php:11-133](file://app/Http/Controllers/PayrollController.php#L11-L133)
- [RataController.php:11-74](file://app/Http/Controllers/RataController.php#L11-L74)
- [PeraController.php:11-73](file://app/Http/Controllers/PeraController.php#L11-L73)
- [SalaryController.php:11-73](file://app/Http/Controllers/SalaryController.php#L11-L73)
- [Employee.php:10-103](file://app/Models/Employee.php#L10-L103)
- [Salary.php:20-24](file://app/Models/Salary.php#L20-L24)
- [Pera.php:17-20](file://app/Models/Pera.php#L17-L20)
- [Rata.php:17-20](file://app/Models/Rata.php#L17-L20)
- [DeductionType.php:7-32](file://app/Models/DeductionType.php#L7-L32)
- [EmployeeDeduction.php:20-24](file://app/Models/EmployeeDeduction.php#L20-L24)
- [payroll/index.tsx:49-217](file://resources/js/pages/payroll/index.tsx#L49-L217)
- [payroll/show.tsx:55-247](file://resources/js/pages/payroll/show.tsx#L55-L247)
- [payroll.d.ts:7-34](file://resources/js/types/payroll.d.ts#L7-L34)

**Section sources**
- [PayrollController.php:13-133](file://app/Http/Controllers/PayrollController.php#L13-L133)
- [payroll/index.tsx:49-217](file://resources/js/pages/payroll/index.tsx#L49-L217)
- [payroll/show.tsx:55-247](file://resources/js/pages/payroll/show.tsx#L55-L247)

## Core Components
- Payroll computation aggregates salary, PERA, and RATA amounts per employee for a given pay period, subtracts total deductions to compute net pay with enhanced numerical precision.
- Salary management supports adding/removing salary records with effective dates and soft-deletion using decimal casting for monetary accuracy.
- PERA and RATA management supports adding/removing payment records with effective dates and eligibility filtering with precise decimal storage.
- Deduction management stores period-specific deductions linked to deduction types and tracks creators with decimal precision.
- UI provides payroll summary and detail views with filtering, currency formatting, and pagination.

**Updated** Enhanced numerical precision ensures accurate calculations for gross pay, net pay, and deduction aggregations through explicit float casting.

Key computations with precision improvements:
- Gross pay = current salary + current PERA + current RATA (explicitly cast to float)
- Net pay = gross pay − total deductions (accurate floating-point arithmetic)
- Deductions are filtered by pay period month and year with precise aggregation

**Section sources**
- [PayrollController.php:54-72](file://app/Http/Controllers/PayrollController.php#L54-L72)
- [payroll/index.tsx:70-79](file://resources/js/pages/payroll/index.tsx#L70-L79)
- [payroll/show.tsx:74-79](file://resources/js/pages/payroll/show.tsx#L74-L79)

## Architecture Overview
The system follows a layered architecture with enhanced numerical precision:
- Presentation layer: Inertia.js pages for payroll summary and detail with currency formatting.
- Application layer: Controllers handle requests, apply filters, load related data, and compute payroll metrics with explicit float casting for accuracy.
- Domain layer: Eloquent models encapsulate business entities and relationships with decimal casting for monetary precision.
- Data layer: Migrations define normalized schemas with appropriate constraints and decimal precision.

```mermaid
sequenceDiagram
participant U as "User"
participant FE as "payroll/index.tsx"
participant BE as "PayrollController@index<br/>Enhanced Precision"
participant DB as "Database"
U->>FE : "Open Payroll Summary"
FE->>BE : "GET /payroll?month&year&office_id&search"
BE->>DB : "Query employees with latest salary/PERA/RATA<br/>and deductions for period"
DB-->>BE : "Paginated employees with computed fields<br/>using explicit float casting"
BE-->>FE : "Rendered page with employees and filters"
FE-->>U : "Display summary table with accurate gross/net pay"
```

**Diagram sources**
- [payroll/index.tsx:49-80](file://resources/js/pages/payroll/index.tsx#L49-L80)
- [PayrollController.php:13-89](file://app/Http/Controllers/PayrollController.php#L13-L89)

## Detailed Component Analysis

### Payroll Computation Engine
The controller aggregates employee compensation and deductions for a selected pay period with enhanced numerical precision:
- Filters employees by optional search and office.
- Loads latest salary, PERA, and RATA records per employee.
- Loads deductions matching the pay period month and year.
- Computes totals using explicit float casting for monetary accuracy.
- Renders paginated results with precise calculations.

**Updated** Enhanced with explicit float casting for all monetary calculations ensuring mathematical precision in gross pay, net pay, and deduction aggregations.

```mermaid
flowchart TD
Start(["Load Payroll Summary"]) --> Filt["Apply filters: month, year, office, search"]
Filt --> LoadEmp["Load employees with latest salary/PERA/RATA"]
LoadEmp --> LoadDed["Load deductions for pay period"]
LoadDed --> CastFloat["Explicit Float Casting:<br/>- Deductions sum<br/>- Salary amount<br/>- PERA amount<br/>- RATA amount"]
CastFloat --> Compute["Compute: gross = sal+pera+rata<br/>net = gross - sum(deductions)<br/>with floating-point precision"]
Compute --> Render["Render paginated table with metrics"]
Render --> End(["Done"])
```

**Diagram sources**
- [PayrollController.php:20-72](file://app/Http/Controllers/PayrollController.php#L20-L72)

**Section sources**
- [PayrollController.php:13-133](file://app/Http/Controllers/PayrollController.php#L13-L133)
- [payroll/index.tsx:138-213](file://resources/js/pages/payroll/index.tsx#L138-L213)

### Salary Management
- Adds new salary records with amount, effective date, and creator tracking using decimal casting for monetary precision.
- Soft-deletes salary records.
- Provides history view with creator attribution.

```mermaid
sequenceDiagram
participant U as "User"
participant FE as "SalaryController UI"
participant SC as "SalaryController@store"
participant SM as "Salary model<br/>Decimal Casting"
participant DB as "Database"
U->>FE : "Add salary"
FE->>SC : "POST validated data"
SC->>SM : "Create salary record with decimal casting"
SM->>DB : "Insert with created_by"
DB-->>SM : "Saved with precise decimal storage"
SM-->>SC : "Success"
SC-->>FE : "Redirect with success"
```

**Diagram sources**
- [SalaryController.php:49-65](file://app/Http/Controllers/SalaryController.php#L49-L65)
- [Salary.php:20-24](file://app/Models/Salary.php#L20-L24)

**Section sources**
- [SalaryController.php:13-73](file://app/Http/Controllers/SalaryController.php#L13-L73)
- [Salary.php:8-36](file://app/Models/Salary.php#L8-L36)

### PERA Management
- Adds PERA payments with amount, effective date, and creator using decimal casting for monetary precision.
- Removes PERA records.
- Lists eligible employees and shows PERA history.

```mermaid
sequenceDiagram
participant U as "User"
participant FE as "PeraController UI"
participant PE as "PeraController@store"
participant PM as "Pera model<br/>Decimal Casting"
participant DB as "Database"
U->>FE : "Add PERA"
FE->>PE : "POST validated data"
PE->>PM : "Create PERA record with decimal casting"
PM->>DB : "Insert with created_by"
DB-->>PM : "Saved with precise decimal storage"
PM-->>PE : "Success"
PE-->>FE : "Redirect with success"
```

**Diagram sources**
- [PeraController.php:49-65](file://app/Http/Controllers/PeraController.php#L49-L65)
- [Pera.php:17-20](file://app/Models/Pera.php#L17-L20)

**Section sources**
- [PeraController.php:13-73](file://app/Http/Controllers/PeraController.php#L13-L73)
- [Pera.php:8-41](file://app/Models/Pera.php#L8-L41)

### RATA Management
- Adds RATA payments with amount, effective date, and creator using decimal casting for monetary precision.
- Removes RATA records.
- Lists RATA-eligible employees and shows RATA history.

```mermaid
sequenceDiagram
participant U as "User"
participant FE as "RataController UI"
participant RE as "RataController@store"
participant RM as "Rata model<br/>Decimal Casting"
participant DB as "Database"
U->>FE : "Add RATA"
FE->>RE : "POST validated data"
RE->>RM : "Create RATA record with decimal casting"
RM->>DB : "Insert with created_by"
DB-->>RM : "Saved with precise decimal storage"
RM-->>RE : "Success"
RE-->>FE : "Redirect with success"
```

**Diagram sources**
- [RataController.php:50-66](file://app/Http/Controllers/RataController.php#L50-L66)
- [Rata.php:17-20](file://app/Models/Rata.php#L17-L20)

**Section sources**
- [RataController.php:13-74](file://app/Http/Controllers/RataController.php#L13-L74)
- [Rata.php:8-41](file://app/Models/Rata.php#L8-L41)

### Deduction Management
- Stores period-specific deductions with amount, pay period month/year, notes, and creator using decimal casting for monetary precision.
- Prevents duplicate deductions via a unique composite index.
- Supports active deduction types and creator attribution.

```mermaid
erDiagram
DEDUCTION_TYPES {
int id PK
string name
string code
text description
boolean is_active
}
EMPLOYEE_DEDUCTIONS {
int id PK
int employee_id FK
int deduction_type_id FK
decimal amount
tinyint pay_period_month
smallint pay_period_year
text notes
int created_by FK
}
DEDUCTION_TYPES ||--o{ EMPLOYEE_DEDUCTIONS : "has many"
```

**Diagram sources**
- [DeductionType.php:7-32](file://app/Models/DeductionType.php#L7-L32)
- [EmployeeDeduction.php:20-24](file://app/Models/EmployeeDeduction.php#L20-L24)
- [2026_03_22_115112_create_employee_deductions_table.php:14-27](file://database/migrations/2026_03_22_115112_create_employee_deductions_table.php#L14-L27)

**Section sources**
- [EmployeeDeduction.php:10-59](file://app/Models/EmployeeDeduction.php#L10-L59)
- [DeductionType.php:9-32](file://app/Models/DeductionType.php#L9-L32)

### Data Models and Relationships
```mermaid
classDiagram
class Employee {
+int id
+string first_name
+string last_name
+string position
+bool is_rata_eligible
+int employment_status_id
+int office_id
+int created_by
+string image_path
+salaries()
+peras()
+ratas()
+deductions()
+latestSalary()
+latestPera()
+latestRata()
}
class Salary {
+int id
+int employee_id
+decimal amount
+date effective_date
+date end_date
+int created_by
+employee()
+createdBy()
}
class Pera {
+int id
+int employee_id
+decimal amount
+date effective_date
+int created_by
+employee()
+createdBy()
}
class Rata {
+int id
+int employee_id
+decimal amount
+date effective_date
+int created_by
+employee()
+createdBy()
}
class DeductionType {
+int id
+string name
+string code
+string description
+bool is_active
+employeeDeductions()
}
class EmployeeDeduction {
+int id
+int employee_id
+int deduction_type_id
+decimal amount
+int pay_period_month
+int pay_period_year
+string notes
+int created_by
+employee()
+deductionType()
+createdBy()
}
Employee "1" --o{ Salary : "has many"
Employee "1" --o{ Pera : "has many"
Employee "1" --o{ Rata : "has many"
Employee "1" --o{ EmployeeDeduction : "has many"
DeductionType "1" --o{ EmployeeDeduction : "has many"
```

**Diagram sources**
- [Employee.php:46-88](file://app/Models/Employee.php#L46-L88)
- [Salary.php:26-36](file://app/Models/Salary.php#L26-L36)
- [Pera.php:22-41](file://app/Models/Pera.php#L22-L41)
- [Rata.php:22-41](file://app/Models/Rata.php#L22-L41)
- [DeductionType.php:20-23](file://app/Models/DeductionType.php#L20-L23)
- [EmployeeDeduction.php:26-59](file://app/Models/EmployeeDeduction.php#L26-L59)

**Section sources**
- [Employee.php:10-103](file://app/Models/Employee.php#L10-L103)
- [Salary.php:8-36](file://app/Models/Salary.php#L8-L36)
- [Pera.php:8-41](file://app/Models/Pera.php#L8-L41)
- [Rata.php:8-41](file://app/Models/Rata.php#L8-L41)
- [DeductionType.php:7-32](file://app/Models/DeductionType.php#L7-L32)
- [EmployeeDeduction.php:8-59](file://app/Models/EmployeeDeduction.php#L8-L59)

### Payroll UI Components
- Payroll Summary: Filters by month, year, office, and search; displays computed gross and net pay per employee with enhanced precision.
- Payroll Details: Shows salary, PERA, RATA, total deductions, and net pay for a selected period; includes history tables with accurate currency formatting.

```mermaid
sequenceDiagram
participant U as "User"
participant PI as "payroll/index.tsx"
participant PS as "payroll/show.tsx"
participant PC as "PayrollController@show<br/>Enhanced Precision"
U->>PI : "Click View on employee row"
PI->>PS : "Navigate to payroll/show with month/year"
PS->>PC : "GET employee payroll for period"
PC-->>PS : "Employee, histories, deductions<br/>with precise calculations"
PS-->>U : "Render details with computed totals"
```

**Diagram sources**
- [payroll/index.tsx:189-199](file://resources/js/pages/payroll/index.tsx#L189-L199)
- [payroll/show.tsx:61-72](file://resources/js/pages/payroll/show.tsx#L61-L72)
- [PayrollController.php:91-133](file://app/Http/Controllers/PayrollController.php#L91-L133)

**Section sources**
- [payroll/index.tsx:49-243](file://resources/js/pages/payroll/index.tsx#L49-L243)
- [payroll/show.tsx:55-248](file://resources/js/pages/payroll/show.tsx#L55-L248)
- [payroll.d.ts:7-35](file://resources/js/types/payroll.d.ts#L7-L35)

## Numerical Precision Improvements

### Enhanced Monetary Calculations
The payroll system now implements critical numerical precision improvements through explicit float casting in monetary calculations:

#### Key Precision Enhancements:
- **Deduction Aggregation**: `(float) $deductions->sum('amount')` ensures accurate summation of all deduction amounts
- **Gross Pay Calculation**: `(float) ($salary->amount ?? 0) + (float) ($pera->amount ?? 0) + (float) ($rata->amount ?? 0)` guarantees precise addition of all income components
- **Net Pay Computation**: `$grossPay - $totalDeductions` maintains floating-point accuracy throughout the calculation
- **Individual Amount Casting**: `(float) ($salary->amount ?? 0)`, `(float) ($pera->amount ?? 0)`, `(float) ($rata->amount ?? 0)` ensures consistent decimal handling

#### Database-Level Decimal Precision:
- All monetary fields use `'decimal:2'` casting for PHP side precision
- Database storage maintains two decimal places for consistent financial accuracy
- Unique constraint on employee deduction prevents redundant calculations

#### Frontend Currency Handling:
- Client-side calculations use `Number()` conversion for display consistency
- Currency formatting uses `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })` for Philippine peso formatting
- Responsive display ensures accurate representation of precise calculations

**Section sources**
- [PayrollController.php:60-69](file://app/Http/Controllers/PayrollController.php#L60-L69)
- [Salary.php:20-24](file://app/Models/Salary.php#L20-L24)
- [Pera.php:17-20](file://app/Models/Pera.php#L17-L20)
- [Rata.php:17-20](file://app/Models/Rata.php#L17-L20)
- [EmployeeDeduction.php:20-24](file://app/Models/EmployeeDeduction.php#L20-L24)
- [payroll/index.tsx:86-91](file://resources/js/pages/payroll/index.tsx#L86-L91)
- [payroll/show.tsx:74-79](file://resources/js/pages/payroll/show.tsx#L74-L79)

## Dependency Analysis
- Controllers depend on models for data access and relationships with enhanced precision.
- UI pages depend on typed props and Inertia routing to controllers with accurate numerical data.
- Deduction uniqueness is enforced at the database level via a composite unique index.
- All monetary calculations benefit from explicit float casting for mathematical accuracy.

**Updated** Enhanced dependency relationships now include numerical precision considerations across all components.

```mermaid
graph LR
PI["payroll/index.tsx"] --> PC["PayrollController@index<br/>Enhanced Precision"]
PS["payroll/show.tsx"] --> PC
PC --> EM["Employee"]
PC --> SM["Salary<br/>Decimal Casting"]
PC --> PM["Pera<br/>Decimal Casting"]
PC --> RM["Rata<br/>Decimal Casting"]
PC --> EDM["EmployeeDeduction<br/>Decimal Casting"]
PC --> DM["DeductionType"]
SC["SalaryController@store"] --> SM
PEC["PeraController@store"] --> PM
RC["RataController@store"] --> RM
```

**Diagram sources**
- [payroll/index.tsx:49-80](file://resources/js/pages/payroll/index.tsx#L49-L80)
- [payroll/show.tsx:55-72](file://resources/js/pages/payroll/show.tsx#L55-L72)
- [PayrollController.php:13-133](file://app/Http/Controllers/PayrollController.php#L13-L133)
- [SalaryController.php:49-65](file://app/Http/Controllers/SalaryController.php#L49-L65)
- [PeraController.php:49-65](file://app/Http/Controllers/PeraController.php#L49-L65)
- [RataController.php:50-66](file://app/Http/Controllers/RataController.php#L50-L66)

**Section sources**
- [2026_03_22_115112_create_employee_deductions_table.php:25-26](file://database/migrations/2026_03_22_115112_create_employee_deductions_table.php#L25-L26)

## Performance Considerations
- Use of eager loading reduces N+1 queries for related data (salaries, PERAs, RATAs, deductions).
- Pagination limits result sets for large datasets.
- Unique constraint on employee deduction prevents redundant writes and improves lookup performance.
- Currency formatting is client-side for responsiveness.
- **Updated** Explicit float casting adds minimal computational overhead while significantly improving calculation accuracy.
- **Updated** Decimal casting in database models ensures consistent precision without additional runtime conversions.

## Troubleshooting Guide
- Deduction duplicates: The unique index prevents inserting the same deduction type for the same employee in the same pay period. Remove or adjust existing records before re-inserting.
- Eligibility filtering: RATA records are filtered by eligibility flag; ensure employees are marked eligible before adding RATA entries.
- Audit trail: All entities track creators; verify created_by fields for accountability.
- Validation errors: Controllers validate inputs; ensure amounts are numeric and dates are valid.
- **Updated** Precision issues: If encountering rounding errors, verify that all monetary calculations use explicit float casting as implemented in the PayrollController.
- **Updated** Data type consistency: Ensure database decimal casting is properly configured for all monetary fields to maintain precision.

**Section sources**
- [2026_03_22_115112_create_employee_deductions_table.php:25-26](file://database/migrations/2026_03_22_115112_create_employee_deductions_table.php#L25-L26)
- [RataController.php:18-24](file://app/Http/Controllers/RataController.php#L18-L24)
- [PeraController.php:17-23](file://app/Http/Controllers/PeraController.php#L17-L23)
- [SalaryController.php:50-55](file://app/Http/Controllers/SalaryController.php#L50-L55)
- [PayrollController.php:60-69](file://app/Http/Controllers/PayrollController.php#L60-L69)

## Conclusion
The payroll system provides a robust foundation for managing salary, PERA, and RATA payments, applying period-specific deductions, computing gross and net pay, and maintaining historical records. Its modular design, typed UI components, and normalized database schema support scalability, maintainability, and compliance through audit trails and unique constraints.

**Updated** The recent numerical precision improvements ensure mathematically accurate payroll calculations through explicit float casting, decimal casting, and consistent monetary handling across all system components.

## Appendices

### Payroll Computation Algorithm
- Input: Employee records, latest salary/PERA/RATA, deductions for the selected month/year.
- Process:
  - Sum current salary, PERA, and RATA using explicit float casting for accuracy.
  - Sum all deductions for the period with precise decimal aggregation.
  - Compute net pay as gross minus total deductions using floating-point arithmetic.
- Output: Paginated payroll summary with currency formatting and period filters.

**Updated** Enhanced with explicit float casting ensuring mathematical precision in all monetary calculations.

**Section sources**
- [PayrollController.php:54-72](file://app/Http/Controllers/PayrollController.php#L54-L72)
- [payroll/index.tsx:70-79](file://resources/js/pages/payroll/index.tsx#L70-L79)

### Data Schemas
- PERA table: employee foreign key, amount (decimal:2), effective date, creator.
- RATA table: employee foreign key, amount (decimal:2), effective date, creator.
- Employee Deductions table: employee/deduction type foreign keys, amount (decimal:2), pay period month/year, notes, creator; unique constraint on employee/deduction type/month/year.

**Updated** All monetary fields now use decimal casting with two decimal places for consistent precision.

**Section sources**
- [2026_03_22_115109_create_peras_table.php:14-21](file://database/migrations/2026_03_22_115109_create_peras_table.php#L14-L21)
- [2026_03_22_115111_create_ratas_table.php:14-21](file://database/migrations/2026_03_22_115111_create_ratas_table.php#L14-L21)
- [2026_03_22_115112_create_employee_deductions_table.php:14-27](file://database/migrations/2026_03_22_115112_create_employee_deductions_table.php#L14-L27)

### Numerical Precision Implementation
- **Backend Precision**: Explicit float casting in PayrollController for all monetary calculations
- **Database Precision**: Decimal casting with two decimal places for all monetary fields
- **Frontend Precision**: Number conversion for display consistency with currency formatting
- **Calculation Flow**: `(float) $deductions->sum('amount')` → `(float) ($salary->amount ?? 0)` → Addition → Subtraction → Final net pay

**Section sources**
- [PayrollController.php:60-69](file://app/Http/Controllers/PayrollController.php#L60-L69)
- [Salary.php:20-24](file://app/Models/Salary.php#L20-L24)
- [Pera.php:17-20](file://app/Models/Pera.php#L17-L20)
- [Rata.php:17-20](file://app/Models/Rata.php#L17-L20)
- [EmployeeDeduction.php:20-24](file://app/Models/EmployeeDeduction.php#L20-L24)