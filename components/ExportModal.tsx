'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileDown, Calendar, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { logs, profiles } = useStore() as any;
  const [selectedMonths, setSelectedMonths] = useState<Date[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get last 12 months as options
  const monthOptions = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end: new Date()
  }).reverse();

  const toggleMonth = (month: Date) => {
    if (selectedMonths.some(m => isSameMonth(m, month))) {
      setSelectedMonths(selectedMonths.filter(m => !isSameMonth(m, month)));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const generatePDF = async () => {
    if (selectedMonths.length === 0) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const title = "REPORTE DE JORNADAS - WORK LIFE OS";
      
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, 22);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generado por Olianlabs el ${format(new Date(), 'PPpp', { locale: es })}`, 14, 30);

      let currentY = 40;

      // Sort selected months chronologically
      const sortedMonths = [...selectedMonths].sort((a, b) => a.getTime() - b.getTime());

      for (const month of sortedMonths) {
        const monthName = format(month, 'MMMM yyyy', { locale: es }).toUpperCase();
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthLogs = Object.entries(logs)
          .filter(([dateStr]) => {
            const date = new Date(dateStr);
            return date >= monthStart && date <= monthEnd;
          })
          .sort(([a], [b]) => a.localeCompare(b));

        if (monthLogs.length === 0) continue;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(monthName, 14, currentY);
        currentY += 10;

        const tableData = monthLogs.map(([date, log]: [string, any]) => {
          const profile = profiles.find((p: any) => p.id === log.profileId);
          let typeLabel = "DESCONOCIDO";
          if (log.isWorkedHoliday) typeLabel = "FESTIVO TRABAJADO";
          else if (log.type === 'worked') typeLabel = "TRABAJO";
          else if (log.type === 'holiday') typeLabel = "FESTIVO (LIBRE)";
          else if (log.type === 'off') typeLabel = "LIBRE";

          return [
            date,
            typeLabel,
            profile?.name || '—',
            profile ? `${profile.rate + (log.isWorkedHoliday ? 20 : 0)} €` : '0 €',
            log.notes || ''
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Fecha', 'Tipo', 'Rol/Perfil', 'Importe', 'Notas']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 40 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 'auto' }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Add page if needed
        if (currentY > 260 && month !== sortedMonths[sortedMonths.length - 1]) {
          doc.addPage();
          currentY = 20;
        }
      }

      doc.save(`reporte-jornadas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="brutal-card w-full max-w-2xl bg-white overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b-[4px] border-black bg-[var(--color-citrus-yellow)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileDown className="w-8 h-8" />
                <h2 className="text-3xl brutal-heading tracking-tighter">Exportar Reporte PDF</h2>
              </div>
              <button onClick={onClose} className="p-2 bg-white border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto">
              <p className="font-mono text-sm font-bold text-gray-600 uppercase tracking-wide">
                Selecciona los meses que deseas incluir en el reporte detallado:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {monthOptions.map((month, idx) => {
                  const isSelected = selectedMonths.some(m => isSameMonth(m, month));
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleMonth(month)}
                      className={`p-4 border-[3px] border-black rounded-2xl flex flex-col items-center gap-2 transition-all ${
                        isSelected 
                          ? 'bg-black text-white shadow-none translate-x-1 translate-y-1' 
                          : 'bg-white hover:bg-gray-50 shadow-brutal-sm'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 ${isSelected ? 'text-[var(--color-citrus-yellow)]' : 'text-gray-400'}`} />
                      <span className="font-black text-xs uppercase text-center leading-none">
                        {format(month, 'MMM yyyy', { locale: es })}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[var(--color-electric-cyan)]" />}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gray-50 p-4 border-2 border-dashed border-black rounded-2xl">
                <p className="text-[10px] font-mono text-gray-500 uppercase leading-relaxed uppercase">
                  El PDF incluirá un desglose diario, roles desempeñados, importes facturados (incluyendo plus de festividad) y notas de cada jornada.
                </p>
              </div>
            </div>

            <div className="p-8 border-t-[4px] border-black bg-white flex gap-4">
              <button onClick={onClose} className="brutal-btn bg-white text-black flex-1">
                Cancelar
              </button>
              <button 
                onClick={generatePDF}
                disabled={selectedMonths.length === 0 || isGenerating}
                className="brutal-btn bg-[var(--color-electric-cyan)] text-black flex-[2] flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                   <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FileDown className="w-6 h-6" />
                    <span className="text-lg">Generar PDF ({selectedMonths.length})</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
