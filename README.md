<div align="center">
  <img src="https://raw.githubusercontent.com/angel/Work-life-os-main/main/public/icon.svg" width="128" height="128" alt="Work Life OS Logo" />
  <h1>WORK LIFE OS</h1>
  <p><strong>El Sistema Definitivo para Freelancers y Profesionales Modernos</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Powered%20by-Olianlabs-FF00FF?style=for-the-badge&logoColor=white" />
    <img src="https://img.shields.io/badge/Stack-Next.js%2015%20|%20Supabase%20|%20Stripe-00FFFF?style=for-the-badge&logoColor=black" />
  </p>
</div>

---

## 🍌 ¿Qué es Work Life OS?

Work Life OS no es solo una hoja de cálculo; es tu centro de mando laboral. Diseñado con una **estética Neo-Brutalista**, combina potencia analítica con una interfaz que no te deja indiferente.

### 🚀 Características Principales

*   **⚡ Control de Jornada Inteligente:** Mantén tus días trabajados bajo control, respetando el límite legal de 221 días.
*   **🧠 Auditoría de Nóminas con IA:** Sube tus nóminas o recibos y deja que nuestro motor de IA (vía Groq/Gemini) analice tus ingresos y detecte discrepancias.
*   **📊 Dashboards de Alto Impacto:** Visualiza tus ingresos mensuales, promedios diarios y métricas de salud laboral con gráficos interactivos de Recharts.
*   **☕ Soporte Comunitario:** Sistema integrado de propinas vía Stripe con mensajes personalizados para el creador.
*   **🛡️ Seguridad Nivel Enterprise:** Autenticación por MFA, códigos de recuperación y protección contra brechas vía Supabase Auth.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, Next.js 15 (App Router)
- **Estilos:** Tailwind CSS (Custom Theme), Framer Motion
- **Backend/DB:** Supabase (PostgreSQL, RLS Políticas de Seguridad)
- **Pagos:** Stripe (Checkout, Webhooks)
- **IA:** Groq SDK (Llama 3.2 Vision)
- **Email:** Resend API

## 🚦 Primeros Pasos

### Requisitos Previos

- Node.js (v18+)
- Cuenta de Supabase
- API Key de Stripe y Resend

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/angel/Work-life-os-main.git
    cd Work-life-os-main
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura el entorno:**
    Crea un archivo `.env` en la raíz (usa `.env.local` para desarrollo) con las siguientes variables:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    STRIPE_SECRET_KEY=...
    STRIPE_WEBHOOK_SECRET=...
    RESEND_API_KEY=...
    GROQ_API_KEY=...
    ```

4.  **Inicia el modo desarrollo:**
    ```bash
    npm run dev
    ```

## 📜 Soporte y Legal

Este proyecto es una herramienta para profesionales independientes. Todas las contribuciones via "Buy me a Coffee" son voluntarias y ayudan a mantener el servicio libre de publicidad.

Consulta los [Términos y Condiciones](app/legal/terms/page.tsx) para más información sobre reembolsos y responsabilidad legal.

---

<div align="center">
  <p>Creado con ❤️ por <strong>Olianlabs</strong></p>
</div>
