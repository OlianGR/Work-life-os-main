'use client';

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Calendar as CalendarIcon, Download, Settings2, PlusCircle, X, Coffee } from 'lucide-react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { format, subMonths, setDate, addDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabase';

type AuditResult = {
  payslipTotal: number;
  appTotal: number;
  difference: number;
  status: 'MATCH' | 'DISCREPANCY' | 'ERROR';
  details: string;
  breakdown: {
    baseSalary: number;
    seniority: number;
    toxicPlus: number;
    convenioPlus: number;
    incentives: number; // Sum of profile rates
    positionPlus: number; // Sum of profile positionPlus
    holidayPlus: number; // Bonus for Sundays
    postHolidayPlus: number;
    extraHoursTotal: number;
    transportPlus: number;
    clothingPlus: number;
    grossTotal: number;
    netTotal: number;
    offDaysCount: number;
    holidayDaysDetail: Array<{ date: string; profileName: string; notes?: string }>;
    incentivesDetail: Array<{ date: string; profileName: string; amount: number }>;
    positionPlusDetail: Array<{ date: string; profileName: string; amount: number }>;
  };
  extractedDetails?: {
    periodo: string;
    empresa: string;
    total_devengado: number;
    concepts: {
      salario_base?: number;
      antiguedad?: number;
      plus_toxico?: number;
      plus_convenio?: number;
      plus_transporte?: number;
      plus_vestuario?: number;
      incentivos?: number;
      plus_festivos?: number;
      plus_post_festivo?: number;
      plus_puesto?: number;
      horas_extras?: number;
    };
  };
};

const emptySubscribe = () => () => { };

