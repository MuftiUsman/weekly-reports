# Weekly Report Generator

A professional timesheet and weekly report generator that processes Keka timesheet JSON data and creates beautiful PDF reports with AI-powered executive summaries.

## Features

- **Keka Integration**: Parse Keka timesheet JSON arrays into organized daily entries
- **Date Range Selection**: Custom start and end date selection for flexible reporting periods
- **Smart Data Processing**: Automatically groups tasks by date and combines them into daily summaries
- **Editable Reports**: Full editing capabilities for summaries, locations, and hours
- **AI Executive Summaries**: Automated executive summary generation using OpenAI GPT-4o-mini
- **Manual Summary Editing**: Edit and customize executive summaries with inline editing
- **Professional PDF Export**: Generate client-ready PDF timesheets with company branding
- **Multi-week Support**: Handle data spanning multiple weeks with week navigation
- **Leave Day Tracking**: Automatic detection and handling of weekends and leave days

## Quick Start

### Prerequisites
- Node.js (v20 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd weekly-report/weekly-report-app

# Install dependencies
npm install

# Set up environment variables (optional - for AI features)
cp .env.example .env
# Add your OpenAI API key to .env
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

### OpenAI Integration (Optional)

For AI-powered executive summaries, add your OpenAI API key to the `.env` file:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Without an API key, the app will use a mock implementation for executive summaries.

## Usage

### Getting Keka Data
1. Go to [https://think41.keka.com/#/me/timesheet/all-timesheets](https://think41.keka.com/#/me/timesheet/all-timesheets)
2. Open browser developer tools (F12) and go to Network tab
3. Select the timesheet period you want to export
4. Look for the API call: `api/mytimesheet/timeentriesdetails?employeeTimesheetId={employee_id}`
5. Copy the response JSON data under the "data" field
6. **Note**: For multiple weeks, you'll need to collate data from multiple API calls under a single "data" array before pasting

### Creating Reports
1. **Import Data**: Paste your Keka timesheet JSON data in the left panel
2. **Set Details**: Enter client name, employee name, and select date range
3. **Review & Edit**: The app automatically generates daily entries that you can edit
4. **Executive Summary**: AI generates a professional summary (editable)
5. **Export PDF**: Generate a professional PDF timesheet

### Sample Data

Use the included `sample-keka-data.json` file to test the application features.

## Application Architecture

### Key Features Detail

- **Smart Data Processing**: Parses Keka JSON arrays, groups tasks by date, and combines multiple tasks into coherent daily summaries
- **AI Executive Summaries**: Auto-generates professional summaries focusing on work types using OpenAI GPT-4o-mini (with manual editing and regeneration)
- **Flexible Location Management**: Editable dropdown options (Client Office, WFH, Office, On Leave) with smart defaults and leave day detection
- **Professional PDF Export**: Client-ready formatting with company branding, comprehensive timesheet layout, and executive summary inclusion
- **Multi-week Support**: Handles data spanning multiple weeks with automatic weekend and leave day detection

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns
- **AI Integration**: OpenAI API (GPT-4o-mini)
- **Build Tool**: Vite with TypeScript


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with sample data
5. Submit a pull request

## License

This project is proprietary software developed for internal use.