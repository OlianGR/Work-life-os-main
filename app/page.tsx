'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, Clock, DollarSign, Activity, X, Calendar as CalendarIcon, ChevronRight, PlusCircle, BookOpen, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ExportModal } from '@/components/ExportModal';

const emptySubscribe = () => () => { };

export default function Dashboard() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { logs, profiles, legalLimit, holidayLimit } = useStore() as any;
  const [showHolidaysDetail, setShowHolidaysDetail] = useState(false);
  const [showWorkedDaysDetail, setShowWorkedDaysDetail] = useState(false);
  const [showLedgerDetail, setShowLedgerDetail] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  if (!isClient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-[6px] border-black border-t-[var(--color-neon-fuchsia)] rounded-full animate-spin shadow-brutal-sm" />
      <p className="font-mono text-xs font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Sistema...</p>
    </div>
  );

  // Calculate metrics
  const logsList = Object.values(logs) as any[];
  const workedDays = logsList.filter(log => log.type === 'worked' || log.isWorkedHoliday).length;
  const daysRemaining = legalLimit - workedDays;
  const progressPercent = Math.min(100, (workedDays / legalLimit) * 100);

  const workedHolidays = logsList.filter(log => log.isWorkedHoliday).length;
  const currentHolidayLimit = holidayLimit || 13;
  const holidayProgress = Math.min(100, (workedHolidays / currentHolidayLimit) * 100);

  const totalIncome = logsList.reduce((acc, log) => {
    if ((log.type === 'worked' || log.isWorkedHoliday) && log.profileId) {
      const profile = (profiles as any[]).find(p => p.id === log.profileId);
      return acc + (profile?.rate || 0);
    }
    return acc;
  }, 0);

  const avgDayRate = workedDays > 0 ? totalIncome / workedDays : 0;

  // Calculate real data for chart
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

  const data = monthlyData.filter((d, i) => i <= new Date().getMonth());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:justify-between md:items-end border-b-[4px] border-black pb-8 gap-6">
        <div className="flex-1">
          <div className="inline-block bg-[var(--color-citrus-yellow)] border-[3px] border-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-brutal-sm">
            Dashboard / Resumen
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income Card */}
        <div className="brutal-card p-4 xs:p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] sm:text-xs md:text-sm uppercase font-bold text-gray-500">Ingresos Totales</span>
            <span className="bg-[var(--color-electric-cyan)] text-[10px] md:text-xs font-bold px-2 py-1 rounded-md border-2 border-black">+12% YoY</span>
          </div>
          <div className="mt-8">
            <span className="text-3xl xs:text-4xl md:text-5xl brutal-heading break-all">{totalIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
          </div>
          <div className="mt-6 h-4 bg-gray-100 rounded-full overflow-hidden border-[3px] border-black shadow-brutal-sm">
            <div className="h-full bg-[var(--color-neon-fuchsia)] rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-[10px] md:text-xs font-mono text-black font-black mt-3 text-right">Objetivo: 100.000 €</p>
        </div>

        {/* Avg Day Rate Card */}
        <div className="brutal-card p-4 xs:p-6 bg-[var(--color-citrus-yellow)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] sm:text-xs md:text-sm uppercase font-bold text-gray-700">Tarifa Diaria Media</span>
            <Activity className="w-5 h-5 opacity-50" />
          </div>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-display font-bold break-all">{avgDayRate.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
            <span className="font-mono text-xs md:text-sm font-bold opacity-70">/día</span>
          </div>
          <p className="text-sm font-mono mt-4 font-bold">
            Máxima: <span className="bg-white px-2 py-1 rounded border-2 border-black ml-1">850 €</span>
          </p>
        </div>

        {/* Worked Days Card */}
        <div
          onClick={() => setShowWorkedDaysDetail(true)}
          className="brutal-card p-4 xs:p-6 bg-[var(--color-electric-cyan)] flex flex-col justify-between cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-transform group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] sm:text-xs uppercase font-bold text-gray-700 tracking-tighter">Días Trabajados</span>
            <Clock className="w-5 h-5 opacity-50 group-hover:scale-125 transition-transform" />
          </div>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-5xl brutal-heading">{workedDays}</span>
            <span className="font-mono text-lg font-black opacity-70">DÍAS</span>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-6 bg-white border-[3px] border-black rounded-full flex overflow-hidden shadow-brutal-sm">
              <div className="h-full bg-black rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest">{daysRemaining} RESTANTES</span>
          </div>
          <div className="mt-2 text-right opacity-50 font-mono text-[9px] font-bold uppercase text-black">Ver todos →</div>
        </div>

        {/* Worked Days Detail Modal */}
        <AnimatePresence>
          {showWorkedDaysDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWorkedDaysDetail(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative w-full max-w-2xl bg-white border-[3px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="bg-[var(--color-electric-cyan)] text-black p-6 border-b-[3px] border-black flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6" />
                    <div>
                      <h3 className="font-display font-black text-2xl uppercase tracking-tighter">Registro de Días Trabajados</h3>
                      <p className="font-mono text-xs opacity-60 uppercase font-bold tracking-widest">Actividad Total Acumulada</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWorkedDaysDetail(false)}
                    className="bg-black text-white p-2 border-2 border-black hover:bg-white hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                  <div className="space-y-4">
                    {(Object.values(logs) as any[])
                      .filter((log: any) => log.type === 'worked' || log.isWorkedHoliday)
                      .sort((a: any, b: any) => b.date.localeCompare(a.date))
                      .map((log: any, idx: number) => {
                        const profile = (profiles as any[]).find((p: any) => p.id === log.profileId);
                        return (
                          <div key={idx} className="brutal-card p-4 bg-white border-2 border-black flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex items-center gap-4">
                              <div className={`${log.isWorkedHoliday ? 'bg-[var(--color-neon-fuchsia)] text-white' : 'bg-[var(--color-electric-cyan)] text-black'} border-2 border-black p-2 font-mono font-black text-xs min-w-[100px] text-center shadow-brutal-sm rounded-xl`}>
                                {log.date}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {profile && (
                                    <span
                                      className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-2 border-black"
                                      style={{ backgroundColor: profile.color }}
                                    >
                                      {profile.name}
                                    </span>
                                  )}
                                  {log.isWorkedHoliday && (
                                    <span className="bg-black text-[var(--color-citrus-yellow)] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 border-black">
                                      Festivo Trabajado
                                    </span>
                                  )}
                                </div>
                                {log.notes && <p className="text-xs text-gray-500 font-mono italic mt-1">&quot;{log.notes}&quot;</p>}
                              </div>
                            </div>
                            <div className="font-mono font-black text-black">
                              {profile?.rate || 0} €
                            </div>
                          </div>
                        );
                      }
                      )}
                    {workedDays === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-mono text-gray-500 font-bold">Aún no has registrado ningún día trabajado.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t-[3px] border-black flex justify-between items-center">
                  <p className="font-mono text-[10px] font-bold text-gray-500 uppercase">
                    Total Acumulado: {workedDays} Días
                  </p>
                  <button
                    onClick={() => setShowWorkedDaysDetail(false)}
                    className="brutal-btn bg-black text-white px-6 py-2 text-xs"
                  >
                    Cerrar Detalle
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Worked Holidays Card */}
        <div
          onClick={() => setShowHolidaysDetail(true)}
          className="brutal-card p-4 xs:p-6 bg-[var(--color-neon-fuchsia)] text-white flex flex-col justify-between cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-transform group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-[10px] sm:text-sm uppercase font-bold opacity-80 tracking-tighter">Festivos Trabajados</span>
            <Activity className="w-5 h-5 opacity-50 group-hover:scale-125 transition-transform" />
          </div>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold">{workedHolidays}</span>
            <span className="font-mono text-sm font-bold opacity-70">/ {currentHolidayLimit}</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-4 bg-white/20 border-2 border-white rounded-full flex overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${holidayProgress}%` }}></div>
            </div>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest">{currentHolidayLimit - workedHolidays} FALTAN</span>
          </div>
          <div className="mt-2 text-right opacity-50 font-mono text-[9px] font-bold uppercase">Ver detalles →</div>
        </div>
      </div>

      {/* Holiday Detail Overlay/Modal */}
      <AnimatePresence>
        {showHolidaysDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHolidaysDetail(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white border-[3px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="bg-[var(--color-neon-fuchsia)] text-white p-6 border-b-[3px] border-black flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6" />
                  <div>
                    <h3 className="font-display font-black text-2xl uppercase tracking-tighter">Festivos/Domingos Trabajados</h3>
                    <p className="font-mono text-xs opacity-80 uppercase font-bold tracking-widest">Registro de Actividad Especial</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHolidaysDetail(false)}
                  className="bg-black text-white p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                <div className="space-y-4">
                  {(Object.values(logs) as any[])
                    .filter((log: any) => log.isWorkedHoliday)
                    .sort((a: any, b: any) => b.date.localeCompare(a.date))
                    .map((log: any, idx: number) => {
                      const profile = (profiles as any[]).find((p: any) => p.id === log.profileId);
                      return (
                        <div key={idx} className="brutal-card p-4 bg-white border-2 border-black flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                          <div className="flex items-center gap-4">
                            <div className="bg-[var(--color-citrus-yellow)] border-2 border-black p-2 font-mono font-black text-xs min-w-[100px] text-center shadow-brutal-sm rounded-xl">
                              {log.date}
                            </div>
                            <div>
                              <p className="font-bold flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                                  {profile?.name || 'ROL NO DEF.'}
                                </span>
                              </p>
                              {log.notes && <p className="text-xs text-gray-500 font-mono italic mt-1">&quot;{log.notes}&quot;</p>}
                            </div>
                          </div>
                          <div className="font-mono font-black text-[var(--color-neon-fuchsia)] border-b-2 border-dashed border-[var(--color-neon-fuchsia)]">
                            +{profile?.rate || 0} €
                          </div>
                        </div>
                      );
                    }
                    )}
                  {workedHolidays === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-mono text-gray-500 font-bold">No has registrado ningún festivo trabajado todavía.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t-[3px] border-black flex justify-between items-center">
                <p className="font-mono text-[10px] font-bold text-gray-500 uppercase">
                  Total Acumulado: {workedHolidays} Días Especiales
                </p>
                <button
                  onClick={() => setShowHolidaysDetail(false)}
                  className="brutal-btn bg-black text-white px-6 py-2 text-xs"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Mix */}
        <div className="brutal-card p-6 lg:col-span-1">
          <h3 className="font-display font-bold text-xl mb-6">Mix de Ingresos</h3>
          <div className="space-y-6">
            {profiles.map((profile: any) => {
              const profileIncome = Object.values(logs).reduce((acc: number, log: any) => {
                if ((log.type === 'worked' || log.isWorkedHoliday) && log.profileId === profile.id) return acc + profile.rate;
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
                    <span className="absolute left-2 top-1 text-[10px] font-bold">{percent.toFixed(0)}%</span>
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
              <BarChart data={data}>
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
                      {profile ? (profile.rate + (log.isWorkedHoliday ? 20 : 0)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
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

      <AnimatePresence>
        {showLedgerDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLedgerDetail(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[95vh] rounded-none"
            >
              <header className="p-4 md:p-6 bg-black text-white flex justify-between items-center border-b-[4px] border-black shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 bg-[var(--color-citrus-yellow)] border-[3px] border-white shadow-brutal-sm hidden xs:block">
                    <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-5xl brutal-heading tracking-tighter leading-none">Libro Mayor</h2>
                    <p className="font-mono text-[9px] md:text-xs text-[var(--color-electric-cyan)] uppercase font-black tracking-widest mt-1">Transacciones e Ingresos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLedgerDetail(false)}
                  className="p-2 md:p-3 bg-white text-black border-[3px] border-black hover:bg-[var(--color-neon-fuchsia)] hover:text-white transition-colors focus-ring"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </header>

              <div className="overflow-y-auto flex-1 bg-[var(--color-base-bg)] scroll-smooth pb-8">
                {/* Desktop View Table */}
                <div className="hidden lg:block">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-gray-100 border-b-[4px] border-black font-mono text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <th className="p-6 border-r-[3px] border-black bg-gray-50/90 backdrop-blur">Fecha</th>
                        <th className="p-6 border-r-[3px] border-black bg-gray-50/90 backdrop-blur">Estado / Perfil</th>
                        <th className="p-6 border-r-[3px] border-black bg-gray-50/90 backdrop-blur">Concepto</th>
                        <th className="p-6 text-right bg-gray-50/90 backdrop-blur">Importe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.values(logs) as any[])
                        .sort((a: any, b: any) => b.date.localeCompare(a.date))
                        .map((log, idx) => {
                          const profile = (profiles as any[]).find((p: any) => p.id === log.profileId);
                          const isActive = log.type === 'worked' || log.isWorkedHoliday;

                          return (
                            <tr key={idx} className={`border-b-2 border-black/10 hover:bg-black/5 transition-colors group ${isActive ? 'bg-white' : 'bg-gray-50/30'}`}>
                              <td className="p-6 border-r-2 border-dashed border-black/10 font-mono font-black text-sm group-hover:bg-white">{log.date}</td>
                              <td className="p-6 border-r-2 border-dashed border-black/10">
                                {profile ? (
                                  <span
                                    className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] border-2 border-black shadow-brutal-xs inline-block"
                                    style={{ backgroundColor: profile.color }}
                                  >
                                    {profile.name}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest border-2 border-gray-200">
                                    {log.type === 'worked' ? 'ORDI.' : log.isWorkedHoliday ? 'FEST.' : log.type === 'holiday' ? 'FESTIVO' : 'LIBRE'}
                                  </span>
                                )}
                              </td>
                              <td className="p-6 border-r-2 border-dashed border-black/10">
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-xs font-black uppercase tracking-wide ${isActive ? 'text-black' : 'text-gray-400'}`}>
                                    {log.isWorkedHoliday ? 'Jornada Festiva' : isActive ? 'Jornada Ordinaria' : 'Día Inactivo'}
                                  </span>
                                  {log.notes && <p className="text-[10px] text-gray-400 font-mono italic max-w-xs truncate">&quot;{log.notes}&quot;</p>}
                                </div>
                              </td>
                              <td className={`p-6 text-right font-mono font-black text-xl group-hover:scale-110 transition-transform origin-right ${isActive ? 'text-black' : 'text-gray-300'}`}>
                                {profile ? (profile.rate + (log.isWorkedHoliday ? 20 : 0)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {(Object.values(logs) as any[])
                    .sort((a: any, b: any) => b.date.localeCompare(a.date))
                    .map((log, idx) => {
                      const profile = (profiles as any[]).find((p: any) => p.id === log.profileId);
                      const isActive = log.type === 'worked' || log.isWorkedHoliday;

                      return (
                        <div key={idx} className={`p-4 border-[3px] border-black bg-white shadow-brutal-sm ${!isActive && 'opacity-60 grayscale'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-mono font-black text-xs bg-black text-white px-2 py-1">{log.date}</span>
                            <span className="text-lg font-mono font-black">
                              {profile ? (profile.rate + (log.isWorkedHoliday ? 20 : 0)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {profile ? (
                              <span
                                className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 border-black"
                                style={{ backgroundColor: profile.color }}
                              >
                                {profile.name}
                              </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-black uppercase tracking-widest border-2 border-black text-gray-400">
                                  {log.type === 'worked' ? 'ORDI.' : log.isWorkedHoliday ? 'FEST.' : log.type === 'holiday' ? 'FESTIVO' : 'LIBRE'}
                                </span>
                            )}
                            <span className={`text-[9px] font-black uppercase opacity-60`}>
                              {log.isWorkedHoliday ? 'FESTIVO' : isActive ? 'ORDINARIA' : 'INACTIVO'}
                            </span>
                          </div>
                          {log.notes && <p className="text-[10px] text-gray-500 font-mono italic border-t border-black/5 pt-2 mt-2">&quot;{log.notes}&quot;</p>}
                        </div>
                      );
                    })}
                </div>
              </div>

              <footer className="p-4 md:p-6 bg-gray-50 border-t-[4px] border-black shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center w-full sm:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono font-black uppercase text-gray-400">Registros Totales</span>
                      <span className="font-display font-black text-xl leading-none">{Object.keys(logs).length}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono font-black uppercase text-gray-400">Total Ingresos Brutos</span>
                      <span className="font-display font-black text-xl leading-none text-[var(--color-neon-fuchsia)]">
                        {totalIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                 </div>
                <button
                  onClick={() => setShowLedgerDetail(false)}
                  className="brutal-btn bg-black text-white px-8 py-3 uppercase text-sm font-black tracking-widest w-full sm:w-auto hover:bg-[var(--color-citrus-yellow)] hover:text-black transition-colors"
                >
                  Cerrar Reporte
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </motion.div>
  );
}
