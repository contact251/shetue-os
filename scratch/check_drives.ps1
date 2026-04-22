$drives = @("D:\", "E:\")
foreach ($drive in $drives) {
    Write-Output "Scanning $drive..."
    Get-ChildItem -Path $drive -Directory | ForEach-Object {
        try {
            $size = (Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $sizeGB = [math]::Round($size / 1GB, 2)
            if ($sizeGB -gt 1) {
                Write-Output "$($_.FullName) : $sizeGB GB"
            }
        } catch {
            # Skip errors
        }
    }
}
