import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are WorthFixing, a practical repair-or-replace assistant. Inspect the uploaded photo carefully.
Return ONLY valid JSON, no markdown and no extra text, using exactly this shape:
{
  "item": "short item name",
  "verdict": "FIX" | "MAYBE" | "REPLACE",
  "confidence": 0-100,
  "headline": "one short plain-English conclusion",
  "damage": ["2-4 short observations visible or reasonably inferred from the image"],
  "repair": {
    "difficulty": "Easy" | "Moderate" | "Hard",
    "time": "rough human-readable time range",
    "costBand": "Low" | "Medium" | "High",
    "approach": "one concise repair approach"
  },
  "why": ["3 concise reasons behind the verdict"],
  "safety": "short safety note, or 'No obvious safety issue from the photo.'",
  "nextStep": "single most useful next action"
}
Rules:
- Do not pretend you can know hidden/internal damage from a photo.
- If the image is unclear, say so and lower confidence.
- Favor repair when it appears safe, straightforward, and likely cheaper than replacement.
- Choose MAYBE when inspection, missing-price context, or professional diagnosis is needed.
- Choose REPLACE when repair looks unsafe, structurally unreliable, or clearly uneconomical.
- Never invent exact prices. Use only Low/Medium/High cost bands.
- Keep the answer concrete and understandable to a teenager.`;

function parseJson(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  try {
    const { image, note } = await req.json();

    if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Please upload a valid image." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server. You can still use the built-in chair demo." },
        { status: 503 },
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-6-astra",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${systemPrompt}\n\nUser note: ${typeof note === "string" && note.trim() ? note.trim() : "No extra note provided."}`,
            },
            {
              type: "input_image",
              image_url: image,
              detail: "auto",
            },
          ],
        },
      ],
    });

    return NextResponse.json(parseJson(response.output_text));
  } catch (error) {
    console.error("WorthFixing analysis error", error);
    return NextResponse.json(
      { error: "I couldn't analyze that photo. Try a clearer image or a smaller file." },
      { status: 500 },
    );
  }
}
