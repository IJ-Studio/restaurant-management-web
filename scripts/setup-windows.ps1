# ---------------------------------------------------------------------------
# Instalacion completa de El Quijote (front + back) en Windows.
#
# Uso (PowerShell, no hace falta ser administrador):
#   irm https://raw.githubusercontent.com/IJ-Studio/restaurant-management-web/claude/tender-lamport-pabgb9/scripts/setup-windows.ps1 | iex
#
# Que hace:
#   1. Instala Git y Node.js LTS (con winget) si faltan, y pnpm.
#   2. Clona (o actualiza) el back y el front en C:\QUIJOTE.
#   3. Pregunta las claves y crea los .env de ambos proyectos (no sobrescribe
#      los que ya existan, salvo que se confirme).
#   4. Instala dependencias y crea C:\QUIJOTE\iniciar.cmd e iniciar-dev.cmd.
#
# Se puede volver a ejecutar sin problema: solo hace lo que falte.
# ---------------------------------------------------------------------------

$ErrorActionPreference = "Stop"

$Root       = "C:\QUIJOTE"
$FrontRepo  = "https://github.com/IJ-Studio/restaurant-management-web.git"
$FrontDir   = Join-Path $Root "restaurant-management-web"
$FrontBranch = "claude/tender-lamport-pabgb9"
$BackRepo   = "https://github.com/IJ-Studio/restaurant-management-api.git"
$BackDir    = Join-Path $Root "restaurant-management-api"

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Ok($text)   { Write-Host "    $text" -ForegroundColor Green }
function Warn($text) { Write-Host "    $text" -ForegroundColor Yellow }

function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

