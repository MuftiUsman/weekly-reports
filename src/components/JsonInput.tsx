import React from 'react'
import type { AppState, KekaTimesheetEntry } from '../types/timesheet'

interface JsonInputProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

const JsonInput: React.FC<JsonInputProps> = ({ appState, updateAppState }) => {
  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAppState({
      rawJsonInput: e.target.value,
      jsonParseError: null
    })
  }

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

  const parseJsonData = () => {
    if (!appState.rawJsonInput.trim()) {
      updateAppState({
        jsonParseError: 'Please enter JSON data'
      })
      return
    }

    try {
      const parsed = JSON.parse(appState.rawJsonInput.trim())
      
      // Check if data is nested in a "data" field
      let timesheetArray = parsed
      if (!Array.isArray(parsed) && parsed.data && Array.isArray(parsed.data)) {
        timesheetArray = parsed.data
      }
      
      // Validate that we have an array
      if (!Array.isArray(timesheetArray)) {
        updateAppState({
          jsonParseError: 'JSON must be an array of timesheet entries or contain a "data" field with an array'
        })
        return
      }

      // Validate each entry has required fields
      const validEntries: KekaTimesheetEntry[] = []
      const requiredFields = ['id', 'date', 'totalMinutes', 'taskName', 'projectName', 'clientName']
      
      for (let i = 0; i < timesheetArray.length; i++) {
        const entry = timesheetArray[i]
        const missingFields = requiredFields.filter(field => !(field in entry))
        
        if (missingFields.length > 0) {
          updateAppState({
            jsonParseError: `Entry ${i + 1} is missing required fields: ${missingFields.join(', ')}`
          })
          return
        }
        
        validEntries.push(entry as KekaTimesheetEntry)
      }

      updateAppState({
        parsedKekaData: validEntries,
        jsonParseError: null
      })

      console.log('Successfully parsed', validEntries.length, 'timesheet entries')
    } catch (error) {
      updateAppState({
        jsonParseError: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      parseJsonData()
    }
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

      {/* JSON Input Area */}
      <div className="flex-1 flex flex-col">
        <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700 mb-2">
          Keka Timesheet JSON Array
        </label>
        <textarea
          id="jsonInput"
          value={appState.rawJsonInput}
          onChange={handleJsonInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Paste your Keka timesheet JSON array here..."
          className="flex-1 w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
        />
        
        {/* Parse Button */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={parseJsonData}
            disabled={!appState.rawJsonInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Parse JSON Data
          </button>
          <span className="text-xs text-gray-500">
            Ctrl + Enter to parse
          </span>
        </div>

        {/* Status Messages */}
        {appState.jsonParseError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{appState.jsonParseError}</p>
          </div>
        )}

        {appState.parsedKekaData.length > 0 && !appState.jsonParseError && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              ✓ Successfully parsed {appState.parsedKekaData.length} timesheet entries
            </p>
          </div>
        )}

        {/* Sample Format Help */}
        <details className="mt-4">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
            View expected JSON format
          </summary>
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`Option 1 - Direct array:
[
  {
    "id": 2392106,
    "date": "2025-07-08",
    "totalMinutes": 120,
    "taskName": "Design",
    "projectName": "JPMC Conversational AI",
    "clientName": "JPMC",
    "comments": "Evals Design"
  }
]

Option 2 - Nested in "data" field:
{
  "data": [
    {
      "id": 2392106,
      "date": "2025-07-08",
      "totalMinutes": 120,
      "taskName": "Design",
      "projectName": "JPMC Conversational AI",
      "clientName": "JPMC",
      "comments": "Evals Design"
    }
  ]
}`}
            </pre>
          </div>
        </details>
      </div>
    </div>
  )
}

export default JsonInput