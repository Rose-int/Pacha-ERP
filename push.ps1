param (
    [string]$Mensaje = "update: mejoras y actualizaciones en el proyecto"
)

Write-Host "🚀 Guardando y subiendo cambios a GitHub..." -ForegroundColor Cyan

git add .
git commit -m $Mensaje
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ¡Cambios subidos a GitHub con éxito!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Hubo un detalle al subir. Asegúrate de tener conexión y los permisos de GitHub configurados." -ForegroundColor Yellow
}
