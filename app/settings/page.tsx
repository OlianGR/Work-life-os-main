'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useStore, ShiftProfile } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ShieldCheck, ShieldAlert, Key, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const emptySubscribe = () => () => { };

export default function SettingsPage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { profiles, addProfile, updateProfile, deleteProfile, legalLimit, setLegalLimit, holidayLimit, setHolidayLimit } = useStore();
  const [newProfile, setNewProfile] = useState<Omit<ShiftProfile, 'id'>>({
    name: '',
    rate: 0,
    positionPlus: 0,
    color: 'var(--color-electric-cyan)'
  });
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaEnroll, setShowMfaEnroll] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    // Check if MFA is already enabled
    supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!error && data?.all && data.all.length > 0) {
        const verified = data.all.some(f => f.status === 'verified');
        setMfaEnabled(verified);
      }
    });
  }, []);

  const handleEnrollMFA = async () => {
    if (isEnrolling) return;
    setIsEnrolling(true);
    setMfaError('');
    try {
      // First, check for existing factors to clean up unverified ones
      // This prevents 422 errors when trying to enroll again
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.all) {
        const unverified = factors.all.filter(f => f.status === 'unverified');
        for (const factor of unverified) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Work Life OS',
        friendlyName: 'Work Life OS User'
      });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setMfaFactorId(data.id);
      setShowMfaEnroll(true);
    } catch (err: any) {
      setMfaError(err.message || 'Error al iniciar MFA');
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyMFA = async () => {
    setMfaError('');
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.data.id,
        code: mfaCode
      });
      if (verify.error) throw verify.error;

      setMfaEnabled(true);
      setShowMfaEnroll(false);
      alert('¡MFA Activado correctamente!');
    } catch (err: any) {
      setMfaError(err.message || 'Código incorrecto');
    }
  };

  const handleUnenrollMFA = async () => {
    if (!confirm('¿Estás seguro de desactivar la seguridad avanzada MFA?')) return;
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      if (data?.all) {
        for (const f of data.all) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }
      setMfaEnabled(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isClient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-[6px] border-black border-t-[var(--color-electric-cyan)] rounded-full animate-spin shadow-brutal-sm" />
      <p className="font-mono text-xs font-black uppercase tracking-[0.3em] animate-pulse">Accediendo a Ajustes...</p>
    </div>
  );

  const handleAdd = () => {
    if (newProfile.name && (newProfile.rate > 0 || newProfile.positionPlus > 0)) {
      addProfile(newProfile);
      setNewProfile({ name: '', rate: 0, positionPlus: 0, color: 'var(--color-electric-cyan)' });
    }
  };

  const colors = [
    'var(--color-neon-fuchsia)',
    'var(--color-electric-cyan)',
    'var(--color-citrus-yellow)',
    'var(--color-royal-purple)',
    '#A0C4FF',
    '#FFC6FF',
    '#CAFFBF',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[4px] border-black pb-6 gap-4">
        <div>
          <div className="inline-block bg-[var(--color-neon-fuchsia)] text-white border-[3px] border-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-brutal-sm">
            Ajustes
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tighter uppercase leading-none">Configuración de Roles</h1>
          <p className="text-gray-600 mt-4 font-mono text-sm font-bold uppercase tracking-wide">Define tus roles. Establece tus tarifas diarias. Haz un seguimiento de tu valor al céntimo.</p>
        </div>
      </header>

      <div className="space-y-6">
        {profiles.map((profile: ShiftProfile) => (
          <div key={profile.id} className="brutal-card p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center bg-white border-[3px] border-black">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col md:grid md:grid-cols-3 md:gap-4">
                <div className="flex-1">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Nombre del Rol</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => updateProfile(profile.id, { name: e.target.value })}
                    className="w-full brutal-input font-bold"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Incentivo/Tarifa</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">€</span>
                    <input
                      type="number"
                      value={profile.rate}
                      onChange={e => updateProfile(profile.id, { rate: Number(e.target.value) })}
                      className="w-full brutal-input pl-8 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Plus Puesto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">€</span>
                    <input
                      type="number"
                      value={profile.positionPlus}
                      onChange={e => updateProfile(profile.id, { positionPlus: Number(e.target.value) })}
                      className="w-full brutal-input pl-8 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Etiqueta de Color</label>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => updateProfile(profile.id, { color: c })}
                      className={`w-8 h-8 rounded-full border-2 border-black transition-transform ${profile.color === c ? 'scale-125 shadow-brutal-sm ring-2 ring-black ring-offset-2' : 'hover:scale-110'
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => deleteProfile(profile.id)}
              className="brutal-btn p-4 bg-gray-100 hover:bg-[var(--color-neon-fuchsia)] hover:text-white transition-colors self-end md:self-auto rounded-xl flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* Add New Profile Section */}
        <div className="brutal-card p-6 border-dashed border-2 border-gray-400 bg-transparent shadow-none hover:border-black hover:bg-white transition-all">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col md:grid md:grid-cols-3 md:gap-4">
                <div className="flex-1">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Nombre del Nuevo Rol</label>
                  <input
                    type="text"
                    value={newProfile.name}
                    onChange={e => setNewProfile({ ...newProfile, name: e.target.value })}
                    placeholder="ej. Consultor"
                    className="w-full brutal-input font-bold"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Tarifa</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">€</span>
                    <input
                      type="number"
                      value={newProfile.rate || ''}
                      onChange={e => setNewProfile({ ...newProfile, rate: Number(e.target.value) })}
                      placeholder="0.00"
                      className="w-full brutal-input pl-8 font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Plus P.</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-400">€</span>
                    <input
                      type="number"
                      value={newProfile.positionPlus || ''}
                      onChange={e => setNewProfile({ ...newProfile, positionPlus: Number(e.target.value) })}
                      placeholder="0.00"
                      className="w-full brutal-input pl-8 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-widest block mb-2 text-gray-500">Etiqueta de Color</label>
                <div className="flex gap-3">
                  {colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewProfile({ ...newProfile, color: c })}
                      className={`w-8 h-8 rounded-full border-2 border-black transition-transform ${newProfile.color === c ? 'scale-125 shadow-brutal-sm ring-2 ring-black ring-offset-2' : 'hover:scale-110'
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newProfile.name || newProfile.rate <= 0}
              className="brutal-btn p-5 bg-black text-white self-end md:self-auto flex items-center gap-2 rounded-2xl w-full md:w-auto justify-center"
            >
              <Plus className="w-6 h-6" />
              <span className="md:hidden font-black uppercase text-sm">Añadir Rol</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="brutal-card p-6 bg-[var(--color-citrus-yellow)] flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-xl">Límite Legal</h3>
            <p className="font-mono text-sm text-gray-700">Días laborables máximos permitidos por año.</p>
          </div>
          <input
            type="number"
            value={legalLimit}
            onChange={(e) => setLegalLimit(Number(e.target.value))}
            className="w-24 font-display font-bold text-3xl bg-white px-2 py-2 rounded-2xl border-[3px] border-black shadow-brutal-sm text-center"
          />
        </div>

        <div className="brutal-card p-6 bg-[var(--color-neon-fuchsia)] text-white flex justify-between items-center">
          <div>
            <h3 className="font-display font-bold text-xl">Límite de Festivos</h3>
            <p className="font-mono text-sm opacity-80">Total de festivos nacionales a rastrear.</p>
          </div>
          <input
            type="number"
            value={holidayLimit}
            onChange={(e) => setHolidayLimit(Number(e.target.value))}
            className="w-24 font-display font-bold text-3xl bg-white text-black px-2 py-2 rounded-2xl border-[3px] border-black shadow-brutal-sm text-center"
          />
        </div>
      </div>

      <div className="pt-8 border-t-[4px] border-black">
        <div className="flex items-center gap-3 mb-6 font-display">
          <ShieldCheck className="w-8 h-8 text-[var(--color-electric-cyan)]" />
          <h2 className="text-3xl font-bold uppercase tracking-tight">Seguridad Avanzada</h2>
        </div>

        <div className="brutal-card p-8 bg-white border-[3px] border-black relative overflow-hidden">
          {mfaEnabled ? (
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-[3px] border-black shadow-brutal-sm">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-bold text-2xl uppercase">Autenticación en dos pasos activa</h3>
                  <p className="font-mono text-sm text-gray-500 max-w-md text-left">Tu cuenta está protegida con una capa adicional de seguridad. Se requerirá un código de tu móvil para entrar.</p>
                </div>
              </div>
              <button
                onClick={handleUnenrollMFA}
                className="brutal-btn px-6 py-3 bg-[var(--color-neon-fuchsia)] text-white font-mono text-xs font-bold uppercase tracking-widest"
              >
                Desactivar MFA
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border-brutal border-black shadow-brutal-sm">
                  <ShieldAlert className="w-8 h-8 text-[var(--color-neon-fuchsia)]" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-bold text-2xl uppercase">Seguridad básica detectada</h3>
                  <p className="font-mono text-sm text-gray-500 max-w-md text-left">Te recomendamos activar la autenticación de dos factores (2FA) para proteger tus datos de nómina y trabajo.</p>
                </div>
              </div>
              <button
                onClick={handleEnrollMFA}
                disabled={isEnrolling}
                className="brutal-btn px-8 py-4 bg-[var(--color-citrus-yellow)] font-mono text-sm font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                {isEnrolling ? (
                  <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Activar 2FA
                  </>
                )}
              </button>
            </div>
          )}

          {/* MFA Enrollment Modal Overlay */}
          {showMfaEnroll && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMfaEnroll(false)} />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="brutal-card p-8 bg-white max-w-md w-full relative z-[101] text-center"
              >
                <h3 className="text-2xl font-display font-bold mb-4 uppercase">Configurar Autenticador</h3>
                <p className="text-sm font-mono text-gray-500 mb-6">Escanea este código con Google Authenticator o Authy.</p>

                <div className="bg-white p-4 border-2 border-black inline-block mb-6 shadow-brutal-sm">
                  {qrCode && (
                    <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-left">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-widest block mb-1 text-gray-500">Introduce el código de 6 dígitos</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="000000"
                      className="w-full brutal-input text-center text-2xl font-mono tracking-[0.5em]"
                    />
                  </div>

                  {mfaError && <p className="text-[var(--color-neon-fuchsia)] font-bold text-xs">{mfaError}</p>}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowMfaEnroll(false)}
                      className="flex-1 brutal-btn py-3 bg-gray-100 font-mono text-xs font-bold uppercase tracking-widest"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={verifyMFA}
                      className="flex-1 brutal-btn py-3 bg-black text-white font-mono text-xs font-bold uppercase tracking-widest"
                    >
                      Verificar y Activar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
