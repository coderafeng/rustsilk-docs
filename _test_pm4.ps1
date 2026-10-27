$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class PM4 {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  public static IntPtr LP(int x, int y) { return (IntPtr)((y << 16) | (x & 0xFFFF)); }
}
"@
[PM4]::SetProcessDPIAware() | Out-Null
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
if (-not $p) { Write-Host 'NO ZED'; exit 1 }
$hwnd = $p.MainWindowHandle
function Snap([string]$tag) {
  $r = New-Object 'PM4+RECT'
  [PM4]::GetWindowRect($hwnd, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [PM4]::PrintWindow($hwnd, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save("D:\notes\VitePress\rustsilk-docs\_pm4_$tag.png")
  $g.Dispose(); $bmp.Dispose()
  Write-Host "snap $tag"
}
function Click([int]$x, [int]$y) {
  [PM4]::PostMessage($hwnd, 0x200, [IntPtr]0, [PM4]::LP($x, $y)) | Out-Null
  Start-Sleep -Milliseconds 120
  [PM4]::PostMessage($hwnd, 0x201, [IntPtr]1, [PM4]::LP($x, $y)) | Out-Null
  Start-Sleep -Milliseconds 120
  [PM4]::PostMessage($hwnd, 0x202, [IntPtr]0, [PM4]::LP($x, $y)) | Out-Null
  Start-Sleep -Milliseconds 500
}
# hamburger menu top-left
Click 22 15
Snap 'menu'
