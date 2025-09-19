# Quick Deployment Script for CAPTCHA API
Write-Host "🚀 CAPTCHA API Deployment Helper" -ForegroundColor Cyan

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com and create a new repository named 'captcha-api'"
Write-Host "2. Copy your repository URL"
Write-Host "3. Replace YOUR_USERNAME in the commands below"
Write-Host "4. Run the git commands to push your code"
Write-Host "5. Deploy on Vercel"

Write-Host "`n🔗 Git Commands (replace YOUR_USERNAME):" -ForegroundColor Green
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/captcha-api.git"
Write-Host "git branch -M main" 
Write-Host "git push -u origin main"

Write-Host "`n🌐 Deployment Options:" -ForegroundColor Magenta
Write-Host "Option 1 (Easiest): Vercel"
Write-Host "  • Go to https://vercel.com"
Write-Host "  • Sign up with GitHub"
Write-Host "  • Click 'New Project' → Import your repo → Deploy"

Write-Host "`nOption 2: Railway" 
Write-Host "  • Go to https://railway.app"
Write-Host "  • Connect GitHub → Select repo → Deploy"

Write-Host "`nOption 3: Render"
Write-Host "  • Go to https://render.com" 
Write-Host "  • New Web Service → Connect repo → Deploy"

Write-Host "`n✅ Your API will be live with all these endpoints:" -ForegroundColor Green
Write-Host "  • /api/docs (Beautiful documentation)"
Write-Host "  • /api/health (Health check)"
Write-Host "  • /api/register (Get API key)" 
Write-Host "  • /api/captcha/generate (Generate CAPTCHAs)"
Write-Host "  • /api/captcha/verify (Verify answers)"

Write-Host "`n🎉 Ready to deploy! Follow the steps above." -ForegroundColor Cyan