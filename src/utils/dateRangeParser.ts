import { format, parseISO, addDays, isWeekend, differenceInDays } from 'date-fns'
import type { KekaTimesheetEntry, DayEntry, WeeklyReport } from '../types'

// Helper function to clean markdown formatting
const cleanMarkdown = (text: string): string => {
  return text.replace(/\*\*(.*?)\*\*/g, '$1')
}

// Generate a summary string from multiple tasks on the same day
const generateDaySummary = (entries: KekaTimesheetEntry[]): string => {
  if (entries.length === 0) return ''
  
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
  
  return summaryParts.join('\n')
}

// Calculate total hours from total minutes
const calculateTotalHours = (entries: KekaTimesheetEntry[]): number => {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0)
  return Math.round((totalMinutes / 60) * 100) / 100
}

// Generate all dates in the range
const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = []
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const daysDiff = differenceInDays(end, start)
  
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = addDays(start, i)
    dates.push(format(currentDate, 'yyyy-MM-dd'))
  }
  
  return dates
}

// Group Keka entries by date
const groupEntriesByDate = (entries: KekaTimesheetEntry[]): Map<string, KekaTimesheetEntry[]> => {
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

// Generate report with date range, weekend handling, and leave tracking
export const generateDateRangeReport = (
  kekaEntries: KekaTimesheetEntry[],
  clientName: string,
  employeeName: string,
  startDate: string,
  endDate: string
): WeeklyReport => {
  // Generate all dates in the range
  const allDates = generateDateRange(startDate, endDate)
  
  // Group Keka entries by date
  const groupedEntries = groupEntriesByDate(kekaEntries)
  
  // Create day entries for all dates in range
  const dayEntries: DayEntry[] = []
  let totalLeaveDays = 0
  
  allDates.forEach(date => {
    const kekaEntriesForDate = groupedEntries.get(date) || []
    const dateObj = parseISO(date)
    const isWeekendDay = isWeekend(dateObj)
    
    if (kekaEntriesForDate.length > 0) {
      // Has Keka entries for this date
      dayEntries.push({
        date,
        summary: generateDaySummary(kekaEntriesForDate),
        location: 'Client Office', // Default
        totalHours: calculateTotalHours(kekaEntriesForDate),
        isManualEntry: false,
        isWeekend: isWeekendDay,
        isLeave: false,
        originalKekaEntries: kekaEntriesForDate
      })
    } else if (isWeekendDay) {
      // Weekend day - add as grayed out
      dayEntries.push({
        date,
        summary: 'Weekend',
        location: 'On Leave',
        totalHours: 0,
        isManualEntry: true,
        isWeekend: true,
        isLeave: false
      })
    } else {
      // Weekday with no Keka entry - allow user to mark as leave
      dayEntries.push({
        date,
        summary: '',
        location: 'On Leave',
        totalHours: 0,
        isManualEntry: true,
        isWeekend: false,
        isLeave: true // Default to leave, user can change
      })
      totalLeaveDays++
    }
  })
  
  // Calculate total hours (excluding weekends and leave days)
  const totalHours = dayEntries
    .filter(entry => !entry.isWeekend && !entry.isLeave)
    .reduce((sum, entry) => sum + entry.totalHours, 0)
  
  return {
    startDate,
    endDate,
    clientName: clientName || 'Client Name',
    employeeName: employeeName || 'Employee Name',
    entries: dayEntries,
    totalHours: Math.round(totalHours * 100) / 100,
    totalLeaveDays
  }
}

// Generate executive summary using task summaries (for OpenAI integration)
export const prepareTaskSummariesForAI = (dayEntries: DayEntry[]): string => {
  const workEntries = dayEntries.filter(entry => 
    !entry.isWeekend && 
    !entry.isLeave && 
    entry.summary.trim() !== '' && 
    entry.summary !== 'Weekend'
  )
  
  const allSummaries = workEntries
    .map(entry => cleanMarkdown(entry.summary))
    .filter(summary => summary.trim() !== '')
    .join(' | ')
  
  return allSummaries
}