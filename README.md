# Assignment & Submission Management System

Recruitment project implementation for a school/college assignment and submission workflow.

## Stack

The scaffold uses current stable lines checked on 12 Aug 2026: Next.js 16.2.x and .NET 10. MongoDB uses the official C# driver.
- Frontend: Next.js 16 + React + TypeScript
- Backend: ASP.NET Core Web API (.NET 10) + C#
- Database: MongoDB
- Auth: JWT + role-based authorization
- API docs: Swagger/OpenAPI
- Tests: xUnit

## Features
- Admin: users, classes, subjects, teacher assignments, overview
- Teacher: create/update/delete assignments, draft/publish, review submissions, marks and feedback
- Student: see class assignments, submit/update before deadline, view status/marks/feedback
- Seeded demo accounts
- MongoDB indexes and seed data

## Assumptions
1. A student belongs to one class/course for this assignment.
2. A teacher can be assigned to multiple classes and subjects.
3. An assignment belongs to exactly one class and one subject.
4. A student can have one submission per assignment; updating replaces the answer while keeping the same submission record.
5. Students may update a submission until the deadline. Teachers can change status and grade after submission.
6. Submission answer is stored as text; file uploads are outside the mandatory scope.
7. Times are stored in UTC and displayed in the browser's local time.
8. Admin can manage users/classes/subjects and teacher assignments.

## Demo credentials
- Admin: `admin@example.com` / `Admin@12345`
- Teacher: `teacher@example.com` / `Teacher@12345`
- Student: `student@example.com` / `Student@12345`

These are development/demo credentials only. Do not use them in production.

## Prerequisites
- .NET 10 SDK
- Node.js 20.9+
- MongoDB 7/8 locally OR MongoDB Atlas

## 1. Configure MongoDB
Copy `backend/AssignmentManagement.Api/appsettings.Development.example.json` to `appsettings.Development.json` and set your connection string.

`Open Docker first and then run the engine`
`Then connect the MongoDB Compass`
Example local connection:
`mongodb://localhost:27017`

The app creates the database/collections and indexes automatically and seeds demo data on startup when the database is empty.

## 2. Run backend
```bash
# cd backend/AssignmentManagement.Api
# dotnet restore
# dotnet run
docker compose up -d
cd backend/AssignmentManagement.Api
#cp appsettings.Development.example.json appsettingsn
dotnet restore
dotnet run
```

API: `http://localhost:5050`
Swagger: `http://localhost:5050/swagger`

## 3. Run frontend
Copy `frontend/.env.example` to `frontend/.env.local`.

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## 4. Run tests
```bash
cd backend/AssignmentManagement.Tests
dotnet test
```

## Project structure
```text
backend/
  AssignmentManagement.Api/
    Controllers/
    Models/
    Services/
    DTOs/
    Middleware/
  AssignmentManagement.Tests/
frontend/
  app/
  components/
  lib/
  types/
database/
```

## Known limitations
- No binary/file upload; answers are text.
- No email/push notifications.
- Pagination/filtering is intentionally lightweight for the recruitment scope.
- Refresh-token rotation is not implemented; JWTs are short-lived.

# Assignment_Submission_Management
It is a full-stack web application for managing academic assignments and submissions using Next.js, React, TypeScript, ASP.NET Core (.NET 10), C# and MongoDB, with JWT authentication and role-based access for Admins, Teachers, and Students.

