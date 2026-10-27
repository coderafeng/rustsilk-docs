$ErrorActionPreference = 'Continue'
$log = 'D:\notes\VitePress\rustsilk-docs\_zed_capture.log'
function Log([string]$m) { Add-Content -Path $log -Value ((Get-Date -Format 'HH:mm:ss') + ' ' + $m) }
Log 'script start'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int n);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern uint SendInput(uint n, INPUT[] inputs, int cbSize);
  [DllImport("user32.dll")] public static extern uint MapVirtualKey(uint vk, uint mapType);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public INPUTUNION u; }
  [StructLayout(LayoutKind.Explicit)] public struct INPUTUNION {
    [FieldOffset(0)] public KEYBDINPUT ki;
    [FieldOffset(0)] public MOUSEINPUT mi;
  }
  [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public ushort vk; public ushort scan; public uint flags; public uint time; public UIntPtr extra; }
  [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int dx; public int dy; public uint mouseData; public uint flags; public uint time; public UIntPtr extra; }
  public static void Click(int x, int y) {
    SetCursorPos(x, y);
    System.Threading.Thread.Sleep(150);
    INPUT[] ins = new INPUT[2];
    ins[0].type = 0; ins[0].u.mi.flags = 0x0002; // LEFTDOWN
    ins[1].type = 0; ins[1].u.mi.flags = 0x0004; // LEFTUP
    SendInput(2, ins, Marshal.SizeOf(typeof(INPUT)));
  }
  public static void Down(ushort vk) {
    INPUT[] ins = new INPUT[1];
    ins[0].type = 1; ins[0].u.ki.vk = vk; ins[0].u.ki.scan = (ushort)MapVirtualKey(vk, 0); ins[0].u.ki.flags = 0;
    SendInput(1, ins, Marshal.SizeOf(typeof(INPUT)));
    System.Threading.Thread.Sleep(50);
  }
  public static void Up(ushort vk) {
    INPUT[] ins = new INPUT[1];
    ins[0].type = 1; ins[0].u.ki.vk = vk; ins[0].u.ki.scan = (ushort)MapVirtualKey(vk, 0); ins[0].u.ki.flags = 2;
    SendInput(1, ins, Marshal.SizeOf(typeof(INPUT)));
    System.Threading.Thread.Sleep(50);
  }
  public static void Tap(ushort vk) { Down(vk); Up(vk); }
}
"@
[Win32]::SetProcessDPIAware() | Out-Null

$outDir = 'D:\notes\VitePress\rustsilk-docs\md\tools\Zed\Zed.assets'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$ESC = 27; $ENTER = 13; $CTRL = 17; $SHIFT = 16; $ALT = 18; $VK_P = 80; $VK_A = 65; $VK_S = 83; $COMMA = 188

function Find-ZedWindow {
  Get-Process -Name Zed -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Sort-Object StartTime -Descending | Select-Object -First 1
}
function Get-ZedRect {
  $p = Find-ZedWindow
  if (-not $p) { return $null }
  $rect = [Win32+RECT]::new()
  [Win32]::GetWindowRect($p.MainWindowHandle, [ref]$rect) | Out-Null
  return $rect
}
function Activate-Zed {
  $p = Find-ZedWindow
  if (-not $p) { return }
  $rect = Get-ZedRect
  [Win32]::Click(($rect.Left + [int](($rect.Right - $rect.Left) / 2)), ($rect.Top + 14)) | Out-Null
  Start-Sleep -Milliseconds 600
}
function Combo([int[]]$vks) { foreach ($vk in $vks) { [Win32]::Down([ushort]$vk) }; Start-Sleep -Milliseconds 80; for ($i = $vks.Count - 1; $i -ge 0; $i--) { [Win32]::Up([ushort]$vks[$i]) } }
function Type-Text([string]$s) {
  foreach ($c in $s.ToCharArray()) {
    $scan = [Win32]::MapVirtualKey([uint32][char]$c.ToUpper(), 0)  # vk via map? fallback below
    $vk = [int][char]$c
    if ($c -ge 'a' -and $c -le 'z') { $vk = [int][char]$c - 32; [Win32]::Down($SHIFT); [Win32]::Tap([ushort]$vk); [Win32]::Up($SHIFT) }
    elseif ($c -ge 'A' -and $c -le 'Z') { [Win32]::Down($SHIFT); [Win32]::Tap([ushort]$vk); [Win32]::Up($SHIFT) }
    elseif ($c -eq ' ') { [Win32]::Tap(32) }
    elseif ($c -eq ':') { [Win32]::Down($SHIFT); [Win32]::Tap(186); [Win32]::Up($SHIFT) }
    elseif ($c -eq '-') { [Win32]::Tap(189) }
    Start-Sleep -Milliseconds 50
  }
}
function Capture([string]$name) {
  Activate-Zed
  $p = Find-ZedWindow
  if (-not $p) { Log "NO ZED WINDOW for $name"; return }
  $rect = Get-ZedRect
  $w = $rect.Right - $rect.Left; $h = $rect.Bottom - $rect.Top
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $hdc = $g.GetHdc()
  [Win32]::PrintWindow($p.MainWindowHandle, $hdc, 2) | Out-Null
  $g.ReleaseHdc($hdc)
  $bmp.Save("$outDir\$name.png", [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
  Log "SAVED $name.png ($w x $h)"
}

# kill leftovers, relaunch
Get-Process -Name Zed -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Start-Process -FilePath 'C:\app\aaa\zed\one\Zed\bin\Zed.exe' -ArgumentList '-n', 'D:\notes\VitePress\rustsilk-docs'
Log 'launched zed, waiting...'
Start-Sleep -Seconds 15
Log ("foreground: " + [Win32]::GetForegroundWindow())

# dismiss trust dialog: Stay in Restricted Mode (ctrl-alt-shift-s)
Activate-Zed
Combo @($CTRL, $ALT, $SHIFT, $VK_S)
Start-Sleep -Milliseconds 900
Capture 'zed-editor-main'

# command palette
Activate-Zed; Combo @($CTRL, $SHIFT, $VK_P); Start-Sleep -Milliseconds 1300
Capture 'zed-command-palette'
Activate-Zed; [Win32]::Tap($ESC)

# settings split
Activate-Zed; Combo @($CTRL, $COMMA); Start-Sleep -Milliseconds 1700
Capture 'zed-settings'
Activate-Zed; [Win32]::Tap($ESC); Start-Sleep -Milliseconds 400

# terminal via palette
Activate-Zed; Combo @($CTRL, $SHIFT, $VK_P); Start-Sleep -Milliseconds 900
Type-Text 'terminal: new'; Start-Sleep -Milliseconds 700
[Win32]::Tap($ENTER); Start-Sleep -Milliseconds 2600
Capture 'zed-terminal'

# git panel via palette
Activate-Zed; Combo @($CTRL, $SHIFT, $VK_P); Start-Sleep -Milliseconds 900
Type-Text 'git panel'; Start-Sleep -Milliseconds 700
[Win32]::Tap($ENTER); Start-Sleep -Milliseconds 2000
Capture 'zed-git-panel'
Activate-Zed; [Win32]::Tap($ESC)

# agent panel
Activate-Zed; Combo @($CTRL, $SHIFT, $VK_A); Start-Sleep -Milliseconds 3200
Capture 'zed-agent-panel'

Log 'ALL DONE'
