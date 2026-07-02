import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { messages, userApiKey, userContext } = await request.json();

    // Prioritize environment variable, fallback to client-supplied key
    const apiKey = (process.env.GEMINI_API_KEY || userApiKey || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API Key tidak ditemukan.",
          message: "Silakan atur environment variable GEMINI_API_KEY di server atau masukkan API Key Anda di pengaturan YosBot.",
        },
        { status: 400 }
      );
    }

    // Build context-aware system instruction
    let contextPrompt = "Anda adalah YosBot, asisten gym pribadi & personal trainer profesional buatan Yossika dari Sokaraja. Berikan tips kebugaran, pola makan sehat, penjelasan gerakan olahraga, dan saran motivasi latihan yang asyik, informatif, ramah, dan 100% menggunakan Bahasa Indonesia yang suportif.";
    
    if (userContext) {
      const { profile, logsCount, todayRecovery, todayChecklist } = userContext;
      if (profile) {
        contextPrompt += `\n\n[INFORMASI USER SAAT INI]:
- Nama: ${profile.name}
- Tujuan: ${profile.goal}
- Level: ${profile.experience}
- Berat: ${profile.weightKg} kg, Tinggi: ${profile.heightCm} cm, Body Fat: ${profile.bodyFatPct}%
- Jumlah latihan selesai dicatat: ${logsCount} kali.`;
      }
      if (todayRecovery) {
        contextPrompt += `\n- Skor Pemulihan Tubuh Hari Ini: ${todayRecovery.score}% (Tidur: ${todayRecovery.sleep} jam, DOMS/Nyeri: ${todayRecovery.soreness}/10, Stress: ${todayRecovery.stress}/10, Energi: ${todayRecovery.energy}/10). Berikan saran porsi latihan berat/ringan berdasarkan skor pemulihan ini jika ditanya tentang pemulihan atau latihan.`;
      }
      if (todayChecklist) {
        const completed = Object.keys(todayChecklist).filter(k => k !== "date" && todayChecklist[k] === true);
        contextPrompt += `\n- Checklist Harian Tercapai Hari Ini: ${completed.join(", ") || "Belum ada yang dicentang"}.`;
      }
    }

    // Use official Google Generative AI SDK — handles AQ. and AIzaSy keys automatically
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: contextPrompt,
    });

    // Build chat history (all messages except the last one)
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const replyText = result.response.text() || "Maaf, YosBot sedang mengalami kendala menjawab pertanyaan Anda.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    const errorMsg = error?.message || "Internal Server Error";
    return NextResponse.json(
      { error: `Gemini API Error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
