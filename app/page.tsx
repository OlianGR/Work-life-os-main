'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useStore } from '@/store/useStore';
import { format, subMonths, setDate } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Activity, Clock, FileDown, ShieldCheck, Heart, BookOpen, Briefcase, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ExportModal } from '@/components/ExportModal';
import { supabase } from '@/lib/supabase';
import { calculateTotalIncome, getDashboardStats, calculateDailyIncome } from '@/lib/calculations';

// New Dashboard Components
import { StatsCard } from '@/components/dashboard/StatsCard';
import { WorkedDaysModal } from '@/components/dashboard/WorkedDaysModal';
import { WorkedHolidaysModal } from '@/components/dashboard/WorkedHolidaysModal';
import { LedgerModal } from '@/components/dashboard/LedgerModal';

const emptySubscribe = () => () => { };

export default function Dashboard() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { logs, profiles, legalLimit, holidayLimit } = useStore() as any;
  
  // Modal States
  const [showHolidaysDetail, setShowHolidaysDetail] = useState(false);
  const [showWorkedDaysDetail, setShowWorkedDaysDetail] = useState(false);
  const [showLedgerDetail, setShowLedgerDetail] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [coffeeCount, setCoffeeCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('site_stats')
        .select('value')
        .eq('name', 'coffees_received')
        .single();
      if (data) setCoffeeCount(data.value);
    };
    fetchStats();
  }, []);

  if (!isClient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-[6px] border-black border-t-[var(--color-neon-fuchsia)] rounded-full animate-spin shadow-brutal-sm" />
      <p className="font-mono text-xs font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Sistema...</p>
    </div>
  );

  // --- BUSINESS LOGIC (Extracted for readability) ---
  const logsList = Object.values(logs) as any[];
  const stats = getDashboardStats(logsList, profiles, legalLimit, holidayLimit);
  
  const { 
    workedDays, 
    daysRemaining, 
    progressPercent, 
    workedHolidays, 
    holidayProgress, 
    totalIncome, 
    totalPositionPlus, 
    avgDayRate 
  } = stats;

  // Chart Data Calculation
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const currentYear = new Date().getFullYear();
  
  const monthlyData = months.map((month, index) => {
    const monthStr = (index + 1).toString().padStart(2, '0');
    const income = logsList.reduce((acc, log) => {
      if (log.date.startsWith(`${currentYear}-${monthStr}`) && (log.type === 'worked' || log.isWorkedHoliday) && log.profileId) {
        const profile = (profiles as any[]).find(p => p.id === log.profileId);
        return acc + (profile?.rate || 0);
      }
      return acc;
    }, 0);
    return { name: month, val: income };
  });

  const chartData = monthlyData.filter((_, i) => i <= new Date().getMonth());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b-[4px] border-black pb-8 gap-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="inline-block bg-[var(--color-citrus-yellow)] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-brutal-sm">
              Dashboard / Resumen
            </div>
            {coffeeCount !== null && (
              <Link href="/apoyar-proyecto" className="group">
                <div className="flex items-center gap-2 bg-white border-[2px] border-black px-3 py-1 rounded-full shadow-brutal-xs transform group-hover:scale-105 transition-transform">
                  <Heart className="w-3 h-3 text-[var(--color-neon-fuchsia)] fill-[var(--color-neon-fuchsia)] animate-pulse" />
                  <span className="font-mono text-[9px] font-black uppercase tracking-tight">❤️ {coffeeCount} cafés recibidos</span>
                </div>
              </Link>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight">
              <ShieldCheck className="w-3 h-3 text-[var(--color-electric-cyan)]" />
              Independiente & Sin Ads
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl brutal-heading text-black leading-tight">
            Work Life <span className="text-[var(--color-neon-fuchsia)]">OS</span>
          </h1>
          <p className="text-gray-600 mt-2 font-mono text-xs md:text-sm font-bold max-w-xl">
            Control de ingresos, límites legales y auditoría de nóminas con IA.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link href="/auditor" className="brutal-btn bg-black text-white px-6 py-3 md:px-8 md:py-4 flex items-center justify-center gap-3 group w-full sm:w-auto">
            <Activity className="w-5 h-5 group-hover:rotate-12 transition-transform text-[var(--color-electric-cyan)]" />
            <span>Auditar</span>
          </Link>
          <button 
            onClick={() => setShowExportModal(true)}
            className="brutal-btn bg-white text-black px-6 py-3 md:px-8 md:py-4 flex items-center justify-center gap-2 w-full sm:w-auto border-dashed"
          >
            <FileDown className="w-5 h-5" />
            <span>Exportar</span>
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Ingresos Totales"
          value={totalIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          progressText={`PLUS PUESTO: ${totalPositionPlus.toLocaleString('es-ES')} €`}
          backgroundColor="var(--color-electric-cyan)"
          className="text-black"
          icon={<TrendingUp className="w-5 h-5 opacity-50" />}
        />
        
        <StatsCard 
          title="Tarifa Diaria Media"
          value={avgDayRate.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          subtitle="/día"
          backgroundColor="var(--color-citrus-yellow)"
          icon={<Activity className="w-5 h-5 opacity-50" />}
        />
        
        <StatsCard 
          title="Días Trabajados"
          value={workedDays}
          subtitle="DÍAS"
          backgroundColor="var(--color-electric-cyan)"
          icon={<Clock className="w-5 h-5" />}
          progress={progressPercent}
          progressText={`${daysRemaining} RESTANTES`}
          onClick={() => setShowWorkedDaysDetail(true)}
        />

        <StatsCard 
          title="Festivos Trabajados"
          value={workedHolidays}
          subtitle={`/ ${holidayLimit || 13}`}
          backgroundColor="var(--color-neon-fuchsia)"
          className="text-white"
          icon={<Activity className="w-5 h-5" />}
          progress={holidayProgress}
          progressText={`${(holidayLimit || 13) - workedHolidays} FALTAN`}
          onClick={() => setShowHolidaysDetail(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Mix */}
        <div className="brutal-card p-6 lg:col-span-1">
          <h3 className="font-display font-bold text-xl mb-6">Mix de Ingresos</h3>
          <div className="space-y-6">
            {[...profiles].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((profile: any) => {
              let count = 0;
              const profileIncome = Object.values(logs).reduce((acc: number, log: any) => {
                if ((log.type === 'worked' || log.isWorkedHoliday) && log.profileId === profile.id) {
                  count++;
                  return acc + calculateDailyIncome(log, profile);
                }
                return acc;
              }, 0);
              const percent = totalIncome > 0 ? (profileIncome / totalIncome) * 100 : 0;

              return (
                <div key={profile.id}>
                  <div className="flex justify-between font-mono text-sm font-bold mb-2">
                    <span>{profile.name}</span>
                    <span>{profileIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                  <div className="h-6 bg-gray-100 border-2 border-black rounded-full overflow-hidden relative">
                    <div
                      className="h-full border-r-2 border-black"
                      style={{ width: `${percent}%`, backgroundColor: profile.color }}
                    ></div>
                    <span className="absolute left-2 top-1 text-[10px] font-bold">{count} {count === 1 ? 'vez' : 'veces'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Velocity Chart */}
        <div className="brutal-card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-xl mb-6">Velocidad Mensual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 'bold' }} axisLine={{ strokeWidth: 2 }} tickLine={{ strokeWidth: 2 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ border: '3px solid black', borderRadius: '8px', boxShadow: '4px 4px 0px black', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
                  formatter={(value: any) => [`${value} €`, 'Ingresos']}
                />
                <Bar dataKey="val" fill="var(--color-neon-fuchsia)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="brutal-card p-0 overflow-hidden">
        <div className="p-6 border-b-brutal border-black flex justify-between items-center bg-white">
          <h3 className="font-display font-bold text-xl">Registros Recientes</h3>
          <button
            onClick={() => setShowLedgerDetail(true)}
            className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-[var(--color-neon-fuchsia)] transition-colors"
          >
            Ver Libro Mayor Completo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-[3px] border-black font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <th className="p-4 border-r-[3px] border-black">Fecha</th>
                <th className="p-4 border-r-[3px] border-black">Rol / Perfil</th>
                <th className="p-4 border-r-[3px] border-black hidden md:table-cell">Notas</th>
                <th className="p-4 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(logs).sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 5).map((log: any, i: number) => {
                const profile = profiles.find((p: any) => p.id === log.profileId);
                return (
                  <tr key={i} className="border-b-[2px] border-black hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r-[2px] border-black font-mono text-xs md:text-sm font-black italic">{log.date}</td>
                    <td className="p-4 border-r-[2px] border-black">
                      {profile ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className="px-2 py-0.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-[2px] border-black shadow-brutal-xs inline-block text-center"
                            style={{ backgroundColor: profile.color }}
                          >
                            {profile.name}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest border-[2px] border-gray-300">
                          {log.type === 'worked' ? 'worked' : log.isWorkedHoliday ? 'FEST. TRABAJADO' : log.type === 'holiday' ? 'festivo' : 'LIBRE'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 border-r-[2px] border-black text-xs font-mono text-gray-400 italic hidden md:table-cell">
                      {log.notes || '—'}
                    </td>
                    <td className="p-4 text-right font-mono font-black text-sm md:text-base">
                      {profile ? calculateDailyIncome(log, profile).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
                    </td>
                  </tr>
                );
              })}
              {Object.keys(logs).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center font-mono text-gray-500">Aún no hay registros. Ve al Calendario para registrar días.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-center">
          <button
            onClick={() => setShowLedgerDetail(true)}
            className="w-full brutal-btn bg-white text-black py-4 flex items-center justify-center gap-3 group"
          >
            <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm">Ver Libro Mayor Completo</span>
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      <WorkedDaysModal 
        isOpen={showWorkedDaysDetail} 
        onClose={() => setShowWorkedDaysDetail(false)} 
        logs={logs} 
        profiles={profiles} 
        workedDays={workedDays} 
      />
      
      <WorkedHolidaysModal 
        isOpen={showHolidaysDetail} 
        onClose={() => setShowHolidaysDetail(false)} 
        logs={logs} 
        profiles={profiles} 
        workedHolidays={workedHolidays} 
      />

      <LedgerModal 
        isOpen={showLedgerDetail} 
        onClose={() => setShowLedgerDetail(false)} 
        logs={logs} 
        profiles={profiles} 
        totalIncome={totalIncome} 
      />

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </motion.div>
  );
}
