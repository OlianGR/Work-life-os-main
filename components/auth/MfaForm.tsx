'use client';

import { KeyRound, Smartphone, ShieldCheck } from 'lucide-react';

interface MfaFormProps {
  isBackupMode: boolean;
  setIsBackupMode: (val: boolean) => void;
  mfaCode: string;
  setMfaCode: (val: string) => void;
  backupCode: string;
  setBackupCode: (val: string) => void;
  error: string;
  isProcessing: boolean;
  onVerify: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function MfaForm({
  isBackupMode,
  setIsBackupMode,
  mfaCode,
  setMfaCode,
  backupCode,
  setBackupCode,
  error,
  isProcessing,
  onVerify,
  onBack
}: MfaFormProps) {
  return (
    <form onSubmit={onVerify} className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-[var(--color-neon-fuchsia)] text-white rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4 shadow-brutal-sm">
          {isBackupMode ? <KeyRound className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
        </div>
        <h2 className="text-2xl font-bold">{isBackupMode ? 'Ingresar Código de Rescate' : 'Verificación Requerida'}</h2>
        <p className="text-sm font-mono text-gray-500 mt-2">
          {isBackupMode 
            ? 'Introduce uno de tus códigos de recuperación de 10 caracteres.' 
            : 'Introduce el código de 6 dígitos de tu aplicación de autenticación.'}
        </p>
      </div>

      {isBackupMode ? (
        <input
          type="text"
          maxLength={12}
          value={backupCode}
          onChange={(e) => {
            const val = e.target.value;
            setBackupCode(val);
            if (val.length > 7) setIsBackupMode(true);
          }}
          placeholder="abcdef1234"
          className="w-full brutal-input text-center text-3xl font-mono tracking-[0.2em] rounded-2xl normal-case"
          autoFocus
          required
        />
      ) : (
        <input
          type="text"
          maxLength={12}
          value={mfaCode}
          onChange={(e) => {
            const val = e.target.value;
            setMfaCode(val);
            if (val.length > 7) {
              setBackupCode(val);
              setIsBackupMode(true);
            }
          }}
          placeholder="000000"
          className="w-full brutal-input text-center text-3xl font-mono tracking-[0.5em] rounded-2xl"
          autoFocus
          required
        />
      )}

      {error && (
        <div className="bg-red-50 border-[3px] border-[var(--color-neon-fuchsia)] p-4 rounded-2xl">
          <p className="text-[var(--color-neon-fuchsia)] font-bold text-xs text-center">{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isProcessing || (isBackupMode ? backupCode.length !== 10 : mfaCode.length !== 6)}
        className="w-full brutal-btn bg-black text-white py-5 flex justify-center items-center gap-2 text-lg rounded-2xl disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {isBackupMode ? 'Verificar Código de Rescate' : 'Verificar Identidad'}
            <ShieldCheck className="w-5 h-5 text-[var(--color-electric-cyan)]" />
          </>
        )}
      </button>

      <div className="flex flex-col gap-3">
        <button 
          type="button"
          onClick={() => { setIsBackupMode(!isBackupMode); }}
          className="w-full text-xs font-black uppercase tracking-widest text-black hover:opacity-70 transition-colors underline decoration-2 underline-offset-4"
        >
          {isBackupMode ? 'Usar aplicación autenticadora en su lugar' : 'Perdí mi móvil. Usar código de rescate'}
        </button>

        <button 
          type="button"
          onClick={onBack}
          className="w-full text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </form>
  );
}
