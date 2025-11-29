# Monitor API Logs Script
param(
    [string]$Filter = "",
    [int]$Lines = 50
)

$sshKey = "D:\INTERN\MyFirstApp\id_ed25519.pem"
$sshUser = "jay"
$sshHost = "139.59.52.58"

Write-Host "=== API Log Monitor ===" -ForegroundColor Cyan
Write-Host "Monitoring server: $sshHost" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop..." -ForegroundColor Yellow
Write-Host ""

if ($Filter) {
    Write-Host "Filtering logs for: $Filter" -ForegroundColor Green
    ssh -i $sshKey "$sshUser@$sshHost" "sudo tail -f /var/log/nginx/access.log | grep --line-buffered -E '$Filter'"
} else {
    Write-Host "Showing all API requests" -ForegroundColor Green
    ssh -i $sshKey "$sshUser@$sshHost" "sudo tail -f /var/log/nginx/access.log | grep --line-buffered -E 'POST|GET|PUT|DELETE|PATCH'"
}
