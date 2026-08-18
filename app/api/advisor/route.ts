import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Strict request validation schema
const advisorRequestSchema = z.object({
  currentMonthData: z.object({
    totalIncome: z.coerce.number().min(0).max(1_000_000_000),
    totalExpenses: z.coerce.number().min(0).max(1_000_000_000),
    netSavings: z.coerce.number().min(-1_000_000_000).max(1_000_000_000),
    categoryExpenses: z.record(z.string().max(100), z.coerce.number().min(0).max(1_000_000_000)).optional().default({}),
    budgetProgress: z.array(z.object({
      category: z.string().max(100),
      spent: z.coerce.number().min(0).max(1_000_000_000),
      limit: z.coerce.number().min(0).max(1_000_000_000),
    })).optional().default([]),
  }),
  previousMonthData: z.object({
    totalIncome: z.coerce.number().min(0).max(1_000_000_000),
    totalExpenses: z.coerce.number().min(0).max(1_000_000_000),
    netSavings: z.coerce.number().min(-1_000_000_000).max(1_000_000_000),
    categoryExpenses: z.record(z.string().max(100), z.coerce.number().min(0).max(1_000_000_000)).optional().default({}),
  }),
  currency: z.string().min(2).max(10).default('GHS'),
});

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // 1. Authenticate the caller when Supabase is configured
    if (supabaseUrl && supabaseAnonKey) {
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.replace(/^Bearer\s+/i, '');

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Authentication bearer token is required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data: { user }, error: authError } = await supabaseAuthClient.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid or expired session token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2. Validate input schema
    const rawBody = await req.json();
    const parseResult = advisorRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request payload format or parameters',
          details: parseResult.error.flatten(),
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { currentMonthData, previousMonthData, currency } = parseResult.data;

    // 3. Construct professional, bounded financial analyst prompt
    const systemPrompt = `You are a certified financial analytics engine providing executive cash flow reports for ScalePay.
The report is a month-over-month performance comparison.
Currency: ${currency.replace(/[^a-zA-Z0-9$€£¥₵]/g, '')}

Guidelines:
1. Executive Summary: Succinct statement of net cash flow variances (income change, expense delta, savings rate).
2. Category Variances: Highlight notable category increases or decreases and budget limit status.
3. Recommended Actions: 2-3 specific, measurable cash allocation steps for the next billing cycle.
4. Tone: Objective, professional, concise, and financial. Do not use generic motivational fluff, sparkles, or emojis. Use clean markdown formatting (bold metrics, clean bullet points).`;

    const userPrompt = `
CURRENT MONTH:
- Total Income: ${currentMonthData.totalIncome}
- Total Expenses: ${currentMonthData.totalExpenses}
- Net Savings: ${currentMonthData.netSavings}
- Category Expenses: ${JSON.stringify(currentMonthData.categoryExpenses)}
- Budget Threshold Status: ${JSON.stringify(currentMonthData.budgetProgress)}

PREVIOUS MONTH:
- Total Income: ${previousMonthData.totalIncome}
- Total Expenses: ${previousMonthData.totalExpenses}
- Net Savings: ${previousMonthData.netSavings}
- Category Expenses: ${JSON.stringify(previousMonthData.categoryExpenses)}

Generate a structured financial analysis report.`;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Advisor API Error:', errorMsg);
    return new Response(
      JSON.stringify({ error: 'Failed to generate financial report' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
