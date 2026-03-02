import { GoogleGenerativeAI } from "@google/generative-ai";

const simpleSummarizer = (text: string): string => {
  if (!text || text.trim() === '') {
    return 'No work activities were recorded during this period.';
  }

  const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
  const items = cleanText.split('|').map(s => s.trim()).filter(s => s.length > 0);

  if (items.length === 0) return 'Work activities recorded.';

  const summary = items.slice(0, 3).join('. ') + (items.length > 3 ? ' and other tasks.' : '.');
  return `Focus was on: ${summary}`;
};

type Provider = 'gemini' | 'groq';

export const generateExecutiveSummary = async (
  taskSummaries: string,
  userApiKey?: string | null,
  provider?: Provider
): Promise<string> => {
  if (!taskSummaries || taskSummaries.trim() === '') {
    return 'No work activities were recorded during this period.';
  }

  try {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;

    const activeProvider: Provider =
      provider ||
      (userApiKey ? 'gemini' :
        geminiKey ? 'gemini' :
        groqKey ? 'groq' :
        'gemini');

    const apiKey =
      userApiKey ||
      (activeProvider === 'gemini' ? geminiKey : groqKey);

    if (!apiKey || apiKey.trim() === '') {
      return simpleSummarizer(taskSummaries);
    }

    const prompt = `
Provide a professional, concise executive summary of the following work activities.
Focus on key achievements and impact. Keep it between 1-2 small sentences.

Work Activities:
${taskSummaries}
`;

    if (activeProvider === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const summary = result.response.text().trim();
      return summary.endsWith('.') ? summary : summary + '.';
    }

    if (activeProvider === 'groq') {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b", // Groq's best model for general tasks
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 720,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const summary = data.choices?.[0]?.message?.content?.trim();

      if (!summary) {
        return simpleSummarizer(taskSummaries);
      }

      return summary.endsWith('.') ? summary : summary + '.';
    }

    return simpleSummarizer(taskSummaries);

  } catch (error) {
    console.error('AI Summary failed:', error);
    return simpleSummarizer(taskSummaries);
  }
};

export const generateExecutiveSummaryWithOpenAI = generateExecutiveSummary;