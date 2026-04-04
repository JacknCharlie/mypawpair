"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Menu, MessageSquare, Bot, User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { OnboardingFlow, DogProfile } from "./onboarding-flow";
import { ProviderGrid } from "./provider-card";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  providers?: any[];
  suggestions?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  is_onboarded: boolean;
  dog_profile_id?: string;
}

export interface DogProfileData extends DogProfile {
  id?: string;
  user_id?: string;
}

const SUGGESTIONS = [
  "What grooming services do service providers offer?",
  "How do I find a dog trainer near me?",
  "What should I ask before choosing a vet?",
  "What's the difference between boarding and pet sitting?",
];

export function AiChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dogProfile, setDogProfile] = useState<DogProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [typingContent, setTypingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const activeSession = sessions.find((s) => s.id === activeId);
  const messages = activeSession?.messages ?? [];

  // Load user and their data
  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = "/auth/login";
          return;
        }

        setUserId(user.id);

        // Load dog profile
        const { data: profiles } = await supabase
          .from("dog_profiles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (profiles && profiles.length > 0) {
          setDogProfile({
            id: profiles[0].id,
            user_id: profiles[0].user_id,
            name: profiles[0].name,
            pronouns: profiles[0].pronouns,
            species: profiles[0].species,
            breed: profiles[0].breed,
            age: profiles[0].age,
            healthConditions: profiles[0].health_conditions || [],
            dietaryNeeds: profiles[0].dietary_needs || [],
          });
        }

        // Load chat sessions
        const { data: sessionsData } = await supabase
          .from("chat_sessions")
          .select(`
            id,
            title,
            is_onboarded,
            dog_profile_id,
            created_at
          `)
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (sessionsData) {
          // Load messages for each session
          const sessionsWithMessages = await Promise.all(
            sessionsData.map(async (session) => {
              const { data: messagesData } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("session_id", session.id)
                .order("created_at", { ascending: true });

              return {
                id: session.id,
                title: session.title,
                is_onboarded: session.is_onboarded,
                dog_profile_id: session.dog_profile_id,
                messages:
                  messagesData?.map((m) => ({
                    id: m.id,
                    role: m.role as "user" | "assistant",
                    content: m.content,
                    created_at: m.created_at,
                  })) || [],
              };
            })
          );

          setSessions(sessionsWithMessages);

          // If user has no sessions and no profile, show onboarding
          if (sessionsWithMessages.length === 0 && !profiles?.length) {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadUserData();
  }, [supabase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingContent]);

  const handleOnboardingComplete = async (profile: DogProfile) => {
    if (!userId) return;

    try {
      // Save dog profile to database
      const { data: profileData, error: profileError } = await supabase
        .from("dog_profiles")
        .insert({
          user_id: userId,
          name: profile.name,
          pronouns: profile.pronouns,
          species: profile.species,
          breed: profile.breed,
          age: parseInt(profile.age) || null,
          health_conditions: profile.healthConditions,
          dietary_needs: profile.dietaryNeeds,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      setDogProfile({
        ...profile,
        id: profileData.id,
        user_id: userId,
      });

      // Create initial session
      const { data: sessionData, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          dog_profile_id: profileData.id,
          title: `Chat about ${profile.name}`,
          is_onboarded: true,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const newSession: ChatSession = {
        id: sessionData.id,
        title: sessionData.title,
        is_onboarded: true,
        dog_profile_id: profileData.id,
        messages: [],
      };

      setSessions([newSession]);
      setActiveId(sessionData.id);
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleOnboardingSkip = async () => {
    if (!userId) return;

    try {
      // Create session without profile
      const { data: sessionData, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          title: "New chat",
          is_onboarded: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: sessionData.id,
        title: "New chat",
        is_onboarded: false,
        messages: [],
      };

      setSessions([newSession]);
      setActiveId(sessionData.id);
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const createNewChat = async () => {
    if (!userId) return;

    try {
      const { data: sessionData, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          dog_profile_id: dogProfile?.id,
          title: "New chat",
          is_onboarded: !!dogProfile,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: ChatSession = {
        id: sessionData.id,
        title: "New chat",
        is_onboarded: !!dogProfile,
        dog_profile_id: dogProfile?.id,
        messages: [],
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveId(sessionData.id);
      setInput("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !userId) return;

    let session = activeSession;
    if (!session) {
      // Create new session if none exists
      try {
        const { data: sessionData, error } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: userId,
            dog_profile_id: dogProfile?.id,
            title: trimmed.slice(0, 40) + (trimmed.length > 40 ? "…" : ""),
            is_onboarded: !!dogProfile,
          })
          .select()
          .single();

        if (error) throw error;

        session = {
          id: sessionData.id,
          title: sessionData.title,
          is_onboarded: !!dogProfile,
          dog_profile_id: dogProfile?.id,
          messages: [],
        };

        setSessions((prev) => [session!, ...prev]);
        setActiveId(sessionData.id);
      } catch (error) {
        console.error("Error creating session:", error);
        return;
      }
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    // Optimistically update UI
    setSessions((prev) =>
      prev.map((s) =>
        s.id === session!.id
          ? {
              ...s,
              title:
                s.messages.length === 0
                  ? userMsg.content.slice(0, 40) + (userMsg.content.length > 40 ? "…" : "")
                  : s.title,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );
    setInput("");
    setIsLoading(true);

    try {
      // Save user message to database
      const { error: msgError } = await supabase.from("chat_messages").insert({
        session_id: session.id,
        role: "user",
        content: trimmed,
      });

      if (msgError) throw msgError;

      const history = [...(session.messages ?? []), userMsg];

      // Build system prompt with dog profile context
      let systemContext = "";
      if (dogProfile) {
        systemContext = `You are Charlie, ${dogProfile.name}'s personal AI care assistant. ${dogProfile.name} is a ${dogProfile.age || ""} ${dogProfile.breed || dogProfile.species}. Use ${dogProfile.pronouns || "they/them"} pronouns when referring to ${dogProfile.name}.`;
        
        if (dogProfile.healthConditions?.length) {
          systemContext += ` ${dogProfile.name} has the following health conditions: ${dogProfile.healthConditions.join(", ")}.`;
        }
        
        if (dogProfile.dietaryNeeds?.length) {
          systemContext += ` Dietary needs: ${dogProfile.dietaryNeeds.join(", ")}.`;
        }
        
        systemContext += ` Always refer to "${dogProfile.species}" (not "fur baby") and personalize responses to ${dogProfile.name}'s specific profile.`;
      }

      // Search for relevant providers based on query
      let providers: any[] = [];
      const searchKeywords = trimmed.toLowerCase();
      
      // Only search if the query seems to be about finding providers
      if (
        searchKeywords.includes("find") ||
        searchKeywords.includes("recommend") ||
        searchKeywords.includes("groomer") ||
        searchKeywords.includes("vet") ||
        searchKeywords.includes("trainer") ||
        searchKeywords.includes("walker") ||
        searchKeywords.includes("boarding") ||
        searchKeywords.includes("daycare")
      ) {
        try {
          // Try to determine category from query
          let category = null;
          if (searchKeywords.includes("groomer") || searchKeywords.includes("grooming")) category = "groomer";
          else if (searchKeywords.includes("vet") || searchKeywords.includes("veterinar")) category = "veterinarian";
          else if (searchKeywords.includes("train")) category = "trainer";
          else if (searchKeywords.includes("walk")) category = "dog_walker";
          else if (searchKeywords.includes("board") || searchKeywords.includes("daycare")) category = "boarding";

          let query = supabase
            .from("providers")
            .select("*")
            .limit(4);

          if (category) {
            query = query.eq("category", category);
          }

          const { data } = await query;
          if (data) providers = data;
        } catch (error) {
          console.error("Error fetching providers:", error);
        }
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          dogProfile: dogProfile ? {
            name: dogProfile.name,
            pronouns: dogProfile.pronouns,
            species: dogProfile.species,
            breed: dogProfile.breed,
            age: dogProfile.age,
            healthConditions: dogProfile.healthConditions,
            dietaryNeeds: dogProfile.dietaryNeeds,
          } : null,
          systemContext,
          hasProviders: providers.length > 0,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const { content, suggestions } = await res.json();

      // Type out the response
      setIsTyping(true);
      setTypingContent("");
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < content.length) {
          setTypingContent((prev) => prev + content[index]);
          index++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setTypingContent("");

          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content,
            providers: providers.length > 0 ? providers : undefined,
            suggestions: suggestions || undefined,
          };

          // Save assistant message to database
          supabase.from("chat_messages").insert({
            session_id: session!.id,
            role: "assistant",
            content,
          });

          // Update session timestamp
          supabase
            .from("chat_sessions")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", session!.id);

          setSessions((prev) =>
            prev.map((s) =>
              s.id === session!.id ? { ...s, messages: [...s.messages, assistantMsg] } : s
            )
          );
          setIsLoading(false);
        }
      }, 20);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setTypingContent("");
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  if (isLoadingData) {
    return (
      <div className="flex h-screen bg-[#FFF2DD] items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3B443]/10 mb-4 animate-pulse">
            <Bot className="h-8 w-8 text-[#F3B443]" />
          </div>
          <p className="text-[#4A5563]">Loading Charlie...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#FFF2DD] text-[#260900] font-modern overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } flex flex-col border-r border-[#260900]/10 bg-[#FFF9ED] transition-all duration-200 overflow-hidden shrink-0 fixed lg:relative h-full z-40 lg:z-0`}
      >
        <div className="flex items-center justify-between p-3 border-b border-[#260900]/10 min-h-[52px]">
          <button
            onClick={createNewChat}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3B443] text-white text-sm font-medium transition-all duration-300 hover:bg-[#d99d2f] shadow-[0px_4px_8px_rgba(137,82,43,0.5),inset_0px_-4px_8px_rgba(137,82,43,0.3)]"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        {/* Dog Profile Info */}
        {dogProfile && (
          <div className="p-3 border-b border-[#260900]/10 bg-white/50">
            <div className="text-xs text-[#4A5563] mb-1">Chatting about</div>
            <div className="text-sm font-medium text-[#260900]">{dogProfile.name}</div>
            <div className="text-xs text-[#4A5563]">
              {dogProfile.breed} • {dogProfile.pronouns}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveId(s.id);
                setInput("");
                // Close sidebar on mobile after selection
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
              className={`w-full text-left px-4 py-3 text-sm truncate hover:bg-[#FFF2DD] transition-colors ${
                activeId === s.id ? "bg-[#FFF2DD] border-l-2 border-[#F3B443]" : ""
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-2 opacity-60" />
              {s.title || "New chat"}
            </button>
          ))}
        </div>

        {/* Sign out button */}
        <div className="p-3 border-t border-[#260900]/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#260900] hover:bg-[#FFF2DD] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FFF2DD] relative">
        {/* Top bar */}
        <header className="flex items-center gap-3 h-16 sm:h-20 px-4 border-b border-[#260900]/10 shrink-0 bg-[#FFF9ED]">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-[#FFF2DD] transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-[#260900]" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="myPawPair" width={229} height={72} className="h-10 sm:h-12 w-auto" />
          </Link>
          <div className="flex-1" />
          {dogProfile && (
            <div className="hidden md:flex items-center gap-2 text-sm text-[#4A5563]">
              <Bot className="h-4 w-4 text-[#F3B443]" />
              <span className="hidden lg:inline">Charlie is here for {dogProfile.name}</span>
              <span className="lg:hidden">{dogProfile.name}</span>
            </div>
          )}
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          {messages.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center pt-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F3B443]/10 mb-6 shadow-[0px_2px_4px_rgba(137,82,43,0.3)]">
                <Bot className="h-10 w-10 text-[#F3B443]" />
              </div>
              <h2 className="text-3xl font-normal text-[#260900] mb-3 font-modern">
                {dogProfile 
                  ? `Hi! I'm Charlie, ${dogProfile.name}'s AI assistant.`
                  : "How can I help you today?"}
              </h2>
              <p className="text-[#4A5563] mb-8 text-lg">
                {dogProfile
                  ? `Ask me anything about ${dogProfile.name}'s care, or general questions about ${dogProfile.species} care, service providers, and more.`
                  : "Ask about dog care, service providers (groomers, trainers, vets), care provider matching, or anything else — I'm here to help."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    disabled={isLoading}
                    className="px-5 py-3 rounded-full bg-white hover:bg-[#F3B443] text-sm text-[#260900] hover:text-white transition-all duration-300 border border-[#260900]/20 hover:border-[#F3B443] disabled:opacity-50 shadow-[0px_2px_4px_rgba(137,82,43,0.2)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, idx) => (
                <div key={m.id}>
                  <div
                    className={`flex gap-4 ${
                      m.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        m.role === "user"
                          ? "bg-[#5F7E9D] shadow-[0px_2px_4px_rgba(95,126,157,0.3)]"
                          : "bg-[#F3B443]/20 shadow-[0px_2px_4px_rgba(137,82,43,0.2)]"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-[#F3B443]" />
                      )}
                    </div>
                    <div
                      className={`flex-1 min-w-0 ${
                        m.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block px-5 py-3 rounded-2xl text-base ${
                          m.role === "user"
                            ? "bg-[#5F7E9D] text-white shadow-[0px_2px_4px_rgba(95,126,157,0.3)]"
                            : "bg-white text-[#260900] shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>

                      {/* Provider Grid - only for assistant messages */}
                      {m.role === "assistant" && m.providers && m.providers.length > 0 && (
                        <div className="mt-3">
                          <ProviderGrid 
                            providers={m.providers} 
                            title="Here are some providers that might help:"
                          />
                        </div>
                      )}

                      {/* Follow-up Suggestions - only for last assistant message */}
                      {m.role === "assistant" && m.suggestions && m.suggestions.length > 0 && idx === messages.length - 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSuggestion(suggestion)}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-full bg-[#F3B443]/10 hover:bg-[#F3B443] text-sm text-[#260900] hover:text-white transition-all duration-300 border border-[#F3B443]/30 hover:border-[#F3B443] disabled:opacity-50 shadow-[0px_2px_4px_rgba(0,0,0,0.04)]"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {(isLoading || isTyping) && (
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#F3B443]/20 flex items-center justify-center shadow-[0px_2px_4px_rgba(137,82,43,0.2)]">
                    <Bot className="h-5 w-5 text-[#F3B443]" />
                  </div>
                  <div className="flex-1">
                    {isTyping && typingContent ? (
                      <div className="inline-block px-5 py-3 rounded-2xl bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5">
                        <p className="text-[#260900] text-base whitespace-pre-wrap">{typingContent}<span className="animate-pulse">|</span></p>
                      </div>
                    ) : (
                      <div className="inline-block px-5 py-3 rounded-2xl bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#F3B443] animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-[#F3B443] animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-[#F3B443] animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#260900]/10 p-3 sm:p-4 bg-[#FFF9ED]">
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex gap-2 sm:gap-3 items-end"
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
              placeholder="Ask about dog care, service providers, or care provider matching..."
              rows={1}
              disabled={isLoading}
              className="flex-1 min-h-[44px] sm:min-h-[48px] max-h-32 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white border-2 border-[#80A626]/30 focus:border-[#F3B443] focus:outline-none focus:ring-2 focus:ring-[#F3B443]/20 resize-none text-sm sm:text-base placeholder:text-[#4A5563] text-[#260900] shadow-[0px_2px_4px_rgba(0,0,0,0.04)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F3B443] hover:bg-[#d99d2f] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-[0px_4px_8px_rgba(137,82,43,0.5),inset_0px_-4px_8px_rgba(137,82,43,0.3)]"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </form>
          <p className="text-center text-xs text-[#4A5563] mt-2 sm:mt-3">
            Charlie can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}
