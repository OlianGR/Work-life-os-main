'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, MousePointer2, KeyRound, Lock } from 'lucide-react';

interface LandingHeroProps {
  onEnter: () => void;
}

export function LandingHero({ onEnter }: LandingHeroProps) {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--color-base-bg)] p-4 cursor-pointer overflow-hidden relative"
      onClick={onEnter}
      onWheel={(e) => { if (e.deltaY > 20) onEnter(); }}
    >
      {/* Background Accents */}
      <motion.div 
        initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
        animate={{ rotate: -5, scale: 1, opacity: 0.1 }}
        className="absolute -top-20 -left-20 w-96 h-96 bg-[var(--color-neon-fuchsia)] border-4 border-black rounded-full"
      />
      <motion.div 
        initial={{ rotate: 10, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 15, scale: 1, opacity: 0.1 }}
        className="absolute -bottom-20 -right-20 w-80 h-80 bg-[var(--color-electric-cyan)] border-4 border-black"
      />

      <div className="z-10 text-center space-y-8 max-w-4xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-block bg-black text-white px-4 py-2 rounded-full font-mono text-sm font-bold uppercase tracking-[0.3em] mb-6 shadow-brutal">
            Multiplayer Edition
          </div>
          <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter leading-none uppercase">
            Work Life <br />
            <span className="text-[var(--color-neon-fuchsia)] outline-text">OS</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl font-mono font-bold text-gray-600 max-w-2xl mx-auto"
        >
          Domina tu tiempo. Rastrea tus ingresos. <br /> 
          Ahora en la nube para todo tu equipo.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="pt-12 flex flex-col items-center gap-4"
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onEnter(); }}
            className="brutal-btn bg-black text-white px-12 py-6 text-2xl flex items-center gap-4 group rounded-3xl"
          >
            Entrar al Sistema
            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2 text-gray-400 font-mono text-sm animate-bounce mt-8">
            <ChevronDown className="w-4 h-4" />
            <span>Haz scroll o click para entrar</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-1/4 right-10 hidden lg:block"
      >
        <div className="brutal-card p-4 bg-[var(--color-citrus-yellow)] rotate-6">
          <MousePointer2 className="w-8 h-8" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        className="absolute top-1/3 left-10 hidden lg:block"
      >
        <div className="brutal-card p-4 bg-[var(--color-electric-cyan)] -rotate-12">
          <KeyRound className="w-8 h-8 text-black" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-1/4 left-20 hidden lg:block"
      >
        <div className="brutal-card p-3 bg-[var(--color-neon-fuchsia)] text-white rotate-3">
          <Lock className="w-6 h-6" />
        </div>
      </motion.div>
    </div>
  );
}
