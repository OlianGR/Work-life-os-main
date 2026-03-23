'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen } from 'lucide-react';
import { calculateDailyIncome } from '@/lib/calculations';

interface LedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: any;
  profiles: any[];
  totalIncome: number;
}

export function LedgerModal({ isOpen, onClose, logs, profiles, totalIncome }: LedgerModalProps) {
  const totalPositionPlus = Object.values(logs).reduce((acc: number, log: any) => {
    if ((log.type === 'worked' || log.isWorkedHoliday) && log.profileId) {
      const profile = profiles.find((p: any) => p.id === log.profileId);
      return acc + (profile?.positionPlus || 0);
    }
    return acc;
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                onClick={onClose}
                className="p-2 md:p-3 bg-white text-black border-[3px] border-black hover:bg-[var(--color-neon-fuchsia)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-black"
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
                              {calculateDailyIncome(log, profile).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
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
                            {calculateDailyIncome(log, profile).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
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
                    <span className="text-[8px] font-mono font-black uppercase text-gray-400">Total Plus Puesto</span>
                    <span className="font-display font-black text-xl leading-none text-[var(--color-electric-cyan)]">
                      {totalPositionPlus.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-black uppercase text-gray-400">Total Ingresos Brutos</span>
                    <span className="font-display font-black text-xl leading-none text-[var(--color-neon-fuchsia)]">
                      {totalIncome.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
               </div>
              <button
                onClick={onClose}
                className="brutal-btn bg-black text-white px-8 py-3 uppercase text-sm font-black tracking-widest w-full sm:w-auto hover:bg-[var(--color-citrus-yellow)] hover:text-black transition-colors"
              >
                Cerrar Reporte
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
