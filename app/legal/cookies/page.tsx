'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-12 px-4"
    >
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest mb-8 hover:text-[var(--color-neon-fuchsia)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al Panel
      </Link>

      <header className="mb-12">
        <div className="inline-flex items-center gap-3 bg-[var(--color-citrus-yellow)] border-2 border-black px-4 py-2 mb-6 shadow-brutal-sm">
          <Cookie className="w-5 h-5" />
          <span className="font-black uppercase tracking-widest text-sm">Transparencia</span>
        </div>
        <h1 className="text-5xl md:text-7xl brutal-heading tracking-tighter leading-none mb-4">Política de <br />Cookies</h1>
        <p className="text-gray-600 font-mono text-sm leading-relaxed max-w-xl">
          Cómo utilizamos las pequeñas piezas de información para que tu experiencia sea segura y fluida.
        </p>
      </header>

      <div className="brutal-card bg-white p-8 md:p-12 space-y-10 border-[3px] border-black shadow-brutal">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">1. ¿Qué son las cookies?</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Las cookies son pequeños archivos de texto que se almacenan en el navegador del usuario cuando visita una página web. Permiten que el sitio web recuerde información sobre su visita, como su sesión de usuario o preferencias.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">2. Cookies utilizadas</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Work Life OS utiliza únicamente cookies técnicas necesarias para el funcionamiento del servicio.
          </p>
          <div className="bg-gray-50 border-2 border-dashed border-black/10 p-4 font-mono text-xs space-y-2">
            <p><span className="font-bold text-black">sb-auth-token:</span> Cookie de sesión gestionada por Supabase que permite mantener la autenticación del usuario mientras navega por la aplicación.</p>
          </div>
          <p className="font-mono text-sm leading-relaxed text-gray-700 italic">
            Estas cookies son esenciales para el funcionamiento del sistema y no se utilizan con fines publicitarios ni de seguimiento.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">3. Almacenamiento local (LocalStorage)</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Además de cookies, la aplicación puede utilizar mecanismos de almacenamiento local del navegador (LocalStorage) para guardar preferencias del usuario como:
          </p>
          <ul className="list-disc pl-5 font-mono text-sm space-y-2 text-gray-700">
            <li>Tema visual (Modo oscuro/claro)</li>
            <li>Configuraciones de interfaz y colapsado de menús</li>
          </ul>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Estos datos permanecen únicamente en el dispositivo del usuario y no se envían a nuestros servidores.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">4. Desactivación de cookies</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            El usuario puede configurar su navegador para bloquear o eliminar cookies. Sin embargo, si se desactivan las cookies técnicas necesarias, es posible que algunas funcionalidades de Work Life OS no funcionen correctamente, incluyendo el inicio de sesión.
          </p>
        </section>

        <footer className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Última actualización</p>
            <p className="font-mono text-xs font-black">Marzo 2026</p>
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 px-3 py-1 border border-black/10">
            Work Life OS Legal Compliance
          </div>
        </footer>
      </div>
    </motion.div>
  );
}
