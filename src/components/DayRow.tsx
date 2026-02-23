import React from 'react'
import type { DayEntry, LocationType } from '../types/timesheet'

interface DayRowProps {
  entry: DayEntry
  onChange: (updates: Partial<DayEntry>) => void
  onDelete: () => void
}

const LOCATION_OPTIONS: LocationType[] = ['JPMC-ETV','JPMC-PTP','WFH', 'Office', 'On Leave']

const DayRow: React.FC<DayRowProps> = ({ entry, onChange, onDelete }) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ date: e.target.value })
  }

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ summary: e.target.value })
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value as LocationType
    const isLeave = newLocation === 'On Leave'
    onChange({ 
      location: newLocation,
      isLeave: isLeave,
      totalHours: isLeave ? 0 : entry.totalHours // Reset hours if on leave
    })
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value) || 0
    onChange({ totalHours: Math.round(hours * 100) / 100 })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Determine row styling based on entry type
  const getRowClassName = () => {
    if (entry.isWeekend) return 'bg-gray-100'
    if (entry.isLeave) return 'bg-red-50'
    if (entry.isManualEntry) return 'bg-blue-50'
    return 'bg-white'
  }

  return (
    <tr className={getRowClassName()}>
      {/* Date Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <input
            type="date"
            value={entry.date}
            onChange={handleDateChange}
            className="text-sm font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          />
          <span className="text-xs text-gray-500 mt-1">
            {formatDate(entry.date)}
          </span>
        </div>
      </td>

      {/* Summary Column */}
      <td className="px-6 py-4">
        <textarea
          value={entry.summary}
          onChange={handleSummaryChange}
          placeholder={entry.isWeekend ? "Weekend" : entry.isLeave ? "On Leave" : "Enter task summary..."}
          rows={2}
          disabled={entry.isWeekend}
          className={`w-full text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            entry.isWeekend ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-900'
          }`}
        />
      </td>

      {/* Location Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={entry.location}
          onChange={handleLocationChange}
          disabled={entry.isWeekend}
          className={`text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            entry.isWeekend ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-900'
          }`}
        >
          {LOCATION_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>

      {/* Hours Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          value={entry.totalHours}
          onChange={handleHoursChange}
          min="0"
          step="0.25"
          disabled={entry.isWeekend || entry.isLeave}
          className={`w-20 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            entry.isWeekend || entry.isLeave ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-900'
          }`}
        />
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
          title="Delete row"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        {entry.isWeekend && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Weekend
          </span>
        )}
        {entry.isLeave && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Leave
          </span>
        )}
        {entry.isManualEntry && !entry.isWeekend && !entry.isLeave && (
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Manual
          </span>
        )}
      </td>
    </tr>
  )
}

export default DayRow