import { Meeting } from '../types';

/**
 * Checks if a given date falls on a weekday (Monday - Friday).
 */
export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

/**
 * Calculates the exact cutoff timestamp for N working days into the future.
 * Skips Saturday and Sunday.
 */
export function getWorkingDaysCutoff(startDate: Date = new Date(), workingDaysCount = 7): Date {
  const current = new Date(startDate);
  // Set to start of day for clean calculation
  current.setHours(0, 0, 0, 0);

  let daysAdded = 0;
  while (daysAdded < workingDaysCount) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current)) {
      daysAdded++;
    }
  }

  // End of the target working day
  current.setHours(23, 59, 59, 999);
  return current;
}

/**
 * Determines whether a meeting's scheduled time is within the 7-working-day runway.
 */
export function isWithinWorkingDaysRunway(
  dateTimeStr: string | null | undefined,
  workingDays = 7,
  refDate: Date = new Date()
): boolean {
  if (!dateTimeStr) return false;
  const meetingDate = new Date(dateTimeStr);
  if (isNaN(meetingDate.getTime())) return false;

  const startOfRefDay = new Date(refDate);
  startOfRefDay.setHours(0, 0, 0, 0);

  const cutoffDate = getWorkingDaysCutoff(refDate, workingDays);
  return meetingDate >= startOfRefDay && meetingDate <= cutoffDate;
}

/**
 * Counts the number of working days that have elapsed since a given ISO timestamp.
 */
export function countWorkingDaysElapsed(sinceIsoStr: string | undefined, refDate: Date = new Date()): number {
  if (!sinceIsoStr) return 0;
  const startDate = new Date(sinceIsoStr);
  if (isNaN(startDate.getTime())) return 0;

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const target = new Date(refDate);
  target.setHours(0, 0, 0, 0);

  if (current >= target) return 0;

  let workingDays = 0;
  while (current < target) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current)) {
      workingDays++;
    }
  }

  return workingDays;
}

/**
 * Check if a meeting marked TBD has exceeded momentum threshold (> 5 working days).
 */
export function isStalledMomentum(sinceIsoStr: string | undefined, threshold = 5, refDate: Date = new Date()): boolean {
  return countWorkingDaysElapsed(sinceIsoStr, refDate) > threshold;
}

/**
 * Checks if a scheduled meeting time has passed and requires status resolution.
 */
export function needsStatusUpdate(meeting: Meeting, refDate: Date = new Date()): boolean {
  if (meeting.status !== 'SCHEDULED' || meeting.is_tbd || !meeting.date_time) {
    return false;
  }
  const meetingDate = new Date(meeting.date_time);
  return meetingDate < refDate;
}

/**
 * Formats date into readable string, e.g., "Nov 12, 2026 · 2:00 PM"
 */
export function formatDateTime(isoStr: string | null | undefined): string {
  if (!isoStr) return 'Date TBD';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats date into clean relative countdown or human context.
 */
export function formatRelativeMeetingTime(isoStr: string | null | undefined, refDate: Date = new Date()): string {
  if (!isoStr) return 'Date TBD';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return 'Date TBD';

  const diffMs = d.getTime() - refDate.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isToday =
    d.getDate() === refDate.getDate() &&
    d.getMonth() === refDate.getMonth() &&
    d.getFullYear() === refDate.getFullYear();

  const tomorrow = new Date(refDate);
  tomorrow.setDate(refDate.getDate() + 1);
  const isTomorrow =
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear();

  const yesterday = new Date(refDate);
  yesterday.setDate(refDate.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) {
    if (diffHours < 0) {
      return `Today at ${timeString} (${Math.abs(diffHours)}h ago)`;
    }
    return `Today at ${timeString} (in ${diffHours}h)`;
  }

  if (isTomorrow) {
    return `Tomorrow at ${timeString}`;
  }

  if (isYesterday) {
    return `Yesterday at ${timeString}`;
  }

  if (diffDays > 1 && diffDays < 7) {
    return `In ${diffDays} days (${d.toLocaleDateString('en-US', { weekday: 'short' })} at ${timeString})`;
  }

  if (diffDays < -1 && diffDays > -7) {
    return `${Math.abs(diffDays)} days ago (${timeString})`;
  }

  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeString}`;
}

export type DeliverableDueStatus = 'OVERDUE' | 'DUE_SOON' | 'OPEN' | 'COMPLETED';

/**
 * Calculates deliverable due status:
 * - OVERDUE: past due date
 * - DUE_SOON: due within next 48 hours
 * - OPEN: future (> 48 hours)
 */
export function getDeliverableStatus(
  dueDateStr: string,
  isCompleted: boolean,
  refDate: Date = new Date()
): DeliverableDueStatus {
  if (isCompleted) return 'COMPLETED';

  // Compare due date at end of day (23:59:59)
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day, 23, 59, 59, 999);

  if (dueDate < refDate) {
    return 'OVERDUE';
  }

  const fortyEightHoursFromNow = new Date(refDate.getTime() + 48 * 60 * 60 * 1000);
  if (dueDate <= fortyEightHoursFromNow) {
    return 'DUE_SOON';
  }

  return 'OPEN';
}

/**
 * Helper to produce ISO string for N days relative to now, at a given hour.
 */
export function createRelativeIsoDate(daysOffset: number, hours = 14, minutes = 0, baseDate = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/**
 * Helper to produce YYYY-MM-DD string for N days relative to now.
 */
export function createRelativeDateString(daysOffset: number, baseDate = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
