# ⚙️ SECRETS SYNC PROTOCOL
# Generates a fresh, clean secret and pushes it to both Vercel and GitHub.

$newSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

Write-Host "🌍 [Vercel] Updating CRON_SECRET for production..."
# Use --force and -y to ensure non-interactive replacement
& vercel env rm CRON_SECRET production -y
$newSecret | & vercel env add CRON_SECRET production

Write-Host "🐙 [GitHub] Updating CRON_SECRET for Actions..."
$newSecret | & gh secret set CRON_SECRET

Write-Host "✅ Secrets synchronized! The industrial empire is now secure."
Write-Host "🚀 Triggering a new build on Vercel..."
& vercel --prod
