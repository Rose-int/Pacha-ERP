# ==========================================================================
# Pachamama ERP - Script de Despliegue en Google Cloud (PowerShell)
# ==========================================================================

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Pachamama ERP - Despliegue en Google Cloud           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Selecciona la opción de despliegue en Google Cloud:"
Write-Host "1) Firebase Hosting (Recomendado - Dominio gratis, SSL y CDN)" -ForegroundColor Green
Write-Host "2) Google Cloud Storage (Bucket de sitio web estático)" -ForegroundColor Yellow
Write-Host "3) Salir"
Write-Host ""

$choice = Read-Host "Elige una opción (1-3)"

if ($choice -eq "1") {
    Write-Host "`nIniciando despliegue con Firebase Hosting..." -ForegroundColor Green
    Write-Host "1. Autenticándose en Firebase..."
    npx --package=firebase-tools firebase login --no-localhost
    
    Write-Host "`n2. Inicializando proyecto..."
    Write-Host "Se detectó 'firebase.json' en el proyecto."
    npx --package=firebase-tools firebase init hosting
    
    Write-Host "`n3. Desplegando a Firebase Hosting..." -ForegroundColor Green
    npx --package=firebase-tools firebase deploy
    
} elseif ($choice -eq "2") {
    Write-Host "`nIniciando despliegue con Google Cloud Storage..." -ForegroundColor Yellow
    Write-Host "1. Autenticándose en Google Cloud..."
    gcloud auth login
    
    $projectId = Read-Host "Ingresa tu ID de Proyecto de Google Cloud (GCP Project ID)"
    if ([string]::IsNullOrEmpty($projectId)) {
        Write-Host "ID de proyecto no válido. Saliendo..." -ForegroundColor Red
        exit
    }
    
    gcloud config set project $projectId
    
    $bucketName = Read-Host "Ingresa el nombre del Bucket a crear (ej. pachamama-erp)"
    if ([string]::IsNullOrEmpty($bucketName)) {
        Write-Host "Nombre de bucket no válido. Saliendo..." -ForegroundColor Red
        exit
    }
    
    $bucketUri = "gs://$bucketName"
    
    Write-Host "`n2. Creando el bucket $bucketUri..." -ForegroundColor Green
    gcloud storage buckets create $bucketUri --location=us-central1
    
    Write-Host "`n3. Configurando el bucket como sitio web estático..."
    gcloud storage buckets update $bucketUri --web-index-page=index.html
    
    Write-Host "`n4. Configurando accesibilidad pública para lectura..."
    gcloud storage buckets add-iam-policy-binding $bucketUri --member=allUsers --role=roles/storage.objectViewer
    
    Write-Host "`n5. Subiendo archivos del ERP a Cloud Storage..." -ForegroundColor Green
    gcloud storage cp index.html "$bucketUri/index.html"
    gcloud storage cp -r css "$bucketUri/"
    gcloud storage cp -r js "$bucketUri/"
    
    Write-Host "`n¡Despliegue completo!" -ForegroundColor Green
    Write-Host "Tu sitio está disponible públicamente en:" -ForegroundColor Green
    Write-Host "https://storage.googleapis.com/$bucketName/index.html" -ForegroundColor Cyan
    
} else {
    Write-Host "Saliendo del asistente de despliegue."
}
