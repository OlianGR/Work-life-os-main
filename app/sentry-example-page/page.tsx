"use client";

import { motion } from "framer-motion";

export default function SentryExamplePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <header className="border-b-[4px] border-black pb-6 gap-4">
        <div className="inline-block bg-[var(--color-neon-fuchsia)] text-white border-[3px] border-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-brutal-sm">
          Testing
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter uppercase leading-none">
          Sentry Test
        </h1>
        <p className="text-gray-600 mt-4 font-mono text-sm font-bold uppercase tracking-wide">
          Haz clic en el botón de abajo para forzar un error y comprobar si llega a tu panel de Sentry.
        </p>
      </header>
      
      <button
        type="button"
        className="brutal-btn p-5 bg-[var(--color-citrus-yellow)] text-black border-[3px] border-black rounded-2xl font-bold font-mono text-xl shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        onClick={() => {
          throw new Error("💥 Boom! Sentry Error Test in Work Life OS!");
        }}
      >
        Lanzar Error de Prueba
      </button>
    </motion.div>
  );
}
