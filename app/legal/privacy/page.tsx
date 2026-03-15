'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
        <div className="inline-flex items-center gap-3 bg-[var(--color-electric-cyan)] border-2 border-black px-4 py-2 mb-6 shadow-brutal-sm">
          <ShieldCheck className="w-5 h-5 text-black" />
          <span className="font-black uppercase tracking-widest text-sm text-black">Privacidad Blindada</span>
        </div>
        <h1 className="text-5xl md:text-7xl brutal-heading tracking-tighter leading-none mb-4">Política de <br />Privacidad</h1>
        <p className="text-gray-600 font-mono text-sm leading-relaxed max-w-xl">
          Tu información es tuya. Aquí te explicamos cómo la tratamos con el máximo respeto y seguridad.
        </p>
      </header>

      <div className="brutal-card bg-white p-8 md:p-12 space-y-10 border-[3px] border-black shadow-brutal">
        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">1. Responsable del Tratamiento</h2>
          <div className="bg-gray-50 border-2 border-black p-4 inline-block">
            <p className="font-mono text-sm font-bold">Responsable: <span className="text-[var(--color-neon-fuchsia)]">Olianlabs</span></p>
            <p className="font-mono text-sm ">Email: contacto@olianlabs.com</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">2. Datos recogidos</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Work Life OS puede recoger los siguientes datos:
          </p>
          <ul className="list-disc pl-5 font-mono text-sm space-y-2 text-gray-700">
            <li>Dirección de correo electrónico (para autenticación).</li>
            <li>Datos introducidos voluntariamente por el usuario en la plataforma (jornadas, perfiles, notas).</li>
            <li>Información técnica necesaria para la autenticación y funcionamiento del servicio.</li>
          </ul>
          <p className="font-mono text-sm leading-relaxed text-gray-700 italic">
            La autenticación y almacenamiento de datos se gestionan mediante servicios proporcionados por Supabase.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">3. Finalidad del tratamiento</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Los datos se utilizan exclusivamente para:
          </p>
          <ul className="list-disc pl-5 font-mono text-sm space-y-2 text-gray-700">
            <li>Gestionar la cuenta del usuario y permitir el acceso.</li>
            <li>Proporcionar acceso al sistema Work Life OS.</li>
            <li>Realizar cálculos laborales y auditorías de nóminas solicitadas por el usuario.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">4. Base legal y Conservación</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            El tratamiento se basa en el consentimiento del usuario y la ejecución del servicio solicitado. 
            Los datos se conservarán mientras el usuario mantenga su cuenta activa.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">5. Tus Derechos</h2>
          <p className="font-mono text-sm leading-relaxed text-gray-700">
            Tienes derecho a acceder a tus datos, rectificarlos o solicitar su eliminación en cualquier momento. Puedes contactarnos en contacto@olianlabs.com o presentar una reclamación ante la Agencia Española de Protección de Datos.
          </p>
        </section>

        <footer className="pt-10 border-t border-black/5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Última actualización</p>
          <p className="font-mono text-xs font-black">Marzo 2026</p>
        </footer>
      </div>
    </motion.div>
  );
}
