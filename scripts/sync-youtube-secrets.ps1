# 🚀 YOUTUBE EMPIRE SECRETS SYNC
# Pushes the latest client_secret and tokens to GitHub Actions for the 20-channel fleet.

$clientSecret = Get-Content -Raw -Path "client_secret.json"
$youtubeToken = Get-Content -Raw -Path "youtube-token.json"

Write-Host "🐙 [GitHub] Syncing YOUTUBE_CLIENT_SECRET..."
$clientSecret | & gh secret set YOUTUBE_CLIENT_SECRET

Write-Host "🐙 [GitHub] Syncing YOUTUBE_TOKEN_JSON..."
$youtubeToken | & gh secret set YOUTUBE_TOKEN_JSON

Write-Host "✅ Fleet secrets synchronized to GitHub Actions!"
