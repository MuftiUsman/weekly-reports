import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Simple fallback summarizer that works locally without API calls
 */
const simpleSummarizer = (text: string): string => {
  if (!text || text.trim() === '') {
    return 'No work activities were recorded during this period.';
  }
  
  // Basic cleaning of the input
  const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
  const items = cleanText.split('|').map(s => s.trim()).filter(s => s.length > 0);
  
  if (items.length === 0) return 'Work activities recorded.';
  
  // Take first 3 activities and join them simply
  const summary = items.slice(0, 3).join('. ') + (items.length > 3 ? ' and other tasks.' : '.');
  return `Focus was on: ${summary}`;
};

/**
 * Generates an executive summary using Google's Gemini API
 * @param taskSummaries The input text to summarize
 * @param userApiKey Optional personal API key provided by the user in settings
 * @returns A promise that resolves to the generated summary
 */
export const generateExecutiveSummary = async (taskSummaries: string, userApiKey?: string | null): Promise<string> => {
  if (!taskSummaries || taskSummaries.trim() === '') {
    return 'No work activities were recorded during this period.';
  }

  try {
    // Priority: User API Key > Environment Variable
    const apiKey = userApiKey || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
      console.warn('No Gemini API key found. Falling back to simple local summarizer.');
      return simpleSummarizer(taskSummaries);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const prompt = `
    Please provide a professional, concise executive summary of the following work activities.
    Focus on key achievements and impact. Keep it between 1-2 small sentences.

    Work Activities:
    ${taskSummaries}
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const summary = result.response.text().trim();
    return summary.endsWith('.') ? summary : summary + '.';
    
  } catch (error) {
    // LOG THE ERROR IN BACKGROUND
    console.error('AI Summary failed (Quota or Network):', error);
    
    // RETURN FALLBACK INSTEAD OF THROWING
    return simpleSummarizer(taskSummaries);
  }
};

export const generateExecutiveSummaryWithOpenAI = generateExecutiveSummary;
