#!/bin/bash

# ============================================================================
# Script de prueba para verificar configuración de Stripe
# ============================================================================

echo "🔍 Verificando configuración de Stripe..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar variable de entorno
check_env() {
  local var_name=$1
  local var_value=$(grep "^$var_name=" .env 2>/dev/null | cut -d '=' -f2)

  if [ -z "$var_value" ] || [ "$var_value" = "" ]; then
    echo -e "${RED}❌ $var_name no está configurado${NC}"
    return 1
  elif [[ "$var_value" == *"xxxxx"* ]] || [[ "$var_value" == *"test_xxxx"* ]]; then
    echo -e "${YELLOW}⚠️  $var_name tiene valor de ejemplo${NC}"
    return 1
  else
    echo -e "${GREEN}✅ $var_name configurado${NC}"
    return 0
  fi
}

# Verificar que existe .env
if [ ! -f .env ]; then
  echo -e "${RED}❌ Archivo .env no encontrado${NC}"
  echo "Copia .env.example a .env y completa las variables"
  exit 1
fi

echo "📝 Variables de entorno:"
echo "------------------------"

# Verificar variables de Stripe
check_env "STRIPE_SECRET_KEY"
stripe_secret=$?

check_env "PUBLIC_STRIPE_PUBLISHABLE_KEY"
stripe_public=$?

check_env "STRIPE_WEBHOOK_SECRET"
stripe_webhook=$?

echo ""

# Verificar variables de Supabase
echo "📝 Variables de Supabase:"
echo "------------------------"
check_env "PUBLIC_SUPABASE_URL"
supabase_url=$?

check_env "PUBLIC_SUPABASE_ANON_KEY"
supabase_anon=$?

check_env "SUPABASE_SERVICE_ROLE_KEY"
supabase_service=$?

echo ""

# Resumen
echo "📊 Resumen:"
echo "------------------------"

total_checks=$((stripe_secret + stripe_public + stripe_webhook + supabase_url + supabase_anon + supabase_service))

if [ $total_checks -eq 0 ]; then
  echo -e "${GREEN}✅ Todas las variables están configuradas${NC}"
  echo ""
  echo "🚀 Próximos pasos:"
  echo "1. Ejecuta: npm run dev"
  echo "2. Abre: http://localhost:4321"
  echo "3. Haz una compra de prueba con la tarjeta: 4242 4242 4242 4242"
  echo ""
  echo "📖 Para más detalles, lee: STRIPE_SETUP.md"
else
  echo -e "${YELLOW}⚠️  Faltan variables por configurar${NC}"
  echo ""
  echo "📖 Lee las instrucciones en: STRIPE_SETUP.md"
  echo ""
  echo "Pasos rápidos:"
  echo "1. Ve a: https://dashboard.stripe.com/test/apikeys"
  echo "2. Copia las claves y agrégalas al archivo .env"
  echo "3. Ejecuta nuevamente este script para verificar"
fi

echo ""

# Verificar que Stripe CLI está instalado (opcional)
if command -v stripe &> /dev/null; then
  echo -e "${GREEN}✅ Stripe CLI instalado${NC}"
  echo "   Puedes usar: stripe listen --forward-to localhost:4321/api/webhook"
else
  echo -e "${YELLOW}ℹ️  Stripe CLI no instalado (opcional)${NC}"
  echo "   Instala con: brew install stripe/stripe-cli/stripe"
fi

echo ""
