'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Heart, Coffee } from 'lucide-react';

export function Footer() {
  const [coffeeCount, setCoffeeCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('site_stats')
        .select('value')
        .eq('name', 'coffees_received')
        .single();
      if (data) setCoffeeCount(data.value);
    };
    fetchStats();
  }, []);

  return (
    <footer className="border-t-[4px] border-black bg-white p-8 mt-auto overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 font-mono text-xs font-bold uppercase tracking-widest">
            <Link href="/legal/normativa" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Normativa</Link>
            <Link href="/legal/terms" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Aviso Legal</Link>
            <Link href="/legal/privacy" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Privacidad</Link>
            <Link href="/legal/data" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Datos</Link>
            <Link href="/legal/cookies" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Cookies</Link>
          </div>
          <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest text-center md:text-left">
            Independiente • Sin Publicidad • Sin Rastreadores
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <Link href="/apoyar-proyecto" className="group">
            <div className="brutal-card bg-[var(--color-citrus-yellow)] px-4 py-2 border-[3px] border-black flex items-center gap-2 transform group-hover:-translate-y-1 group-active:translate-y-0 transition-all shadow-brutal-sm">
              <Heart className="w-4 h-4 text-[var(--color-neon-fuchsia)] fill-[var(--color-neon-fuchsia)] animate-pulse" />
              <span className="font-mono text-xs font-black uppercase">Apoyar Proyecto</span>
              {coffeeCount !== null && (
                <div className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {coffeeCount} cafés
                </div>
              )}
            </div>
          </Link>
          
          <div className="text-center md:text-right">
            <p className="font-display font-bold text-sm tracking-tight flex items-center justify-center md:justify-end gap-1">
              Work Life OS <span className="text-[var(--color-neon-fuchsia)]">V2</span> &copy; {new Date().getFullYear()}
            </p>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              Desarrollado por <span className="text-black font-bold border-b-2 border-[var(--color-electric-cyan)]">Olianlabs</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
