import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple fallback summarizer if API call fails
const simpleSummarizer = (text: string): string => {
  if (!text || text.trim() === '') {
    return 'No work activities were recorded during this period.';
  }
  
  const sentences = text
    .split('.')
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  return sentences.slice(0, 3).join('. ') + '.';
};

/**
 * Generates an executive summary using Google's Gemini API
 * @param taskSummaries The input text to summarize
 * @returns A promise that resolves to the generated summary
 */
export const generateExecutiveSummary = async (taskSummaries: string): Promise<string> => {
  if (!taskSummaries || taskSummaries.trim() === '') {
    return 'No work activities were recorded during this period.';
  }

  try {
    // Get API key from Vite environment variables
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 1,
        topK: 32,
        maxOutputTokens: 200,
      },
    });

    // Create a more structured prompt
    const prompt = `
    Please provide a professional, concise executive summary of the following work activities.
    Focus on key achievements, outcomes, and impact.
    Use a professional tone and keep it between 1-2 small sentences.

    Work Activities:
    ${taskSummaries}
    `;

    // Generate content
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }]
    });

    // Get the response text
    const response = result.response;
    const summary = response.text().trim();
    
    // Ensure the summary ends with a period
    return summary.endsWith('.') ? summary : summary + '.';
    
  } catch (error) {
    console.error('Error generating summary with Gemini API:', error);
    // Fall back to simple summarizer if API call fails
    return simpleSummarizer(taskSummaries);
  }
};

// For backward compatibility
export const generateExecutiveSummaryWithOpenAI = generateExecutiveSummary;