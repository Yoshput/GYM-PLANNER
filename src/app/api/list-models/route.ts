import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || process.env.GEMINI_API_KEY || "";

  if (!key) {
    return NextResponse.json({ error: "No API key provided. Add ?key=YOUR_KEY to the URL." });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}&pageSize=50`
  );
  const data = await res.json();

  const models = (data.models || []).map((m: any) => ({
    name: m.name,
    displayName: m.displayName,
    supportedMethods: m.supportedGenerationMethods,
  }));

  return NextResponse.json({ totalModels: models.length, models });
}
