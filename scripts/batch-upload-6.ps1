$brain = "C:\Users\Prasad\.gemini\antigravity\brain\65ca50d4-35df-491e-8420-a21e0f47038a"
$base = "C:\Users\Prasad\workspace\dups\crucible\data\youtube-empire\AAK-Nation\topics"
$root = "C:\Users\Prasad\workspace\dups\crucible"
$ffmpeg = "$root\scripts\bin\ffmpeg.exe"

$map = @{
  WealthWizards  = "wealth_wizards_frame1_1773946443224.png"
  MysteryArchive = "mystery_archive_frame1_1773946457764.png"
  ZenGarden      = "zen_garden_frame1_1773946475979.png"
  FutureTech     = "future_tech_frame1_1773946495270.png"
  DailyStoic     = "daily_stoic_frame1_1773946512068.png"
}

$voices = @{
  WealthWizards  = "While you sleep, AI is rewriting the rules of finance. The old playbook is dead. This is WealthWizards on AAK Nation."
  MysteryArchive = "Some cases were never meant to be solved. But the data tells a different story. MysteryArchive on AAK Nation."
  ZenGarden      = "Close your eyes. Breathe in. Let ambient frequencies restore your focus. ZenGarden on AAK Nation."
  FutureTech     = "The silicon revolution is already here. Hardware that thinks. Chips that dream. FutureTech on AAK Nation."
  DailyStoic     = "You cannot control the storm. But you can build a mind that weathers anything. DailyStoic on AAK Nation."
}

# STEP 1: Copy assets
foreach ($t in $map.Keys) {
  Copy-Item "$brain\$($map[$t])" "$base\$t\assets\frame1.png" -Force
  Copy-Item "$brain\$($map[$t])" "$base\$t\assets\frame2.png" -Force
  Write-Host "[OK] Assets copied: $t"
}

# STEP 2: Generate voiceover + render for each
foreach ($t in $voices.Keys) {
  Write-Host "[TTS] $t..."
  python -m edge_tts --voice "en-US-GuyNeural" --text "$($voices[$t])" --write-media "$base\$t\voiceover.mp3" --write-subtitles "$base\$t\captions.vtt" 2>$null

  Write-Host "[RENDER] $t..."
  $f1 = "$base\$t\assets\frame1.png"
  $f2 = "$base\$t\assets\frame2.png"
  $audio = "$base\$t\voiceover.mp3"
  $out = "$base\$t\final-render.mp4"

  & $ffmpeg -y -loop 1 -t 5 -i $f1 -loop 1 -t 5 -i $f2 -i $audio -filter_complex "[0:v]scale=2160:3840:force_original_aspect_ratio=decrease,pad=2160:3840:(ow-iw)/2:(oh-ih)/2[v0];[1:v]scale=2160:3840:force_original_aspect_ratio=decrease,pad=2160:3840:(ow-iw)/2:(oh-ih)/2[v1];[v0][v1]concat=n=2:v=1:a=0[v]" -map "[v]" -map 2:a -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest -r 25 $out 2>$null

  if (Test-Path $out) { Write-Host "[OK] $t RENDERED" } else { Write-Host "[FAIL] $t render failed" }
}

# STEP 3: Upload 6 videos
Write-Host ""
Write-Host "=== UPLOADING 6 VIDEOS TO AAK NATION ==="
$uploaded = 0
foreach ($t in @("SuccessCodes","WealthWizards","MysteryArchive","ZenGarden","FutureTech","DailyStoic")) {
  $render = "$base\$t\final-render.mp4"
  if (Test-Path $render) {
    $n = $uploaded + 1
    Write-Host "[UPLOAD $n/6] $t..."
    node "$root\scripts\youtube-official-uploader.mjs" --topic $t
    $uploaded++
  } else {
    Write-Host "[SKIP] $t has no video"
  }
}
Write-Host ""
Write-Host "=== BATCH COMPLETE: $uploaded videos uploaded ==="
