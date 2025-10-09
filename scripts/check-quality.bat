@echo off
echo Running ESLint and Prettier checks for %1
echo.

echo ESLint Check:
npx eslint --max-warnings 0 %1
set eslint_result=%errorlevel%

echo.
echo Prettier Check:
npx prettier --check %1
set prettier_result=%errorlevel%

echo.
echo Results:
if %eslint_result%==0 (
    echo ESLint: PASSED
) else (
    echo ESLint: FAILED
)

if %prettier_result%==0 (
    echo Prettier: PASSED
) else (
    echo Prettier: FAILED
)

if %eslint_result%==0 if %prettier_result%==0 (
    echo.
    echo All checks PASSED!
    exit /b 0
) else (
    echo.
    echo Some checks FAILED!
    exit /b 1
)