import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for myPawPair, a dog care platform that connects dog owners with providers (groomers, trainers, vets, walkers, boarding). You help users:
- Find the right type of care for their dog
- Understand what services are available (grooming, training, vet, walking, boarding)
- Get tips on choosing providers
- Answer general dog care questions

Keep replies concise, friendly, and practical. When users ask about providers, suggest they use the Find Providers page to browse verified providers by category and city.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { messages } = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    };

    if (!messages?.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      max_tokens: 1024,
    });

    const content =
      response.choices[0]?.message?.content ?? "I couldn't generate a response.";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
