"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Bot, Settings, Key, AlertCircle, Dumbbell, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_SUGGESTIONS = [
  "Bagaimana tips Bench Press?",
  "Berapa kebutuhan protein harian saya?",
  "Beri rekomendasi menu diet lokal",
  "Tips squat agar lutut aman",
];

export default function YosBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya YosBot, asisten kebugaran pribadimu 💪 Ada yang bisa saya bantu untuk program latihan atau diet harianmu hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load custom key from localstorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomKey(localStorage.getItem("gym-planner:gemini-key") || "");
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSaveKey = () => {
    localStorage.setItem("gym-planner:gemini-key", customKey);
    setShowConfig(false);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const savedKey = localStorage.getItem("gym-planner:gemini-key") || "";
      
      // Load current context from localStorage
      const profile = localStorage.getItem("gym-planner:profile");
      const logs = localStorage.getItem("gym-planner_workout_logs");
      const recovery = localStorage.getItem("gym-planner_recovery_logs");
      const checklist = localStorage.getItem("gym-planner_daily_checklist");

      const userContext = {
        profile: profile ? JSON.parse(profile) : null,
        logsCount: logs ? JSON.parse(logs).length : 0,
        todayRecovery: recovery ? JSON.parse(recovery)[0] : null,
        todayChecklist: checklist ? JSON.parse(checklist) : null,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userApiKey: savedKey,
          userContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal menghubungi YosBot server.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Gagal mendapatkan respon."}\n\nSilakan klik ikon gerigi di kanan atas dan pastikan API Key Gemini Anda sudah benar.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-lime border border-lime shadow-[0_0_20px_rgba(204,255,0,0.45)] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] flex items-center justify-center text-base hover:scale-105 active:scale-95 transition-all group duration-300"
          aria-label="Tanya YosBot AI"
        >
          <MessageSquare size={24} className="text-base group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-base animate-pulse" />
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-96 h-[480px] bg-base-card/95 backdrop-blur-xl border border-base-border rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-base-raised/80 px-4 py-3.5 border-b border-base-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime animate-pulse">
                <Dumbbell size={16} />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase text-white flex items-center gap-1">
                  YosBot AI <Sparkles size={12} className="text-lime" />
                </h3>
                <p className="text-[10px] text-lime font-semibold uppercase tracking-wider">Gym Coach Pendamping</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
                  showConfig ? "bg-lime/10 border-lime/30 text-lime" : "bg-base-card border-base-border text-white/55 hover:text-white"
                }`}
                title="Atur Gemini API Key"
              >
                <Settings size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-base-card border border-base-border text-white/55 hover:text-white flex items-center justify-center active:scale-90 transition-transform"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Config Panel Overlay */}
          {showConfig && (
            <div className="bg-lime/5 border-b border-base-border p-4 animate-slide-down-fade text-xs">
              <div className="flex items-center gap-1.5 text-lime font-bold uppercase tracking-wider mb-2">
                <Key size={13} />
                <span>Atur Gemini API Key</span>
              </div>
              <p className="text-white/60 mb-3 leading-relaxed">
                Jika bot tidak merespon, masukkan API Key Gemini Anda di bawah (disimpan di browser Anda):
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="flex-1 bg-base border border-base-border/80 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime/40"
                />
                <button
                  onClick={handleSaveKey}
                  className="bg-lime text-base px-4 py-2 rounded-lg font-bold hover:scale-95 transition-transform"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-lime/10 border border-lime/20 flex items-center justify-center shrink-0 text-lime font-bold text-sm">
                    Y
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed border ${
                    m.role === "user"
                      ? "bg-lime text-base border-lime shadow-md font-medium rounded-tr-none"
                      : "bg-base-raised/60 text-white/80 border-base-border rounded-tl-none"
                  }`}
                >
                  {m.role === "user" ? (
                    <div style={{ whiteSpace: "pre-line" }}>{m.content}</div>
                  ) : (
                    <div className="space-y-1.5 text-left break-words">
                      {m.content.split("\n").map((line, lineIdx) => {
                        let trimmed = line.trim();
                        
                        // Parse bullet list items starting with '*' or '-'
                        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                          const cleanText = trimmed.substring(2);
                          return (
                            <div key={lineIdx} className="flex items-start gap-2 pl-1.5 my-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-lime shrink-0 mt-1.5" />
                              <span dangerouslySetInnerHTML={{
                                __html: cleanText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              }} />
                            </div>
                          );
                        }

                        // Normal paragraphs with bold parsing
                        return (
                          <p 
                            key={lineIdx} 
                            className={trimmed === "" ? "h-2" : ""}
                            dangerouslySetInnerHTML={{
                              __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            }} 
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="h-8 w-8 rounded-lg bg-lime/10 border border-lime/20 flex items-center justify-center shrink-0 text-lime">
                  <Bot size={15} className="animate-bounce" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-base-raised/40 border border-base-border text-white/40 text-xs italic flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
                  YosBot sedang berpikir...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Strip */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none border-t border-base-border/50">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="shrink-0 bg-base-raised text-[10px] uppercase font-bold tracking-wider text-lime/80 border border-base-border px-3 py-1.5 rounded-full hover:border-lime/30 active:scale-95 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-base-raised/40 border-t border-base-border flex gap-2"
          >
            <input
              type="text"
              placeholder="Tulis pesan ke YosBot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-base border border-base-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-lime/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-10 w-10 rounded-xl bg-lime border border-lime text-base flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95 transition-transform shrink-0 shadow-lg"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
