const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface FabricTimesheetParams {
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  token: string;
  organizationId?: string;
}

export async function fetchTimesheetsFromFabric(params: FabricTimesheetParams) {
  const { start_date, end_date, token, organizationId } = params;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  if (organizationId) {
    headers['X-Organization-Id'] = organizationId;
  }

  const response = await fetch(
    `${BACKEND_URL}/api/timesheets?start_date=${start_date}&end_date=${end_date}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch timesheets: ${response.status}`);
  }

  const data = await response.json();
  return data.data || []; // Return the transformed Keka-format data
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}
