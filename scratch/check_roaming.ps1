$path = "C:\Users\shetuemultibiz\AppData\Roaming"
Get-ChildItem -Path $path -Directory | ForEach-Object {
    $size = (Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $sizeGB = [math]::Round($size / 1GB, 2)
    if ($sizeGB -gt 0.5) {
        Write-Output "$($_.Name) : $sizeGB GB"
    }
} | Sort-Object { [double]($_.Split(":")[1].Trim().Split(" ")[0]) } -Descending