export default function AuditorPage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { logs, profiles, contractDetails, updateContract } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showContractSettings, setShowContractSettings] = useState(false);
  const [showFestivosDetail, setShowFestivosDetail] = useState(false);
  const [showIncentivesDetail, setShowIncentivesDetail] = useState(false);
  const [showPositionPlusDetail, setShowPositionPlusDetail] = useState(false);
  const [auditStatus, setAuditStatus] = useState<string>('');

  // Default date range: 25th of last month to 24th of current month
  const today = new Date();
  const defaultStart = format(setDate(subMonths(today, 1), 25), 'yyyy-MM-dd');
  const defaultEnd = format(setDate(today, 24), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);


  const generatePDF = (audit: AuditResult) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

    // Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('INFORME DE AUDITORÍA', 14, 25);
    doc.setFontSize(10);
    doc.text(`Work-Life OS • ${dateStr}`, 14, 33);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Periodo Analizado: ${format(new Date(startDate), 'dd/MM/yyyy')} - ${format(new Date(endDate), 'dd/MM/yyyy')}`, 14, 50);
    if (audit.extractedDetails?.periodo) {
      doc.text(`Periodo Detectado en Nómina: ${audit.extractedDetails.periodo}`, 14, 56);
    }

    // Summary Comparison Table
    autoTable(doc, {
      startY: 65,
      head: [['Concepto General', 'Valor App', 'Valor Nómina', 'Diferencia']],
      body: [
        [
          'TOTAL LÍQUIDO (NETO)', 
          `${audit.appTotal.toFixed(2)}€`, 
          `${audit.payslipTotal.toFixed(2)}€`, 
          { 
            content: `${audit.difference.toFixed(2)}€`, 
            styles: { fontStyle: 'bold', textColor: audit.status === 'MATCH' ? [0, 128, 0] : [255, 0, 0] } 
          }
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] },
    });

    // Concepts Comparison Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Desglose Comparativo de Conceptos', 14, (doc as any).lastAutoTable.finalY + 15);
    doc.setFont('helvetica', 'normal');

    const aiConcepts = audit.extractedDetails?.concepts || {};
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Concepto Salarial', 'Cálculo App', 'Extracción IA', 'Estado']],
      body: [
        ['Salario Base', `${audit.breakdown.baseSalary.toFixed(2)}€`, `${(aiConcepts.salario_base || 0).toFixed(2)}€`, getStatus(audit.breakdown.baseSalary, aiConcepts.salario_base)],
        ['Antigüedad', `${audit.breakdown.seniority.toFixed(2)}€`, `${(aiConcepts.antiguedad || 0).toFixed(2)}€`, getStatus(audit.breakdown.seniority, aiConcepts.antiguedad)],
        ['Plus Puesto de Trabajo', `${audit.breakdown.positionPlus.toFixed(2)}€`, `${(aiConcepts.plus_puesto || 0).toFixed(2)}€`, getStatus(audit.breakdown.positionPlus, aiConcepts.plus_puesto)],
        ['Plus Tóxico', `${audit.breakdown.toxicPlus.toFixed(2)}€`, `${(aiConcepts.plus_toxico || 0).toFixed(2)}€`, getStatus(audit.breakdown.toxicPlus, aiConcepts.plus_toxico)],
        ['Plus Convenio', `${audit.breakdown.convenioPlus.toFixed(2)}€`, `${(aiConcepts.plus_convenio || 0).toFixed(2)}€`, getStatus(audit.breakdown.convenioPlus, aiConcepts.plus_convenio)],
        ['Horas Extraordinarias', `${audit.breakdown.extraHoursTotal.toFixed(2)}€`, `${(aiConcepts.horas_extras || 0).toFixed(2)}€`, getStatus(audit.breakdown.extraHoursTotal, aiConcepts.horas_extras)],
        ['Plus Festivos', `${audit.breakdown.holidayPlus.toFixed(2)}€`, `${(aiConcepts.plus_festivos || 0).toFixed(2)}€`, getStatus(audit.breakdown.holidayPlus, aiConcepts.plus_festivos)],
        ['Plus Transporte/Dist.', `${audit.breakdown.transportPlus.toFixed(2)}€`, `${(aiConcepts.plus_transporte || 0).toFixed(2)}€`, getStatus(audit.breakdown.transportPlus, aiConcepts.plus_transporte)],
        ['Plus Vestuario/Herr.', `${audit.breakdown.clothingPlus.toFixed(2)}€`, `${(aiConcepts.plus_vestuario || 0).toFixed(2)}€`, getStatus(audit.breakdown.clothingPlus, aiConcepts.plus_vestuario)],
        ['Incentivos/Pluses', `${audit.breakdown.incentives.toFixed(2)}€`, `${(aiConcepts.incentivos || 0).toFixed(2)}€`, getStatus(audit.breakdown.incentives, aiConcepts.incentivos)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [60, 60, 60] },
      columnStyles: {
        3: { fontStyle: 'bold' }
      }
    });

    function getStatus(app: number, ai?: number) {
      if (ai === undefined || ai === 0 && app === 0) return 'OK';
      const diff = Math.abs(app - ai);
      return diff < 0.5 ? 'OK' : 'REVISAR';
    }

    // Verdict Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(14, finalY, 196, finalY);
    
    doc.setFontSize(12);
    const resultColor = audit.status === 'MATCH' ? [0, 100, 0] : [150, 0, 0];
    doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`RESULTADO FINAL: ${audit.status === 'MATCH' ? 'COINCIDENCIA EXITOSA' : 'DISCREPANCIA DETECTADA'}`, 14, finalY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento es una auditoría generada automáticamente por IA y debe ser validada por un profesional.', 14, finalY + 20);

    doc.save(`Auditoria_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      // 'application/pdf': ['.pdf'] // Disabled for Groq Vision
    },
    maxFiles: 1
  });

  if (!isClient) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="w-16 h-16 border-[6px] border-black border-t-[var(--color-citrus-yellow)] rounded-full animate-spin shadow-brutal-sm" />
      <p className="font-mono text-xs font-black uppercase tracking-[0.3em] animate-pulse">Cargando Auditoría...</p>
    </div>
  );

  const handleAudit = async () => {
    if (!file) return;

    setIsAuditing(true);
    setAuditStatus('Procesando imagen...');

    try {
      // 1. App Calculation: Sum variables from the selected range in calendar
      let incentivesTotal = 0;
      let positionPlusTotal = 0;
      let holidayPlusTotal = 0;
      let postHolidayPlusTotal = 0;
      let extraHoursTotal = 0;
      let offDaysCount = 0;
      const holidayDaysDetail: Array<{ date: string; profileName: string; notes?: string }> = [];
      const incentivesDetail: Array<{ date: string; profileName: string; amount: number }> = [];
      const positionPlusDetail: Array<{ date: string; profileName: string; amount: number }> = [];

      // Validar fechas del rango
      if (!startDate || !endDate) {
        throw new Error('Por favor, selecciona un rango de fechas válido.');
      }

      // Filter and sum logs in the selected range
      Object.values(logs).forEach((log) => {
        if (log.date >= startDate && log.date <= endDate) {
          // Extra hours: always sum the total euros
          if (log.extraHours && log.extraHoursRate) {
            extraHoursTotal += Number(log.extraHours) * Number(log.extraHoursRate);
          }

          const isWorkedHol = log.type === 'holiday' && log.isWorkedHoliday;

          if ((log.type === 'worked' || isWorkedHol) && log.profileId) {
            const profile = profiles.find(p => p.id === log.profileId);
            if (profile) {
              // User Requirement: "incentivos ... compararlo con todo el rango seleccionado ... con todas esas diferencias"
              // We use profile.rate as the variable incentive/difference for that day
              const pRate = Number(profile.rate || 0);
              if (pRate > 0) {
                incentivesTotal += pRate;
                incentivesDetail.push({ date: log.date, profileName: profile.name, amount: pRate });
              }
              
              // User Requirement: "plus puesto ... compararlo con el plus puesto que va sumando"
              const pPlus = Number(profile.positionPlus || 0);
              if (pPlus > 0) {
                positionPlusTotal += pPlus;
                positionPlusDetail.push({ date: log.date, profileName: profile.name, amount: pPlus });
              }

              // Plus festivos (specifically marked worked holidays)
              if (isWorkedHol) {
                const amount = Number(contractDetails.holidayPlusAmount || 20);
                holidayPlusTotal += amount;
                holidayDaysDetail.push({
                  date: log.date,
                  profileName: profile.name,
                  notes: (log.notes || '') + ` (+${amount}€)`
                });
              }
            }

            // Plus post-festivo: Bonus for working the day after a holiday
            const prevDay = format(addDays(new Date(log.date), -1), 'yyyy-MM-dd');
            const prevLog = logs[prevDay];
            if (prevLog?.type === 'holiday' && !prevLog.isWorkedHoliday) {
              postHolidayPlusTotal += Number(contractDetails.postHolidayPlus || 0);
            }
          } else if (log.type === 'off') {
            offDaysCount++;
          }
        }
      });

      // 2. Base & Fixed Concepts: from Contract (Requirement: "compare with contract data")
      const baseSalary = Number(contractDetails.baseSalary);
      const seniority = Number(contractDetails.seniority);
      const toxicPlus = Number(contractDetails.toxicPlus);
      const convenioPlus = Number(contractDetails.convenioPlus);
      const transportPlus = Number(contractDetails.transportPlus);
      const clothingPlus = Number(contractDetails.clothingPlus);

      const grossTotal = baseSalary +
        seniority +
        toxicPlus +
        convenioPlus +
        incentivesTotal +
        positionPlusTotal +
        holidayPlusTotal +
        postHolidayPlusTotal +
        extraHoursTotal +
        transportPlus +
        clothingPlus;

      const taxAmount = grossTotal * (Number(contractDetails.taxRate) / 100);
      const socialSecurityAmount = grossTotal * (Number(contractDetails.socialSecurityRate) / 100);
      const netTotal = grossTotal - taxAmount - socialSecurityAmount;

      const breakdown = {
        baseSalary,
        seniority,
        toxicPlus,
        convenioPlus,
        incentives: incentivesTotal,
        positionPlus: positionPlusTotal,
        holidayPlus: holidayPlusTotal,
        postHolidayPlus: postHolidayPlusTotal,
        extraHoursTotal,
        transportPlus,
        clothingPlus,
        grossTotal,
        netTotal,
        offDaysCount,
        holidayDaysDetail: holidayDaysDetail.sort((a, b) => a.date.localeCompare(b.date)),
        incentivesDetail: incentivesDetail.sort((a, b) => a.date.localeCompare(b.date)),
        positionPlusDetail: positionPlusDetail.sort((a, b) => a.date.localeCompare(b.date))
      };

      const processImage = async (file: File): Promise<string> => {
        try {
          let source: ImageBitmap | HTMLImageElement;
          let urlToRevoke: string | null = null;

          // Usar createImageBitmap si está disponible (más eficiente en memoria)
          if (typeof window.createImageBitmap === 'function') {
            try {
              source = await createImageBitmap(file);
            } catch (e) {
              console.warn("createImageBitmap falló, intentando fallback con URL.createObjectURL", e);
              urlToRevoke = URL.createObjectURL(file);
              source = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('El navegador no pudo cargar esta imagen.'));
                img.src = urlToRevoke!;
              });
            }
          } else {
            // Fallback para navegadores antiguos
            urlToRevoke = URL.createObjectURL(file);
            source = await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => reject(new Error('El navegador no pudo cargar esta imagen.'));
              img.src = urlToRevoke!;
            });
          }

          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 1200; // Reducido para móviles (antes 1600)
          let width = source.width;
          let height = source.height;

          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('No se pudo inicializar el contexto de dibujo.');

          ctx.drawImage(source, 0, 0, width, height);
          
          // Limpieza de memoria
          if (source instanceof ImageBitmap) {
            source.close();
          }
          if (urlToRevoke) {
            URL.revokeObjectURL(urlToRevoke);
          }

          const base64 = canvas.toDataURL('image/jpeg', 0.7); // Calidad 0.7 para mayor velocidad
          return base64.split(',')[1];
        } catch (error: any) {
          console.error("Error detallado en procesamiento de imagen:", error);
          throw new Error('No se pudo procesar la imagen: ' + (error.message || 'Error de lectura'));
        }
      };

      try {
        const base64Data = await processImage(file);
        setAuditStatus('Analizando nómina con IA...');

        // Obtener el token de sesión
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for mobile networks

        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: 'image/jpeg',
            appTotal: netTotal
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Error del servidor (${response.status}).`);
        }

        const data = await response.json();
        setResult({
          ...data,
          breakdown
        });
        setIsAuditing(false);
      } catch (err: any) {
        throw err; // Re-throw to be caught by the outer catch
      }
    } catch (error: any) {
      console.error(error);
      setResult({
        payslipTotal: 0,
        appTotal: 0,
        difference: 0,
        status: 'ERROR',
        details: 'Error en el procesamiento: ' + (error.message || 'Error desconocido'),
        breakdown: {
          baseSalary: 0, seniority: 0, toxicPlus: 0, convenioPlus: 0, incentives: 0, 
          positionPlus: 0, holidayPlus: 0, postHolidayPlus: 0, extraHoursTotal: 0,
          transportPlus: 0, clothingPlus: 0, grossTotal: 0, netTotal: 0,
          offDaysCount: 0,
          holidayDaysDetail: [],
          incentivesDetail: [],
          positionPlusDetail: []
        }
      });
      setIsAuditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <header className="flex flex-col border-b-[4px] border-black pb-8 gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[var(--color-citrus-yellow)] border-2 border-black px-3 py-1 mb-4 shadow-brutal-xs">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Módulo de Integridad IA</span>
            </div>
            <h1 className="text-4xl md:text-7xl brutal-heading tracking-tighter leading-none mb-4">Auditoría <br className="hidden md:block" /> Profesional</h1>
            <p className="max-w-2xl text-gray-600 font-mono text-xs md:text-sm leading-relaxed">
              Detecta discrepancias entre tu actividad registrada y tu nómina real. Sube una captura y nuestra IA cruzará cada concepto, plus e incentivo para asegurar que cobras lo que te corresponde.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowContractSettings(!showContractSettings)}
              className="brutal-btn bg-white text-black px-6 py-4 flex items-center justify-center gap-3 w-full sm:w-auto hover:bg-[var(--color-electric-cyan)] transition-colors"
            >
              <Settings2 className={`w-5 h-5 transition-transform ${showContractSettings ? 'rotate-90' : ''}`} />
              <span className="font-black uppercase tracking-tighter">Mi Contrato</span>
            </button>
            {result && result.status !== 'ERROR' && (
              <button
                onClick={() => generatePDF(result)}
                className="brutal-btn bg-black text-white px-6 py-4 flex items-center justify-center gap-3 group w-full sm:w-auto hover:bg-[var(--color-neon-fuchsia)] hover:text-white transition-colors"
              >
                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                <span className="font-black uppercase tracking-tighter">Exportar PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Contract Quick Summary (Visible when settings are closed) */}
        {!showContractSettings && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-black/5">
            {[
              { label: 'Base', val: contractDetails.baseSalary, icon: '€' },
              { label: 'Antigüedad', val: contractDetails.seniority, icon: '€' },
              { label: 'IRPF', val: contractDetails.taxRate, icon: '%' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border-2 border-black/10 px-3 py-1 h-8">
                <span className="text-[9px] font-black uppercase text-gray-400">{stat.label}:</span>
                <span className="text-xs font-mono font-bold">{stat.val}{stat.icon}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Contract Settings Panel - Redesigned */}
      <AnimatePresence>
        {showContractSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="brutal-card p-6 md:p-10 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-8 border-b-2 border-dashed border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white p-2">
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl brutal-heading tracking-tighter">Parámetros del Contrato</h3>
                </div>
                <button
                   onClick={() => setShowContractSettings(false)}
                   className="p-3 hover:bg-[var(--color-neon-fuchsia)] hover:text-white transition-all border-2 border-black shadow-brutal-sm active:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Group 1: Fixed Salaries */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-4 bg-[var(--color-electric-cyan)]" />
                    <span className="font-mono text-xs font-black uppercase text-gray-500">Conceptos Fijos</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContractField
                      label="Salario Base Mensual"
                      value={contractDetails.baseSalary}
                      onChange={(v) => updateContract({ baseSalary: v })}
                      unit="€"
                    />
                    <ContractField
                      label="Importe Antigüedad"
                      value={contractDetails.seniority}
                      onChange={(v) => updateContract({ seniority: v })}
                      unit="€"
                    />
                    <ContractField
                      label="Plus Tóxico / Penosidad"
                      value={contractDetails.toxicPlus}
                      onChange={(v) => updateContract({ toxicPlus: v })}
                      unit="€"
                    />
                    <ContractField
                      label="Plus Convenio"
                      value={contractDetails.convenioPlus}
                      onChange={(v) => updateContract({ convenioPlus: v })}
                      unit="€"
                    />
                    <ContractField
                      label="Plus de Transporte"
                      value={contractDetails.transportPlus}
                      onChange={(v) => updateContract({ transportPlus: v })}
                      unit="€"
                    />
                    <ContractField
                      label="Plus de Vestuario"
                      value={contractDetails.clothingPlus}
                      onChange={(v) => updateContract({ clothingPlus: v })}
                      unit="€"
                    />
                    <ContractField
                      label="Importe Plus Festivo"
                      value={contractDetails.holidayPlusAmount}
                      onChange={(v) => updateContract({ holidayPlusAmount: v })}
                      unit="€"
                    />
                  </div>
                </div>

                {/* Group 2: Variables & Taxes */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-4 bg-[var(--color-citrus-yellow)]" />
                    <span className="font-mono text-xs font-black uppercase text-gray-500">Variables y Deducciones</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContractField
                      label="Plus Post-Festivo (Día)"
                      value={contractDetails.postHolidayPlus}
                      onChange={(v) => updateContract({ postHolidayPlus: v })}
                      unit="€"
                    />
                    <div /> {/* Spacer */}
                    <ContractField
                      label="Retención IRPF"
                      value={contractDetails.taxRate}
                      onChange={(v) => updateContract({ taxRate: v })}
                      unit="%"
                    />
                    <ContractField
                      label="Seguridad Social"
                      value={contractDetails.socialSecurityRate}
                      onChange={(v) => updateContract({ socialSecurityRate: v })}
                      unit="%"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="p-4 bg-[var(--color-electric-cyan)]/10 border-2 border-[var(--color-electric-cyan)] flex items-center gap-3 w-full md:w-auto">
                   <div className="bg-[var(--color-electric-cyan)] p-1 border border-black">
                     <CheckCircle className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] font-black uppercase leading-tight">Configuración sincronizada con la nube</span>
                </div>
                <button
                  onClick={() => setShowContractSettings(false)}
                  className="w-full md:w-auto brutal-btn bg-black text-white px-10 py-3"
                >
                  Guardar y Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-5 space-y-8">
          <section className="brutal-card p-6 bg-white border-[3px] border-black">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[var(--color-citrus-yellow)] border-2 border-black shadow-brutal-xs flex items-center justify-center shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tighter text-lg leading-tight">Rango de Nómina</h3>
                <p className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">Periodo a auditar</p>
              </div>
            </div>

            <div className="group flex flex-col gap-4">
              <div className="relative">
                <span className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-x border-black/10">Fecha Inicio</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setResult(null); }}
                  className="brutal-input w-full pt-4 focus-ring"
                />
              </div>
              <div className="relative">
                <span className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-x border-black/10">Fecha Fin</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setResult(null); }}
                  className="brutal-input w-full pt-4 focus-ring"
                />
              </div>
            </div>
          </section>

          <section
            {...getRootProps()}
            className={`brutal-card p-6 md:p-12 border-dashed border-[4px] flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] md:min-h-[400px] ${isDragActive ? 'border-[var(--color-neon-fuchsia)] bg-red-50' : 'border-gray-200 hover:border-black hover:bg-gray-50'
              }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="space-y-6 w-full">
                <div className="relative inline-block overflow-hidden">
                  <div className="w-24 h-24 bg-[var(--color-electric-cyan)] border-[4px] border-black shadow-brutal flex items-center justify-center mx-auto">
                    <FileText className="w-10 h-10" />
                  </div>
                  {isAuditing && (
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-[var(--color-neon-fuchsia)] shadow-[0_0_15px_var(--color-neon-fuchsia)] z-20"
                    />
                  )}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white border-2 border-white rounded-none flex items-center justify-center">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="font-black font-mono text-xl tracking-tight truncate px-4">{file.name}</p>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Listo para Procesar</p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAudit(); }}
                    disabled={isAuditing}
                    className="brutal-btn bg-black text-white py-4 text-sm flex items-center justify-center gap-3 hover:bg-[var(--color-citrus-yellow)] hover:text-black transition-all"
                  >
                    {isAuditing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                    <span className="font-black uppercase tracking-widest">{isAuditing ? 'Analizando con IA...' : 'Iniciar Auditoría'}</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[var(--color-neon-fuchsia)] transition-colors underline decoration-black/10"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-white border-[3px] border-black shadow-brutal-sm flex items-center justify-center mx-auto transition-transform hover:-rotate-6">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl brutal-heading tracking-tighter mb-2">Sube tu Nómina</h4>
                  <p className="text-gray-400 font-mono text-[10px] font-bold uppercase tracking-widest space-y-1">
                    <span>Formatos: JPG, PNG, WEBP</span><br />
                    <span className="text-[var(--color-neon-fuchsia)]">Optimizado para Groq Llama Vision</span>
                  </p>
                </div>
                <div className="brutal-btn bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest">
                  Explorar Archivos
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Results - Thermal Receipt Style */}
        <div className="lg:col-span-7">
          <div className="brutal-card bg-black border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Glossy overlay effect for the screen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-20" />
            
            {/* Header / Status Bar */}
            <div className="p-4 bg-gray-900 border-b border-white/10 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-electric-cyan)] animate-pulse" />
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Panel de Resultados • Alpha v2.0</span>
              </div>
              {result && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`px-4 py-1.5 border-2 border-black shadow-brutal-xs font-black text-[10px] uppercase tracking-widest ${
                    result.status === 'MATCH' ? 'bg-[var(--color-electric-cyan)] text-black' :
                    result.status === 'DISCREPANCY' ? 'bg-[var(--color-neon-fuchsia)] text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {result.status === 'MATCH' ? 'Coincidencia Total' : result.status === 'DISCREPANCY' ? 'Discrepancia' : 'Error'}
                </motion.div>
              )}
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col relative">
              {!result && !isAuditing && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <Activity className="w-16 h-16 text-white mb-6 animate-pulse" />
                  <p className="text-white font-mono text-xs uppercase tracking-[0.3em] max-w-[200px]">Esperando datos de entrada...</p>
                </div>
              )}

              {isAuditing && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                   <div className="relative">
                      <div className="w-24 h-24 border-[4px] border-[var(--color-electric-cyan)] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,255,0.2)]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-[var(--color-electric-cyan)]" />
                      </div>
                   </div>
                   <div className="text-center space-y-2">
                      <p className="text-white font-display font-black text-2xl tracking-tighter uppercase italic">Escaneando con IA</p>
                      <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Analizando conceptos, OCR y variables...</p>
                   </div>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 pb-12"
                >
                  {/* AI EXTRACTION PREVIEW */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-citrus-yellow)] to-[var(--color-electric-cyan)] opacity-10 blur transition duration-1000"></div>
                    <div className="relative bg-gray-900/80 border-2 border-white/10 p-6 backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                          <Activity className="w-5 h-5 text-[var(--color-citrus-yellow)]" />
                        </div>
                         <div className="flex flex-col gap-1 overflow-hidden">
                           <h4 className="text-white text-xs md:text-sm font-black uppercase tracking-widest leading-none truncate">Extracción Óptica AI</h4>
                           <p className="text-[8px] md:text-[9px] text-gray-500 font-mono mt-1">Datos crudos detectados</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <DetailItem label="EMPRESA" value={result.extractedDetails?.empresa || 'Detectando...'} />
                        <DetailItem label="PERIODO" value={result.extractedDetails?.periodo || 'Detectando...'} />
                        <div className="border-l border-white/10 pl-4">
                           <span className="text-gray-500 text-[8px] font-black uppercase tracking-widest block mb-1">BRUTO (IA)</span>
                           <span className="text-xl font-display font-black text-white tabular-nums">
                             {(result.extractedDetails?.total_devengado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                           </span>
                        </div>
                        <div className="border-l border-white/10 pl-4">
                           <span className="text-gray-500 text-[8px] font-black uppercase tracking-widest block mb-1">NETO (IA)</span>
                           <span className="text-xl font-display font-black text-[var(--color-citrus-yellow)] tabular-nums">
                             {result.payslipTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RECEIPT STARTS HERE */}
                  <div className="relative group">
                    {/* Shadow underneath the receipt */}
                    <div className="absolute inset-0 translate-x-3 translate-y-3 bg-white/5 blur-xl pointer-events-none" />
                    
                    <div className="bg-[#f9f9f9] text-black p-6 md:p-10 relative shadow-2xl overflow-hidden min-h-[500px]">
                      {/* Thermal Paper Jagged Top */}
                      <div className="absolute -top-3 left-0 right-0 h-4 flex overflow-hidden z-10">
                         {Array.from({length: 40}).map((_, i) => (
                           <div key={i} className="w-6 h-6 bg-black rotate-45 transform origin-center -translate-y-4 shrink-0 shadow-lg" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                         ))}
                      </div>

                      {/* Paper Texture Overlay */}
                      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] z-0" />

                      {/* Ticket Header */}
                      <div className="text-center mb-10 border-b-2 border-dashed border-gray-300 pb-8 relative z-10">
                        <div className="inline-block border-[3px] border-black px-4 py-2 mb-4 bg-white shadow-brutal-sm">
                          <h4 className="brutal-heading text-xl">WORK-LIFE OS</h4>
                        </div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] mb-1 italic">Liquidación de Período</p>
                        <p className="font-mono text-[9px] text-gray-400 font-bold">FECHA: {format(new Date(), 'dd.MM.yyyy')} • {format(new Date(), 'HH:mm:ss')}</p>
                      </div>

                      {/* Main Totals Breakdown */}
                      <div className="grid grid-cols-2 gap-px bg-gray-200 border-[2px] border-black mb-10 overflow-hidden z-10 relative">
                        <div className="bg-white p-5 flex flex-col justify-center">
                           <span className="font-mono text-[8px] font-black uppercase text-gray-400 block mb-1">NÓMINA FÍSICA</span>
                           <span className="text-2xl font-display font-black tracking-tighter tabular-nums">{result.payslipTotal.toFixed(2)}€</span>
                        </div>
                        <div className="bg-[var(--color-citrus-yellow)] p-5 flex flex-col justify-center border-l-[2px] border-black">
                           <span className="font-mono text-[8px] font-black uppercase text-black/40 block mb-1">APP CALCULADO</span>
                           <span className="text-2xl font-display font-black tracking-tighter tabular-nums">{result.appTotal.toFixed(2)}€</span>
                        </div>
                      </div>

                      {/* The Check / Rows */}
                      <div className="space-y-4 font-mono text-xs mb-10 z-10 relative italic">
                          <Row label="Salario Base" value={result.breakdown.baseSalary} extracted={result.extractedDetails?.concepts?.salario_base} source="Contrato" />
                          <Row label="Antigüedad" value={result.breakdown.seniority} extracted={result.extractedDetails?.concepts?.antiguedad} source="Contrato" />
                          <Row label="Plus Tóxico" value={result.breakdown.toxicPlus} extracted={result.extractedDetails?.concepts?.plus_toxico} source="Contrato" />
                          <Row label="Plus Convenio" value={result.breakdown.convenioPlus} extracted={result.extractedDetails?.concepts?.plus_convenio} source="Contrato" />
                          <div className="relative group/incentives">
                            <Row 
                              label="Incentivos Acum." 
                              value={result.breakdown.incentives} 
                              extracted={result.extractedDetails?.concepts?.incentivos} 
                              source="Calendario"
                              isSpecial
                              onClick={() => setShowIncentivesDetail(!showIncentivesDetail)}
                              isOpen={showIncentivesDetail}
                            />
                            <AnimatePresence>
                              {showIncentivesDetail && result.breakdown.incentivesDetail.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-gray-100/50 border-x border-b border-gray-200 p-2 mt-1 space-y-1 mb-2 font-mono text-[9px]"
                                >
                                  {result.breakdown.incentivesDetail.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center opacity-60">
                                      <span>{format(new Date(item.date), 'dd/MM')}</span>
                                      <span className="font-bold truncate px-2">{item.profileName}</span>
                                      <span className="font-black text-black">+{ item.amount.toFixed(2) }€</span>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="relative group/puesto">
                            <Row 
                              label="Plus Puesto Acum." 
                              value={result.breakdown.positionPlus} 
                              extracted={result.extractedDetails?.concepts?.plus_puesto} 
                              source="Calendario"
                              isSpecial
                              onClick={() => setShowPositionPlusDetail(!showPositionPlusDetail)}
                              isOpen={showPositionPlusDetail}
                            />
                            <AnimatePresence>
                              {showPositionPlusDetail && result.breakdown.positionPlusDetail.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-gray-100/50 border-x border-b border-gray-200 p-2 mt-1 space-y-1 mb-2 font-mono text-[9px]"
                                >
                                  {result.breakdown.positionPlusDetail.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center opacity-60">
                                      <span>{format(new Date(item.date), 'dd/MM')}</span>
                                      <span className="font-bold truncate px-2">{item.profileName}</span>
                                      <span className="font-black text-black">+{ item.amount.toFixed(2) }€</span>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <Row label="Horas Extras" value={result.breakdown.extraHoursTotal} extracted={result.extractedDetails?.concepts?.horas_extras} source="Calendario" />
                         <div className="relative group/festivos">
                           <Row
                             label="Plus Festivos"
                             value={result.breakdown.holidayPlus}
                             extracted={result.extractedDetails?.concepts?.plus_festivos}
                             isSpecial
                             onClick={() => setShowFestivosDetail(!showFestivosDetail)}
                             isOpen={showFestivosDetail}
                           />
                           <AnimatePresence>
                             {showFestivosDetail && result.breakdown.holidayDaysDetail.length > 0 && (
                               <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="overflow-hidden bg-gray-100/50 border-x border-b border-gray-200 p-2 mt-1 space-y-1 mb-2 font-mono text-[9px]"
                               >
                                 {result.breakdown.holidayDaysDetail.map((day, idx) => (
                                   <div key={idx} className="flex justify-between items-center opacity-60">
                                     <span>{format(new Date(day.date), 'dd/MM')}</span>
                                     <span className="font-bold truncate px-2">{day.profileName}</span>
                                     <span className="font-black text-black">+{ (contractDetails.holidayPlusAmount || 20).toFixed(2) }</span>
                                   </div>
                                 ))}
                               </motion.div>
                             )}
                           </AnimatePresence>
                         </div>
                          <Row label="Plus Transporte" value={result.breakdown.transportPlus} extracted={result.extractedDetails?.concepts?.plus_transporte} source="Contrato" />
                          <Row label="Plus Vestuario" value={result.breakdown.clothingPlus} extracted={result.extractedDetails?.concepts?.plus_vestuario} source="Contrato" />
                          <Row label="Post-Festivos" value={result.breakdown.postHolidayPlus} extracted={result.extractedDetails?.concepts?.plus_post_festivo} source="Calendario" />
                         <div className="flex justify-between items-center py-1 opacity-60">
                            <span>Días Libres (Informativo)</span>
                            <span className="font-bold">{result.breakdown.offDaysCount} Días</span>
                         </div>

                          <div className="pt-6 mt-6 border-t-[3px] border-black border-double flex justify-between items-center font-display font-black text-lg md:text-xl bg-white -mx-2 px-2 py-4 shadow-sm">
                             <span className="tracking-tighter uppercase">Total Neto Real</span>
                             <span className="text-2xl md:text-3xl tabular-nums">{result.appTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
                          </div>
                      </div>

                      {/* Final verdict ribbon */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 border-[3px] border-black shadow-brutal-sm flex items-center gap-6 relative z-10 
                        ${result.status === 'MATCH' ? 'bg-[var(--color-electric-cyan)]' : 'bg-[var(--color-neon-fuchsia)]'}`}
                      >
                         <div className="w-14 h-14 shrink-0 flex items-center justify-center border-2 border-black bg-white shadow-brutal-xs">
                            {result.status === 'MATCH' ? <CheckCircle className="w-8 h-8 text-black" /> : <AlertTriangle className="w-8 h-8 text-black" />}
                         </div>
                         <div className={`${result.status === 'MATCH' ? 'text-black' : 'text-white'}`}>
                            <h5 className="font-display font-black text-xl uppercase leading-none mb-1">
                              {result.status === 'MATCH' ? 'COINCIDENCIA OK' : 'DETECTOR DE ERROR'}
                            </h5>
                            <p className="font-mono text-[10px] uppercase font-black tracking-widest leading-none">
                              Dif: {result.difference > 0 ? '+' : ''}{result.difference.toFixed(2)}€
                            </p>
                         </div>
                      </motion.div>

                      {/* Paper bottom cut */}
                      <div className="absolute bottom-0 left-0 right-0 h-4 flex overflow-hidden translate-y-2">
                         {Array.from({length: 40}).map((_, i) => (
                           <div key={i} className="w-6 h-6 bg-black rotate-45 transform origin-center translate-y-3 shrink-0"></div>
                         ))}
                      </div>
                    </div>
                  </div>

                  {/* Tip / Support Banner */}
                  <div className="brutal-card p-6 bg-[var(--color-citrus-yellow)] border-[3px] border-black flex flex-col md:flex-row items-center justify-between gap-4 shadow-brutal-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-black text-white p-2 rounded-full">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-display font-black text-lg uppercase leading-none">¿Te ha servido la auditoría?</p>
                        <p className="font-mono text-[9px] font-bold uppercase opacity-60">Ayúdanos a seguir siendo independientes y sin publicidad.</p>
                      </div>
                    </div>
                    <Link href="/apoyar-proyecto" className="brutal-btn bg-white text-black px-6 py-2 text-xs font-black uppercase whitespace-nowrap">
                      Invitar a un café
                    </Link>
                  </div>

                  <div className="text-center opacity-40 font-mono text-[8px] uppercase tracking-[0.3em] text-white pt-4">
                    * * * Fin de Transmisión * * *
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper Components
function ContractField({ label, value, onChange, unit }: { label: string, value: number, onChange: (v: number) => void, unit: string }) {
  const [localValue, setLocalValue] = useState<string>(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    onChange(Number(localValue));
  };

  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 group-focus-within:text-black transition-colors">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          className="brutal-input w-full pr-10 font-bold tabular-nums focus-ring"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-300 pointer-events-none group-focus-within:text-black">{unit}</span>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-gray-500 text-[8px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono font-bold text-white bg-white/5 border border-white/10 px-2 py-1.5 rounded truncate">{value}</span>
    </div>
  );
}

