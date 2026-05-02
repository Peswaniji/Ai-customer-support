import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const ask = async (prompt) => {
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

// ── 1. CLASSIFY TICKET ────────────────────────────────────────
export const classifyQuery = async (subject, description) => {
  const prompt = `You are a customer support AI classifier. Analyze this support query and return ONLY a valid JSON object with no extra text, no markdown, no code fences.

Subject: ${subject}
Description: ${description}

Return exactly this JSON structure:
{
  "canAutoResolve": true or false,
  "confidence": number between 0 and 100,
  "category": one of "billing" | "technical" | "general" | "complaint" | "delivery",
  "priority": one of "low" | "medium" | "high" | "critical",
  "suggestedReply": "complete reply string if canAutoResolve is true, else empty string"
}

Rules:
- canAutoResolve = true ONLY for simple factual queries (hours, policies, order status questions)
- canAutoResolve = false for complaints, refunds, technical issues, anything needing action
- confidence = how sure you are the reply will satisfy the customer (0-100)
- priority: critical = service down, high = major issue, medium = partial issue, low = general query`;

  const text = await ask(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

// ── 2. REPLY SUGGESTIONS ──────────────────────────────────────
export const getSuggestedReplies = async (ticketContext) => {
  const conversationText = ticketContext.messages
    .map(m => `${m.senderRole.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = `You are a helpful customer support AI. Based on this conversation, generate exactly 3 different suggested replies for the human support agent.

Ticket Subject: ${ticketContext.subject}
Category: ${ticketContext.category}

Conversation:
${conversationText}

Requirements:
- Each reply must be professional, empathetic, and concise (2-4 sentences max)
- All 3 replies must be meaningfully different
- Return ONLY a valid JSON array of 3 strings, no extra text, no markdown:
["reply1", "reply2", "reply3"]`;

  const text = await ask(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

// ── 3. TICKET SUMMARY ─────────────────────────────────────────
export const generateSummary = async (messages) => {
  const conversationText = messages
    .map(m => `${m.senderRole.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = `Summarize this customer support conversation in exactly 2-3 sentences.
Mention: what the issue was, what action was taken, how it was resolved.
Be factual and concise. Return only the summary text, nothing else.

Conversation:
${conversationText}`;

  return await ask(prompt);
};