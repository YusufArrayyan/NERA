# Setup Script for Neuro-Adaptive Cloud Learning Platform
# Run this script to finish setting up the environment, database, and frontend.

Write-Host "Setting up Neuro-Adaptive Cloud Learning Platform..." -ForegroundColor Cyan

# 1. Setup PostgreSQL Database locally
Write-Host "Setting up local PostgreSQL database..." -ForegroundColor Yellow
Write-Host "(If prompted for a password, enter your local 'postgres' user password)" -ForegroundColor Cyan
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE USER neuro_user WITH PASSWORD 'neuro_pass_2026' CREATEDB;" 2>$null
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE neuro_adaptive_db OWNER neuro_user;" 2>$null
Start-Sleep -Seconds 2

# 2. Setup Backend Database (Prisma)
Write-Host "Setting up database schema and seeding..." -ForegroundColor Yellow
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
cd ..

# 3. Scaffold Frontend
Write-Host "Setting up Frontend (Next.js)..." -ForegroundColor Yellow
npx -y create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# Install Shadcn UI & Dependencies
cd frontend
npx -y shadcn-ui@latest init -y
npx -y shadcn-ui@latest add button card input label form select tabs table badge dialog toast

# Install Recharts for EEG visualization
npm install recharts socket.io-client lucide-react date-fns

# Setup Frontend Environment
$envContent = "NEXT_PUBLIC_API_URL=http://localhost:3001`nNEXT_PUBLIC_WS_URL=ws://localhost:3001"
$envContent | Out-File -FilePath .env.local -Encoding ascii

Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. In terminal 1 (Backend): cd backend ; npm run start:dev"
Write-Host "2. In terminal 2 (Frontend): cd frontend ; npm run dev"
