# Assignment Management - Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Assignment Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Project paths
$root = "G:\Web Devlopment Folder\assignment_submission_management"
$backend = "$root\backend\AssignmentManagement.Api"
$frontend = "$root\frontend"

Write-Host "Starting backend..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; dotnet run"

Start-Sleep -Seconds 3

Write-Host "Starting frontend..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host " Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host " Swagger:  http://localhost:5000/swagger" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The backend and frontend are starting in separate windows." -ForegroundColor Green
Write-Host "Open http://localhost:3000 in your browser." -ForegroundColor Green