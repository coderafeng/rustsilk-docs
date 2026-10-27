Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Gdi {
  [DllImport("user32.dll")] public static extern IntPtr GetDC(IntPtr h);
  [DllImport("user32.dll")] public static extern int ReleaseDC(IntPtr h, IntPtr dc);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateCompatibleDC(IntPtr dc);
  [DllImport("gdi32.dll")] public static extern IntPtr CreateCompatibleBitmap(IntPtr dc, int w, int h);
  [DllImport("gdi32.dll")] public static extern IntPtr SelectObject(IntPtr dc, IntPtr obj);
  [DllImport("gdi32.dll")] public static extern bool BitBlt(IntPtr d, int x, int y, int w, int h, IntPtr s, int sx, int sy, uint op);
  [DllImport("gdi32.dll")] public static extern bool DeleteDC(IntPtr dc);
  [DllImport("gdi32.dll")] public static extern int GetDeviceCaps(IntPtr dc, int index);
}
"@
$screenDC = [Gdi]::GetDC([IntPtr]::Zero)
Write-Host ("screenDC: " + $screenDC)
if ($screenDC -eq [IntPtr]::Zero) { Write-Host 'GetDC failed - likely no window station / secure desktop'; exit 1 }
Write-Host ("desktop width: " + [Gdi]::GetDeviceCaps($screenDC, 8))
Write-Host ("desktop height: " + [Gdi]::GetDeviceCaps($screenDC, 10))
$memDC = [Gdi]::CreateCompatibleDC($screenDC)
$bmp = [Gdi]::CreateCompatibleBitmap($screenDC, 300, 300)
[Gdi]::SelectObject($memDC, $bmp) | Out-Null
$ok = [Gdi]::BitBlt($memDC, 0, 0, 300, 300, $screenDC, 0, 0, 0x00CC0020)
Write-Host ("BitBlt: " + $ok)
[Gdi]::ReleaseDC([IntPtr]::Zero, $screenDC) | Out-Null
$g = [System.Drawing.Graphics]::FromImage([System.Drawing.Image]::FromHbitmap($bmp))
$bmpObj = [System.Drawing.Image]::FromHbitmap($bmp)
$bmpObj.Save('D:\notes\VitePress\rustsilk-docs\_bitblt_test.png')
Write-Host 'saved _bitblt_test.png'
