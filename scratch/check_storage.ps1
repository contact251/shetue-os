$paths = @("C:\Program Files", "C:\Program Files (x86)", "C:\Program Files\WindowsApps", "C:\ProgramData", "C:\Users\shetuemultibiz\AppData\Local", "C:\Users\shetuemultibiz\AppData\Roaming")
foreach ($path in $paths) {
    if (Test-Path $path) {
        try {
            $size = (Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $sizeGB = [math]::Round($size / 1GB, 2)
            Write-Output "$path : $sizeGB GB"
        } catch {
            Write-Output "Could not access $path"
        }
    } else {
        Write-Output "$path does not exist"
    }
}
