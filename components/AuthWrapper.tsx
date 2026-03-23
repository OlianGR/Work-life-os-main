'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { Lock, ChevronDown, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Auth Components
import { LandingHero } from './auth/LandingHero';
import { MfaForm } from './auth/MfaForm';
import { AuthForm } from './auth/AuthForm';
import { usePathname } from 'next/navigation';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showLogin, setShowLogin] = useState(false);
  // ... existing states ...
  const [isRegister, setIsRegister] = useState(false);
  const { user, setUser, fetchUserData, initHolidays2026 } = useStore();
  
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
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [backupCode, setBackupCode] = useState('');

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

  const isPublicPath = 
    (pathname.startsWith('/legal/') || 
     pathname === '/apoyar-proyecto' ||
     pathname === '/about');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    // Check if we are in a recovery flow (user clicked reset password link)
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      setIsRecoveryMode(true);
      setShowLogin(true);
    }
  }, []);

  if (user || isPublicPath) {
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


  const handleResetPassword = async () => {
    if (!email) {
      setError('Escribe tu email para enviarte el enlace de recuperación.');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password-mode`,
      });

      if (error) throw error;
      alert('¡Enlace enviado! Revisa tu bandeja de entrada para cambiar tu contraseña.');
    } catch (err: any) {
      setError('Error al enviar el enlace. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      alert('¡Contraseña actualizada con éxito!');
      setIsRecoveryMode(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            data: {
              full_name: email.split('@')[0], // Basic placeholder
            }
          }
        });
        if (error) throw error;
        alert('¡Bienvenido! Revisa tu correo electrónico para verificar tu cuenta y empezar a trabajar.');
        setIsRegister(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
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
          const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
          if (!factorsError && factors.all.length > 0) {
            const factor = factors.all.find(f => f.status === 'verified');
            if (factor) {
              setMfaFactorId(factor.id);
              setShowMfaChallenge(true);
              setIsProcessing(false);
              return;
            }
          }
        }
      }
    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('rate limit')) {
        setError('Demasiados intentos. Por favor espera unos minutos.');
      } else if (message.includes('Credenciales') || message.includes('invalid')) {
        setError('Acceso denegado. Email o contraseña no válidos.');
      } else if (message.includes('verificar')) {
        setError('Cuenta pendiente de verificación por email.');
      } else if (message.includes('already registered')) {
        setError('Se ha producido un error. Si tienes cuenta, inicia sesión.');
      } else {
        setError(message || 'Se ha producido un error en la autenticación.');
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

  const handleBackupCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    try {
      if (!email) {
        throw new Error("El correo electrónico es necesario para la verificación.");
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-backup-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          backupCode: backupCode.toLowerCase() 
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || `Error del servidor (${response.status})`);
      }

      setIsBackupMode(false);
      setShowMfaChallenge(false);
      setBackupCode('');
      setError('MFA desactivado correctamente. Ya puedes iniciar sesión sin el móvil.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message || 'Código incorrecto u obsoleto.');
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
              onClick={() => { setShowLogin(false); setMagicLinkSent(false); setShowMfaChallenge(false); }}
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
              {showMfaChallenge ? 'Seguridad Extra' : (isRecoveryMode ? 'Nueva Contraseña' : (isRegister ? 'Crear Cuenta' : 'Bienvenido de nuevo'))}
            </h1>
            <p className="text-center font-mono text-sm text-gray-500 mb-8">
              {showMfaChallenge ? 'Protege tu cuenta' : (isRecoveryMode ? 'Establece tu nueva contraseña de acceso' : (isRegister 
                ? 'Regístrate para sincronizar tus datos en la nube' 
                : 'Introduce tus credenciales para acceder'))}
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
              <MfaForm 
                isBackupMode={isBackupMode}
                setIsBackupMode={setIsBackupMode}
                mfaCode={mfaCode}
                setMfaCode={(val) => { setMfaCode(val); setError(''); }}
                backupCode={backupCode}
                setBackupCode={(val) => { setBackupCode(val); setError(''); }}
                error={error}
                isProcessing={isProcessing}
                onVerify={isBackupMode ? handleBackupCodeVerify : handleMfaVerify}
                onBack={() => { setShowMfaChallenge(false); setError(''); }}
              />
            ) : (
              <AuthForm 
                email={email}
                setEmail={(val) => { setEmail(val); setError(''); }}
                password={password}
                setPassword={(val) => { setPassword(val); setError(''); }}
                confirmPassword={confirmPassword}
                setConfirmPassword={(val) => { setConfirmPassword(val); setError(''); }}
                isRegister={isRegister || isRecoveryMode}
                setIsRegister={setIsRegister}
                useMagicLink={useMagicLink && !isRecoveryMode}
                setUseMagicLink={setUseMagicLink}
                legalAccepted={legalAccepted}
                setLegalAccepted={setLegalAccepted}
                error={error}
                isProcessing={isProcessing}
                onSubmit={isRecoveryMode ? handleUpdatePassword : (useMagicLink ? handleMagicLink : handleSubmit)}
                onResetPassword={handleResetPassword}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
