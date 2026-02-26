import { GoogleGenerativeAI } from "@google/generative-ai";

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
    
    // Detailed validation to catch common CI/CD or build-time issues
    if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined' || apiKey === 'null') {
      const errorMsg = 'Gemini API key is not configured. Ensure VITE_GEMINI_API_KEY is set in your production environment variables during build.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
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
    // Re-throw so UI can handle it
    throw error;
  }
};

// For backward compatibility
export const generateExecutiveSummaryWithOpenAI = generateExecutiveSummary;