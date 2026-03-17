'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight, Mail, User, MousePointer2, ChevronDown, KeyRound, Smartphone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function LandingHero({ onEnter }: { onEnter: () => void }) {
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

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { user, setUser, fetchUserData, initHolidays2026, loading } = useStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');

  useEffect(() => {
    // Suppress specific Next.js 15 error overlays for Supabase internal token refresh failures
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const msg = args.map(a => (typeof a === 'string' ? a : a?.message || '')).join(' ');
      if (msg.includes('AuthApiError') && msg.includes('Refresh Token')) {
        return; // Ignore
      }
      originalConsoleError.apply(console, args);
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData();
        initHolidays2026();
      }
    }).catch((err) => {
      console.warn('Auth session error handled:', err);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData();
        initHolidays2026();
      }
    });

    return () => {
      console.error = originalConsoleError;
      subscription.unsubscribe();
    };
  }, [setUser, fetchUserData, initHolidays2026]);

  if (user) {
    return <>{children}</>;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, introduce tu email.');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      setError('Error al enviar el enlace mágico. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          }
        });
        if (error) throw error;
        alert('¡Registro casi completo! Por favor verifica tu email para activar tu cuenta.');
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Hardened error messages to prevent enumeration
          if (error.status === 400 || error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Debes verificar tu email antes de entrar.');
          }
          throw error;
        }

        // Check for MFA requirements
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (!aalError && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
          // MFA is required. Get factors to find the active one
          const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
          if (!factorsError && factors.all.length > 0) {
            const factor = factors.all.find(f => f.status === 'verified');
            if (factor) {
              setMfaFactorId(factor.id);
              setShowMfaChallenge(true);
              setIsProcessing(false);
              return; // Stop here and show MFA UI
            }
          }
        }
      }
    } catch (err: any) {
      // Map common errors to generic messages for security
      const message = err.message || '';
      if (message.includes('rate limit')) {
        setError('Demasiados intentos. Por favor espera unos minutos.');
      } else if (message.includes('Credenciales') || message.includes('invalid')) {
        setError('Acceso denegado. Email o contraseña no válidos.');
      } else if (message.includes('verificar')) {
        setError('Cuenta pendiente de verificación por email.');
      } else {
        setError('Se ha producido un error en la autenticación. Reinténtalo.');
      }
    } finally {
      if (!showMfaChallenge) setIsProcessing(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaCode
      });

      if (verifyError) throw verifyError;
    } catch (err: any) {
      setError(err.message || 'Código de seguridad incorrecto.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!showLogin ? (
        <motion.div 
          key="hero"
          initial={{ opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <LandingHero onEnter={() => setShowLogin(true)} />
        </motion.div>
      ) : (
        <motion.div 
          key="login"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-screen flex items-center justify-center bg-[var(--color-base-bg)] p-4 w-full"
        >
          <div className="brutal-card p-8 max-w-md w-full bg-white relative rounded-3xl border-[3px] border-black">
            <button 
              onClick={() => setShowLogin(false)}
              className="absolute -top-4 -left-4 w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-brutal-sm"
            >
              <ChevronDown className="w-6 h-6 rotate-90" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[var(--color-citrus-yellow)] rounded-full border-brutal border-black flex items-center justify-center shadow-brutal">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            
            <h1 className="text-3xl font-display font-bold text-center mb-2">
              {isRegister ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
            </h1>
            <p className="text-center font-mono text-sm text-gray-500 mb-8">
              {isRegister 
                ? 'Regístrate para sincronizar tus datos en la nube' 
                : 'Introduce tus credenciales para acceder'}
            </p>

            {magicLinkSent ? (
               <div className="bg-green-50 border-[3px] border-[var(--color-electric-cyan)] p-6 rounded-3xl text-center space-y-4">
                 <div className="w-12 h-12 bg-[var(--color-electric-cyan)] rounded-full border-2 border-black flex items-center justify-center mx-auto shadow-brutal-sm">
                   <Mail className="w-6 h-6" />
                 </div>
                 <h2 className="text-xl font-bold">¡Enlace enviado!</h2>
                 <p className="text-sm font-mono text-gray-600">Revisa tu bandeja de entrada para entrar sin contraseña.</p>
                 <button 
                   onClick={() => setMagicLinkSent(false)}
                   className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black mt-2"
                 >
                   Volver a intentar
                 </button>
               </div>
            ) : showMfaChallenge ? (
              <form onSubmit={handleMfaVerify} className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--color-neon-fuchsia)] text-white rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4 shadow-brutal-sm">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold">Verificación Requerida</h2>
                  <p className="text-sm font-mono text-gray-500 mt-2">
                    Introduce el código de 6 dígitos de tu aplicación de autenticación.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="000000"
                    className="w-full brutal-input text-center text-3xl font-mono tracking-[0.5em] rounded-2xl"
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-[3px] border-[var(--color-neon-fuchsia)] p-4 rounded-2xl">
                    <p className="text-[var(--color-neon-fuchsia)] font-bold text-xs text-center">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isProcessing || mfaCode.length !== 6}
                  className="w-full brutal-btn bg-black text-white py-5 flex justify-center items-center gap-2 text-lg rounded-2xl disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Verificar Identidad
                      <ShieldCheck className="w-5 h-5 text-[var(--color-electric-cyan)]" />
                    </>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={() => { setShowMfaChallenge(false); setMfaCode(''); setError(''); }}
                  className="w-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </form>
            ) : (
              <form onSubmit={useMagicLink ? handleMagicLink : handleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500 text-left">Email Corporativo / Personal</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="email@ejemplo.com"
                      className="w-full brutal-input pl-12 font-mono text-sm rounded-2xl"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {!useMagicLink && (
                  <div>
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500 text-left">Contraseña</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
                  <label htmlFor="legal-checkbox" className="text-[10px] font-mono leading-tight text-gray-500 cursor-pointer select-none">
                    Acepto los <Link href="/legal/privacy" target="_blank" className="text-black font-bold underline">Términos de Privacidad</Link>, la <Link href="/legal/data" target="_blank" className="text-black font-bold underline">Política de Datos</Link> y el uso de <Link href="/legal/cookies" target="_blank" className="text-black font-bold underline">Cookies</Link> de Olianlabs.
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
                      onClick={() => { setUseMagicLink(!useMagicLink); setError(''); }}
                      className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--color-neon-fuchsia)] hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
                    >
                      {useMagicLink ? 'Usar contraseña normal' : 'Entrar sin contraseña (Magic Link)'}
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setUseMagicLink(false); setError(''); }}
                    className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
