$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class PM3 {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  public static IntPtr LP(int x, int y) { return (IntPtr)((y << 16) | (x & 0xFFFF)); }
}
"@
[PM3]::SetProcessDPIAware() | Out-Null
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
if (-not $p) { Write-Host 'NO ZED'; exit 1 }
$hwnd = $p.MainWindowHandle

function Snap([string]$tag) {
  $r = New-Object 'PM3+RECT'
  [PM3]::GetWindowRect($hwnd, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [PM3]::PrintWindow($hwnd, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save("D:\notes\VitePress\rustsilk-docs\_pm3_$tag.png")
  $g.Dispose(); $bmp.Dispose()
  Write-Host "snap $tag"
}
function Click([int]$x, [int]$y) {
  [PM3]::PostMessage($hwnd, 0x200, [IntPtr]0, [PM3]::LP($x, $y)) | Out-Null
  Start-Sleep -Milliseconds 120
  [PM3]::PostMessage($hwnd, 0x201, [IntPtr]1, [PM3]::LP($x, $y)) | Out-Null
  Start-Sleep -Milliseconds 120
  [PM3]::PostMessage($hwnd, 0x202, [IntPtr]0, [PM3]::LP($x, $y)) | Out-Null
  Start-Sleep -Milliseconds 400
}
function TypeStr([string]$s) {
  foreach ($c in $s.ToCharArray()) {
    [PM3]::PostMessage($hwnd, 0x0102, [IntPtr][int]$c, [IntPtr]1) | Out-Null   # WM_CHAR
    Start-Sleep -Milliseconds 60
  }
  Start-Sleep -Milliseconds 400
}

# 1. click search icon in bottom dock (magnifier, ~85,827)
Click 85 827
Start-Sleep -Milliseconds 800
Snap 'aftersearchclick'

# 2. type text into whatever opened
TypeStr 'terminal: new'
Snap 'aftertype'

# 3. press Enter via WM_KEYDOWN + WM_CHAR 13
[PM3]::PostMessage($hwnd, 0x0100, [IntPtr]13, [IntPtr]0x1C0001) | Out-Null
[PM3]::PostMessage($hwnd, 0x0101, [IntPtr]13, [IntPtr]0xC01C0001) | Out-Null
Start-Sleep -Milliseconds 2500
Snap 'afterenter'
