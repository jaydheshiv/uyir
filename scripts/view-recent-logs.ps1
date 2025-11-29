# View Recent API Logs Script
param(
    [string]$Endpoint = "",
    [int]$Lines = 100
)

$sshKey = "D:\INTERN\MyFirstApp\id_ed25519.pem"
$sshUser = "jay"
$sshHost = "139.59.52.58"

Write-Host "=== Recent API Logs ===" -ForegroundColor Cyan
Write-Host "Server: $sshHost" -ForegroundColor Yellow
Write-Host ""

if ($Endpoint) {
    Write-Host "Showing logs for endpoint: $Endpoint (last $Lines lines)" -ForegroundColor Green
    ssh -i $sshKey "$sshUser@$sshHost" "sudo tail -$Lines /var/log/nginx/access.log | grep -E '$Endpoint'"
} else {
    Write-Host "Showing all API requests (last $Lines lines)" -ForegroundColor Green
    ssh -i $sshKey "$sshUser@$sshHost" "sudo tail -$Lines /var/log/nginx/access.log | grep -E 'POST|GET|PUT|DELETE|PATCH' | grep -v 'phpunit'"
}
