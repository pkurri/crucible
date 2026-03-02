# Remove all external references and rebrand content for Crucible

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "Crucible Content Cleanup Tool" -ForegroundColor Cyan
Write-Host "Removing all external references..." -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
}
Write-Host ""

# Files to delete completely
$filesToDelete = @(
    "SYNC_SUMMARY.md",
    "FINAL_SYNC_REPORT.md",
    "docs\ship-faster-sync.md"
)

# Patterns to remove
$patternsToRemove = @{
    'ship-faster' = 'crucible'
    'ship faster' = 'crucible'
    'ShipFaster' = 'Crucible'
    'Heyvhuang/ship-faster' = 'pkurri/crucible'
    'https://github.com/Heyvhuang/ship-faster' = 'https://github.com/pkurri/crucible'
}

# Delete sync documentation files
Write-Host "Removing sync documentation files..." -ForegroundColor Magenta
foreach ($file in $filesToDelete) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        if (-not $DryRun) {
            Remove-Item -Path $filePath -Force
            Write-Host "Deleted: $file" -ForegroundColor Green
        } else {
            Write-Host "Would delete: $file" -ForegroundColor Yellow
        }
    }
}

# Clean up package.json
Write-Host "`nCleaning package.json..." -ForegroundColor Magenta
$packagePath = Join-Path $rootDir "package.json"
if (Test-Path $packagePath) {
    $packageContent = Get-Content -Path $packagePath -Raw
    
    # Remove sync scripts
    $packageContent = $packageContent -replace ',?\s*"sync:ship-faster":\s*"[^"]*"', ''
    $packageContent = $packageContent -replace ',?\s*"sync:templates":\s*"[^"]*"', ''
    $packageContent = $packageContent -replace ',?\s*"sync:skills":\s*"[^"]*"', ''
    
    # Clean up any double commas
    $packageContent = $packageContent -replace ',\s*,', ','
    
    if (-not $DryRun) {
        Set-Content -Path $packagePath -Value $packageContent
        Write-Host "Cleaned: package.json" -ForegroundColor Green
    } else {
        Write-Host "Would clean: package.json" -ForegroundColor Yellow
    }
}

# Remove sync scripts
Write-Host "`nRemoving sync scripts..." -ForegroundColor Magenta
$scriptsToRemove = @(
    "scripts\sync-ship-faster.ps1",
    "scripts\pull-from-ship-faster.js",
    "scripts\pull-from-ship-faster-git.ps1",
    "scripts\pull-remaining.ps1"
)

foreach ($script in $scriptsToRemove) {
    $scriptPath = Join-Path $rootDir $script
    if (Test-Path $scriptPath) {
        if (-not $DryRun) {
            Remove-Item -Path $scriptPath -Force
            Write-Host "Deleted: $script" -ForegroundColor Green
        } else {
            Write-Host "Would delete: $script" -ForegroundColor Yellow
        }
    }
}

# Clean all markdown and text files
Write-Host "`nCleaning content files..." -ForegroundColor Magenta
$fileExtensions = @('*.md', '*.txt', '*.json')
$filesToClean = Get-ChildItem -Path $rootDir -Recurse -Include $fileExtensions -File | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*.git*" 
    }

$cleanedCount = 0
foreach ($file in $filesToClean) {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $originalContent = $content
        
        # Apply all pattern replacements
        foreach ($pattern in $patternsToRemove.GetEnumerator()) {
            $content = $content -replace [regex]::Escape($pattern.Key), $pattern.Value
        }
        
        # Remove references to syncing from ship-faster
        $content = $content -replace '(?m)^.*ship-faster.*$\r?\n?', ''
        $content = $content -replace '(?m)^.*Synced from.*$\r?\n?', ''
        $content = $content -replace '(?m)^.*Pulled from.*$\r?\n?', ''
        
        if ($content -ne $originalContent) {
            if (-not $DryRun) {
                Set-Content -Path $file.FullName -Value $content -NoNewline
                $cleanedCount++
                Write-Host "Cleaned: $($file.FullName.Replace($rootDir, '.'))" -ForegroundColor Green
            } else {
                $cleanedCount++
                Write-Host "Would clean: $($file.FullName.Replace($rootDir, '.'))" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Files cleaned: $cleanedCount" -ForegroundColor White
if ($DryRun) {
    Write-Host "`nRun without -DryRun to apply changes" -ForegroundColor Yellow
} else {
    Write-Host "`nCleanup complete!" -ForegroundColor Green
}
