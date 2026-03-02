# Crucible — Windows Install Script
# Usage: irm https://raw.githubusercontent.com/pkurri/crucible/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$SkillsDir = if ($env:CLAUDE_SKILLS_DIR) { $env:CLAUDE_SKILLS_DIR } else { "$HOME\.claude\skills" }
$Repo = "pkurri/crucible"
$Branch = "main"

Write-Host "🔥 Installing Crucible skills to $SkillsDir"

New-Item -ItemType Directory -Force -Path $SkillsDir | Out-Null

$Tmp = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory $_.FullName }
$ZipPath = Join-Path $Tmp "crucible.zip"

Invoke-WebRequest -Uri "https://github.com/$Repo/archive/refs/heads/$Branch.zip" -OutFile $ZipPath
Expand-Archive -Path $ZipPath -DestinationPath $Tmp -Force

$ExtractedSkills = Get-ChildItem -Path $Tmp -Filter "crucible-$Branch" | Select-Object -First 1
Copy-Item -Recurse -Force "$($ExtractedSkills.FullName)\skills\*" $SkillsDir

Remove-Item -Recurse -Force $Tmp

Write-Host ""
Write-Host "✅ Crucible installed! Skills available in $SkillsDir"
Write-Host ""
Write-Host "Installed skills:"
Get-ChildItem $SkillsDir | ForEach-Object { Write-Host "  - $($_.Name)" }

# Run IDE auto-setup if Node.js is available
if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host ""
  Write-Host "🔧 Setting up IDE configurations..."
  $SetupScript = Join-Path $ExtractedSkills.FullName "setup-ide.js"
  if (Test-Path $SetupScript) {
    Push-Location $HOME
    & node $SetupScript 2>$null
    Pop-Location
  }
}

Write-Host ""
Write-Host "💡 Tip: Run 'node setup-ide.js' in any project to generate IDE configs"
