# 🌐 Reglas Globales de Calidad y Seguridad (Omni-Agent)

Estas reglas son de cumplimiento **obligatorio** para todos los agentes activos en Antigravity Professional Studio. Deben aplicarse y verificarse en cada fase de diseño, desarrollo y despliegue.

## ✅ Checklist de Testing (Calidad y Estabilidad)

1. **Unit Testing:** Cobertura de funciones lógicas y cálculos aislados (Jest, Vitest).
2. **Integration Testing:** Comunicación correcta entre servicios (API, DB, Cloud Services).
3. **E2E (End-to-End):** Flujos críticos (Login, Registro, Compra) validados en navegador (Playwright, Cypress).
4. **Regression Testing:** Verificación de que nuevas características no rompen funcionalidades existentes.
5. **Smoke Testing:** Pruebas rápidas de funcionalidades críticas tras despliegue.
6. **Performance/Load Testing:** Validación de latencia y throughput bajo carga (k6, Artillery).
7. **Snapshot Testing (Frontend):** Detección de regresiones visuales no deseadas.

---

## 🛡️ Checklist de Seguridad (OWASP Top 10 + Hardening)

1. **SQL Injection:** Uso obligatorio de queries parametrizadas o RLS (evitar concatenación).
2. **XSS (Cross-Site Scripting):** Sanitización de inputs y uso de CSP (Content Security Policy).
3. **CSRF:** Tokens de validación única en peticiones mutables (POST, PUT, DELETE).
4. **Broken Authentication:** Implementación de Rate Limiting y cookies `HttpOnly` + `Secure`.
5. **IDOR:** Validación de propiedad (Ownership) en cada acceso a recursos.
6. **Security Misconfiguration:** Desactivar listados de directorios y ocultar versiones de servidores/frameworks.
7. **Vulnerable Components:** Escaneo automático de dependencias (`npm audit`, `snyk`).
8. **CORS Policy:** Whitelisting estricto de dominios de confianza.
9. **Sensitive Data Exposure:** Tráfico obligatorio por HTTPS y hashing fuerte (bcrypt, argon2).

---

## 📖 Protocolo de Reporte
Cada propuesta técnica DEBE incluir una sección de **"Garantía de Calidad y Seguridad"** referenciando qué puntos de este checklist se están cubriendo.
