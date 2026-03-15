'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="brutal-card p-12 bg-[var(--color-neon-fuchsia)] text-white text-center max-w-lg w-full"
      >
        <div className="w-20 h-20 bg-black border-[4px] border-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-brutal -rotate-6">
          <ShieldAlert className="w-10 h-10 text-[var(--color-electric-cyan)]" />
        </div>

        <h1 className="text-4xl font-display font-black mb-4 uppercase tracking-tighter">Error de Sistema</h1>
        
        <p className="font-mono text-sm font-bold mb-10 leading-relaxed uppercase opacity-90">
          Se ha producido una anomalía en la sincronización. 
          No te preocupes, tus datos en la nube siguen seguros.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="brutal-btn bg-white text-black px-8 py-4 flex-1 flex items-center justify-center gap-3 hover:bg-[var(--color-electric-cyan)] transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reintentar</span>
          </button>
          
          <Link
            href="/"
            className="brutal-btn bg-black text-white px-8 py-4 flex-1 flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
        </div>
        
        <p className="mt-8 font-mono text-[10px] opacity-60 break-all uppercase">
          ID: {error.digest || 'Anónimo'}
        </p>
      </motion.div>
    </div>
  );
}
