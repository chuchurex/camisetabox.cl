#!/bin/bash

# ============================================================================
# Script para verificar claves de producción de Stripe
# ============================================================================

echo "🔍 Verificando claves de Stripe para producción..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar que existe .env
if [ ! -f .env ]; then
  echo -e "${RED}❌ Archivo .env no encontrado${NC}"
  exit 1
fi

# Leer claves
STRIPE_SECRET=$(grep "^STRIPE_SECRET_KEY=" .env | cut -d '=' -f2)
STRIPE_PUBLIC=$(grep "^PUBLIC_STRIPE_PUBLISHABLE_KEY=" .env | cut -d '=' -f2)
STRIPE_WEBHOOK=$(grep "^STRIPE_WEBHOOK_SECRET=" .env | cut -d '=' -f2)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 VERIFICACIÓN DE CLAVES DE STRIPE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar Secret Key
echo -n "🔑 Secret Key: "
if [[ "$STRIPE_SECRET" == sk_live_* ]]; then
  echo -e "${GREEN}✅ LIVE MODE${NC} - ${STRIPE_SECRET:0:20}..."
elif [[ "$STRIPE_SECRET" == sk_test_* ]]; then
  echo -e "${YELLOW}⚠️  TEST MODE${NC} - ${STRIPE_SECRET:0:20}..."
  echo -e "   ${YELLOW}Necesitas cambiar a claves LIVE para producción${NC}"
else
  echo -e "${RED}❌ INVÁLIDA${NC}"
fi

# Verificar Public Key
echo -n "🔓 Publishable Key: "
if [[ "$STRIPE_PUBLIC" == pk_live_* ]]; then
  echo -e "${GREEN}✅ LIVE MODE${NC} - ${STRIPE_PUBLIC:0:20}..."
elif [[ "$STRIPE_PUBLIC" == pk_test_* ]]; then
  echo -e "${YELLOW}⚠️  TEST MODE${NC} - ${STRIPE_PUBLIC:0:20}..."
  echo -e "   ${YELLOW}Necesitas cambiar a claves LIVE para producción${NC}"
else
  echo -e "${RED}❌ INVÁLIDA${NC}"
fi

# Verificar Webhook Secret
echo -n "🔗 Webhook Secret: "
if [[ "$STRIPE_WEBHOOK" == whsec_* ]]; then
  echo -e "${GREEN}✅ CONFIGURADO${NC} - ${STRIPE_WEBHOOK:0:20}..."
else
  echo -e "${RED}❌ NO CONFIGURADO${NC}"
  echo -e "   ${YELLOW}Necesitas crear webhook en producción${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar coherencia
if [[ "$STRIPE_SECRET" == sk_live_* ]] && [[ "$STRIPE_PUBLIC" == pk_live_* ]]; then
  echo -e "${GREEN}✅ Ambas claves en LIVE MODE - Listo para producción${NC}"
elif [[ "$STRIPE_SECRET" == sk_test_* ]] && [[ "$STRIPE_PUBLIC" == pk_test_* ]]; then
  echo -e "${YELLOW}⚠️  Ambas claves en TEST MODE - Solo para desarrollo${NC}"
else
  echo -e "${RED}❌ INCONSISTENCIA: Secret y Public no coinciden en modo${NC}"
  echo -e "${RED}   Ambas deben ser TEST o ambas LIVE${NC}"
fi

echo ""

# Estado de Stripe CLI
if command -v stripe &> /dev/null; then
  echo -e "${GREEN}✅ Stripe CLI instalado${NC}"

  # Verificar si está logueado
  if stripe config --list &> /dev/null; then
    echo -e "${GREEN}✅ Stripe CLI autenticado${NC}"
  else
    echo -e "${YELLOW}⚠️  Stripe CLI no autenticado${NC}"
    echo -e "   Ejecuta: ${BLUE}stripe login${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️  Stripe CLI no instalado (opcional para producción)${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Resumen final
if [[ "$STRIPE_SECRET" == sk_live_* ]] && [[ "$STRIPE_PUBLIC" == pk_live_* ]] && [[ "$STRIPE_WEBHOOK" == whsec_* ]]; then
  echo -e "${GREEN}🎉 TODO LISTO PARA PRODUCCIÓN${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "1. Hacer deploy a Vercel"
  echo "2. Configurar variables de entorno en Vercel"
  echo "3. Probar una compra real (con tarjeta real)"
  echo "4. Verificar que la orden llegue a Supabase"
else
  echo -e "${YELLOW}⏳ PENDIENTE: Configurar claves LIVE${NC}"
  echo ""
  echo "Pasos para obtener claves LIVE:"
  echo "1. Activa tu cuenta: ${BLUE}https://dashboard.stripe.com/settings/account${NC}"
  echo "2. Obtén claves LIVE: ${BLUE}https://dashboard.stripe.com/apikeys${NC}"
  echo "3. Configura webhook: ${BLUE}https://dashboard.stripe.com/webhooks${NC}"
  echo "4. Actualiza tu archivo .env con las nuevas claves"
  echo "5. Ejecuta este script nuevamente para verificar"
fi

echo ""
