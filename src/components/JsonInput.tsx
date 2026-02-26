import React from 'react'
import type { AppState } from '../types/timesheet'

interface JsonInputProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

const JsonInput: React.FC<JsonInputProps> = ({ appState, updateAppState }) => {
  const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAppState({
      clientName: e.target.value
    })
  }

  const handleEmployeeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAppState({
      employeeName: e.target.value
    })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAppState({
      startDate: e.target.value
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAppState({
      endDate: e.target.value
    })
  }

  const initializeReport = () => {
    if (!appState.clientName.trim() || !appState.employeeName.trim() || !appState.startDate || !appState.endDate) {
      updateAppState({
        jsonParseError: 'Please fill all fields (Client, Employee, and Dates)'
      })
      return
    }

    updateAppState({
      isInitialized: true,
      jsonParseError: null,
      parsedKekaData: [], // Ensure it's empty as we are doing manual entry
      weeklyReport: null // Clear existing report to trigger regeneration
    })
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Client Name Input */}
      <div className="mb-4">
        <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
          Client Name (for PDF header)
        </label>
        <input
          id="clientName"
          type="text"
          value={appState.clientName}
          onChange={handleClientNameChange}
          placeholder="Enter client name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Employee Name Input */}
      <div className="mb-4">
        <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-2">
          Employee Name
        </label>
        <input
          id="employeeName"
          type="text"
          value={appState.employeeName}
          onChange={handleEmployeeNameChange}
          placeholder="Enter employee name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Date Range Inputs */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timesheet Period
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={appState.startDate}
              onChange={handleStartDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={appState.endDate}
              onChange={handleEndDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={initializeReport}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Parse JSON Data
        </button>
      </div>

      {/* Status Messages */}
      {appState.jsonParseError && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{appState.jsonParseError}</p>
        </div>
      )}
    </div>
  )
}

export default JsonInput
