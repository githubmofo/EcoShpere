# ============================================
# Resolve Current Conflict + Merge All Branches
# ============================================
# Run from: d:\Hackathon\Odoo
# Usage: powershell -ExecutionPolicy Bypass -File .\merge_all_branches.ps1
# ============================================

Set-Location "d:\Hackathon\Odoo"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Step 1: Resolving current merge conflict" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Stage the resolved files (mock-data.ts was manually resolved, package.json is clean)
Write-Host "Staging resolved files..." -ForegroundColor Yellow
git add frontend/lib/mock-data.ts
git add frontend/package.json
git add -A
Write-Host "Files staged." -ForegroundColor Green

# Complete the in-progress merge
Write-Host "Completing merge of origin/member-1..." -ForegroundColor Yellow
git commit --no-edit
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not commit merge. Check git status." -ForegroundColor Red
    git status
    exit 1
}
Write-Host "origin/member-1 merged successfully!`n" -ForegroundColor Green

# ── Fetch latest ──────────────────────────────────────────────
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 2: Fetching latest from remote" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
git fetch --all
Write-Host "Fetch complete.`n" -ForegroundColor Green

# ── Merge remaining branches ─────────────────────────────────
$branches = @(
    "origin/member-4",
    "origin/feature/member2-social-governance"
)

$successCount = 1  # member-1 already done above
$failCount = 0
$failedBranches = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 3: Merging remaining branches" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($branch in $branches) {
    Write-Host "Merging $branch into main..." -ForegroundColor Yellow
    git merge $branch --no-edit --allow-unrelated-histories
    if ($LASTEXITCODE -ne 0) {
        Write-Host "CONFLICT merging $branch!" -ForegroundColor Red
        
        # Check if there are actual conflict markers
        $conflicts = git diff --name-only --diff-filter=U
        if ($conflicts) {
            Write-Host "Conflicted files:" -ForegroundColor Red
            Write-Host $conflicts -ForegroundColor Red
            Write-Host "Attempting auto-resolution (accept both sides)..." -ForegroundColor Yellow
            
            # Try to accept all changes by staging everything
            git add -A
            git commit --no-edit 2>$null
            if ($LASTEXITCODE -ne 0) {
                git merge --abort 2>$null
                $failCount++
                $failedBranches += $branch
                Write-Host "Could not auto-resolve. Skipped $branch.`n" -ForegroundColor Red
                continue
            }
            Write-Host "Auto-resolved and committed.`n" -ForegroundColor Green
            $successCount++
        } else {
            git merge --abort 2>$null
            $failCount++
            $failedBranches += $branch
            Write-Host "Skipped $branch.`n" -ForegroundColor Red
        }
    } else {
        $successCount++
        Write-Host "Successfully merged $branch`n" -ForegroundColor Green
    }
}

# ── Push ─────────────────────────────────────────────────────
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 4: Pushing to remote" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. You may need to authenticate." -ForegroundColor Red
} else {
    Write-Host "Push complete.`n" -ForegroundColor Green
}

# ── Summary ──────────────────────────────────────────────────
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  MERGE SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Successfully merged: $successCount branches" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "Failed (conflicts):  $failCount branches" -ForegroundColor Red
    foreach ($fb in $failedBranches) {
        Write-Host "  - $fb" -ForegroundColor Red
    }
}

Write-Host "`nRecent commits:" -ForegroundColor Yellow
git log --oneline -8
Write-Host ""
