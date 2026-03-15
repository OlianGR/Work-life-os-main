'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Database } from 'lucide-react';

export default function DataPolicyPage() {
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
        <div className="inline-flex items-center gap-3 bg-[var(--color-sky-blue)] border-2 border-black px-4 py-2 mb-6 shadow-brutal-sm">
          <Database className="w-5 h-5 text-black" />
          <span className="font-black uppercase tracking-widest text-sm text-black">Gestión de Información</span>
        </div>
        <h1 className="text-5xl md:text-7xl brutal-heading tracking-tighter leading-none mb-4">Política de <br />Datos</h1>
        <p className="text-gray-600 font-mono text-sm leading-relaxed max-w-xl">
          Transparencia absoluta sobre dónde residen tus datos y qué tecnología los procesa.
        </p>
      </header>

      <div className="brutal-card bg-white p-8 md:p-12 space-y-10 border-[3px] border-black shadow-brutal">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Infraestructura y Seguridad</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Los datos de los usuarios se almacenan en infraestructuras cloud gestionadas por <span className="font-bold underline">Supabase</span> utilizando bases de datos PostgreSQL de alto rendimiento con cifrado en reposo.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Finalidad</h2>
          <ul className="list-disc pl-5 font-mono text-sm space-y-2 text-gray-700">
            <li>Permitir el acceso al panel personal del usuario.</li>
            <li>Calcular jornadas laborales y descansos.</li>
            <li>Analizar nóminas mediante sistemas de IA avanzada.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Procesamiento de Documentos (IA)</h2>
          <div className="bg-yellow-50 border-2 border-yellow-400 p-4 font-mono text-sm text-yellow-900">
            <p className="font-bold mb-2 uppercase tracking-wide">Aviso sobre Auditoría de Nóminas:</p>
            <p>
              Para el análisis de nóminas, las imágenes pueden procesarse temporalmente mediante servicios proporcionados por <span className="font-bold">Groq</span>. 
              <span className="underline">Estas imágenes no se utilizan para entrenar modelos de inteligencia artificial</span> y se manejan en memoria de forma transitoria.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Conservación y Eliminación</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Los datos se conservarán mientras el usuario mantenga una cuenta activa. En caso de eliminación de la cuenta a través del menú de ajustes, todos los registros asociados (logs, perfiles y datos personales) serán eliminados permanentemente de nuestros sistemas.
          </p>
        </section>

        <section className="space-y-4 border-2 border-dashed border-black/10 p-6">
          <h3 className="text-lg font-display font-black uppercase tracking-tight mb-2">Proveedores tecnológicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[10px] font-bold text-gray-400 uppercase">Datos y Auth</p>
              <p className="font-mono text-xs font-black">Supabase</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[10px] font-bold text-gray-400 uppercase">IA / OCR</p>
              <p className="font-mono text-xs font-black">Groq</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[10px] font-bold text-gray-400 uppercase">Hosting</p>
              <p className="font-mono text-xs font-black">Vercel</p>
            </div>
          </div>
        </section>

        <footer className="pt-10 border-t border-black/5 flex justify-between items-center">
          <div className="font-mono text-xs font-black">Marzo 2026</div>
        </footer>
      </div>
    </motion.div>
  );
}
