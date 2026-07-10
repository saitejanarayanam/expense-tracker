import { GoogleGenAI, Type } from '@google/genai';

let client: GoogleGenAI | null = null;
function getClient() {
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    vendor: { type: Type.STRING, nullable: true, description: 'Merchant / vendor name' },
    amount: { type: Type.NUMBER, nullable: true, description: 'Total amount paid' },
    date: { type: Type.STRING, nullable: true, description: 'Transaction date in YYYY-MM-DD format' },
    category: {
      type: Type.STRING,
      nullable: true,
      description: 'Best-fit category: Food, Travel, Shopping, Bills/Utilities, Health, Entertainment, or Others',
    },
    paymentMode: {
      type: Type.STRING,
      nullable: true,
      description: 'One of: Cash, Bank Transfer, Credit Card, Debit Card, UPI, Digital Wallet, Cheque, Other',
    },
    paymentAccountLabel: {
      type: Type.STRING,
      nullable: true,
      description: 'Card/account identifier if visible, e.g. "HDFC CC ****4821"',
    },
    items: {
      type: Type.ARRAY,
      nullable: true,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER, nullable: true },
        },
      },
    },
    confidence: {
      type: Type.OBJECT,
      description: 'Confidence 0-1 for each extracted top-level field',
      properties: {
        vendor: { type: Type.NUMBER },
        amount: { type: Type.NUMBER },
        date: { type: Type.NUMBER },
        category: { type: Type.NUMBER },
        paymentMode: { type: Type.NUMBER },
      },
    },
  },
  required: ['confidence'],
};

const EXTRACTION_PROMPT = `You are an expert financial document parser. Read the attached invoice, bill, or receipt image/PDF and extract structured expense data.

Rules:
- If a field cannot be confidently determined from the document, return null for it rather than guessing.
- "date" must be formatted as YYYY-MM-DD.
- "category" must be one of: Food, Travel, Shopping, Bills/Utilities, Health, Entertainment, Others.
- "paymentMode" must be one of: Cash, Bank Transfer, Credit Card, Debit Card, UPI, Digital Wallet, Cheque, Other. Look for text like "Paid via", "Card ending", "Cash Receipt", "UPI Ref", etc.
- Provide a confidence score between 0 and 1 for each of vendor, amount, date, category, paymentMode reflecting how certain you are.
- Return ONLY the structured JSON described by the schema.`;

export interface ExtractedExpense {
  vendor: string | null;
  amount: number | null;
  date: string | null;
  category: string | null;
  paymentMode: string | null;
  paymentAccountLabel: string | null;
  items: { name: string; amount: number | null }[] | null;
  confidence: Partial<Record<'vendor' | 'amount' | 'date' | 'category' | 'paymentMode', number>>;
}

export async function extractExpenseFromDocument(buffer: Buffer, mimeType: string): Promise<ExtractedExpense> {
  const response = await getClient().models.generateContent({
    model: 'gemini-flash-latest',
    contents: [
      {
        role: 'user',
        parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType, data: buffer.toString('base64') } }],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: EXTRACTION_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error('AI returned an empty response');
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('AI returned an unparseable response');
  }
}

export async function generateSpendingSummary(
  expenses: { amount: number; category: string; date: string; paymentMode: string; vendor: string | null }[],
  currency = 'INR'
): Promise<string> {
  if (!expenses.length) {
    return "You haven't logged any expenses yet — add your first one to get personalized insights.";
  }
  const prompt = `You are a friendly personal finance assistant. Given this user's expense data (currency: ${currency}) as JSON, write a short, natural-language summary (3-5 sentences) of their spending patterns. Mention notable trends, the top category, any week-over-week or period comparisons you can infer, and flag anything unusually high. Be warm and encouraging, not preachy. Do not use markdown headers.

Expense data:
${JSON.stringify(expenses)}`;

  const response = await getClient().models.generateContent({
    model: 'gemini-flash-latest',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  return (response.text || '').trim();
}