function Has-Command($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Run($exe, [string[]]$arguments) {
  & $exe @arguments
  if ($LASTEXITCODE -ne 0) { throw "Fallo: $exe $($arguments -join ' ')" }
}

function Ask($label, $default) {
  if ($default) {
    $value = Read-Host "    $label [$default]"
    if ([string]::IsNullOrWhiteSpace($value)) { return $default }
    return $value.Trim()
  }
  do { $value = Read-Host "    $label" } while ([string]::IsNullOrWhiteSpace($value))
  return $value.Trim()
}

# UTF-8 sin BOM: con BOM, dotenv leeria mal la primera variable.
function Write-EnvFile($path, [string[]]$lines) {
  $encoding = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($path, (($lines -join "`r`n") + "`r`n"), $encoding)
}

function Should-Write($path) {
  if (-not (Test-Path $path)) { return $true }
  $answer = Read-Host "    $path ya existe. Sobrescribir? (s/N)"
  return $answer -match '^[sSyY]'
}

# --- 1. Herramientas -------------------------------------------------------
Step "Revisando herramientas"

if (-not (Has-Command "winget") -and (-not (Has-Command "git") -or -not (Has-Command "node"))) {
  throw "No se encontro winget. Instala a mano Git (git-scm.com) y Node.js LTS (nodejs.org) y vuelve a ejecutar."
}

if (-not (Has-Command "git")) {
  Warn "Instalando Git..."
  Run "winget" @("install", "--id", "Git.Git", "-e", "--silent", "--accept-package-agreements", "--accept-source-agreements")
  Refresh-Path
}
Ok "Git: $(git --version)"

$nodeOk = $false
if (Has-Command "node") {
  $major = [int]((node -v).TrimStart("v").Split(".")[0])
  $nodeOk = $major -ge 20
  if (-not $nodeOk) { Warn "Node $(node -v) es muy viejo (Next 16 pide 20 o mayor)." }
}
if (-not $nodeOk) {
  Warn "Instalando Node.js LTS..."
  Run "winget" @("install", "--id", "OpenJS.NodeJS.LTS", "-e", "--silent", "--accept-package-agreements", "--accept-source-agreements")
  Refresh-Path
}
Ok "Node: $(node -v)"

if (-not (Has-Command "pnpm.cmd")) {
  Warn "Instalando pnpm..."
  Run "npm.cmd" @("install", "-g", "pnpm@10")
  Refresh-Path
}
Ok "pnpm: $(pnpm.cmd -v)"

# Permite usar "pnpm" desde PowerShell despues (solo para este usuario).
try { Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force } catch { }

# --- 2. Codigo -------------------------------------------------------------
Step "Descargando el codigo en $Root"
New-Item -ItemType Directory -Force -Path $Root | Out-Null

if (Test-Path (Join-Path $BackDir ".git")) {
  Ok "Back ya existe, actualizando..."
  Run "git" @("-C", $BackDir, "pull", "--ff-only")
} else {
  Run "git" @("clone", $BackRepo, $BackDir)
}

if (Test-Path (Join-Path $FrontDir ".git")) {
  Ok "Front ya existe, actualizando..."
  Run "git" @("-C", $FrontDir, "fetch", "origin", $FrontBranch)
  Run "git" @("-C", $FrontDir, "checkout", $FrontBranch)
  Run "git" @("-C", $FrontDir, "pull", "--ff-only", "origin", $FrontBranch)
} else {
  Run "git" @("clone", "--branch", $FrontBranch, $FrontRepo, $FrontDir)
}

# --- 3. Variables de entorno -----------------------------------------------
$backEnv = Join-Path $BackDir ".env"
$frontEnv = Join-Path $FrontDir ".env.local"
$writeBack = Should-Write $backEnv
$writeFront = Should-Write $frontEnv

if ($writeBack -or $writeFront) {
  Step "Configuracion (Enter = usar el valor entre corchetes)"
  Write-Host "    Los datos de Supabase estan en: Supabase > Project Settings > Database / API." -ForegroundColor DarkGray

  $databaseUrl = Ask "DATABASE_URL (cadena de conexion de Postgres/Supabase)" $null
  $databaseSsl = Ask "La base de datos usa SSL? (true/false)" "true"
  $supabaseUrl = Ask "SUPABASE_URL (https://xxxx.supabase.co)" $null

  # Mismo secreto en front y back: el back firma la sesion y el front la verifica.
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $randomSecret = ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
  $jwtSecret = Ask "JWT_SECRET (el mismo de tu equipo; Enter genera uno nuevo)" $randomSecret

  if ($writeBack) {
    $serviceRole = Ask "SUPABASE_SERVICE_ROLE_KEY (clave service_role)" $null
    $stripeSecret = Ask "STRIPE_SECRET_KEY (prueba)" "sk_test_placeholder"
    $facturapi = Ask "FACTURAPI_TEST_KEY (prueba)" "sk_test_placeholder"
    Write-EnvFile $backEnv @(
      "PORT=10000",
      "DATABASE_URL=$databaseUrl",
      "DATABASE_SSL=$databaseSsl",
      "SUPABASE_URL=$supabaseUrl",
      "SUPABASE_SERVICE_ROLE_KEY=$serviceRole",
      "JWT_SECRET=$jwtSecret",
      "JWT_ACCESS_TOKEN_TTL=3600",
      "STRIPE_SECRET_KEY=$stripeSecret",
      "FACTURAPI_TEST_KEY=$facturapi"
    )
    Ok "Creado $backEnv"
  }

  if ($writeFront) {
    $anonKey = Ask "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (clave anon/publishable)" $null
    $stripePublic = Ask "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (prueba)" "pk_test_placeholder"
    Write-EnvFile $frontEnv @(
      "NEXT_PUBLIC_API_URL=http://localhost:10000",
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dcb1tspbj",
      "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$anonKey",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublic",
      "DATABASE_URL=$databaseUrl",
      "JWT_SECRET=$jwtSecret"
    )
    Ok "Creado $frontEnv"
  }
} else {
  Ok "Se conservan los .env existentes."
}

# --- 4. Dependencias -------------------------------------------------------
Step "Instalando dependencias del back (puede tardar)"
Push-Location $BackDir
try { Run "pnpm.cmd" @("install") } finally { Pop-Location }

Step "Instalando dependencias del front (puede tardar)"
Push-Location $FrontDir
try { Run "pnpm.cmd" @("install") } finally { Pop-Location }

# --- 5. Accesos para arrancar ----------------------------------------------
Step "Creando accesos para arrancar"

# Modo produccion: con PWA (instalable y sin conexion).
$iniciar = @"
@echo off
echo Arrancando El Quijote (modo produccion, con PWA)...
start "QUIJOTE - BACK" cmd /k "cd /d $BackDir && pnpm start:dev"
start "QUIJOTE - FRONT" cmd /k "cd /d $FrontDir && pnpm build && (start http://localhost:3000) && pnpm start"
echo Se abrieron dos ventanas. El navegador se abre cuando termine el build del front.
"@

# Modo desarrollo: recarga al guardar, sin PWA.
$iniciarDev = @"
@echo off
echo Arrancando El Quijote (modo desarrollo)...
start "QUIJOTE - BACK" cmd /k "cd /d $BackDir && pnpm start:dev"
start "QUIJOTE - FRONT" cmd /k "cd /d $FrontDir && pnpm dev"
timeout /t 10 >nul
start http://localhost:3000
"@

Set-Content -Path (Join-Path $Root "iniciar.cmd") -Value $iniciar -Encoding ASCII
Set-Content -Path (Join-Path $Root "iniciar-dev.cmd") -Value $iniciarDev -Encoding ASCII
Ok "Creado $Root\iniciar.cmd      (con PWA)"
Ok "Creado $Root\iniciar-dev.cmd  (desarrollo)"

Write-Host ""
Write-Host "Listo. Para arrancar todo, haz doble clic en C:\QUIJOTE\iniciar.cmd" -ForegroundColor Green
Write-Host "Si ya tenias El Quijote abierto en Chrome: DevTools > Application > Storage > Clear site data." -ForegroundColor DarkGray
