# Architecture Overview - Work Life OS

## 🏗️ Technical Stack
- **Framework:** Next.js 15 (App Router)
- **State Management:** Zustand (see `store/useStore.ts`)
- **Database & Auth:** Supabase
- **Payments:** Stripe Lifecycle (Checkout -> Webhook -> DB Update)
- **Styling:** Neo-Brutalism via Tailwind CSS

## 📊 Business Logic (Centralized)
To ensure consistency between the Dashboard, PDFs, and Audit views, all labor calculations are centralized in `lib/calculations.ts`.

### Key Rules:
1. **Worked Days:** Any log of type `worked` or marked as `isWorkedHoliday`.
2. **Income Calculation:**
   - `Daily Income = Base Rate + Position Plus + (Bonus if Sunday/Holiday and Rate > 0)`
   - **Standard Bonus:** 20€ flat rate.
3. **Legal Limit:** Standard for 40h is 221 days, for 35h is 225 days.

## 🔒 Security
- **MFA:** Required for sensitive operations. Handled in `AuthWrapper.tsx` and `AuthForm.tsx`.
- **Validation:** Server-side validation on Stripe webhooks and Supabase RLS policies.

## 🧪 Testing
- **Unit/Integration:** Vitest & React Testing Library (see `tests/*.test.tsx`).
- **E2E:** Playwright (configured in `playwright.config.ts`).

## 📁 Key Directories
- `app/`: Routing and Page logic.
- `components/`: UI components (Brutalist style).
- `lib/`: Utility functions and centralized logic.
- `store/`: Global state management.
