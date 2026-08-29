# atualizar.ps1 — Atalho para atualizar o projeto
# Duplo clique ou execute: .\atualizar.ps1

$projeto = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host "   Inventario Wi-Fi - Atalho de Atualizacao" -ForegroundColor Cyan
Write-Host "  =========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $projeto

# 1. Git pull
Write-Host "[1/3] Buscando atualizacoes no GitHub..." -ForegroundColor Yellow
$gitOut = git pull 2>&1
Write-Host "  $gitOut" -ForegroundColor Gray

# 2. npm install
Write-Host "[2/3] Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "$projeto\node_modules\@upstash\redis")) {
    npm install 2>&1 | Out-Null
    Write-Host "  Dependencias instaladas." -ForegroundColor Green
} else {
    Write-Host "  Dependencias ja ok." -ForegroundColor Green
}

# 3. Verificar dev server
$procVercel = Get-Process -Name node -ErrorAction SilentlyContinue |
    Where-Object { try { $_.CommandLine -match 'vercel|meu-projeto' } catch { $false } }

if ($procVercel) {
    Write-Host "[3/3] Dev server ja esta rodando!" -ForegroundColor Green
} else {
    Write-Host "[3/3] Iniciando servidor local (vercel dev)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "Set-Location '$projeto'; vercel dev --port 3333"
    )
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "  Pronto! Site: http://localhost:3333" -ForegroundColor Green
Write-Host "  Pressione qualquer tecla para fechar..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
