# Link de Prueba para Ariel 🧪

## URL del Test
Una vez que hagas deploy, la página de prueba estará disponible en:

```
https://camisetabox.cl/test-ariel
```

## ¿Qué hace esta página?

Esta página de prueba genera un link de pago de Mercado Pago de **$1 peso** para que Ariel pueda probar todo el flujo de compra sin gastar dinero real.

## Funcionalidades del Test

1. **Genera un link de pago**: Al hacer clic en "Generar Link de Pago", crea una preferencia de pago en Mercado Pago
2. **Redirige a Mercado Pago**: El link generado lleva directamente al checkout de Mercado Pago
3. **Monto de prueba**: Solo cobra $1 peso chileno
4. **Datos pre-llenados**:
   - Nombre: Ariel
   - Email: ariel@test.com
   - Teléfono: +56912345678

## Proceso de Prueba

1. Abre la URL: `https://camisetabox.cl/test-ariel`
2. Haz clic en el botón "🚀 Generar Link de Pago"
3. Espera a que se genere el link (aparecerá un botón verde)
4. Haz clic en "Ir a Mercado Pago →"
5. Completa el proceso de pago con los métodos de prueba de Mercado Pago

## Importante

- Este link usa el API de producción de Mercado Pago
- El webhook guardará el pedido en Supabase marcado como `is_test: true`
- Los datos del pedido incluirán el metadata de prueba

## Para hacer deploy

```bash
# Si estás en local, haz push a GitHub
git add .
git commit -m "Add test payment page for Ariel"
git push

# Vercel hará el deploy automáticamente
```

## Verificar el pedido

Después de que Ariel complete el pago, puedes verificar el pedido en:
1. Panel de admin: `https://camisetabox.cl/admin`
2. Dashboard de Mercado Pago
3. Tabla `orders` en Supabase

Los pedidos de prueba tendrán el `external_reference` que empieza con `test-`

---

**Nota**: Si quieres cambiar el nombre o email de prueba, edita los valores en el archivo:
`src/pages/test-ariel.astro` (líneas 77-81)
