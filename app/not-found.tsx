'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="brutal-card p-12 bg-[var(--color-citrus-yellow)] text-center max-w-lg w-full"
      >
        <div className="w-24 h-24 bg-white border-[4px] border-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-brutal rotate-3">
          <AlertCircle className="w-12 h-12 text-black" />
        </div>
        
        <h1 className="text-6xl font-display font-black mb-4 uppercase tracking-tighter italic">404</h1>
        <h2 className="text-2xl font-display font-black mb-6 uppercase tracking-tight">Ruta Perdida</h2>
        
        <p className="font-mono text-sm font-bold text-gray-800 mb-10 leading-relaxed uppercase">
          Esta coordenada no existe en tu cuadrícula de trabajo. 
          Quizás te la has tomado libre por error.
        </p>

        <Link 
          href="/"
          className="brutal-btn bg-black text-white px-8 py-4 flex items-center justify-center gap-3 w-full hover:translate-x-1 hover:translate-y-1 transition-transform"
        >
          <Home className="w-5 h-5" />
          <span>Volver al Panel</span>
        </Link>
      </motion.div>
    </div>
  );
}
