'use client';

import { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowRight, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (val: string) => void;
  isRegister: boolean;
  setIsRegister: (val: boolean) => void;
  useMagicLink: boolean;
  setUseMagicLink: (val: boolean) => void;
  legalAccepted: boolean;
  setLegalAccepted: (val: boolean) => void;
  error: string;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResetPassword?: () => void;
}

export function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword = '',
  setConfirmPassword = () => {},
  isRegister,
  setIsRegister,
  useMagicLink,
  setUseMagicLink,
  legalAccepted,
  setLegalAccepted,
  error,
  isProcessing,
  onSubmit,
  onResetPassword
}: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase text-gray-400 px-1">Email</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-[3px] border-black rounded-2xl font-mono text-sm focus:bg-white focus:ring-4 focus:ring-[var(--color-electric-cyan)]/20 transition-all outline-none"
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      {!useMagicLink && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-gray-400 px-1">Contraseña</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-[3px] border-black rounded-2xl font-mono text-sm focus:bg-white focus:ring-4 focus:ring-[var(--color-electric-cyan)]/20 transition-all outline-none"
                placeholder={isRegister ? "Mínimo 6 caracteres" : "Tu contraseña"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors"
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-gray-400 px-1">Repite la contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-[3px] border-black rounded-2xl font-mono text-sm focus:bg-white focus:ring-4 focus:ring-[var(--color-electric-cyan)]/20 transition-all outline-none"
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>
            </div>
          )}

          {!isRegister && onResetPassword && (
            <div className="flex justify-end p-1">
              <button
                type="button"
                onClick={onResetPassword}
                className="text-[10px] font-mono font-bold uppercase text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </>
      )}

      {isRegister && (
        <div className="space-y-4">
          <label className="flex items-start gap-4 p-4 bg-gray-50 border-[3px] border-black rounded-2xl cursor-pointer hover:bg-white transition-colors group">
            <input
              type="checkbox"
              checked={legalAccepted}
              onChange={(e) => setLegalAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 border-2 border-black rounded cursor-pointer accent-black"
              required
            />
            <span className="text-xs font-mono text-gray-600 leading-relaxed group-hover:text-black transition-colors">
              Acepto que mis datos se guarden de forma segura y entiendo que puedo borrarlos en cualquier momento.
            </span>
          </label>

          <label className="flex items-start gap-4 p-4 bg-gray-50 border-[3px] border-black rounded-2xl cursor-pointer hover:bg-white transition-colors group">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 border-2 border-black rounded cursor-pointer accent-black"
              required
            />
            <span className="text-xs font-mono text-gray-600 leading-relaxed group-hover:text-black transition-colors">
              He leído y acepto los <a href="/legal/terms" target="_blank" className="font-bold underline hover:text-[var(--color-neon-fuchsia)] transition-colors">Términos de Uso</a>, la <a href="/legal/privacy" target="_blank" className="font-bold underline hover:text-[var(--color-neon-fuchsia)] transition-colors">Política de Privacidad</a> y la <a href="/legal/cookies" target="_blank" className="font-bold underline hover:text-[var(--color-neon-fuchsia)] transition-colors">Política de Cookies</a>.
            </span>
          </label>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 border-[3px] border-red-500 rounded-2xl text-red-600 text-xs font-mono font-bold"
        >
          {error}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className="brutal-btn w-full py-5 bg-[var(--color-electric-cyan)] text-black rounded-2xl flex items-center justify-center gap-3 font-display font-bold text-lg shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            {isRegister ? 'Crear mi cuenta' : (useMagicLink ? 'Enviarme enlace' : 'Entrar ahora')}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <div className="space-y-4 pt-4 border-t-2 border-dashed border-gray-200">
        {!showPassword && (
          <button
            type="button"
            onClick={() => {
              setUseMagicLink(!useMagicLink);
              setIsRegister(false);
            }}
            className="w-full p-4 border-[3px] border-black rounded-2xl flex items-center justify-center gap-3 font-mono text-sm font-bold bg-white hover:bg-gray-50 transition-all shadow-brutal-sm"
          >
            {useMagicLink ? (
              <><Lock className="w-5 h-5" /> Usar contraseña tradicional</>
            ) : (
              <><KeyRound className="w-5 h-5" /> Entrar con enlace mágico</>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setUseMagicLink(false);
          }}
          className="w-full text-center text-sm font-mono font-bold text-gray-400 hover:text-black transition-colors"
        >
          {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </form>
  );
}
