@echo off
echo 🚀 Setting up Docker environment for Build Yourself...

REM Create main data directories
echo 📁 Creating data directories...
if not exist "data\postgres" mkdir "data\postgres"
if not exist "data\redis" mkdir "data\redis"
if not exist "data\logs" mkdir "data\logs"

REM Create development data directories
echo 📁 Creating development data directories...
if not exist "data\dev\postgres" mkdir "data\dev\postgres"
if not exist "data\dev\redis" mkdir "data\dev\redis"
if not exist "data\dev\logs" mkdir "data\dev\logs"

echo ✅ Docker environment setup complete!
echo.
echo Next steps:
echo 1. Copy backend\env.prod.template to backend\.env
echo 2. Edit backend\.env with your actual values
echo 3. Run 'make up-dev' to start development services
echo 4. Or run 'make up' to start production services
echo.
echo Your backend API will be available at: http://localhost:5000
echo For help, run: make help
pause
