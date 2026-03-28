'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Info, Calendar, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';

export default function NormativaPage() {
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
        <div className="inline-flex items-center gap-3 bg-[var(--color-citrus-yellow)] border-2 border-black px-4 py-2 mb-6 shadow-brutal-sm text-black">
          <Info className="w-5 h-5" />
          <span className="font-black uppercase tracking-widest text-sm">Guía de Normativa Laboral 2026</span>
        </div>
        <h1 className="text-5xl md:text-7xl brutal-heading tracking-tighter leading-none mb-4 uppercase">Normativa <br />& Jornada</h1>
        <p className="text-gray-600 font-mono text-sm leading-relaxed max-w-2xl">
          Entiende los límites legales de tu jornada laboral en España, el cálculo del límite de 225 días para jornadas de 35h y cómo auditar tu nómina para asegurar que recibes lo que te corresponde.
        </p>
      </header>

      <div className="space-y-12 pb-24">
        {/* 1. LÍMITE DE 225 DÍAS */}
        <section className="brutal-card bg-white p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-3xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-[var(--color-neon-fuchsia)]" /> El Límite de 225 Días Trabajados (35h)
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-700">
            <p className="font-bold text-lg text-black">¿Por qué 225 días?</p>
            <p>
              Aunque el estándar de 40h suele situarse en 225 días, para <strong>jornadas intensivas o de 35h semanales</strong>, el cómputo de días laborables efectivos puede ajustarse hasta los 225 días anuales, dependiendo del convenio colectivo y la distribución de horas.
            </p>
            <div className="bg-gray-100 p-4 border border-black space-y-2">
              <p className="font-black uppercase tracking-widest text-xs">Cálculo 35h semanales:</p>
              <ul className="list-disc pl-5">
                <li>Referencia Anual: ~1575-1600 horas/año en convenio 35h.</li>
                <li>Días de Vacaciones: 30 días naturales.</li>
                <li>Festivos Nacionales/Locales: 14 días.</li>
                <li><strong>Capacidad Máxima: 225 Días Laborables</strong></li>
              </ul>
            </div>
            <p>
              Superar este límite implica la realización de <strong>horas extraordinarias</strong>, las cuales tienen una compensación económica superior o descanso equivalente, según el convenio colectivo aplicable.
            </p>
          </div>
        </section>

        {/* 2. AUDITORÍA DE NÓMINA */}
        <section className="brutal-card bg-[var(--color-electric-cyan)] p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-3xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <UserCheck className="w-8 h-8 text-black" /> Cómo Auditar tu Nómina con IA
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-black">
            <p>
              Auditar tu nómina significa verificar que los conceptos devengados (salario base, complementos, horas extra, pluses de transporte) coinciden con tu realidad laboral diaria.
            </p>
            <div className="bg-white p-6 border-2 border-black rotate-1">
              <h3 className="font-black uppercase text-sm mb-3">Puntos clave para revisar:</h3>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="bg-black text-white px-1 font-bold">1</span>
                  <span><strong>Plus de Turnicidad / Nocturnidad:</strong> Si trabajas fuera del horario estándar, revisa que se aplique el coeficiente corrector.</span>
                </li>
                <li className="flex gap-2">
                  <span className="bg-black text-white px-1 font-bold">2</span>
                  <span><strong>Festivos Trabajados:</strong> La remuneración suele incluir un recargo del 75% o descanso compensatorio.</span>
                </li>
                <li className="flex gap-2">
                  <span className="bg-black text-white px-1 font-bold">3</span>
                  <span><strong>Gastos de Teletrabajo:</strong> La Ley de Teletrabajo obliga a compensar los gastos derivados de trabajar desde casa.</span>
                </li>
              </ul>
            </div>
            <p className="font-bold underline italic">Work Life OS utiliza IA para escanear estos términos y compararlos con tus registros de actividad mensual.</p>
          </div>
        </section>

        {/* 3. DERECHOS DE DESCANSO */}
        <section className="brutal-card bg-[var(--color-sky-blue)] p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-3xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-black" /> Derechos de Descanso y Desconexión
          </h2>
          <div className="space-y-4 font-mono text-sm leading-relaxed text-gray-800">
            <p>El Estatuto de los Trabajadores establece descansos mínimos que todas las empresas deben respetar:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="p-4 border-2 border-black bg-white">
                <p className="font-black uppercase text-[10px] mb-1">Descanso Diario</p>
                <p>Mínimo de 12 horas entre el final de una jornada y el comienzo de la siguiente.</p>
              </li>
              <li className="p-4 border-2 border-black bg-white">
                <p className="font-black uppercase text-[10px] mb-1">Pausa en Jornada</p>
                <p>Si la jornada excede las 6 horas, debe haber una pausa no inferior a 15 minutos.</p>
              </li>
              <li className="p-4 border-2 border-black bg-white col-span-1 md:col-span-2">
                <p className="font-black uppercase text-[10px] mb-1">Descanso Semanal</p>
                <p>Mínimo de un día y medio ininterrumpido a la semana (acumulable en periodos de hasta 14 días).</p>
              </li>
            </ul>
          </div>
        </section>

        {/* 4. PREGUNTAS FRECUENTES (FAQ SEO) */}
        <section className="brutal-card bg-black text-white p-8 border-[3px] border-black shadow-brutal">
          <h2 className="text-3xl font-display font-black uppercase tracking-tight flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-[var(--color-citrus-yellow)]" /> Preguntas Frecuentes
          </h2>
          <div className="space-y-6 font-mono text-sm">
            <div>
              <p className="font-black text-[var(--color-citrus-yellow)] uppercase mb-2">¿Es obligatorio el registro de jornada?</p>
              <p className="opacity-80">Sí, desde 2019 todas las empresas en España están obligadas a registrar el inicio y fin de la jornada de cada trabajador.</p>
            </div>
            <div>
              <p className="font-black text-[var(--color-citrus-yellow)] uppercase mb-2">¿Cuántos festivos hay en España al año?</p>
              <p className="opacity-80">El calendario laboral estándar cuenta con 14 días festivos no recuperables, retribuidos y obligatorios.</p>
            </div>
            <div>
              <p className="font-black text-[var(--color-citrus-yellow)] uppercase mb-2">¿Cómo afecta la IA a mi nómina?</p>
              <p className="opacity-80">La IA permite detectar discrepancias entre lo firmado en contrato y lo pagado realmente, analizando patrones de horas extra y pluses olvidados.</p>
            </div>
          </div>
        </section>

        <footer className="text-center pt-10 border-t-2 border-black/10">
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
            * Esta información es de carácter general y orientativa. Para casos específicos, consulta siempre con un abogado laboralista o asesor especializado.
          </p>
        </footer>
      </div>
    </motion.div>
  );
}