function ComparisonBox({ label, value, status, icon }: { label: string, value: number, status: 'primary' | 'secondary', icon: React.ReactNode }) {
  return (
    <div className={`p-4 border-2 border-black shadow-brutal-xs flex flex-col gap-2 ${
      status === 'primary' ? 'bg-[var(--color-citrus-yellow)] text-black' : 'bg-gray-900 border-white/20 text-white'
    }`}>
      <div className="flex items-center gap-2 opacity-60">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-3xl font-display font-black leading-none">{value.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
    </div>
  );
}

function Row({ label, value, extracted, isSpecial, onClick, isOpen, source }: { label: string, value: number, extracted?: number, isSpecial?: boolean, onClick?: () => void, isOpen?: boolean, source?: 'Contrato' | 'Calendario' }) {
  const hasDiff = extracted !== undefined && Math.abs(value - extracted) > 0.5;
  
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center py-1.5 transition-colors border-b border-black/5 last:border-0 ${
        isSpecial ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
    >
      <div className="flex flex-col">
         <div className="flex items-center gap-2">
           <span className={`${isSpecial ? 'font-black' : 'text-gray-800'}`}>{label}</span>
           {source && <span className={`text-[7px] px-1 py-0 border border-black/20 font-black uppercase tracking-tighter ${source === 'Contrato' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{source}</span>}
           {isSpecial && <PlusCircle className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-45 text-[var(--color-neon-fuchsia)]' : 'text-black'}`} />}
           {hasDiff && <AlertTriangle className="w-3 h-3 text-[var(--color-neon-fuchsia)] animate-pulse" />}
         </div>
      </div>
      <div className="flex items-center gap-3">
        {extracted !== undefined && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-gray-400 font-black uppercase leading-none mb-0.5">Nómina</span>
            <span className="text-[10px] text-gray-500 font-mono">
              {extracted.toFixed(2)}€
            </span>
          </div>
        )}
        <div className="flex flex-col items-end min-w-[70px]">
          <span className="text-[8px] text-gray-400 font-black uppercase leading-none mb-0.5">App</span>
          <span className={`font-bold tabular-nums ${hasDiff ? 'text-[var(--color-neon-fuchsia)]' : 'text-black'}`}>
            {value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
          </span>
        </div>
      </div>
    </div>
  );
}
