$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Inj {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, UIntPtr e);
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, INPUT[] inputs, int cbSize);
  [DllImport("user32.dll")] public static extern uint MapVirtualKey(uint vk, uint mapType);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  public static bool SetProcessDPIAware2() { return SetProcessDPIAware(); }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct INPUT {
    public uint type; public INPUTUNION u;
  }
  [StructLayout(LayoutKind.Explicit)] public struct INPUTUNION {
    [FieldOffset(0)] public KEYBDINPUT ki;
    [FieldOffset(0)] public MOUSEINPUT mi;
  }
  [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT {
    public ushort vk; public ushort scan; public uint flags; public uint time; public UIntPtr extra;
  }
  [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT {
    public int dx; public int dy; public uint mouseData; public uint flags; public uint time; public UIntPtr extra;
  }
  public static void Click(int x, int y) {
    SetCursorPos(x, y);
    System.Threading.Thread.Sleep(150);
    mouse_event(0x0002, 0, 0, 0, UIntPtr.Zero);
    mouse_event(0x0004, 0, 0, 0, UIntPtr.Zero);
  }
  public static void TapKey(ushort vk) {
    KeyDown(vk); KeyUp(vk);
  }
  public static void KeyDown(ushort vk) {
    INPUT[] ins = new INPUT[1];
    ins[0].type = 1;
    ins[0].u.ki.vk = vk;
    ins[0].u.ki.scan = (ushort)MapVirtualKey(vk, 0);
    ins[0].u.ki.flags = 0;
    SendInput(1, ins, Marshal.SizeOf(typeof(INPUT)));
    System.Threading.Thread.Sleep(50);
  }
  public static void KeyUp(ushort vk) {
    INPUT[] ins = new INPUT[1];
    ins[0].type = 1;
    ins[0].u.ki.vk = vk;
    ins[0].u.ki.scan = (ushort)MapVirtualKey(vk, 0);
    ins[0].u.ki.flags = 2; // KEYEVENTF_KEYUP
    SendInput(1, ins, Marshal.SizeOf(typeof(INPUT)));
    System.Threading.Thread.Sleep(50);
  }
}
"@
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Screen]::PrimaryScreen | Out-Null  # ensure display available
$s = [Inj]::SetProcessDPIAware2()
$out = 'D:\notes\VitePress\rustsilk-docs'
$p = Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
if (-not $p) { Write-Host 'NO ZED'; exit 1 }
$rect = New-Object 'Inj+RECT'
[Inj]::GetWindowRect($p.MainWindowHandle, [ref]$rect) | Out-Null
Write-Host ("hwnd=" + $p.MainWindowHandle + " rect=" + $rect.Left + "," + $rect.Top + "," + $rect.Right + "," + $rect.Bottom)

function Snap([string]$tag) {
  $r = New-Object 'Inj+RECT'
  [Inj]::GetWindowRect($p.MainWindowHandle, [ref]$r) | Out-Null
  $w = $r.Right - $r.Left; $h = $r.Bottom - $r.Top
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [Inj]::PrintWindow($p.MainWindowHandle, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save("D:\notes\VitePress\rustsilk-docs\_diag_$tag.png")
  $g.Dispose(); $bmp.Dispose()
  Write-Host "snap $tag"
}

# step 1: click "Stay in Restricted Mode" button (window coords ~ 726,412)
[Inj]::Click($rect.Left + 726, $rect.Top + 412)
Start-Sleep -Milliseconds 900
$fg = [Inj]::GetForegroundWindow()
Write-Host ("foreground after click: " + $fg + " (zed: " + $p.MainWindowHandle + ")")
Snap 'afterclick'

# step 2: if dialog gone, test SendInput key: open command palette ctrl-shift-p
[Inj]::KeyDown(0x11); [Inj]::KeyDown(0x10); [Inj]::TapKey(0x50); [Inj]::KeyUp(0x10); [Inj]::KeyUp(0x11)
Start-Sleep -Milliseconds 1300
Snap 'palette'
