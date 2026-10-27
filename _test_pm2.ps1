$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class PM2 {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern uint MapVirtualKey(uint vk, uint t);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  public static uint KEYL(uint vk, bool up) {
    uint scan = MapVirtualKey(vk, 0);
    uint l = 1u | (scan << 16);
    if (up) l |= 0xC0000000u;
    return l;
  }
}
"@
[PM2]::SetProcessDPIAware() | Out-Null
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
if (-not $p) { Write-Host 'NO ZED'; exit 1 }
$hwnd = $p.MainWindowHandle

function Snap([string]$tag) {
  $r = New-Object 'PM2+RECT'
  [PM2]::GetWindowRect($hwnd, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [PM2]::PrintWindow($hwnd, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save("D:\notes\VitePress\rustsilk-docs\_pm2_$tag.png")
  $g.Dispose(); $bmp.Dispose()
  Write-Host "snap $tag"
}
function Key([uint16]$vk, [uint32]$msg, [bool]$up) {
  [PM2]::PostMessage($hwnd, $msg, [IntPtr]$vk, [IntPtr][PM2]::KEYL($vk, $up)) | Out-Null
  Start-Sleep -Milliseconds 80
}
function Tap([uint16]$vk) { Key $vk 0x0100 $false; Key $vk 0x0101 $true }
function Down([uint16]$vk) { Key $vk 0x0100 $false }
function Up([uint16]$vk) { Key $vk 0x0101 $true }

# ctrl+shift+p
Down 0x11; Down 0x10; Tap 0x50; Up 0x10; Up 0x11
Start-Sleep -Milliseconds 1500
Snap 'palette'
