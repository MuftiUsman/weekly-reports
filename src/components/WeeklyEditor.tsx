import React, { useEffect, useState } from 'react'
import type { AppState, WeeklyReport, DayEntry } from '../types/timesheet'
import { generateDateRangeReport, prepareTaskSummariesForAI } from '../utils/dateRangeParser'
import { generateExecutiveSummary } from '../services/openai'
import DayRow from './DayRow'
import PdfExporter from './PdfExporter'

interface WeeklyEditorProps {
  appState: AppState
  updateWeeklyReport: (report: WeeklyReport) => void
  updateAppState?: (updates: Partial<AppState>) => void
}

const WeeklyEditor: React.FC<WeeklyEditorProps> = ({ appState, updateWeeklyReport, updateAppState }) => {
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  // Generate report when data or date range changes
  useEffect(() => {
    if (
      appState.isInitialized && 
      appState.startDate && 
      appState.endDate && 
      appState.clientName && 
      appState.employeeName &&
      !appState.weeklyReport // Only generate if no report exists yet
    ) {
      const report = generateDateRangeReport(
        appState.parsedKekaData, 
        appState.clientName, 
        appState.employeeName,
        appState.startDate,
        appState.endDate
      )
      updateWeeklyReport(report)
    }
  }, [
    appState.isInitialized,
    appState.parsedKekaData, 
    appState.clientName, 
    appState.employeeName, 
    appState.startDate,
    appState.endDate,
    updateWeeklyReport,
    appState.weeklyReport
  ])

  // No longer generating summary automatically on load
  // to avoid triggering it while user is manually typing entries.

  const generateSummary = async () => {
    if (!appState.weeklyReport || !updateAppState) return
    
    // Check if there's any summary data to generate from
    const taskSummaries = prepareTaskSummariesForAI(appState.weeklyReport.entries)
    if (!taskSummaries.trim()) {
      alert('Please enter some task summaries first before generating an AI summary.')
      return
    }
    
    // Set loading state
    updateAppState({ isGeneratingSummary: true })
    const updatedReport = { ...appState.weeklyReport, executiveSummary: 'Generating summary...' }
    updateWeeklyReport(updatedReport)
    
    try {
      const summary = await generateExecutiveSummary(taskSummaries)
      
      const finalReport = { ...appState.weeklyReport, executiveSummary: summary }
      updateWeeklyReport(finalReport)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      // DON'T PUT TECHNICAL ERROR IN SUMMARY FIELD
      // The generateExecutiveSummary itself now handles fallback
      const currentSummary = appState.weeklyReport.executiveSummary === 'Generating summary...' 
        ? '' 
        : appState.weeklyReport.executiveSummary;
        
      const errorReport = { 
        ...appState.weeklyReport, 
        executiveSummary: currentSummary || 'Failed to generate summary with AI.' 
      }
      updateWeeklyReport(errorReport)
    } finally {
      updateAppState({ isGeneratingSummary: false })
    }
  }

  const startEditingSummary = () => {
    setEditedSummary(appState.weeklyReport?.executiveSummary || '')
    setIsEditingSummary(true)
  }

  const saveEditedSummary = () => {
    if (appState.weeklyReport) {
      const updatedReport = { ...appState.weeklyReport, executiveSummary: editedSummary.trim() }
      updateWeeklyReport(updatedReport)
    }
    setIsEditingSummary(false)
    setEditedSummary('')
  }

  const cancelEditingSummary = () => {
    setIsEditingSummary(false)
    setEditedSummary('')
  }

  const handleDayEntryChange = (index: number, updates: Partial<DayEntry>) => {
    if (!appState.weeklyReport) return

    const updatedEntries = [...appState.weeklyReport.entries]
    updatedEntries[index] = { ...updatedEntries[index], ...updates }

    // Recalculate totals
    const totalHours = updatedEntries
      .filter(entry => !entry.isWeekend && !entry.isLeave)
      .reduce((sum, entry) => sum + entry.totalHours, 0)
    
    const totalLeaveDays = updatedEntries
      .filter(entry => !entry.isWeekend && entry.isLeave) // Count manual leave days too
      .length

    const updatedReport: WeeklyReport = {
      ...appState.weeklyReport,
      entries: updatedEntries,
      totalHours: Math.round(totalHours * 100) / 100,
      totalLeaveDays
    }

    updateWeeklyReport(updatedReport)
  }

  const handleAddDay = () => {
    if (!appState.weeklyReport) return

    const newEntry: DayEntry = {
      date: new Date().toISOString().split('T')[0],
      summary: '',
      location: 'JPMC-ETV',
      totalHours: 0,
      isManualEntry: true,
      isWeekend: false,
      isLeave: false
    }

    const updatedEntries = [...appState.weeklyReport.entries, newEntry]
    updatedEntries.sort((a, b) => a.date.localeCompare(b.date))

    const updatedReport: WeeklyReport = {
      ...appState.weeklyReport,
      entries: updatedEntries,
      totalHours: updatedEntries.reduce((sum, entry) => sum + entry.totalHours, 0)
    }

    updateWeeklyReport(updatedReport)
  }

  const handleDeleteDay = (index: number) => {
    if (!appState.weeklyReport) return

    const updatedEntries = appState.weeklyReport.entries.filter((_, i) => i !== index)
    
    const updatedReport: WeeklyReport = {
      ...appState.weeklyReport,
      entries: updatedEntries,
      totalHours: updatedEntries.reduce((sum, entry) => sum + entry.totalHours, 0)
    }

    updateWeeklyReport(updatedReport)
  }

  // Show message if not initialized
  if (!appState.isInitialized) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
          <p className="text-gray-600">Enter client name, employee name and date range, then click "Parse JSON Data" to generate weekly report</p>
        </div>
      </div>
    )
  }

  // Show message if report creation is pending
  if (!appState.weeklyReport) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Timesheet Report Display */}
      {appState.weeklyReport && (
        <div className="flex-1 flex flex-col">
          {/* Report Header */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Timesheet: {new Date(appState.weeklyReport.startDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })} - {new Date(appState.weeklyReport.endDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>Client: {appState.weeklyReport.clientName}</span>
              <span>Employee: {appState.weeklyReport.employeeName}</span>
              <span>Total Hours: {appState.weeklyReport.totalHours}</span>
              {appState.weeklyReport.totalLeaveDays > 0 && (
                <span>Leave Days: {appState.weeklyReport.totalLeaveDays}</span>
              )}
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold text-blue-900">Executive Summary</h4>
              <div className="flex gap-2">
                {!isEditingSummary && (
                  <>
                    <button
                      onClick={startEditingSummary}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {appState.weeklyReport.executiveSummary ? 'Edit' : 'Add Manually'}
                    </button>
                    <button
                      onClick={() => generateSummary()}
                      disabled={appState.isGeneratingSummary}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {appState.isGeneratingSummary ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {appState.weeklyReport.executiveSummary ? 'Regenerate' : 'Generate with AI'}
                        </>
                      )}
                    </button>
                  </>
                )}
                {isEditingSummary && (
                  <>
                    <button
                      onClick={saveEditedSummary}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </button>
                    <button
                      onClick={cancelEditingSummary}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
            {isEditingSummary ? (
              <textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full p-3 text-sm text-blue-800 bg-white border border-blue-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Enter executive summary..."
              />
            ) : (
              <p className="text-sm text-blue-800 leading-relaxed min-h-[1.25rem]">
                {appState.weeklyReport.executiveSummary || <span className="text-blue-400 italic">No summary generated yet. Click "Generate with AI" or "Add Manually".</span>}
              </p>
            )}
          </div>

          {/* Day Entries Table */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appState.weeklyReport.entries.map((entry, index) => (
                    <DayRow
                      key={`${entry.date}-${index}`}
                      entry={entry}
                      onChange={(updates) => handleDayEntryChange(index, updates)}
                      onDelete={() => handleDeleteDay(index)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleAddDay}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Day
            </button>

            <PdfExporter weeklyReport={appState.weeklyReport} />
          </div>
        </div>
      )}
    </div>
  )
}

export default WeeklyEditor