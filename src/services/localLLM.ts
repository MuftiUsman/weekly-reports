import { generateExecutiveSummaryWithOpenAI } from './openai';

// Simple fallback summarizer if API call fails
const simpleSummarizer = (text: string): string => {
  if (!text || text.trim() === '') {
    return 'No work activities were recorded during this period.';
  }
  
  const sentences = text
    .split('.')
    .map(s => s.trim())
    .filter(s => s.length > 0);
    
  let summary = sentences.slice(0, 3).join('. ') + '.';
  return summary.replace(/^\s*\w/, (c) => c.toUpperCase());
};

/**
 * Generates a summary using the existing OpenAI service
 * @param taskSummaries The input text to summarize
 * @returns A promise that resolves to the generated summary
 */
export const generateLocalSummary = async (taskSummaries: string): Promise<string> => {
  if (!taskSummaries || taskSummaries.trim() === '') {
    return 'No work activities were recorded during this period.';
  }

  try {
    // Use the existing OpenAI service
    const summary = await generateExecutiveSummaryWithOpenAI(taskSummaries);
    
    // Fallback to simple summarizer if the result is too short
    if (!summary || summary.length < 10) {
      throw new Error('Generated summary is too short');
    }
    
    return summary;
    
  } catch (error) {
    console.error('Error generating summary with OpenAI service:', error);
    // Fall back to simple summarizer if API call fails
    return simpleSummarizer(taskSummaries);
  }
};
