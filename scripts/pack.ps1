# Builds dist/gpa-tek-<version>.zip from src/ (to upload as a release or to the Chrome Web Store).
# Uses System.IO.Compression directly: Compress-Archive on Windows PowerShell 5.1 writes
# backslashes in entry names, which breaks extraction on other systems.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'src'
$dist = Join-Path $root 'dist'

$version = (Get-Content (Join-Path $src 'manifest.json') -Raw | ConvertFrom-Json).version
New-Item -ItemType Directory -Force $dist | Out-Null
$zip = Join-Path $dist "gpa-tek-$version.zip"
if (Test-Path $zip) { Remove-Item $zip }

$archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
try {
  Get-ChildItem $src -Recurse -File | ForEach-Object {
    $entry = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entry, 'Optimal') | Out-Null
  }
} finally {
  $archive.Dispose()
}
Write-Host "Created $zip"
