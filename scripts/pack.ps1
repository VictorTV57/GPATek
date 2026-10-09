# Builds one zip per browser engine from src/ (to upload as a release or to the stores):
#   dist/gpa-tek-<version>-chromium.zip  Chrome, Edge, Brave, Opera (GX), Vivaldi, Arc, Comet...
#   dist/gpa-tek-<version>-firefox.zip   Firefox, Zen, LibreWolf, Floorp... (addons.mozilla.org)
# The Chromium package drops browser_specific_settings, which Chrome reports as an unrecognized key.
# Uses System.IO.Compression directly: Compress-Archive on Windows PowerShell 5.1 writes
# backslashes in entry names, which breaks extraction on other systems.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'src'
$dist = Join-Path $root 'dist'

$manifestText = [System.IO.File]::ReadAllText((Join-Path $src 'manifest.json'))
$version = ($manifestText | ConvertFrom-Json).version
New-Item -ItemType Directory -Force $dist | Out-Null

function New-Package([string]$target, [string]$manifest) {
  $zip = Join-Path $dist "gpa-tek-$version-$target.zip"
  if (Test-Path $zip) { Remove-Item $zip }

  $archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
  try {
    Get-ChildItem $src -Recurse -File | ForEach-Object {
      $entry = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
      if ($entry -eq 'manifest.json') {
        $writer = New-Object System.IO.StreamWriter($archive.CreateEntry($entry, 'Optimal').Open(), (New-Object System.Text.UTF8Encoding($false)))
        try { $writer.Write($manifest) } finally { $writer.Dispose() }
      } else {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entry, 'Optimal') | Out-Null
      }
    }
  } finally {
    $archive.Dispose()
  }
  Write-Host "Created $zip"
}

$chromium = $manifestText | ConvertFrom-Json
$chromium.PSObject.Properties.Remove('browser_specific_settings')

New-Package 'chromium' ($chromium | ConvertTo-Json -Depth 10)
New-Package 'firefox' $manifestText
