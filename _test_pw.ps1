Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Gdi2 {
  [DllImport("user32.dll", SetLastError=true)] public static extern IntPtr GetDC(IntPtr h);
  [DllImport("user32.dll", SetLastError=true)] public static extern bool BitBlt(IntPtr d, int x, int y, int w, int h, IntPtr s, int sx, int sy, uint op);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
# launch Zed if not running
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) {
  Start-Process -FilePath 'C:\app\aaa\zed\one\Zed\bin\Zed.exe' -ArgumentList '-n', 'D:\notes\VitePress\rustsilk-docs'
  Start-Sleep -Seconds 15
  $p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
}
if (-not $p) { Write-Host 'ZED NOT RUNNING'; exit 1 }
Write-Host ('Zed pid=' + $p.Id + ' hwnd=' + $p.MainWindowHandle)
[Gdi2]::ShowWindowAsync($p.MainWindowHandle, 9) | Out-Null  # SW_RESTORE
Start-Sleep -Milliseconds 600
[Gdi2]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
Start-Sleep -Seconds 1

$r = New-Object 'Gdi2+RECT'
[Gdi2]::GetWindowRect($p.MainWindowHandle, [ref]$r) | Out-Null
$w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
Write-Host ("window rect: $w x $h")

$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
$ok = [Gdi2]::PrintWindow($p.MainWindowHandle, $hdc, 2)
$g.ReleaseHdc($hdc)
Write-Host ("PrintWindow(PW_RENDERFULLCONTENT): " + $ok + " err=" + [System.Runtime.InteropServices.Marshal]::GetLastWin32Error())
$bmp.Save('D:\notes\VitePress\rustsilk-docs\_printwindow_test.png')
# sample center pixel to check not black
$px = $bmp.GetPixel([int]($w/2), [int]($h/2))
Write-Host ("center pixel RGBA: " + $px.R + "," + $px.G + "," + $px.B + "," + $px.A)
$g.Dispose(); $bmp.Dispose()

# BitBlt with CAPTUREBLT and error code
$sdc = [Gdi2]::GetDC([IntPtr]::Zero)
$b2 = New-Object System.Drawing.Bitmap 100,100
$g2 = [System.Drawing.Graphics]::FromImage($b2)
try { $g2.CopyFromScreen(0,0,0,0,(New-Object System.Drawing.Size(100,100))) ; Write-Host 'CopyFromScreen retry OK' }
catch { Write-Host ('CopyFromScreen retry FAIL: ' + $_.Exception.InnerException.Message) }
Write-Host ("last err=" + [System.Runtime.InteropServices.Marshal]::GetLastWin32Error())
$g2.Dispose(); $b2.Dispose()
