import { Metadata } from 'next';
import { Coffee, Heart, Shield, Globe, Terminal, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CoffeeSupportAction } from '@/components/CoffeeSupportAction';

interface PageProps {
  searchParams: Promise<{ success?: string; cancel?: string }>;
}

export const metadata: Metadata = {
  title: 'Apoyar el proyecto | Olian Labs',
  description: 'Si nuestras herramientas te resultan útiles puedes apoyar el desarrollo del proyecto con una pequeña propina. Gracias por ayudarnos a seguir creando herramientas gratuitas.',
};

export default async function SupportPage({ searchParams }: PageProps) {
  const { success, cancel } = await searchParams;

  const { data } = await supabase
    .from('site_stats')
    .select('value')
    .eq('name', 'coffees_received')
    .single();

  const coffeeCount = data?.value || 0;

  return (
    <div className="min-h-screen bg-[var(--color-base-bg)] p-4 sm:p-8 font-mono overflow-x-hidden">
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        {/* Success/Cancel Messages */}
        {success && (
          <div className="brutal-card p-6 bg-[var(--color-citrus-yellow)] border-[4px] border-black flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase tracking-tighter">¡Gracias por tu apoyo!</h3>
              <p className="text-sm font-bold opacity-70">Tu café está en camino. El contador se actualizará en unos segundos.</p>
            </div>
          </div>
        )}

        {cancel && (
          <div className="brutal-card p-6 bg-red-100 border-[4px] border-black flex items-center gap-4">
            <XCircle className="w-10 h-10 text-red-600" />
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase tracking-tighter">Oh, se ha cancelado</h3>
              <p className="text-sm font-bold opacity-70">No hay problema. Si cambias de opinión, aquí seguiremos.</p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <header className="space-y-6 text-center">
          <div className="inline-block bg-[var(--color-citrus-yellow)] text-black border-[3px] border-black px-4 py-2 font-black uppercase tracking-widest shadow-brutal-sm transform -rotate-1 rounded-2xl">
            Support the Project
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase leading-none">
            Apoyar el <br />
            <span className="text-[var(--color-neon-fuchsia)] outline-text">PROYECTO</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-bold uppercase tracking-tight">
            Mantener herramientas <span className="text-black border-b-[4px] border-[var(--color-electric-cyan)]">gratuitas</span> requiere servidores, APIs y tiempo. Ayúdanos a seguir siendo independientes.
          </p>
        </header>

        {/* The Coffee Counter - Social Proof */}
        <div className="flex justify-center">
            <div className="brutal-card p-6 bg-white border-[4px] border-black flex flex-col items-center gap-2 transform rotate-2">
                <Heart className="w-8 h-8 text-[var(--color-neon-fuchsia)] fill-[var(--color-neon-fuchsia)]" />
                <div className="text-3xl font-display font-black tracking-tighter">❤️ {coffeeCount} cafés recibidos</div>
                <p className="text-[10px] uppercase font-black text-gray-400">Prueba social: Otros usuarios ya han ayudado</p>
            </div>
        </div>

        {/* Action Section - Psychology: Directing users */}
        <CoffeeSupportAction />

        {/* Psychology Anchoring Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <div className="brutal-card p-8 bg-black text-white space-y-4 shadow-[12px_12px_0px_0px_var(--color-electric-cyan)]">
                <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[var(--color-electric-cyan)]" />
                    Independiente
                </h3>
                <p className="opacity-80 text-sm leading-relaxed font-bold">
                    Esta web es 100% independiente. No aceptamos patrocinios que comprometan tu privacidad. <strong>Sin publicidad</strong>, sin rastreadores invasivos. Solo código y utilidad para ti.
                </p>
            </div>
            <div className="brutal-card p-8 bg-white border-[4px] border-black space-y-4 shadow-[12px_12px_0px_0px_var(--color-neon-fuchsia)]">
                <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                    <Globe className="w-6 h-6 text-[var(--color-neon-fuchsia)]" />
                    Comunidad
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed font-bold">
                    El apoyo directo nos permite pagar los servidores y añadir nuevas funciones que la comunidad pide. Cada café ayuda a que Olian Labs siga creciendo como estudio humano.
                </p>
            </div>
        </div>
        <footer className="text-center pt-12">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Olian Labs © 2026 | Desarrollado con ❤️ para gente independiente</p>
        </footer>
      </div>
    </div>
  );
}
