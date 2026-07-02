import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { query, imageBase64, mimeType, userApiKey } = await request.json();

    const apiKey = (process.env.GEMINI_API_KEY || userApiKey || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key tidak ditemukan. Masukkan Gemini API Key di Pengaturan YosBot." },
        { status: 400 }
      );
    }

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

    // Use official Google Generative AI SDK — handles AQ. and AIzaSy keys automatically
    const genAI = new GoogleGenerativeAI(apiKey);

    let prompt: string;
    let imagePart: any = null;

    if (imageBase64) {
      imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64,
        },
      };
      prompt = `Kamu adalah ahli nutrisi dan dietitian profesional. Identifikasi semua makanan yang terlihat dalam foto ini, lalu perkirakan total kandungan nutrisi untuk sajian yang terlihat di foto (bukan per 100g, tapi total estimasi porsi dalam foto).\n\n${jsonInstruction}\n\nJika tidak bisa mengidentifikasi dengan baik, tetap berikan estimasi terbaik dan set confidence ke "low". Selalu balas HANYA JSON.`;
    } else if (query) {
      prompt = `Kamu adalah ahli nutrisi dan dietitian profesional. User ingin mengetahui kandungan nutrisi makanan berikut:\n\n"${query}"\n\nTugas kamu:\n1. Identifikasi nama makanan dari query tersebut\n2. Jika user menyebutkan gram spesifik (misalnya "150g", "50 gram", "200g"), hitung nutrisi untuk gram tersebut\n3. Jika tidak ada gram, default ke 100g\n4. Hitung protein, karbohidrat, lemak, serat, dan kalori berdasarkan database nutrisi yang akurat untuk makanan Indonesia atau internasional\n\n${jsonInstruction}\n\nContoh: jika user ketik "Ayam rebus 150 gram", maka estimatedGram: 150 dan semua nutrisi dihitung untuk 150g dada ayam rebus.\nSelalu balas HANYA JSON.`;
    } else {
      return NextResponse.json({ error: "Butuh query atau gambar." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = imagePart
      ? await model.generateContent([prompt, imagePart])
      : await model.generateContent(prompt);

    const rawText = result.response.text() || "";

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
