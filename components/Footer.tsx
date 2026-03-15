'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t-brutal border-black bg-white p-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap justify-center md:justify-start gap-6 font-mono text-xs font-bold uppercase tracking-widest">
          <Link href="/legal/terms" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Aviso Legal</Link>
          <Link href="/legal/privacy" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Privacidad</Link>
          <Link href="/legal/data" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Datos</Link>
          <Link href="/legal/cookies" className="hover:text-[var(--color-neon-fuchsia)] transition-colors">Cookies</Link>
        </div>
        
        <div className="text-center md:text-right">
          <p className="font-display font-bold text-sm tracking-tight">
            Work Life OS &copy; {new Date().getFullYear()}
          </p>
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            Desarrollado por <span className="text-black font-bold">Olianlabs</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
