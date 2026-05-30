import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { currentMonthData, previousMonthData, currency } = await req.json();

    const systemPrompt = `You are an expert, friendly financial advisor named ScalePay AI. 
The user is asking for a comparison of their financial performance this month vs last month.
Currency used: ${currency}

Your job is to:
1. Congratulate them on where they saved money or increased income.
2. Gently point out where they overspent (e.g. comparing category spending or exceeded budgets).
3. Give them 2-3 actionable, short pieces of advice for next month.

Keep your response under 4 paragraphs. Format it nicely using markdown (bolding, bullet points). Be encouraging but realistic.`;

    const userPrompt = `
Here is my data:

CURRENT MONTH:
- Total Income: ${currentMonthData.totalIncome}
- Total Expenses: ${currentMonthData.totalExpenses}
- Net Savings: ${currentMonthData.netSavings}
- Expenses by Category: ${JSON.stringify(currentMonthData.categoryExpenses)}
- Budget Status: ${JSON.stringify(currentMonthData.budgetProgress)}

PREVIOUS MONTH:
- Total Income: ${previousMonthData.totalIncome}
- Total Expenses: ${previousMonthData.totalExpenses}
- Net Savings: ${previousMonthData.netSavings}
- Expenses by Category: ${JSON.stringify(previousMonthData.categoryExpenses)}

Please give me my financial advice!`;

    const result = streamText({
      model: google('gemini-2.5-flash'), // or gemini-1.5-flash depending on SDK version
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate AI insights' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
