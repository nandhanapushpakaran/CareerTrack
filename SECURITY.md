# Security Policy & Architecture

## Security Overview

**CareerTrack** was designed and implemented following secure-by-default software engineering principles and OWASP top 10 best practices. This document details the security controls, data isolation guarantees, and vulnerability reporting procedures.

> **Honest Disclosure**: No software system can guarantee 100% security against all potential attack vectors. CareerTrack implements defense-in-depth measures to mitigate common risks, protect user confidentiality, and ensure data integrity.

---

## 1. Authentication & Session Management

- **Password Hashing**: Passwords are never stored in plaintext. Passwords are salted and hashed using **bcrypt** via `passlib` with an adaptive work factor.
- **Password Complexity**: Registration enforces strict password validation rules:
  - Minimum 8 characters
  - At least one uppercase letter (`A-Z`)
  - At least one lowercase letter (`a-z`)
  - At least one numerical digit (`0-9`)
  - At least one special character (`!@#$%^&*...`)
- **JSON Web Tokens (JWT)**:
  - **Short-Lived Access Tokens**: Signed with HMAC-SHA256 (`HS256`) and expire within 15 minutes to minimize token compromise windows.
  - **Rotating Refresh Tokens**: Expire after 7 days and can be used to request fresh access tokens.
  - **Type Checking**: JWT payloads enforce explicit token type checks (`"type": "access"` vs `"type": "refresh"`), preventing refresh tokens from being misapplied to protected API routes.

---

## 2. Authorization & IDOR / BOLA Prevention

**Insecure Direct Object Reference (IDOR)** or **Broken Object Level Authorization (BOLA)** occurs when an application exposes a database entity ID without verifying that the requesting user owns that entity.

In CareerTrack:
- **Zero Cross-Account Leakage**: All application and contact queries strictly enforce `Application.user_id == current_user.id`.
- **404 Over 403 on Entity Lookup**: If User A requests `GET /api/v1/applications/{id}` where `{id}` belongs to User B, the server responds with `404 Not Found` rather than `403 Forbidden`. This prevents malicious actors from enumerating valid entity IDs.
- **Multi-Tenant Isolation**: Statistics and metrics aggregates (`/dashboard/stats`) calculate rates and sums exclusively over the authenticated user's records.

---

## 3. Data Validation & Injection Defenses

- **SQL Injection Prevention**: Built entirely on **SQLAlchemy 2.0 ORM**. All database queries are fully parameterized. Raw SQL string concatenation is strictly avoided.
- **Strong Typing & Runtime Schemas**:
  - Backend requests are validated using **Pydantic v2** models with strict boundary checks (e.g., `salary_min <= salary_max`, valid URL formatting, email syntax verification).
  - Frontend input is verified before submission using **Zod** and **React Hook Form**.
- **Cross-Site Scripting (XSS)**:
  - React’s JSX engine automatically escapes all interpolated values by default.
  - `dangerouslySetInnerHTML` is not used anywhere in the codebase.
- **HTTP Security Headers**: Every response served by FastAPI includes security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (clickjacking defense)
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 4. Secret & Environment Management

- **No Secrets in Source Control**: Credentials, encryption keys, and database passwords are read from environment variables (`.env`).
- **Committed Placeholders**: Only `.env.example` is committed to the repository with placeholder values.
- **Git Hygiene**: Strict `.gitignore` rules prevent accidental commits of `.env`, SQLite database files, build outputs, and Python bytecode.

---

## 5. Reporting a Security Vulnerability

If you discover a security vulnerability within CareerTrack:
1. Please **do not** open a public GitHub issue.
2. Email security details privately to the repository maintainer.
3. Include reproducible steps and proof-of-concept details where applicable.
4. Maintainers will review the report, acknowledge receipt, and coordinate a patch promptly.
