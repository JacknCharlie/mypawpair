import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  try {
    const { messages, dogProfile, systemContext } = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      dogProfile?: {
        name: string;
        pronouns: string;
        species: string;
        breed?: string;
        age?: string;
        healthConditions?: string[];
        dietaryNeeds?: string[];
      } | null;
      systemContext?: string;
    };

    if (!messages?.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Build system prompt
    let systemPrompt = `You are Charlie, a helpful and friendly AI care assistant for myPawPair, a dog care platform.

myPawPair has two types of partners:
1) Service providers — verified local businesses (groomers, trainers, vets, dog walkers, boarding) listed in the directory.
2) Care providers — individuals matched to dog owners for in-home or hosting care (boarding, walks, drop-ins) via compatibility matching.

You help users:
- Find the right type of care for their dog
- Understand grooming, training, vet, walking, and boarding options
- Get tips on choosing a service provider or care provider
- Answer general dog care questions

IMPORTANT LANGUAGE RULES:
- Always use "dog" instead of "fur baby" or "pet parent"
- Be warm, friendly, and professional
- Keep replies concise and practical`;

    // Add dog-specific context if available
    if (dogProfile && systemContext) {
      systemPrompt += `\n\n${systemContext}`;
    } else if (dogProfile) {
      systemPrompt += `\n\nYou are specifically assisting with ${dogProfile.name}, a ${dogProfile.age || ""} ${dogProfile.breed || dogProfile.species}. Use ${dogProfile.pronouns || "they/them"} pronouns when referring to ${dogProfile.name}.`;
      
      if (dogProfile.healthConditions?.length) {
        systemPrompt += ` ${dogProfile.name} has the following health conditions: ${dogProfile.healthConditions.join(", ")}.`;
      }
      
      if (dogProfile.dietaryNeeds?.length) {
        systemPrompt += ` Dietary needs: ${dogProfile.dietaryNeeds.join(", ")}.`;
      }
      
      systemPrompt += ` Always personalize your responses to ${dogProfile.name}'s specific needs and profile.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
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
