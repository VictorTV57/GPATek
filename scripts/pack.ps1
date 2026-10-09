# Builds dist/gpa-tek-<version>.zip from src/ (to upload as a release or to the Chrome Web Store).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'src'
$dist = Join-Path $root 'dist'

$version = (Get-Content (Join-Path $src 'manifest.json') -Raw | ConvertFrom-Json).version
New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist "gpa-tek-$version.zip"
if (Test-Path $zip) { Remove-Item $zip }

Compress-Archive -Path (Join-Path $src '*') -DestinationPath $zip
Write-Host "Created $zip"
