"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Menu, MessageSquare, Bot, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

const SUGGESTIONS = [
  "What grooming services do providers offer?",
  "How do I find a dog trainer near me?",
  "What should I ask before choosing a vet?",
  "What's the difference between boarding and pet sitting?",
];

const STORAGE_KEY = "mypawpair-ai-chat-sessions";

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

export function AiChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId);
  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    if (activeId && sessions.length) {
      saveSessions(sessions);
    }
  }, [sessions, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const createNewChat = () => {
    const id = crypto.randomUUID();
    const session: ChatSession = {
      id,
      title: "New chat",
      messages: [],
    };
    setSessions((prev) => [session, ...prev]);
    setActiveId(id);
    setInput("");
    inputRef.current?.focus();
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    let session = activeSession;
    if (!session) {
      const id = crypto.randomUUID();
      session = {
        id,
        title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : ""),
        messages: [],
      };
      setSessions((prev) => [session!, ...prev]);
      setActiveId(id);
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === session!.id
          ? {
              ...s,
              title: s.messages.length === 0 ? userMsg.content.slice(0, 40) + (userMsg.content.length > 40 ? "…" : "") : s.title,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );
    setInput("");
    setIsLoading(true);

    const history = [...(session.messages ?? []), userMsg];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const { content } = await res.json();

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === session!.id
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session!.id
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "Sorry, I couldn't get a response. Please try again.",
                  },
                ],
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (s: string) => {
    sendMessage(s);
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } flex flex-col border-r border-white/10 bg-[#161b22] transition-all duration-200 overflow-hidden shrink-0`}
      >
        <div className="flex items-center justify-between p-3 border-b border-white/10 min-h-[52px]">
          <button
            onClick={createNewChat}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveId(s.id);
                setInput("");
              }}
              className={`w-full text-left px-4 py-3 text-sm truncate hover:bg-white/5 transition-colors ${
                activeId === s.id ? "bg-white/10" : ""
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2 opacity-60" />
              {s.title || "New chat"}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 h-14 px-4 border-b border-white/10 shrink-0">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/find-providers" className="flex items-center gap-2">
            <Image src="/logo.png" alt="myPawPair" width={100} height={28} className="h-7 w-auto" />
          </Link>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center pt-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
                <Bot className="h-8 w-8 text-[#5F7E9D]" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-400 mb-8 text-sm">
                Ask about dog care, finding providers, or anything else. I&apos;m here to help.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors border border-white/10 hover:border-white/20 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-4 ${
                    m.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      m.role === "user"
                        ? "bg-[#5F7E9D]"
                        : "bg-white/10"
                    }`}
                  >
                    {m.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div
                    className={`flex-1 min-w-0 ${
                      m.role === "user" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl text-sm ${
                        m.role === "user"
                          ? "bg-[#5F7E9D] text-white"
                          : "bg-white/5 text-gray-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-white/5">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex gap-3 items-end"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask anything about dog care or finding providers..."
              rows={1}
              disabled={isLoading}
              className="flex-1 min-h-[44px] max-h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-[#5F7E9D] focus:outline-none focus:ring-1 focus:ring-[#5F7E9D]/50 resize-none text-sm placeholder:text-gray-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-11 h-11 rounded-xl bg-[#5F7E9D] hover:bg-[#4e6d8c] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-3">
            myPawPair AI can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}
