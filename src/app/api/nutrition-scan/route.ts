import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query, imageBase64, mimeType, userApiKey } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY || userApiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key tidak ditemukan. Masukkan Gemini API Key di Pengaturan YosBot." },
        { status: 400 }
      );
    }

    let parts: any[] = [];

    const jsonInstruction = `Berikan respons HANYA dalam format JSON berikut tanpa markdown, tanpa backticks, tanpa kode blok apapun — hanya JSON murni:
{
  "name": "Nama Makanan",
  "estimatedGram": 100,
  "kcal": 165,
  "proteinG": 31,
  "carbsG": 0,
  "fatG": 3.6,
  "fiberG": 0,
  "confidence": "high",
  "notes": "Catatan singkat tentang estimasi akurasi"
}`;

    if (imageBase64) {
      // Multimodal: Image + Text prompt
      parts.push({
        inline_data: {
          mime_type: mimeType || "image/jpeg",
          data: imageBase64,
        },
      });
      parts.push({
        text: `Kamu adalah ahli nutrisi dan dietitian profesional. Identifikasi semua makanan yang terlihat dalam foto ini, lalu perkirakan total kandungan nutrisi untuk sajian yang terlihat di foto (bukan per 100g, tapi total estimasi porsi dalam foto).

${jsonInstruction}

Jika tidak bisa mengidentifikasi dengan baik, tetap berikan estimasi terbaik dan set confidence ke "low". Selalu balas HANYA JSON.`,
      });
    } else if (query) {
      // Text-based: parse food name + gram from user query
      parts.push({
        text: `Kamu adalah ahli nutrisi dan dietitian profesional. User ingin mengetahui kandungan nutrisi makanan berikut:

"${query}"

Tugas kamu:
1. Identifikasi nama makanan dari query tersebut
2. Jika user menyebutkan gram spesifik (misalnya "150g", "50 gram", "200g"), hitung nutrisi untuk gram tersebut
3. Jika tidak ada gram, default ke 100g
4. Hitung protein, karbohidrat, lemak, serat, dan kalori berdasarkan database nutrisi yang akurat untuk makanan Indonesia atau internasional

${jsonInstruction}

Contoh: jika user ketik "Ayam rebus 150 gram", maka estimatedGram: 150 dan semua nutrisi dihitung untuk 150g dada ayam rebus.
Selalu balas HANYA JSON.`,
      });
    } else {
      return NextResponse.json({ error: "Butuh query atau gambar." }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      return NextResponse.json(
        { error: `Gemini API Error: ${errData?.error?.message || response.statusText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean all possible markdown wrappers before parsing
    const cleanedText = rawText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Nutrition scan error:", error);
    return NextResponse.json(
      { error: `Gagal memproses: ${error.message || "Terjadi kesalahan internal."}` },
      { status: 500 }
    );
  }
}
