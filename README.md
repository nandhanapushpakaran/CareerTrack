# CareerTrack — Job Application Tracker

> **"Organize your job search. Track every opportunity. Land your next role."**

CareerTrack is a modern, production-grade full-stack web application built to help job seekers streamline, organize, and analyze their entire hiring pipeline. Designed with modern SaaS principles inspired by Linear and Vercel, it features real-time conversion analytics, interactive data visualizations, multi-criteria filtering, interview tracking, and strict multi-tenant security.

---

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.111-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18.3-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/DevOps-Docker_Compose-2496ED.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passing-brightgreen.svg?style=flat)](#automated-testing)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](LICENSE)

---

## What is CareerTrack?
**CareerTrack** is a centralized job application tracker built to eliminate the chaos of managing multiple interview pipelines across disparate platforms like LinkedIn, Indeed, Glassdoor, and direct company career portals.

## The Problem It Solves
Job hunting without a dedicated system quickly leads to lost opportunities and disorganization:
- **Dispersed Information**: Forgetting when an application was submitted or which resume version was used.
- **Lost Recruiter Contacts**: Misplacing contact details, follow-up dates, and salary figures quoted during recruiter screening calls.
- **Blind Job Search Metrics**: Not knowing your actual interview conversion rate, response time averages, or offer percentages.
- **Unreliable Spreadsheets**: Generic spreadsheets lack automatic status progressions, interview date reminders, and intuitive data visualizations.

CareerTrack replaces spreadsheets with a privacy-focused, accessible web application tailored for tech professionals, career switchers, and new graduates.

---

## Tech Stack & Tools

### Frontend
- **React 18** — Component-based UI library
- **TypeScript** — Strict end-to-end type safety
- **Vite** — Next-gen build tool & instant HMR dev server
- **Tailwind CSS** — Utility-first styling with dark/light themes
- **TanStack Query** — Server-state caching and background refetching
- **React Hook Form + Zod** — Type-safe schema validation & form handling
- **Recharts** — Interactive donut and historical trend charts
- **Lucide React** — Modern, lightweight SVG icon suite
- **Axios** — HTTP client configured with JWT interceptors
- **Vitest & React Testing Library** — Fast unit & component testing

---

### Backend
- **FastAPI** — High-performance async Python web framework
- **Python 3.11** — Modern backend runtime
- **SQLAlchemy 2.0** — ORM for relational models & queries
- **Pydantic v2** — High-speed data parsing & serialization
- **Alembic** — Database schema versioning & migrations
- **PyJWT & Bcrypt** — JWT authentication (15m access / 7d refresh) & salted password hashing
- **Uvicorn** — Lightning-fast ASGI web server
- **Pytest & HTTPX** — Automated API test suite

---

### Database & Storage
- **PostgreSQL 16** — Production relational database (Docker)
- **SQLite 3** — Zero-config local development & test database

---

### DevOps & Tools
- **Docker & Docker Compose** — Containerization & multi-service deployment
- **Nginx (Alpine)** — High-performance reverse proxy & SPA web server
- **Git & GitHub** — Version control and repository structure

---
