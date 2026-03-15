# 🧬 Master Intelligence: Cumulative Global Patterns

This document is the **Permanent Knowledge Asset** of the Antigravity Agent System. It captures architectural decisions, solved edge cases, and high-performance patterns discovered across all projects.

## 🏛️ Proven Architectural Patterns
*   **Next.js 15 Auth + RLS:** Use Supabase Auth with server-side middleware to pre-validate session before reaching RSC.
*   **Stripe Idempotency:** Always include `idempotency_key` (UUID) in every payment intent creation to prevent double charges on retries.
*   **Stitch Rapid UI:** Use "Atomic Layouts" first, then refine with "Style Tokens" for 3x faster delivery.

## 🛡️ Anti-Patterns & Mistakes Avoided
*   **Client-Side Secrets:** DO NOT use environment variables with `NEXT_PUBLIC_` for anything other than public keys.
*   **Hardcoded API Schemas:** Avoid defining types locally; always sync from the Shared Global Notebook.

## 🚀 Optimization Wins
*   **Vercel Edge Streaming:** Implement PPR (Partial Prerendering) for pages with mixed static/dynamic content to hit < 500ms TTFB.

## 📈 Learning Log (Project Feed)
> [!NOTE]
> Each agent must log a "Lesson Learned" here after major milestone completion.
- [Session 2026-03-09]: Initialized Agent OS with "Staff-Level" protocols and Global Synchronization Notebook.
- [Session 2026-03-12]: Agent OS v2 — Incorporados 2 nuevos agentes (QA Testing Engineer + Documentation Engineer). Creado `global_rules.md` con OWASP Top 9 + Testing checklist Top 7, obligatorio en todos los proyectos. CTO adquiere protocolo "termino la sesion": sincroniza memoria de todos los agentes + crea nota Notion via MCP. Backend/Frontend/SRE actualizados con enforcement de global_rules.

## 🔐 Global Security Patterns (OWASP Enforcement)
*   **SQL Injection:** Siempre usar RLS en Supabase + queries parametrizadas. Nunca concatenar strings en queries.
*   **XSS:** Sanitizar inputs en FE y definir CSP headers via middleware Next.js.
*   **Broken Auth:** Rate Limiting en Supabase Edge Functions + cookies HttpOnly+Secure siempre.
*   **IDOR:** Validar ownership con `auth.uid() = user_id` en RLS policies, nunca solo en cliente.
*   **Secrets:** Variables `NEXT_PUBLIC_` solo para keys públicas. Secrets solo en servidor vía Edge Functions.

## 🧪 Global Testing Patterns
*   **Test-First on Critical Flows:** Login, Checkout y Registro deben tener tests E2E (Playwright) antes de merge.
*   **data-testid Convention:** Todos los elementos interactivos de FE llevan `data-testid` para selectores estables.
*   **k6 Load Threshold:** Ningún endpoint crítico puede superar 200ms p95 bajo 1000 RPS.
