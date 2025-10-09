#!/usr/bin/env pwsh
# Check bo    Write-Host "All checks PASSED! Your code meets quality standards." -ForegroundColor Greenh     Write-Host "Some checks FAILED. Please fix the issues above." -ForegroundColor RedSLint and Prettier for a single file
param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

Write-Host "🔍 Running code quality checks for: $FilePath" -ForegroundColor Cyan

Write-Host "`n📋 ESLint Check..." -ForegroundColor Yellow
$eslintResult = & npx eslint --max-warnings 0 $FilePath
$eslintExitCode = $LASTEXITCODE

Write-Host "`n✨ Prettier Check..." -ForegroundColor Yellow  
$prettierResult = & npx prettier --check $FilePath
$prettierExitCode = $LASTEXITCODE

Write-Host "`n📊 Results:" -ForegroundColor Cyan
if ($eslintExitCode -eq 0) {
    Write-Host "✅ ESLint: PASSED" -ForegroundColor Green
} else {
    Write-Host "❌ ESLint: FAILED" -ForegroundColor Red
}

if ($prettierExitCode -eq 0) {
    Write-Host "✅ Prettier: PASSED" -ForegroundColor Green  
} else {
    Write-Host "❌ Prettier: FAILED" -ForegroundColor Red
}

if ($eslintExitCode -eq 0 -and $prettierExitCode -eq 0) {
    Write-Host "`n🎉 All checks PASSED! Your code meets quality standards." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some checks FAILED. Please fix the issues above." -ForegroundColor Red
    exit 1
}