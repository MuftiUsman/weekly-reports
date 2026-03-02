import React, { useState } from 'react'
import { Alert, Button, Spin } from 'antd'
import { CloudDownloadOutlined, EditOutlined } from '@ant-design/icons'
import type { AppState } from '../types/timesheet'
import { fetchTimesheetsFromFabric } from '../services/fabricApi'

interface JsonInputProps {
  appState: AppState
  updateAppState: (updates: Partial<AppState>) => void
}

const JsonInput: React.FC<JsonInputProps> = ({ appState, updateAppState }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

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

  const initializeManualReport = () => {
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

  const fetchFromFabric = async () => {
    // Validate inputs
    if (!appState.clientName.trim() || !appState.employeeName.trim()) {
      setFetchError('Please fill in Client Name and Employee Name')
      return
    }

    if (!appState.startDate || !appState.endDate) {
      setFetchError('Please select start and end dates')
      return
    }

    if (!appState.fabricToken) {
      setFetchError('Please connect to Fabric in Settings first')
      return
    }

    setIsLoading(true)
    setFetchError(null)
    updateAppState({ jsonParseError: null })

    try {
      const data = await fetchTimesheetsFromFabric({
        start_date: appState.startDate,
        end_date: appState.endDate,
        token: appState.fabricToken
      })

      console.log('Fetched timesheet data from Fabric:', data)

      if (!data || data.length === 0) {
        setFetchError('No timesheet data found for the selected date range')
        return
      }

      // Map the transformed Keka-format data to parsedKekaData
      // The backend already transformed it, so we just need to format it correctly
      const kekaFormatted = data.map((entry: any, index: number) => ({
        id: index,
        employeeTimesheetId: entry.timesheetId || 0,
        employeeId: 0,
        clientName: entry.client,
        projectId: entry.projectId,
        projectName: entry.project,
        projectCode: '',
        projectStartDate: '',
        projectEndDate: null,
        projectStatus: 0,
        isArchived: false,
        taskLogging: 0,
        restrictTaskWithNoAssignees: false,
        allowNonBillableHours: false,
        requireComment: false,
        requireTimings: false,
        hasTimer: false,
        taskId: entry.entryId || 0,
        taskName: entry.workCategory || entry.project || 'Work', // Use work category as task name
        phaseId: 0,
        phaseName: null,
        date: entry.date,
        status: entry.status === 'SUBMITTED' ? 2 : 0,
        rejectedComment: null,
        invoiceStatus: 0,
        totalMinutes: Math.round(entry.hours * 60), // Convert hours to minutes
        startTime: null,
        endTime: null,
        comments: entry.description || '', // Full description goes in comments
        billable: true,
        billingClassificationId: null,
        sequenceNumber: index,
        isTimerRunning: false,
        taskBillingType: 0,
        taskStartDate: '',
        taskEndDate: null,
        startTimestamp: null,
        endTimestamp: null,
        resourceStartDate: '',
        resourceEndDate: null,
        taskStageId: 0,
        isTaskAssignedToEmployee: true,
        isTaskWithNoAssignees: false,
        approverLogEntry: [],
        isSystemDefinedTask: false,
        allowTimeEntriesOnProject: true,
        formattedComment: entry.description || ''
      }))

      updateAppState({
        parsedKekaData: kekaFormatted,
        isInitialized: true,
        jsonParseError: null,
        weeklyReport: null // Clear to trigger regeneration
      })

      setFetchError(null)
    } catch (error) {
      console.error('Error fetching from Fabric:', error)
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch data from Fabric')
    } finally {
      setIsLoading(false)
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

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        {appState.fabricToken ? (
          <>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={fetchFromFabric}
              loading={isLoading}
              block
              size="large"
            >
              {isLoading ? 'Fetching from Fabric...' : 'Fetch from Fabric'}
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={initializeManualReport}
              block
            >
              Manual Entry
            </Button>
          </>
        ) : (
          <>
            <Alert
              message="Not connected to Fabric"
              description="Connect to Fabric in Settings to automatically fetch timesheet data"
              type="info"
              showIcon
              className="mb-2"
            />
            <Button
              icon={<EditOutlined />}
              onClick={initializeManualReport}
              type="primary"
              block
              size="large"
            >
              Start Manual Entry
            </Button>
          </>
        )}
      </div>

      {/* Status Messages */}
      {(appState.jsonParseError || fetchError) && (
        <div className="mt-3">
          <Alert
            message={appState.jsonParseError || fetchError}
            type="error"
            showIcon
            closable
            onClose={() => {
              updateAppState({ jsonParseError: null })
              setFetchError(null)
            }}
          />
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex justify-center">
          <Spin tip="Fetching timesheet data from Fabric..." />
        </div>
      )}
    </div>
  )
}

export default JsonInput
