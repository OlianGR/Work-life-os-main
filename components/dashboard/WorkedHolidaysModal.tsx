'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { calculateDailyIncome } from '@/lib/calculations';

interface WorkedHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: any;
  profiles: any[];
  workedHolidays: number;
}

export function WorkedHolidaysModal({ isOpen, onClose, logs, profiles, workedHolidays }: WorkedHolidaysModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                  <h3 className="font-display font-black text-2xl uppercase tracking-tighter">Festivos Trabajados</h3>
                  <p className="font-mono text-xs opacity-80 uppercase font-bold tracking-widest">Registro de Actividad Especial</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-black text-white p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
              <div className="space-y-4">
                {(Object.values(logs) as any[])
                  .filter((log: any) => !!log.isWorkedHoliday)
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
                            <div className="font-bold flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                                {profile?.name || 'ROL NO DEF.'}
                              </span>
                            </div>
                            {log.notes && <p className="text-xs text-gray-500 font-mono italic mt-1">&quot;{log.notes}&quot;</p>}
                          </div>
                        </div>
                        <div className="font-mono font-black text-[var(--color-neon-fuchsia)] border-b-2 border-dashed border-[var(--color-neon-fuchsia)]">
                          +{calculateDailyIncome(log, profile)} €
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
                Total Acumulado: {workedHolidays} Festivos Trabajados
              </p>
              <button
                onClick={onClose}
                className="brutal-btn bg-black text-white px-6 py-2 text-xs"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
