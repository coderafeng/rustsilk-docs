Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap 100,100
try {
  $g = [System.Drawing.Graphics]::FromImage($b)
  $g.CopyFromScreen(0,0,0,0,(New-Object System.Drawing.Size(100,100)))
  Write-Host 'SCREEN CAPTURE OK'
  $g.Dispose()
} catch {
  Write-Host ('FAIL: ' + $_.Exception.Message)
  Write-Host ('INNER: ' + $_.Exception.InnerException.Message)
}
$b.Dispose()
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class W2 {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
}
"@
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if ($p) {
  Write-Host ('Zed hwnd: ' + $p.MainWindowHandle)
  $b2 = New-Object System.Drawing.Bitmap 200,200
  $g2 = [System.Drawing.Graphics]::FromImage($b2)
  $hdc = $g2.GetHdc()
  $ok = [W2]::PrintWindow($p.MainWindowHandle, $hdc, 2)
  $g2.ReleaseHdc($hdc)
  Write-Host ('PrintWindow result: ' + $ok)
  $b2.Save('D:\notes\VitePress\rustsilk-docs\_printwin_test.png')
  $g2.Dispose(); $b2.Dispose()
} else {
  Write-Host 'no zed window'
}
