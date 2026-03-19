# 🎭 AAK Nation: LatentSync Local Lip-Sync Setup
# Run this ONCE to install the free AI lip-sync engine
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-lipsync.ps1

Write-Host "======================================================"
Write-Host "  AAK NATION: LIPSYNC ENGINE SETUP"
Write-Host "  Installing ByteDance LatentSync (100% Free)"
Write-Host "======================================================"

$lipsyncDir = "$PSScriptRoot\lipsync"

# Step 1: Clone LatentSync repo
if (-not (Test-Path $lipsyncDir)) {
    Write-Host "[1] Cloning LatentSync repo..."
    git clone https://github.com/bytedance/LatentSync.git $lipsyncDir
} else {
    Write-Host "[1] LatentSync repo already exists."
}

# Step 2: Install Python dependencies
Write-Host "[2] Installing Python dependencies..."
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
python -m pip install -r "$lipsyncDir\requirements.txt"
python -m pip install accelerate diffusers transformers

# Step 3: Create avatar directory and instructions
$avatarDir = "$PSScriptRoot\..\data\avatar"
New-Item -ItemType Directory -Force -Path $avatarDir | Out-Null

$instructions = @"
====================================================
AAK NATION: AVATAR SETUP INSTRUCTIONS
====================================================

STEP 1: Record your face video
  - Record a 10-30 second video of yourself
  - Look directly at the camera
  - Speak or stay silent (doesn't matter)
  - Good lighting, neutral background
  - Save as: data\avatar\my-face.mp4

STEP 2: Test the pipeline
  node scripts/ai-updates-producer.mjs

STEP 3: Schedule daily production
  The GitHub Actions workflow will run this daily at 6am EST.

HeyGen Option (for premium quality):
  1. Go to https://app.heygen.com
  2. Create "Instant Avatar" with your face video
  3. Get API key from Settings > API
  4. Add HEYGEN_API_KEY to .env
  5. Update ai-updates-producer.mjs to use HeyGen API

====================================================
"@

Set-Content "$avatarDir\SETUP_INSTRUCTIONS.txt" $instructions
Write-Host $instructions

Write-Host ""
Write-Host "[OK] LatentSync setup complete!"
Write-Host "[OK] Instructions saved to data/avatar/SETUP_INSTRUCTIONS.txt"
Write-Host ""
Write-Host "NEXT: Drop your face video at: data\avatar\my-face.mp4"
Write-Host "THEN: Run: node scripts/ai-updates-producer.mjs"
