$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$content = Get-Content -LiteralPath (Join-Path $root 'content/demo-podcast.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$destination = Join-Path $root 'public/demo'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$voice = New-Object -ComObject SAPI.SpVoice
$spanish = $voice.GetVoices() | Where-Object { $_.GetDescription() -match 'Helena' } | Select-Object -First 1
if (-not $spanish) { throw 'Microsoft Helena Spanish voice is required to reproduce this local demo audio.' }
$voice.Voice = $spanish
$voice.Rate = 0
$stream = New-Object -ComObject SAPI.SpFileStream
try {
  $stream.Open((Join-Path $destination 'podcast-demo.wav'), 3, $false)
  $voice.AudioOutputStream = $stream
  [void]$voice.Speak(($content.transcript -join "`r`n`r`n"), 0)
} finally {
  $stream.Close()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($stream)
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($voice)
}
Get-Item -LiteralPath (Join-Path $destination 'podcast-demo.wav') | Select-Object Name, Length
