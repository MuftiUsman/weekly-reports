import express, { Request, Response } from 'express';

const router = express.Router();

// Fetch timesheets from Fabric and transform to Keka-compatible format
router.get('/', async (req: Request, res: Response) => {
  // Read env var at runtime, not at module load time
  const FABRIC_API_URL = process.env.FABRIC_API_URL || 'http://localhost:8000';
  try {
    const { start_date, end_date } = req.query;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    console.log(`Fetching timesheets from Fabric: ${start_date} to ${end_date}`);

    // Generate array of dates between start_date and end_date
    const dates = getDatesInRange(start_date as string, end_date as string);
    console.log(`Fetching timesheets for ${dates.length} days...`);

    // Fetch timesheets for each day
    const allFabricData: any[] = [];

    for (const day of dates) {
      try {
        const fabricResponse = await fetch(
          `${FABRIC_API_URL}/api/v1/timesheet?day=${day}`,
          {
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'X-Organization-Id': req.headers['x-organization-id'] as string || ''
            }
          }
        );

        if (fabricResponse.ok) {
          const dayData = await fabricResponse.json();
          if (Array.isArray(dayData) && dayData.length > 0) {
            console.log(`  ✓ ${day}: ${dayData.length} entries`);
            // Add the day to each timesheet entry since Fabric doesn't include it
            dayData.forEach(ts => ts.day = day);
            allFabricData.push(...dayData);
          } else {
            console.log(`  - ${day}: no entries`);
          }
        } else {
          console.log(`  ✗ ${day}: HTTP ${fabricResponse.status}`);
        }
      } catch (dayError) {
        console.error(`  ✗ ${day}: ${dayError instanceof Error ? dayError.message : 'Error'}`);
        // Continue with other days even if one fails
      }
    }

    console.log(`Total: Received ${allFabricData.length} timesheet entries from Fabric`);

    // Transform Fabric format to Keka-compatible format
    const kekaFormatData = transformFabricToKeka(allFabricData);
    console.log(`Transformed to ${kekaFormatData.length} Keka entries`);

    res.json({ data: kekaFormatData });
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to generate array of dates between start and end
function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return [];
  }

  const current = new Date(start);
  while (current <= end) {
    // Format as YYYY-MM-DD
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Transform Fabric timesheet format to Keka-compatible format
function transformFabricToKeka(fabricTimesheets: any[]): any[] {
  if (!Array.isArray(fabricTimesheets)) {
    return [];
  }

  const kekaEntries: any[] = [];

  fabricTimesheets.forEach(timesheet => {
    const date = timesheet.day; // We added this in the fetch loop

    if (!date) {
      console.warn('Timesheet missing day field:', timesheet.id);
      return;
    }

    // Fabric uses 'timesheetEntries' not 'entries'
    if (timesheet.timesheetEntries && Array.isArray(timesheet.timesheetEntries)) {
      timesheet.timesheetEntries.forEach((entry: any) => {
        kekaEntries.push({
          // Keka format fields
          date: date,
          workDate: date,
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          hours: (entry.mins || 0) / 60, // Convert minutes to hours
          description: entry.description || '',
          project: timesheet.projectName || 'Unknown Project',
          projectId: timesheet.id, // Using timesheet ID as project reference
          client: timesheet.description || timesheet.projectName || 'Client', // Using description as client
          // Additional metadata for reference
          timesheetId: timesheet.id,
          entryId: entry.id,
          status: timesheet.status || 'DRAFT',
          workCategory: entry.workCategory?.categoryName || 'Work'
        });
      });
    } else {
      console.warn('Timesheet has no timesheetEntries:', timesheet.id);
    }
  });

  // Sort by date
  kekaEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return kekaEntries;
}

export default router;
