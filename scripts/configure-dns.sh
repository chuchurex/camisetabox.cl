#!/bin/bash

# Load environment variables
source .env

# Cloudflare API endpoint
CF_API="https://api.cloudflare.com/client/v4"

echo "Configurando DNS para camisetabox.cl en Cloudflare..."
echo ""

# 1. Verificar registros DNS actuales
echo "📋 Registros DNS actuales:"
curl -s -X GET "${CF_API}/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" | jq -r '.result[] | "\(.type) \(.name) -> \(.content)"'

echo ""
echo "----------------------------------------"
echo ""

# 2. Crear/actualizar registro A para @ (root domain)
echo "🔧 Configurando registro A para camisetabox.cl..."

# Buscar si ya existe el registro
EXISTING_A=$(curl -s -X GET "${CF_API}/zones/${CF_ZONE_ID}/dns_records?type=A&name=camisetabox.cl" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" | jq -r '.result[0].id // empty')

if [ -n "$EXISTING_A" ]; then
  echo "Actualizando registro A existente..."
  curl -s -X PUT "${CF_API}/zones/${CF_ZONE_ID}/dns_records/${EXISTING_A}" \
    -H "X-Auth-Email: ${CF_EMAIL}" \
    -H "X-Auth-Key: ${CF_API_KEY}" \
    -H "Content-Type: application/json" \
    --data '{
      "type": "A",
      "name": "camisetabox.cl",
      "content": "76.76.21.21",
      "ttl": 1,
      "proxied": false
    }' | jq -r '.success'
else
  echo "Creando nuevo registro A..."
  curl -s -X POST "${CF_API}/zones/${CF_ZONE_ID}/dns_records" \
    -H "X-Auth-Email: ${CF_EMAIL}" \
    -H "X-Auth-Key: ${CF_API_KEY}" \
    -H "Content-Type: application/json" \
    --data '{
      "type": "A",
      "name": "camisetabox.cl",
      "content": "76.76.21.21",
      "ttl": 1,
      "proxied": false
    }' | jq -r '.success'
fi

echo ""

# 3. Crear/actualizar registro CNAME para www
echo "🔧 Configurando registro CNAME para www.camisetabox.cl..."

EXISTING_CNAME=$(curl -s -X GET "${CF_API}/zones/${CF_ZONE_ID}/dns_records?type=CNAME&name=www.camisetabox.cl" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" | jq -r '.result[0].id // empty')

if [ -n "$EXISTING_CNAME" ]; then
  echo "Actualizando registro CNAME existente..."
  curl -s -X PUT "${CF_API}/zones/${CF_ZONE_ID}/dns_records/${EXISTING_CNAME}" \
    -H "X-Auth-Email: ${CF_EMAIL}" \
    -H "X-Auth-Key: ${CF_API_KEY}" \
    -H "Content-Type: application/json" \
    --data '{
      "type": "CNAME",
      "name": "www",
      "content": "cname.vercel-dns.com",
      "ttl": 1,
      "proxied": false
    }' | jq -r '.success'
else
  echo "Creando nuevo registro CNAME..."
  curl -s -X POST "${CF_API}/zones/${CF_ZONE_ID}/dns_records" \
    -H "X-Auth-Email: ${CF_EMAIL}" \
    -H "X-Auth-Key: ${CF_API_KEY}" \
    -H "Content-Type: application/json" \
    --data '{
      "type": "CNAME",
      "name": "www",
      "content": "cname.vercel-dns.com",
      "ttl": 1,
      "proxied": false
    }' | jq -r '.success'
fi

echo ""
echo "✅ Configuración DNS completada!"
echo ""
echo "📝 Siguiente paso: Agregar los dominios en Vercel"
echo "   1. Ve a: https://vercel.com/chuchurexs-projects/camisetabox-cl/settings/domains"
echo "   2. Agrega: camisetabox.cl"
echo "   3. Agrega: www.camisetabox.cl"
echo ""
echo "⏱️  La propagación DNS puede tomar entre 5-30 minutos"
