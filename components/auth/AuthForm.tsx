'use client';

import Link from 'next/link';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  email: string;
  setEmail: (val: string) => void;
  password?: string;
  setPassword?: (val: string) => void;
  isRegister: boolean;
  setIsRegister: (val: boolean) => void;
  useMagicLink: boolean;
  setUseMagicLink: (val: boolean) => void;
  legalAccepted: boolean;
  setLegalAccepted: (val: boolean) => void;
  error: string;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  isRegister,
  setIsRegister,
  useMagicLink,
  setUseMagicLink,
  legalAccepted,
  setLegalAccepted,
  error,
  isProcessing,
  onSubmit
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500 text-left">Email Corporativo / Personal</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
            placeholder="email@ejemplo.com"
            className="w-full brutal-input pl-12 font-mono text-sm rounded-2xl"
            autoFocus
            required
          />
        </div>
      </div>

      {!useMagicLink && setPassword && (
        <div>
          <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500 text-left">Contraseña</label>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); }}
              placeholder="••••••••"
              className="w-full brutal-input pl-12 font-mono text-sm rounded-2xl"
              required={!useMagicLink}
            />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 p-3 bg-gray-50 border-2 border-dashed border-black/10 rounded-lg group hover:border-black/30 transition-colors">
        <div className="relative flex items-center h-5">
          <input
            id="legal-checkbox"
            type="checkbox"
            checked={legalAccepted}
            onChange={(e) => setLegalAccepted(e.target.checked)}
            className="w-6 h-6 border-[3px] border-black rounded-lg bg-white checked:bg-[var(--color-electric-cyan)] appearance-none cursor-pointer transition-all relative after:content-['✓'] after:absolute after:hidden checked:after:block after:text-xs after:font-black after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 shadow-brutal-sm"
            required
          />
        </div>
        <label htmlFor="legal-checkbox" className="text-[10px] font-mono leading-tight text-gray-500 cursor-pointer select-none text-left">
          Acepto los <Link href="/legal/privacy" target="_blank" className="text-black font-bold underline border-b-2 border-black">Términos de Privacidad</Link>, la <Link href="/legal/data" target="_blank" className="text-black font-bold underline border-b-2 border-black">Política de Datos</Link> y el uso de <Link href="/legal/cookies" target="_blank" className="text-black font-bold underline border-b-2 border-black">Cookies</Link> de Olianlabs.
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border-[3px] border-[var(--color-neon-fuchsia)] p-4 rounded-2xl">
          <p className="text-[var(--color-neon-fuchsia)] font-bold text-xs text-center">{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isProcessing || !legalAccepted}
        className="w-full brutal-btn bg-[var(--color-electric-cyan)] py-5 flex justify-center items-center gap-2 text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {useMagicLink 
              ? 'Enviar Enlace Mágico' 
              : (isRegister ? 'Registrarme ahora' : 'Entrar al Panel')
            }
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="flex flex-col gap-3 items-center mt-6">
        {!isRegister && (
          <button 
            type="button"
            onClick={() => { setUseMagicLink(!useMagicLink); }}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-fuchsia)] hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
          >
            {useMagicLink ? 'Usar contraseña normal' : 'Entrar sin contraseña (Magic Link)'}
          </button>
        )}

        <button 
          type="button"
          onClick={() => { setIsRegister(!isRegister); setUseMagicLink(false); }}
          className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
        </button>
      </div>
    </form>
  );
}
