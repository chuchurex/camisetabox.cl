#!/bin/bash

# ============================================================================
# Script para desarrollo local con Stripe webhooks
# ============================================================================

echo "🚀 Iniciando desarrollo con Stripe..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar si ya está logueado en Stripe
if ! stripe --version &> /dev/null; then
  echo -e "${YELLOW}⚠️  Stripe CLI no encontrado${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Stripe CLI instalado${NC}"
echo ""

# Mensaje de instrucciones
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 INSTRUCCIONES:${NC}"
echo ""
echo "1. En ESTA terminal ejecutaremos Stripe webhook listener"
echo "2. Copia el webhook secret (whsec_...) que aparecerá"
echo "3. Actualiza tu .env con ese secret"
echo "4. En OTRA terminal ejecuta: npm run dev"
echo "5. Abre http://localhost:4321 y prueba un pago"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar login
echo "Verificando login en Stripe..."
if ! stripe config --list &> /dev/null; then
  echo -e "${YELLOW}⚠️  Necesitas hacer login en Stripe CLI${NC}"
  echo ""
  echo "Ejecuta: stripe login"
  echo "Se abrirá tu navegador para autorizar"
  echo ""
  exit 1
fi

echo -e "${GREEN}✅ Ya estás logueado en Stripe${NC}"
echo ""

# Iniciar listener
echo -e "${GREEN}🎧 Iniciando webhook listener...${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Copia el 'webhook signing secret' que aparece abajo${NC}"
echo -e "${YELLOW}   y actualiza STRIPE_WEBHOOK_SECRET en tu archivo .env${NC}"
echo ""

stripe listen --forward-to localhost:4321/api/webhook
