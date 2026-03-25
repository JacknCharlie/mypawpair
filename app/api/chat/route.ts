import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for myPawPair, a dog care platform with two types of partners:
1) Service providers — verified local businesses (groomers, trainers, vets, dog walkers, boarding) listed in the directory.
2) Care providers — individuals matched to dog owners for in-home or hosting care (boarding, walks, drop-ins) via compatibility matching.

You help users:
- Find the right type of care for their dog
- Understand grooming, training, vet, walking, and boarding options
- Get tips on choosing a service provider or care provider
- Answer general dog care questions

Keep replies concise, friendly, and practical. For business listings (groomers, trainers, vets, etc.), direct users to the Find Providers page to browse verified service providers by category and city. For one-to-one care matching, mention care providers and the owner matching flow when relevant.`;

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
