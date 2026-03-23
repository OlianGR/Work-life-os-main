import { isSunday } from 'date-fns';

export interface Profile {
  id: string;
  name: string;
  rate: number;
  positionPlus?: number;
  color?: string;
}

export interface Log {
  date: string;
  type: 'worked' | 'holiday' | 'off';
  isWorkedHoliday?: boolean;
  profileId?: string;
  notes?: string;
}

/**
 * Calculates the daily income for a given log entry and profile.
 * Standard bonus is 20€ for Sundays or Worked Holidays, only if rate or plus is > 0.
 */
export function calculateDailyIncome(log: Log, profile?: Profile): number {
  if (!profile) return 0;
  
  const isWorked = log.type === 'worked' || log.isWorkedHoliday;
  if (!isWorked) return 0;

  const baseRate = profile.rate || 0;
  const plus = profile.positionPlus || 0;
  
  // Requirement: Bonus only if it's a worked holiday or Sunday, and the profile has any income (rate or plus).
  const isBonusDay = log.isWorkedHoliday || isSunday(new Date(log.date));
  const hasIncome = baseRate > 0 || plus > 0;
  const bonus = (isBonusDay && hasIncome) ? 20 : 0;

  return baseRate + plus + bonus;
}

/**
 * Calculates total income from a list of logs and profiles.
 */
export function calculateTotalIncome(logs: Log[], profiles: Profile[]): number {
  return logs.reduce((acc, log) => {
    const profile = profiles.find(p => p.id === log.profileId);
    return acc + calculateDailyIncome(log, profile);
  }, 0);
}

/**
 * Calculates total stats for the dashboard.
 */
export function getDashboardStats(logs: Log[], profiles: Profile[], legalLimit: number, holidayLimit: number) {
  const workedDays = logs.filter(log => log.type === 'worked' || log.isWorkedHoliday).length;
  const workedHolidays = logs.filter(log => log.isWorkedHoliday || (log.type === 'worked' && isSunday(new Date(log.date)))).length;
  
  const totalIncome = calculateTotalIncome(logs, profiles);
  const totalPositionPlus = logs.reduce((acc, log) => {
    if (log.type === 'worked' || log.isWorkedHoliday) {
      const profile = profiles.find(p => p.id === log.profileId);
      return acc + (profile?.positionPlus || 0);
    }
    return acc;
  }, 0);

  return {
    workedDays,
    daysRemaining: Math.max(0, legalLimit - workedDays),
    progressPercent: Math.min(100, (workedDays / legalLimit) * 100),
    workedHolidays,
    holidayProgress: Math.min(100, (workedHolidays / (holidayLimit || 13)) * 100),
    totalIncome,
    totalPositionPlus,
    avgDayRate: workedDays > 0 ? totalIncome / workedDays : 0
  };
}
