# Shetue OS - System Storage Cleanup Script
Write-Output "Starting system cleanup..."

# 1. Clean IDM Temp Data (The 59GB culprit)
$idmPath = "C:\Users\shetuemultibiz\AppData\Roaming\IDM\DwnlData"
if (Test-Path $idmPath) {
    Write-Output "Cleaning IDM Download Data: $idmPath"
    Get-ChildItem -Path $idmPath -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Output "IDM Cleanup complete."
} else {
    Write-Output "IDM Path not found."
}

# 2. Clean User Temp Folder
$userTemp = "C:\Users\shetuemultibiz\AppData\Local\Temp"
if (Test-Path $userTemp) {
    Write-Output "Cleaning User Temp folder..."
    Get-ChildItem -Path $userTemp -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Clean Windows Temp Folder
$winTemp = "C:\Windows\Temp"
if (Test-Path $winTemp) {
    Write-Output "Cleaning Windows Temp folder..."
    Get-ChildItem -Path $winTemp -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Empty Recycle Bin
Write-Output "Emptying Recycle Bin..."
Clear-RecycleBin -Confirm:$false -ErrorAction SilentlyContinue

Write-Output "Cleanup task finished. Checking new free space..."
Get-PSDrive C | Select-Object Name, @{Name="Free(GB)";Expression={[math]::Round($_.Free/1GB,2)}} | Format-List
