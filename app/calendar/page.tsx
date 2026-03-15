'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, subDays } from 'date-fns';
import { format as dateFnsFormat } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

const emptySubscribe = () => () => { };

const format = (date: Date, formatStr: string) => {
  return dateFnsFormat(date, formatStr, { locale: es });
};

export default function CalendarPage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { logs = {}, profiles = [], logDay, removeLog } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isClient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-[6px] border-black border-t-[var(--color-royal-purple)] rounded-full animate-spin shadow-brutal-sm" />
      <p className="font-mono text-xs font-black uppercase tracking-[0.3em] animate-pulse">Abriendo Cuadrícula...</p>
    </div>
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calculate off days in the current visible month
  const offDaysCount = days.reduce((count: number, day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const log = logs ? (logs as any)[dateStr] : null;
    if (log?.type === 'off') {
      return count + 1;
    }
    return count;
  }, 0);

  // Assuming a target of 8+ days off per month (approx 2 per week)
  const isRestAdequate = offDaysCount >= 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[3px] border-black pb-6 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl brutal-heading text-black">La Cuadrícula</h1>
          <p className="text-gray-800 mt-2 md:mt-4 font-mono text-xs md:text-sm font-bold uppercase">Rastreador de Calendario Visual - Límite 221 Días.</p>
        </div>

        <div className="flex flex-col items-end gap-6 w-full md:w-auto">
          {/* 14-Day Rest Tracker Widget */}
          <div className={`brutal-card p-4 flex items-center gap-4 w-full md:w-auto ${isRestAdequate ? 'bg-[var(--color-electric-cyan)]' : 'bg-[var(--color-citrus-yellow)]'}`}>
            <div className="bg-white p-2 rounded-xl border-[3px] border-black shadow-brutal-sm">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-[11px] font-black uppercase tracking-widest leading-none mb-1">Descanso Mensual</p>
              <p className="font-black text-lg uppercase leading-none">
                {offDaysCount} DÍAS LIBRES <span className="font-mono text-xs opacity-70">(REC: 8+)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <button onClick={prevMonth} className="brutal-btn p-3 bg-white rounded-xl"><ChevronLeft /></button>
            <span className="font-black text-xl md:text-2xl uppercase w-48 md:w-64 text-center brutal-heading tracking-tight truncate">
              {format(currentDate, 'MMMM yyyy').toUpperCase()}
            </span>
            <button onClick={nextMonth} className="brutal-btn p-3 bg-white rounded-xl"><ChevronRight /></button>
          </div>
        </div>
      </header>

      <div className="brutal-card p-4 md:p-10 bg-white">
        <div className="grid grid-cols-7 gap-2 md:gap-6 mb-4 md:mb-8">
          {['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'].map(day => (
            <div key={day} className="text-center font-mono font-black text-[10px] md:text-sm tracking-widest text-black">
              {day.substring(0, 1)}<span className="hidden md:inline">{day.substring(1)}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-6">
          {/* Padding for first day of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 md:h-32 rounded-2xl border-[2px] md:border-[3px] border-dashed border-gray-200" />
          ))}

          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const log = (logs as any)[dateStr];
            const profile = log?.profileId ? profiles.find(p => p.id === log.profileId) : null;

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={`h-24 md:h-32 rounded-2xl border-[2px] md:border-[3px] border-black p-1.5 md:p-4 flex flex-col justify-between items-start transition-all hover:scale-[1.02] active:scale-[0.98] ${isToday(day) ? 'bg-gray-50' : 'bg-white'
                  } ${log ? 'shadow-brutal-xs md:shadow-brutal' : 'shadow-none'}`}
                style={{ backgroundColor: profile?.color || (log?.isWorkedHoliday ? 'var(--color-neon-fuchsia)' : log?.type === 'holiday' ? 'var(--color-citrus-yellow)' : log?.type === 'off' ? '#e5e7eb' : '') }}
              >
                <span className={`font-black text-base md:text-2xl tracking-tighter ${isToday(day) ? 'bg-black text-white px-1 md:px-2 py-0' : 'text-black'}`}>
                  {format(day, 'd')}
                </span>
                {log && (
                  <div className="w-full text-left">
                    <span className={`text-[8px] md:text-[10px] font-black uppercase truncate block px-1 md:px-2 md:py-1 border-[1px] md:border-[2px] border-black rounded-md ${log.isWorkedHoliday ? 'bg-white text-black' : 'bg-white/70 text-black'}`}>
                      {profile ? profile.name : log.isWorkedHoliday ? 'FESTIVO' : log.type === 'worked' ? 'TRAB.' : log.type === 'holiday' ? 'FESTIVO' : 'LIBRE'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>


      <AnimatePresence>
        {isModalOpen && selectedDate && (
          <EditDayModal
            date={selectedDate}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EditDayModal({ date, onClose }: { date: Date, onClose: () => void }) {
  const { logs, profiles, logDay, removeLog } = useStore();
  const dateStr = format(date, 'yyyy-MM-dd');
  const existingLog = logs[dateStr];

  const [type, setType] = useState<'worked' | 'off' | 'holiday'>(existingLog?.type || 'worked');
  const [isWorkedHoliday, setIsWorkedHoliday] = useState(existingLog?.isWorkedHoliday || false);
  const [profileId, setProfileId] = useState(existingLog?.profileId || profiles[0]?.id || '');
  const [notes, setNotes] = useState(existingLog?.notes || '');

  const handleSave = () => {
    logDay(dateStr, {
      type,
      profileId: (type === 'worked' || (type === 'holiday' && isWorkedHoliday)) ? profileId : undefined,
      notes,
      isWorkedHoliday: type === 'holiday' ? isWorkedHoliday : false
    });
    onClose();
  };

  const handleDelete = () => {
    removeLog(dateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="brutal-card w-full max-w-md bg-white overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b-[3px] border-black flex justify-between items-center bg-white">
          <div>
            <h2 className="font-black text-3xl uppercase tracking-tighter">{format(date, 'd MMM, yyyy').toUpperCase()}</h2>
            <p className="font-mono text-xs font-black text-gray-500 uppercase">{format(date, 'EEEE').toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-citrus-yellow)] rounded-xl transition-all border-[3px] border-black shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          <div>
            <label className="font-mono text-xs font-black uppercase tracking-widest block mb-3">Tipo de Registro</label>
            <div className="flex rounded-2xl border-[3px] border-black overflow-hidden shadow-brutal-sm bg-black gap-[3px]">
              {[
                { id: 'worked', label: 'TRABAJO' },
                { id: 'holiday', label: 'FESTIVO' },
                { id: 'off', label: 'LIBRE' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as any)}
                  className={`flex-1 py-4 font-black text-xs uppercase transition-all ${type === t.id ? 'bg-[var(--color-electric-cyan)] text-black' : 'bg-white hover:bg-gray-100 text-black'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'holiday' && (
            <div className="flex items-center justify-between p-5 brutal-card bg-[var(--color-citrus-yellow)]">
              <span className="font-black uppercase text-sm tracking-tight">¿HAS TRABAJADO ESTE FESTIVO?</span>
              <button
                onClick={() => setIsWorkedHoliday(!isWorkedHoliday)}
                className={`w-14 h-8 rounded-full border-[3px] border-black transition-all relative ${isWorkedHoliday ? 'bg-black' : 'bg-white'} shadow-brutal-sm`}
              >
                <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-[2px] border-black transition-all ${isWorkedHoliday ? 'right-1 bg-[var(--color-electric-cyan)]' : 'left-1 bg-black'}`} />
              </button>
            </div>
          )}

          {(type === 'worked' || (type === 'holiday' && isWorkedHoliday)) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="font-mono text-xs font-black uppercase tracking-widest block mb-3">Seleccionar Rol Profesional</label>
              <div className="grid grid-cols-1 gap-3">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProfileId(p.id)}
                    className={`w-full flex justify-between items-center p-4 rounded-xl border-[3px] border-black transition-all ${profileId === p.id ? 'bg-white shadow-brutal -translate-x-1 -translate-y-1' : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-black" style={{ backgroundColor: p.color }} />
                      <span className="font-black uppercase text-sm">{p.name}</span>
                    </div>
                    <span className="font-mono font-black bg-black text-white px-3 py-1 text-xs rounded-md">{p.rate.toFixed(2)} €</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div>
            <div className="inline-block bg-black text-white border-[3px] border-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest -mb-[3px] relative z-10 ml-4 shadow-brutal-sm">
              Nota Adhesiva
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="ESCRIBE AQUÍ TUS NOTAS..."
              className="w-full h-32 brutal-input bg-[var(--color-citrus-yellow)] resize-none font-mono text-sm font-bold p-4 shadow-brutal leading-tight border-[3px] border-black"
            />
          </div>
        </div>

        <div className="p-8 border-t-[3px] border-black bg-white flex gap-4">
          {existingLog && (
            <button onClick={handleDelete} className="brutal-btn bg-white text-black px-8 py-4 flex-1">
              BORRAR
            </button>
          )}
          <button onClick={handleSave} className="brutal-btn bg-[var(--color-neon-fuchsia)] text-white px-8 py-4 flex-[2] flex justify-between items-center shadow-brutal hover:shadow-none translate-x-[-4px] translate-y-[-4px] hover:translate-x-0 hover:translate-y-0">
            <span className="font-black uppercase tracking-tighter text-lg">Guardar Registro</span>
            {(type === 'worked' || (type === 'holiday' && isWorkedHoliday)) && profileId && (
              <span className="bg-black/30 px-3 py-1 rounded-lg text-xs font-black">{profiles.find(p => p.id === profileId)?.rate.toFixed(2)} €</span>
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
