import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns'
import type { KekaTimesheetEntry, DayEntry, WeeklyReport } from '../types/timesheet'

// Group Keka entries by date and combine tasks for each day
export const groupEntriesByDate = (entries: KekaTimesheetEntry[]): Map<string, KekaTimesheetEntry[]> => {
  const grouped = new Map<string, KekaTimesheetEntry[]>()
  
  entries.forEach(entry => {
    const date = entry.date
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date)!.push(entry)
  })
  
  return grouped
}

// Generate a summary string from multiple tasks on the same day
export const generateDaySummary = (entries: KekaTimesheetEntry[]): string => {
  if (entries.length === 0) return ''
  
  // Group by project and task, then create readable summary
  const taskGroups = new Map<string, { taskName: string; comments: string[] }>()
  
  entries.forEach(entry => {
    const key = entry.taskName // Only use task name, not project name
    if (!taskGroups.has(key)) {
      taskGroups.set(key, {
        taskName: key,
        comments: []
      })
    }
    
    if (entry.comments && entry.comments.trim()) {
      taskGroups.get(key)!.comments.push(entry.comments.trim())
    }
  })
  
  // Build summary string with bold task names
  const summaryParts: string[] = []
  taskGroups.forEach(({ taskName, comments }) => {
    if (comments.length > 0) {
      const uniqueComments = [...new Set(comments)]
      summaryParts.push(`**${taskName}**: ${uniqueComments.join(', ')}`)
    } else {
      summaryParts.push(`**${taskName}**`)
    }
  })
  
  return summaryParts.join('; ')
}

// Calculate total hours from total minutes
export const calculateTotalHours = (entries: KekaTimesheetEntry[]): number => {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0)
  return Math.round((totalMinutes / 60) * 100) / 100 // Round to 2 decimal places
}

// Convert grouped entries to DayEntry array
export const convertToDayEntries = (groupedEntries: Map<string, KekaTimesheetEntry[]>): DayEntry[] => {
  const dayEntries: DayEntry[] = []
  
  groupedEntries.forEach((entries, date) => {
    const entryDate = new Date(date);
    const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    dayEntries.push({
      date,
      summary: generateDaySummary(entries),
      location: 'Client Office', // Default location - user can change this
      totalHours: calculateTotalHours(entries),
      isManualEntry: false,
      isWeekend,
      isLeave: false, // Default to false, can be updated later
      originalKekaEntries: entries
    })
  })
  
  // Sort by date
  dayEntries.sort((a, b) => a.date.localeCompare(b.date))
  
  return dayEntries
}

// Get week boundaries for a given date
export const getWeekBoundaries = (date: string) => {
  const parsedDate = parseISO(date)
  const weekStart = startOfWeek(parsedDate, { weekStartsOn: 1 }) // Monday start
  const weekEnd = endOfWeek(parsedDate, { weekStartsOn: 1 }) // Sunday end
  
  return {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    weekEnd: format(weekEnd, 'yyyy-MM-dd')
  }
}

// Generate weekly report from Keka data
export const generateWeeklyReport = (
  kekaEntries: KekaTimesheetEntry[], 
  clientName: string,
  employeeName: string,
  targetWeek?: string
): WeeklyReport | null => {
  if (kekaEntries.length === 0) return null
  
  // Group entries by date
  const groupedEntries = groupEntriesByDate(kekaEntries)
  
  // Convert to day entries
  const dayEntries = convertToDayEntries(groupedEntries)
  
  if (dayEntries.length === 0) return null
  
  // Determine week boundaries
  const firstDate = dayEntries[0].date
  const { weekStart, weekEnd } = getWeekBoundaries(targetWeek || firstDate)
  
  // Filter entries for the target week if specified
  const weekEntries = targetWeek 
    ? dayEntries.filter(entry => {
        const entryWeek = getWeekBoundaries(entry.date)
        return entryWeek.weekStart === weekStart
      })
    : dayEntries
  
  // Calculate total hours
  const totalHours = weekEntries.reduce((sum, entry) => sum + entry.totalHours, 0)
  
  // Calculate total leave days
  const totalLeaveDays = weekEntries.filter(entry => entry.isLeave).length;
  
  return {
    startDate: weekStart,
    endDate: weekEnd,
    clientName: clientName || 'Client Name',
    employeeName: employeeName || 'Employee Name',
    entries: weekEntries,
    totalHours: Math.round(totalHours * 100) / 100,
    totalLeaveDays
  }
}

// Get unique weeks from Keka data for week selection
export const getAvailableWeeks = (kekaEntries: KekaTimesheetEntry[]): Array<{value: string, label: string}> => {
  const weeks = new Set<string>()
  
  kekaEntries.forEach(entry => {
    const { weekStart } = getWeekBoundaries(entry.date)
    weeks.add(weekStart)
  })
  
  return Array.from(weeks)
    .sort()
    .map(weekStart => {
      const { weekEnd } = getWeekBoundaries(weekStart)
      const startDate = format(parseISO(weekStart), 'MMM d')
      const endDate = format(parseISO(weekEnd), 'MMM d, yyyy')
      
      return {
        value: weekStart,
        label: `${startDate} - ${endDate}`
      }
    })
}