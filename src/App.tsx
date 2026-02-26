import { useState, useCallback } from 'react'
import { Button, Modal } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import type { AppState, WeeklyReport } from './types/timesheet'
import JsonInput from './components/JsonInput'
import WeeklyEditor from './components/WeeklyEditor'
import ApiKeyInput from './components/ApiKeyInput.tsx'

function App() {
  const [appState, setAppState] = useState<AppState>({
    parsedKekaData: [],
    clientName: '',
    employeeName: '',
    startDate: '',
    endDate: '',
    weeklyReport: null,
    jsonParseError: null,
    isGeneratingSummary: false,
    isInitialized: false,
    geminiApiKey: localStorage.getItem('gemini_api_key')
  })

  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }))
  }, [])

  const updateWeeklyReport = useCallback((weeklyReport: WeeklyReport) => {
    setAppState(prev => ({ ...prev, weeklyReport }))
  }, [])

  const [isSettingsVisible, setIsSettingsVisible] = useState(false)

  const showSettings = () => {
    setIsSettingsVisible(true)
  }

  const handleSettingsCancel = () => {
    setIsSettingsVisible(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Settings Modal */}
      <Modal
        title="Settings"
        open={isSettingsVisible}
        onCancel={handleSettingsCancel}
        footer={null}
        width={600}
      >
        <div className="p-4">
          <ApiKeyInput 
            apiKey={appState.geminiApiKey} 
            onKeyChange={(key) => {
              if (key.trim()) {
                localStorage.setItem('gemini_api_key', key.trim());
                updateAppState({ geminiApiKey: key.trim() });
              } else {
                localStorage.removeItem('gemini_api_key');
                updateAppState({ geminiApiKey: null });
              }
            }}
          />
        </div>
      </Modal>

      {/* Left Panel - JSON Input */}
      <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Weekly Report Generator</h1>
            <p className="text-sm text-gray-600 mt-1">Generate professional reports with AI summaries and PDF export</p>
          </div>
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            onClick={showSettings}
            title="Settings"
          />
        </div>
        <div className="flex-1">
          <JsonInput 
            appState={appState}
            updateAppState={updateAppState}
          />
        </div>
      </div>

      {/* Right Panel - Weekly Editor */}
      <div className="w-3/5 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Report</h2>
          <p className="text-sm text-gray-600 mt-1">Edit your timesheet and export to PDF</p>
        </div>
        <div className="flex-1 bg-gray-50">
          <WeeklyEditor
            appState={appState}
            updateWeeklyReport={updateWeeklyReport}
            updateAppState={updateAppState}
          />
        </div>
      </div>
    </div>
  )
}

export default App
