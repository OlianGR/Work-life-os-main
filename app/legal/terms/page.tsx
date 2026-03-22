'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Scale, AlertTriangle, Cpu, Globe, ShieldAlert, CheckCircle2, Coffee } from 'lucide-react';

export default function TermsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest mb-8 hover:text-[var(--color-neon-fuchsia)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al Panel
      </Link>

      <header className="mb-12">
        <div className="inline-flex items-center gap-3 bg-[var(--color-neon-fuchsia)] border-2 border-black px-4 py-2 mb-6 shadow-brutal-sm text-white">
          <Scale className="w-5 h-5 text-white" />
          <span className="font-black uppercase tracking-widest text-sm text-white">Marco Legal Completo</span>
        </div>
        <h1 className="text-5xl md:text-7xl brutal-heading tracking-tighter leading-none mb-4 uppercase">Aviso Legal <br />& Términos</h1>
        <p className="text-gray-600 font-mono text-sm leading-relaxed max-w-2xl">
          Este documento constituye el acuerdo legal entre tú y Olianlabs. Contiene cláusulas críticas de responsabilidad que debes conocer.
        </p>
      </header>

      <div className="space-y-8 pb-24">
        {/* 1. AVISO LEGAL */}
        <section className="brutal-card bg-white p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-[var(--color-sky-blue)]" /> 1. Información General
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-700">
            <p>En cumplimiento de la normativa aplicable en materia de servicios de la sociedad de la información, se informa de los siguientes datos:</p>
            <ul className="space-y-2">
              <li><span className="font-bold">Responsable del sitio web:</span> Olianlabs</li>
              <li><span className="font-bold">Sitio web:</span> Work Life OS</li>
              <li><span className="font-bold">Correo electrónico de contacto:</span> contacto@olianlabs.com</li>
            </ul>
            <p>El presente sitio web tiene como finalidad ofrecer una plataforma digital para la gestión y análisis de actividad laboral, cálculos de jornada y auditoría de nóminas.</p>
            <p>El acceso y uso del sitio web atribuye la condición de usuario e implica la aceptación de las condiciones recogidas en este aviso legal.</p>
            <p>Olianlabs se reserva el derecho a modificar cualquier tipo de información que pudiera aparecer en el sitio web sin obligación de preavisar a los usuarios.</p>
          </div>
        </section>

        {/* 2. LIMITACIÓN DE RESPONSABILIDAD LABORAL */}
        <section className="brutal-card bg-[var(--color-neon-fuchsia)] text-white p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <ShieldAlert className="w-8 h-8" /> Limitación de Responsabilidad Laboral
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed">
            <p>Work Life OS es una herramienta digital diseñada para proporcionar cálculos orientativos relacionados con jornadas laborales, descansos y análisis de nóminas.</p>
            <p className="font-black underline italic">La información generada por la plataforma tiene carácter MERAMENTE INFORMATIVO y orientativo, y no constituye asesoramiento legal, laboral, contable o fiscal.</p>
            <p>Olianlabs no garantiza que los cálculos o análisis realizados por el sistema reflejen con exactitud la situación laboral real del usuario ni que sean válidos para procedimientos administrativos o judiciales.</p>
            <p>El usuario reconoce que cualquier decisión tomada basándose en la información proporcionada por Work Life OS es de su exclusiva responsabilidad.</p>
            <p>Olianlabs no será responsable de reclamaciones laborales, conflictos con empleadores ni pérdidas económicas derivadas del uso de la plataforma.</p>
          </div>
        </section>

        {/* 3. INTELIGENCIA ARTIFICIAL */}
        <section className="brutal-card bg-[var(--color-citrus-yellow)] p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6 text-black">
            <Cpu className="w-6 h-6" /> Uso de Inteligencia Artificial
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-black">
            <p>Work Life OS puede utilizar sistemas automatizados de procesamiento de datos e inteligencia artificial para analizar documentos proporcionados por el usuario, como imágenes de nóminas.</p>
            <p>Estos sistemas pueden estar gestionados por proveedores tecnológicos externos, como <span className="font-bold">Groq</span>.</p>
            <div className="border-l-4 border-black pl-4 my-4 space-y-2">
              <p className="font-bold uppercase text-xs">El usuario reconoce que:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>El análisis realizado por estos sistemas es automatizado.</li>
                <li>Los resultados pueden contener errores o interpretaciones incorrectas.</li>
                <li>Dichos resultados no deben considerarse asesoramiento profesional.</li>
              </ul>
            </div>
            <p>Las imágenes o documentos enviados se procesan únicamente para la finalidad solicitada por el usuario.</p>
          </div>
        </section>

        {/* 4. DISPONIBILIDAD TECNOLÓGICA */}
        <section className="brutal-card bg-white p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-[var(--color-electric-cyan)]" /> Disponibilidad y Seguridad
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-700">
            <p>Olianlabs adopta medidas técnicas razonables para garantizar la seguridad y disponibilidad de la plataforma.</p>
            <p>No obstante, el usuario reconoce que los servicios digitales pueden verse afectados por:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 font-bold uppercase text-[10px]">
              <li className="bg-gray-100 p-2 border border-black">&bull; Fallos técnicos</li>
              <li className="bg-gray-100 p-2 border border-black">&bull; Interrupciones de red</li>
              <li className="bg-gray-100 p-2 border border-black">&bull; Incidencias en proveedores</li>
              <li className="bg-gray-100 p-2 border border-black">&bull; Ataques informáticos</li>
            </ul>
            <p>Olianlabs no garantiza la disponibilidad continua e ininterrumpida del servicio y no será responsable de daños derivados de interrupciones, pérdida de datos o accesos no autorizados fuera de su control razonable.</p>
            <p className="text-xs italic">La infraestructura tecnológica utilizada incluye servicios de terceros como Supabase y Vercel.</p>
          </div>
        </section>

        {/* 5. USO ACEPTABLE */}
        <section className="brutal-card bg-black text-white p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-[var(--color-citrus-yellow)]" /> Uso Aceptable del Servicio
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed">
            <p>El usuario se compromete a utilizar Work Life OS de manera lícita y conforme a la legislación vigente.</p>
            <p className="font-bold uppercase tracking-widest text-[10px] text-gray-400">Queda prohibido utilizar la plataforma para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Actividades ilegales.</li>
              <li>Envío de información fraudulenta o falsa.</li>
              <li>Intentos de acceso no autorizado al sistema.</li>
              <li>Explotación del servicio con fines distintos a los previstos.</li>
            </ul>
            <p className="bg-white/10 p-4 border border-white/20">Olianlabs se reserva el derecho de suspender o cancelar cuentas que incumplan estas condiciones.</p>
          </div>
        </section>
        
        {/* 6. CONTRIBUCIONES Y SOPORTE (CAFÉS) */}
        <section className="brutal-card bg-[var(--color-sky-blue)] p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-2xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6 text-black">
            <Coffee className="w-6 h-6" /> 6. Contribuciones y Soporte
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-black">
            <p>Work Life OS ofrece la posibilidad de realizar aportaciones económicas voluntarias (referidas como &quot;invitar a un café&quot;) para apoyar el mantenimiento y desarrollo del proyecto.</p>
            <div className="bg-white/50 p-4 border-2 border-dashed border-black">
              <p className="font-bold uppercase text-xs mb-2">Política de No Reembolso:</p>
              <p>Dada la naturaleza de estas aportaciones como actos de apoyo voluntario y soporte al proyecto, <span className="underline font-bold text-black">todas las transacciones son finales y no se realizarán reembolsos</span> una vez que el pago haya sido procesado con éxito a través de Stripe.</p>
              <p className="mt-2 text-[10px] opacity-70">El usuario acepta expresamente que, al ser una contribución voluntaria procesada inmediatamente, renuncia al derecho de desistimiento una vez el pago sea completado.</p>
            </div>
            <p>El usuario reconoce que estas contribuciones no otorgan derechos de propiedad, licencia especial, ni obligación de soporte técnico personalizado por parte de Olianlabs.</p>
            <p className="text-[10px] opacity-70 italic text-black/60">Los pagos son procesados de forma segura por Stripe, Inc. y están sujetos a sus términos de servicio.</p>
          </div>
        </section>

        <footer className="text-center pt-10">
          <p className="font-display font-black text-4xl uppercase tracking-tighter opacity-10">Olianlabs 2026</p>
        </footer>
      </div>
    </motion.div>
  );
}
