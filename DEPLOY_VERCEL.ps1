# Deploy Headband Frontend to Vercel
# This script deploys the frontend to Vercel with ngrok backend URL

Write-Host "🚀 Headband Frontend Deployment to Vercel" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Instructions:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to: https://vercel.com/new" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Click 'Continue with GitHub'" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Select repository: YusufArrayyan/NERA" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Project Settings:" -ForegroundColor Yellow
Write-Host "   - Framework: Next.js" -ForegroundColor Gray
Write-Host "   - Root Directory: frontend" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Environment Variables (Already set in vercel.json):" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_API_URL=https://chef-overlook-cocoa.ngrok-free.dev" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Click 'Deploy'" -ForegroundColor Yellow
Write-Host ""
Write-Host "7. Wait 2-3 minutes for build" -ForegroundColor Yellow
Write-Host ""
Write-Host "8. You'll get a URL like:" -ForegroundColor Yellow
Write-Host "   https://headband-frontend.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Configuration is ready!" -ForegroundColor Green
Write-Host "👉 Go to https://vercel.com/new and follow steps above" -ForegroundColor Cyan
