# 📓 Cuaderno de Sincronización Global: Work Life OS

Este documento registra los cimientos del proyecto Work Life OS.

## 🏛️ Decisiones de Arquitectura (ADR Summary)
*   **Status del Stack:** BLOQUEADO - Next.js 15, Supabase, Stripe, Stitch.
*   **Shared Contracts:** `/types/nexus.ts` (Pendiente de definición por Backend).

## 🤝 Protocolos de Interfaz entre Agentes
1.  **UI/UX ↔ Frontend:** Definición de tokens Neo-brutalistas en `skills/designer/tokens.json`.
2.  **Backend ↔ Frontend:** Contrato de tipos para auditoría de nóminas y calendario fiscal de 221 días.
3.  **Automation ↔ Backend:** Webhooks para procesamiento de archivos PDF/JPG de nóminas.

## 🧠 Memoria de Sesiones (Chat Persistence)
*   **Hito Actual:** Estabilidad y Seguridad - Sentry SDK y MFA Backup Codes.
*   **Pendientes Críticos:** 
    *   **QA:** Pruebas E2E automatizadas (Playwright) para exportación PDF en entornos no locales.
    *   **Seguridad:** Implementar tabla de `user_backup_codes`, Edge Function y frontend para recuperación de MFA de emergencia.
    *   **SRE:** Añadir NEXT_PUBLIC_SENTRY_DSN e integrar con proyecto Sentry.
*   **Decisión CTO:** Priorizar estabilidad del cliente antes del parcheo agresivo; implementado Sentry y solucionados errores de tokens (Unhandled Rejections en Middleware de Supabase) junto a corrección Responsiva en el calendario.

## 🛡️ Auditoría de Sincronización (Checklist)
- [x] ¿El CTO ha definido la visión global?
- [x] ¿Protocolo de Orquestación activado?
- [x] ¿Diseño ha entregado los tokens iniciales? (Implementado en globals.css)
- [x] ¿Backend ha definido el esquema inicial?
- [x] ¿Frontend ha implementado el layout base?
- [x] ¿Estabilización de navegación móvil completada?
- [x] ¿Contenido legal y cláusulas actualizadas?
- [x] ¿Refinamiento premium de la UI del Auditor finalizado?
