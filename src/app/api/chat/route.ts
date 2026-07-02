import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, userApiKey, userContext } = await request.json();

    // Prioritize environment variable, fallback to client-supplied key
    const apiKey = process.env.GEMINI_API_KEY || userApiKey;

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

    const systemInstruction = {
      parts: [
        {
          text: contextPrompt,
        },
      ],
    };

    // Format messages history for Gemini API content structure
    // Convert role 'assistant' to 'model' for Gemini spec
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction,
          contents,
        }),
      }
    );

    if (!response.ok) {
      let errorMsg = "Gagal menghubungi Gemini API";
      try {
        const errData = await response.json();
        errorMsg = errData.error?.message || JSON.stringify(errData);
      } catch (e) {}
      return NextResponse.json(
        { error: `Gemini API Error: ${errorMsg}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, YosBot sedang mengalami kendala menjawab pertanyaan Anda.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
