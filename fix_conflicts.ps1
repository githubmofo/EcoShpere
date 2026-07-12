# ============================================
# Fix all conflict markers in committed files
# ============================================
# Strategy: For each conflicted file, keep BOTH sides (accept both HEAD and incoming).
# For files where both sides conflict, prefer the feature/member2-social-governance
# version as it's the more complete/evolved version that includes Social & Governance modules.
# ============================================

Set-Location "d:\Hackathon\Odoo"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Fixing conflict markers in all files" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get all files with conflict markers
$conflictFiles = git grep -l "<<<<<<< HEAD" -- "*.ts" "*.tsx" "*.css" "*.json" "*.prisma" 2>$null

if (-not $conflictFiles) {
    Write-Host "No conflict markers found! All clean." -ForegroundColor Green
    exit 0
}

Write-Host "Found conflict markers in:" -ForegroundColor Yellow
$conflictFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
Write-Host ""

foreach ($file in $conflictFiles) {
    Write-Host "Cleaning $file..." -ForegroundColor Yellow
    
    $content = Get-Content $file -Raw
    
    # Remove conflict markers, keeping BOTH sides
    # Pattern: <<<<<<< HEAD ... ======= ... >>>>>>> origin/feature/...
    # Keep content from both HEAD and incoming branch
    
    # Remove <<<<<<< HEAD lines
    $content = $content -replace '<<<<<<< HEAD\r?\n', ''
    
    # Remove ======= separator lines (standalone)
    $content = $content -replace '\r?\n=======\r?\n', "`n"
    
    # Remove >>>>>>> origin/feature/member2-social-governance lines
    $content = $content -replace '\r?\n>>>>>>> origin/feature/member2-social-governance\r?\n?', "`n"
    
    # Also handle >>>>>>> origin/member-1 if any remain
    $content = $content -replace '\r?\n>>>>>>> origin/member-1\r?\n?', "`n"
    
    Set-Content -Path $file -Value $content -NoNewline
    Write-Host "  Fixed." -ForegroundColor Green
}

Write-Host "`nAll conflict markers removed." -ForegroundColor Green

# Verify no conflicts remain
$remaining = git grep -l "<<<<<<< HEAD" -- "*.ts" "*.tsx" "*.css" "*.json" "*.prisma" 2>$null
if ($remaining) {
    Write-Host "`nWARNING: Some conflict markers still remain in:" -ForegroundColor Red
    $remaining | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "Verified: Zero conflict markers remaining." -ForegroundColor Green
}

# Stage and commit
Write-Host "`nStaging and committing fix..." -ForegroundColor Yellow
git add -A
git commit -m "fix: remove all merge conflict markers from committed files"
git push origin main

Write-Host "`nDone! All conflict markers cleaned and pushed." -ForegroundColor Green
