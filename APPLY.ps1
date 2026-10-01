param([string]$ProjectPath = "C:\work\survivor-protocol")
$ErrorActionPreference = "Stop"
if (!(Test-Path (Join-Path $ProjectPath "package.json"))) { throw "Project package.json not found: $ProjectPath" }
$entries = @(Get-Content (Join-Path $PSScriptRoot "manifest.json") -Raw | ConvertFrom-Json)
$conflicts = @()
foreach ($entry in $entries) {
    $target = Join-Path $ProjectPath $entry.path
    $hash = if (Test-Path $target) { (Get-FileHash $target -Algorithm SHA256).Hash.ToLowerInvariant() } else { $null }
    if ($hash -eq $entry.afterSha256) { continue }
    if ($hash -ne $entry.beforeSha256) { $conflicts += $entry.path }
}
if ($conflicts.Count -gt 0) {
    throw ("Local changes differ from the verified base. No files were copied. Merge these files first:`n" + ($conflicts -join "`n"))
}
$backup = Join-Path $ProjectPath ("talisman-backups\" + (Get-Date -Format "yyyyMMdd-HHmmss"))
foreach ($entry in $entries) {
    $target = Join-Path $ProjectPath $entry.path
    if (Test-Path $target) {
        if ((Get-FileHash $target -Algorithm SHA256).Hash.ToLowerInvariant() -eq $entry.afterSha256) { continue }
        $backupFile = Join-Path $backup $entry.path
        New-Item -ItemType Directory -Path (Split-Path $backupFile) -Force | Out-Null
        Copy-Item $target $backupFile
    }
    New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null
    Copy-Item (Join-Path (Join-Path $PSScriptRoot "payload") $entry.path) $target -Force
}
Write-Host "Curse & Talisman update applied. Existing files backed up to $backup"
Write-Host "Next: cd $ProjectPath; npm run build; npm test; npm run dev"
