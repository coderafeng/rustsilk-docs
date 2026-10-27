$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class PM {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool attach);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern uint MapVirtualKey(uint vk, uint t);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  public static IntPtr MAKEPARAM(int lo, int hi) { return (IntPtr)((hi << 16) | (lo & 0xFFFF)); }
  public static uint LPARAM_DOWN(int x, int y) { return (uint)((y << 16) | (x & 0xFFFF)); }
  public static uint LPARAM_UP(int x, int y) { return (uint)(((y << 16) | (x & 0xFFFF)) | (0xC000 << 16)); }
  public static uint KEYL(uint vk, bool up) {
    uint scan = MapVirtualKey(vk, 0);
    uint l = 1u | (scan << 16);
    if ((vk == 0x11) || (vk == 0x10) || (vk == 0x12)) l |= 0x20;
    if (up) l |= 0xC0000000u;
    return l;
  }
}
"@
[PM]::SetProcessDPIAware() | Out-Null
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
if (-not $p) { Write-Host 'NO ZED'; exit 1 }
$hwnd = $p.MainWindowHandle
Write-Host ("hwnd=" + $hwnd + " fg=" + [PM]::GetForegroundWindow())

function Snap([string]$tag) {
  $r = New-Object 'PM+RECT'
  [PM]::GetWindowRect($hwnd, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [PM]::PrintWindow($hwnd, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save("D:\notes\VitePress\rustsilk-docs\_pm_$tag.png")
  $g.Dispose(); $bmp.Dispose()
  Write-Host "snap $tag"
}
function Post-Key([uint16]$vk, [bool]$down) {
  $msg = if ($down) { 0x0100 } else { 0x0101 }   # WM_KEYDOWN / WM_KEYUP
  [PM]::PostMessage($hwnd, $msg, [IntPtr]$vk, [IntPtr][PM]::KEYL($vk, -not $down)) | Out-Null
}

# try 1: posted ctrl+shift+p (command palette)
Post-Key 0x11 $true
Post-Key 0x10 $true
Post-Key 0x50 $true
Post-Key 0x50 $false
Post-Key 0x10 $false
Post-Key 0x11 $false
Start-Sleep -Milliseconds 1500
Snap 'palette_postmsg'

# try 2: mouse click via posted messages on "Stay in Restricted Mode" (726,412)
$r = New-Object 'PM+RECT'
[PM]::GetWindowRect($hwnd, [ref]$r) | Out-Null
# WM_MOUSEMOVE=0x200 WM_LBUTTONDOWN=0x201 WM_LBUTTONUP=0x202 ; wParam MK_LBUTTON=0x2
[PM]::PostMessage($hwnd, 0x200, [IntPtr]0, [PM]::MAKEPARAM(726, 412)) | Out-Null
Start-Sleep -Milliseconds 200
[PM]::PostMessage($hwnd, 0x201, [IntPtr]1, [PM]::MAKEPARAM(726, 412)) | Out-Null
Start-Sleep -Milliseconds 200
[PM]::PostMessage($hwnd, 0x202, [IntPtr]0, [PM]::MAKEPARAM(726, 412)) | Out-Null
Start-Sleep -Milliseconds 1200
Snap 'click_postmsg'
