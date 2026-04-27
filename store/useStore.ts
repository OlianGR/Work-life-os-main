import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type ShiftProfile = {
  id: string;
  name: string;
  rate: number;
  positionPlus: number;
  color: string;
};

export type ContractDetails = {
  baseSalary: number;
  seniority: number;
  postHolidayPlus: number;
  toxicPlus: number;
  convenioPlus: number;
  transportPlus: number;
  clothingPlus: number;
  taxRate: number; // Percentage
  socialSecurityRate: number; // Percentage
  holidayPlusAmount: number;
};

export type LogType = 'worked' | 'off' | 'holiday';

export type WorkLog = {
  date: string; // YYYY-MM-DD
  type: LogType;
  profileId?: string; // Only if type === 'worked' or worked holiday
  notes?: string;
  isWorkedHoliday?: boolean;
  extraHours?: number;
  extraHoursRate?: number;
};

interface AppState {
  user: User | null;
  profiles: ShiftProfile[];
  contractDetails: ContractDetails;
  logs: Record<string, WorkLog>;
  legalLimit: number;
  holidayLimit: number;
  loading: boolean;

  // Auth
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;

  // Sync
  fetchUserData: () => Promise<void>;

  // Profiles
  addProfile: (profile: Omit<ShiftProfile, 'id'>) => Promise<void>;
  updateProfile: (id: string, profile: Partial<ShiftProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;

  // Contract
  updateContract: (details: Partial<ContractDetails>) => Promise<void>;

  // Logs
  logDay: (date: string, log: Omit<WorkLog, 'date'>) => Promise<void>;
  removeLog: (date: string) => Promise<void>;

  // Settings
  setHolidayLimit: (limit: number) => Promise<void>;
  setLegalLimit: (limit: number) => Promise<void>;

  // Init
  initHolidays2026: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  profiles: [],
  contractDetails: {
    baseSalary: 1200,
    seniority: 0,
    postHolidayPlus: 0,
    toxicPlus: 0,
    convenioPlus: 0,
    transportPlus: 0,
    clothingPlus: 0,
    taxRate: 15,
    socialSecurityRate: 6.35,
    holidayPlusAmount: 20,
  },
  logs: {},
  legalLimit: 225,
  holidayLimit: 13,
  loading: false,

  setUser: (user) => set({ user }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null, logs: {}, profiles: [], legalLimit: 225, holidayLimit: 13, contractDetails: {
        baseSalary: 1200,
        seniority: 0,
        postHolidayPlus: 0,
        toxicPlus: 0,
        convenioPlus: 0,
        transportPlus: 0,
        clothingPlus: 0,
        taxRate: 15,
        socialSecurityRate: 6.35,
        holidayPlusAmount: 20,
      }
    });
  },

  fetchUserData: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });

    // Fetch Profiles
    const { data: profiles } = await supabase
      .from('shift_profiles')
      .select('*')
      .eq('user_id', user.id);

    // Fetch Contract
    const { data: contract } = await supabase
      .from('contract_details')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch Logs
    const { data: logs } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', user.id);

    const logsMap: Record<string, WorkLog> = {};
    logs?.forEach(l => {
      logsMap[l.date] = {
        date: l.date,
        type: l.type as LogType,
        profileId: l.profile_id,
        notes: l.notes,
        isWorkedHoliday: l.is_worked_holiday,
        extraHours: Number(l.extra_hours || 0),
        extraHoursRate: Number(l.extra_hours_rate || 0)
      };
    });

    set({
      profiles: (profiles || []).map(p => ({
        id: p.id,
        name: p.name,
        rate: Number(p.rate),
        positionPlus: Number(p.position_plus),
        color: p.color
      })),
      contractDetails: contract ? {
        baseSalary: Number(contract.base_salary),
        seniority: Number(contract.seniority),
        postHolidayPlus: Number(contract.post_holiday_plus),
        toxicPlus: Number(contract.toxic_plus || 0),
        convenioPlus: Number(contract.convenio_plus || 0),
        transportPlus: Number(contract.transport_plus),
        clothingPlus: Number(contract.clothing_plus),
        taxRate: Number(contract.tax_rate),
        socialSecurityRate: Number(contract.social_security_rate),
        holidayPlusAmount: Number(contract.holiday_plus_amount || 20),
      } : get().contractDetails,
      legalLimit: contract?.legal_limit || 225,
      holidayLimit: contract?.holiday_limit || 13,
      logs: logsMap,
      loading: false
    });
  },

  addProfile: async (profile) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('shift_profiles')
      .insert([{
        user_id: user.id,
        name: profile.name,
        rate: profile.rate,
        position_plus: profile.positionPlus,
        color: profile.color
      }])
      .select()
      .single();

    if (!error && data) {
      set((state) => ({
        profiles: [...state.profiles, {
          id: data.id,
          name: data.name,
          rate: Number(data.rate),
          positionPlus: Number(data.position_plus),
          color: data.color
        }]
      }));
    } else if (error) {
      console.error('Error adding profile to Supabase:', error);
    }
  },

  updateProfile: async (id, updated) => {
    const { error } = await supabase
      .from('shift_profiles')
      .update({
        name: updated.name,
        rate: updated.rate,
        position_plus: updated.positionPlus,
        color: updated.color
      })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        profiles: state.profiles.map(p => p.id === id ? { ...p, ...updated } : p)
      }));
    }
  },

  deleteProfile: async (id) => {
    const { error } = await supabase
      .from('shift_profiles')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        profiles: state.profiles.filter(p => p.id !== id)
      }));
    }
  },

  updateContract: async (details) => {
    const { user } = get();
    if (!user) return;

    const updatePayload: any = {};
    if (details.baseSalary !== undefined) updatePayload.base_salary = details.baseSalary;
    if (details.seniority !== undefined) updatePayload.seniority = details.seniority;
    if (details.postHolidayPlus !== undefined) updatePayload.post_holiday_plus = details.postHolidayPlus;
    if (details.toxicPlus !== undefined) updatePayload.toxic_plus = details.toxicPlus;
    if (details.convenioPlus !== undefined) updatePayload.convenio_plus = details.convenioPlus;
    if (details.transportPlus !== undefined) updatePayload.transport_plus = details.transportPlus;
    if (details.clothingPlus !== undefined) updatePayload.clothing_plus = details.clothingPlus;
    if (details.taxRate !== undefined) updatePayload.tax_rate = details.taxRate;
    if (details.socialSecurityRate !== undefined) updatePayload.social_security_rate = details.socialSecurityRate;
    if (details.holidayPlusAmount !== undefined) updatePayload.holiday_plus_amount = details.holidayPlusAmount;

    const { error } = await supabase
      .from('contract_details')
      .update(updatePayload)
      .eq('user_id', user.id);

    if (!error) {
      set((state) => ({
        contractDetails: { ...state.contractDetails, ...details }
      }));
    }
  },

  logDay: async (date, log) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('work_logs')
      .upsert({
        user_id: user.id,
        date,
        type: log.type,
        profile_id: log.profileId,
        notes: log.notes,
        is_worked_holiday: log.isWorkedHoliday,
        extra_hours: log.extraHours,
        extra_hours_rate: log.extraHoursRate
      }, { onConflict: 'user_id,date' });

    if (!error) {
      set((state) => ({
        logs: { ...state.logs, [date]: { ...log, date } }
      }));
    }
  },

  removeLog: async (date) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('work_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);

    if (!error) {
      set((state) => {
        const newLogs = { ...state.logs };
        delete newLogs[date];
        return { logs: newLogs };
      });
    }
  },

  setHolidayLimit: async (limit) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase
      .from('contract_details')
      .update({ holiday_limit: limit })
      .eq('user_id', user.id);
    if (!error) set({ holidayLimit: limit });
  },

  setLegalLimit: async (limit) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase
      .from('contract_details')
      .update({ legal_limit: limit })
      .eq('user_id', user.id);
    if (!error) set({ legalLimit: limit });
  },

  initHolidays2026: async () => {
    const { user, logs } = get();
    if (!user) return;

    const holidays2026 = [
      { date: '2026-01-01', notes: 'Año Nuevo' },
      { date: '2026-01-06', notes: 'Epifanía del Señor' },
      { date: '2026-04-03', notes: 'Viernes Santo' },
      { date: '2026-05-01', notes: 'Fiesta del Trabajo' },
      { date: '2026-08-15', notes: 'Asunción de la Virgen' },
      { date: '2026-10-12', notes: 'Fiesta Nacional de España' },
      { date: '2026-11-01', notes: 'Todos los Santos' },
      { date: '2026-12-06', notes: 'Día de la Constitución' },
      { date: '2026-12-08', notes: 'Inmaculada Concepción' },
      { date: '2026-12-25', notes: 'Navidad' },
    ];

    const toUpsert = holidays2026
      .filter(h => !logs[h.date])
      .map(h => ({
        user_id: user.id,
        date: h.date,
        type: 'holiday',
        notes: h.notes
      }));

    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from('work_logs')
        .upsert(toUpsert, { onConflict: 'user_id,date' });

      if (!error) {
        const newLogs = { ...logs };
        toUpsert.forEach(u => {
          newLogs[u.date] = { date: u.date, type: 'holiday', notes: u.notes };
        });
        set({ logs: newLogs });
      }
    }
  }
}));
