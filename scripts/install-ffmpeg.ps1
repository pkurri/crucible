# FFmpeg Installation Script for Windows
# Downloads and installs FFmpeg to a local directory

$ErrorActionPreference = "Stop"

Write-Host "[*] Installing FFmpeg for Windows..." -ForegroundColor Cyan

# Create tools directory
$toolsDir = Join-Path $PSScriptRoot "..\tools"
$ffmpegDir = Join-Path $toolsDir "ffmpeg"

if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

# Check if already installed
if (Test-Path (Join-Path $ffmpegDir "bin\ffmpeg.exe")) {
    Write-Host "[OK] FFmpeg already installed at: $ffmpegDir" -ForegroundColor Green
    Write-Host "   Adding to PATH for this session..." -ForegroundColor Yellow
    $env:Path = "$ffmpegDir\bin;$env:Path"
    Write-Host "[OK] FFmpeg is ready to use!" -ForegroundColor Green
    exit 0
}

Write-Host "[*] Downloading FFmpeg..." -ForegroundColor Yellow

# Download FFmpeg (using gyan.dev builds - reliable Windows builds)
$ffmpegUrl = "https://github.com/GyanD/codexffmpeg/releases/download/7.1/ffmpeg-7.1-essentials_build.zip"
$zipPath = Join-Path $toolsDir "ffmpeg.zip"

try {
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "[OK] Download complete" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[*] Extracting FFmpeg..." -ForegroundColor Yellow

try {
    Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
    
    # Find the extracted folder (it has version in name)
    $extractedFolder = Get-ChildItem -Path $toolsDir -Directory | Where-Object { $_.Name -like "ffmpeg-*" } | Select-Object -First 1
    
    if ($extractedFolder) {
        # Rename to simple "ffmpeg" folder
        if (Test-Path $ffmpegDir) {
            Remove-Item $ffmpegDir -Recurse -Force
        }
        Rename-Item -Path $extractedFolder.FullName -NewName "ffmpeg"
    }
    
    # Clean up zip file
    Remove-Item $zipPath -Force
    
    Write-Host "[OK] Extraction complete" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Extraction failed: $_" -ForegroundColor Red
    exit 1
}

# Add to PATH for current session
$ffmpegBinPath = Join-Path $ffmpegDir "bin"
$env:Path = "$ffmpegBinPath;$env:Path"

# Verify installation
$ffmpegExe = Join-Path $ffmpegBinPath "ffmpeg.exe"
if (Test-Path $ffmpegExe) {
    Write-Host "[OK] FFmpeg installed successfully!" -ForegroundColor Green
    Write-Host "   Location: $ffmpegDir" -ForegroundColor Cyan
    Write-Host "   Added to PATH for this session" -ForegroundColor Cyan
    
    # Test FFmpeg
    Write-Host "`n[*] Testing FFmpeg..." -ForegroundColor Yellow
    & $ffmpegExe -version | Select-Object -First 1
    
    Write-Host "`n[NOTE] To make FFmpeg permanent, add this to your system PATH:" -ForegroundColor Yellow
    Write-Host "   $ffmpegBinPath" -ForegroundColor White
    
} else {
    Write-Host "[ERROR] Installation failed - ffmpeg.exe not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n[OK] Setup complete! FFmpeg is ready to use." -ForegroundColor Green
