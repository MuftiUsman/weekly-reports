// Keka timesheet entry structure based on provided sample
export interface KekaTimesheetEntry {
  id: number;
  employeeTimesheetId: number;
  employeeId: number;
  clientName: string;
  projectId: number;
  projectName: string;
  projectCode: string;
  projectStartDate: string;
  projectEndDate: string | null;
  projectStatus: number;
  isArchived: boolean;
  taskLogging: number;
  restrictTaskWithNoAssignees: boolean;
  allowNonBillableHours: boolean;
  requireComment: boolean;
  requireTimings: boolean;
  hasTimer: boolean;
  taskId: number;
  taskName: string;
  phaseId: number;
  phaseName: string | null;
  date: string; // "2025-07-08"
  status: number;
  rejectedComment: string | null;
  invoiceStatus: number;
  totalMinutes: number; // 120 = 2 hours
  startTime: string | null;
  endTime: string | null;
  comments: string; // "Evals Design"
  billable: boolean | null;
  billingClassificationId: number | null;
  sequenceNumber: number;
  isTimerRunning: boolean;
  taskBillingType: number;
  taskStartDate: string;
  taskEndDate: string | null;
  startTimestamp: string | null;
  endTimestamp: string | null;
  resourceStartDate: string;
  resourceEndDate: string | null;
  taskStageId: number;
  isTaskAssignedToEmployee: boolean;
  isTaskWithNoAssignees: boolean;
  approverLogEntry: ApproverLogEntry[];
  isSystemDefinedTask: boolean;
  allowTimeEntriesOnProject: boolean;
  formattedComment: string;
}

export interface ApproverLogEntry {
  approver: {
    timesheetId: number;
    projectId: number;
    taskId: number;
    approverName: string;
    submitterId: number;
    profilePicUrl: string | null;
    jobTitle: string;
    isAdmin: boolean;
    currentApprovers: number[] | null;
    id: number;
    requestId: number;
    requestIdentifier: string | null;
    approvalRequestType: number;
    level: number;
    approverType: number;
    approverId: number;
    initiatedOn: string | null;
  };
  level: number;
  approvalStatus: number;
  timeStamp: string;
  comment: string;
  status: number;
}

// Location options for work setting
export type LocationType = 'Client Office' | 'WFH' | 'Office' | 'On Leave';

// Processed daily entry for the report
export interface DayEntry {
  date: string; // "2025-07-08"
  summary: string; // Combined task summary from Keka + manual edits
  location: LocationType;
  totalHours: number; // Calculated from Keka totalMinutes or manual entry
  isManualEntry: boolean; // Track if added manually vs from Keka
  isWeekend: boolean; // Track if this is a weekend day
  isLeave: boolean; // Track if this is a leave day (for missing weekdays)
  originalKekaEntries?: KekaTimesheetEntry[]; // Original Keka data for reference
}

// Weekly report data structure
export interface WeeklyReport {
  startDate: string; // Custom start date from user input
  endDate: string; // Custom end date from user input
  clientName: string; // From user input
  employeeName: string; // Employee name
  entries: DayEntry[];
  totalHours: number;
  totalLeaveDays: number; // Count of leave days
  executiveSummary?: string; // AI-generated summary
}

// Application state
export interface AppState {
  rawJsonInput: string;
  parsedKekaData: KekaTimesheetEntry[];
  clientName: string;
  employeeName: string; // Employee name for the timesheet
  startDate: string; // User-selected start date
  endDate: string; // User-selected end date
  weeklyReport: WeeklyReport | null;
  jsonParseError: string | null;
  isGeneratingSummary: boolean; // Loading state for AI summary
}