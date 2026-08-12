# Assignment & Submission Management System – Project Summary

A full-stack web application for managing school/college assignment workflows with role-based access control.

## Stack
- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Backend:** ASP.NET Core Web API (.NET 10) + C#
- **Database:** MongoDB 8
- **Auth:** JWT + role-based authorization
- **API Docs:** Swagger/OpenAPI
- **Tests:** xUnit

## Core Features
- **Admin:** manage users, classes, subjects, and teacher assignments
- **Teacher:** create/update/publish assignments, review submissions, grade work
- **Student:** view assignments, submit work before deadline, check grades and feedback
- Auto-seeded demo data with JWT authentication
- MongoDB indexes and collections created on startup

## Tech Details
- Text-based submissions (no file uploads)
- Times stored in UTC, displayed in browser's local timezone
- Students can update submissions until deadline; teachers can grade after
- One student per class; teachers can teach multiple classes/subjects
- Each assignment belongs to one class and one subject

## Quick Start

## Configure MongoDB

`Open Docker first and then run the engine`
`Then connect the MongoDB Compass`
Example local connection:
`mongodb://localhost:27017`

## Run backend
`docker compose up -d`
`cd backend/AssignmentManagement.Api`
`cp appsettings.Development.example.json appsettingsn`
`dotnet restore`
`dotnet run`

API: `http://localhost:5050`
Swagger: `http://localhost:5050/swagger`

## Run frontend

`cd frontend`
`npm install`
`npm run dev`


Frontend: `http://localhost:3000`


1. Login with demo credentials (see README.md)

