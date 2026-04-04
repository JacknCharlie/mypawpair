"use client";

import { useState, useEffect, useRef } from "react";
import { Bot, Zap, ClipboardList, User as UserIcon, Users, Dog, Cat, Heart, Utensils } from "lucide-react";
import Image from "next/image";

export interface DogProfile {
  name: string;
  pronouns: string;
  species: string;
  breed: string;
  age: string;
  healthConditions: string[];
  dietaryNeeds: string[];
}

interface OnboardingFlowProps {
  onComplete: (profile: DogProfile) => void;
  onSkip: () => void;
}

type Step = 
  | "welcome"
  | "path-choice"
  | "name"
  | "species"
  | "pronouns"
  | "breed"
  | "age"
  | "health"
  | "dietary";

const CHARLIE_MESSAGES = {
  welcome: "Hi! I am Charlie, your pet's personal AI care assistant.\n\nHow much time do you have to tell me about your pet?",
  pathChoice: "Would you like to give me details about your pet now, or start chatting right away?",
  name: "Alright, perfect! First off:\n\nWhat is your pet's name?",
  species: "What type of pet is",
  pronouns: "What pronouns should I use for",
  breed: "What breed is",
  age: "How old is",
  health: "Does {name} have any health conditions I should know about?",
  dietary: "Any dietary needs or restrictions for {name}?",
};

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [profile, setProfile] = useState<Partial<DogProfile>>({
    species: "dog",
    healthConditions: [],
    dietaryNeeds: [],
  });
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string; isTyping?: boolean }>>([]);
  const [isQuickPath, setIsQuickPath] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, typingContent]);

  // Focus input when step changes
  useEffect(() => {
    if (inputRef.current && ["name", "breed", "age", "health", "dietary"].includes(step)) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  const typeMessage = (content: string, callback?: () => void) => {
    setIsTyping(true);
    setTypingContent("");
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setTypingContent((prev) => prev + content[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setChatHistory((prev) => [...prev, { role: "assistant", content }]);
        setTypingContent("");
        if (callback) callback();
      }
    }, 20); // Typing speed
  };

  const addMessage = (role: "user" | "assistant", content: string, withTyping = true) => {
    if (role === "user") {
      setChatHistory((prev) => [...prev, { role, content }]);
    } else if (withTyping) {
      typeMessage(content);
    } else {
      setChatHistory((prev) => [...prev, { role, content }]);
    }
  };

  const handleWelcomeChoice = (choice: "quick" | "detailed") => {
    if (choice === "quick") {
      setIsQuickPath(true);
      addMessage("user", "Let's keep it quick!");
      setTimeout(() => {
        addMessage("assistant", "Perfect! You can always update details later. Let's start chatting!");
        setTimeout(() => onSkip(), 1500);
      }, 500);
    } else {
      setIsQuickPath(false);
      setStep("path-choice");
    }
  };

  const handlePathChoice = (choice: "detailed" | "skip") => {
    if (choice === "skip") {
      addMessage("user", "I'll start chatting now");
      addMessage("assistant", "Sounds good! Feel free to tell me about your dog anytime.");
      setTimeout(() => onSkip(), 1500);
    } else {
      addMessage("user", "I'd like to give details, so you can get to know my dog!");
      setTimeout(() => {
        addMessage("assistant", CHARLIE_MESSAGES.name);
        setStep("name");
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const value = userInput.trim();
    addMessage("user", value, false);
    setUserInput("");

    switch (step) {
      case "name":
        setProfile((p) => ({ ...p, name: value }));
        setTimeout(() => {
          typeMessage(`${CHARLIE_MESSAGES.species} ${value}?`, () => {
            setStep("species");
          });
        }, 500);
        break;

      case "species":
        const speciesName = value.toLowerCase();
        setProfile((p) => ({ ...p, species: speciesName }));
        setTimeout(() => {
          typeMessage(`${CHARLIE_MESSAGES.pronouns} ${profile.name}?`, () => {
            setStep("pronouns");
          });
        }, 500);
        break;

      case "pronouns":
        setProfile((p) => ({ ...p, pronouns: value }));
        setTimeout(() => {
          typeMessage(`${CHARLIE_MESSAGES.breed} ${profile.name}?`, () => {
            setStep("breed");
          });
        }, 500);
        break;

      case "breed":
        setProfile((p) => ({ ...p, breed: value }));
        setTimeout(() => {
          typeMessage(`${CHARLIE_MESSAGES.age} ${profile.name}?`, () => {
            setStep("age");
          });
        }, 500);
        break;

      case "age":
        setProfile((p) => ({ ...p, age: value }));
        setTimeout(() => {
          typeMessage(
            CHARLIE_MESSAGES.health.replace("{name}", profile.name || "your pet"),
            () => {
              setStep("health");
            }
          );
        }, 500);
        break;

      case "health":
        const healthConditions = value.toLowerCase() === "none" || value.toLowerCase() === "no" 
          ? [] 
          : value.split(",").map((s) => s.trim());
        setProfile((p) => ({ ...p, healthConditions }));
        setTimeout(() => {
          typeMessage(
            CHARLIE_MESSAGES.dietary.replace("{name}", profile.name || "your pet"),
            () => {
              setStep("dietary");
            }
          );
        }, 500);
        break;

      case "dietary":
        const dietaryNeeds = value.toLowerCase() === "none" || value.toLowerCase() === "no"
          ? []
          : value.split(",").map((s) => s.trim());
        setProfile((p) => ({ ...p, dietaryNeeds }));
        setTimeout(() => {
          typeMessage(`Perfect! I've got all the details about ${profile.name}. Let's chat!`, () => {
            setTimeout(() => {
              onComplete({
                ...profile,
                dietaryNeeds,
              } as DogProfile);
            }, 1000);
          });
        }, 500);
        break;
    }
  };

  const handleQuickButton = (value: string, targetStep: Step, fieldName: keyof DogProfile) => {
    addMessage("user", value, false);
    setProfile((p) => ({ ...p, [fieldName]: value }));
    
    setTimeout(() => {
      if (targetStep === "pronouns") {
        typeMessage(`${CHARLIE_MESSAGES.pronouns} ${profile.name}?`, () => {
          setStep(targetStep);
        });
      } else if (targetStep === "breed") {
        typeMessage(`${CHARLIE_MESSAGES.breed} ${profile.name}?`, () => {
          setStep(targetStep);
        });
      }
    }, 500);
  };

  return (
    <div className="flex h-screen bg-[#FFF2DD] text-[#260900] font-modern">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 h-20 px-4 sm:px-6 border-b border-[#260900]/10 bg-[#FFF9ED]">
          <Image src="/logo.png" alt="myPawPair" width={229} height={72} className="h-10 sm:h-12 w-auto" />
        </header>

        {/* Progress indicator - only show during detailed flow */}
        {step !== "welcome" && step !== "path-choice" && !isQuickPath && (
          <div className="px-4 sm:px-6 py-3 bg-[#FFF9ED] border-b border-[#260900]/10">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 text-sm text-[#4A5563]">
                <span className="text-[#F3B443] font-medium">
                  Step {
                    ["name", "species", "pronouns", "breed", "age", "health", "dietary"].indexOf(step) + 1
                  }/7
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Welcome state */}
            {step === "welcome" && chatHistory.length === 0 && (
              <>
                <div className="text-center pt-8 pb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F3B443]/10 mb-6 shadow-[0px_2px_4px_rgba(137,82,43,0.3)]">
                    <Bot className="h-10 w-10 text-[#F3B443]" />
                  </div>
                  <p className="text-sm text-[#4A5563] mb-4">Welcome to myPawPair</p>
                </div>

                {/* Charlie's welcome message */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#F3B443]/20 flex items-center justify-center shadow-[0px_2px_4px_rgba(137,82,43,0.2)]">
                    <Bot className="h-5 w-5 text-[#F3B443]" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-5 py-3 rounded-2xl bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5">
                      <p className="text-[#260900] text-sm sm:text-base whitespace-pre-wrap">
                        {CHARLIE_MESSAGES.welcome}
                      </p>
                    </div>
                    <p className="text-xs text-[#4A5563] mt-1 ml-1">
                      Charlie <span className="text-[#260900]/40">at myPawPair</span>
                    </p>
                  </div>
                </div>

                {/* Quick Path / Detailed Path buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => handleWelcomeChoice("quick")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-[#F3B443] border-2 border-[#260900]/10 hover:border-[#F3B443] text-[#260900] hover:text-white transition-all duration-300 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] text-sm sm:text-base"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Quick Path</span>
                  </button>
                  <button
                    onClick={() => handleWelcomeChoice("detailed")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#F3B443] hover:bg-[#d99d2f] text-white transition-all duration-300 shadow-[0px_4px_8px_rgba(137,82,43,0.5),inset_0px_-4px_8px_rgba(137,82,43,0.3)] text-sm sm:text-base"
                  >
                    <ClipboardList className="h-5 w-5" />
                    <span>Detailed Path</span>
                  </button>
                </div>
              </>
            )}

            {/* Path choice state */}
            {step === "path-choice" && (
              <div className="space-y-6 pt-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#F3B443]/20 flex items-center justify-center shadow-[0px_2px_4px_rgba(137,82,43,0.2)]">
                    <Bot className="h-5 w-5 text-[#F3B443]" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-5 py-3 rounded-2xl bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5">
                      <p className="text-[#260900] text-sm sm:text-base">{CHARLIE_MESSAGES.pathChoice}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handlePathChoice("detailed")}
                    className="flex-1 px-6 py-4 rounded-2xl bg-[#F3B443] hover:bg-[#d99d2f] text-white transition-all duration-300 shadow-[0px_4px_8px_rgba(137,82,43,0.5),inset_0px_-4px_8px_rgba(137,82,43,0.3)] text-sm sm:text-base"
                  >
                    I'd like to give details, so you can get to know my dog!
                  </button>
                  <button
                    onClick={() => handlePathChoice("skip")}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white hover:bg-[#F3B443] border-2 border-[#260900]/10 hover:border-[#F3B443] text-[#260900] hover:text-white transition-all duration-300 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] text-sm sm:text-base"
                  >
                    I'll start chatting now
                  </button>
                </div>
              </div>
            )}

            {/* Chat history */}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-[#5F7E9D] shadow-[0px_2px_4px_rgba(95,126,157,0.3)]"
                      : "bg-[#F3B443]/20 shadow-[0px_2px_4px_rgba(137,82,43,0.2)]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <UserIcon className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-[#F3B443]" />
                  )}
                </div>
                <div className={`flex-1 min-w-0 ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block px-5 py-3 rounded-2xl text-sm sm:text-base max-w-full sm:max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-[#5F7E9D] text-white shadow-[0px_2px_4px_rgba(95,126,157,0.3)]"
                        : "bg-white text-[#260900] shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && typingContent && (
              <div className="flex gap-3 sm:gap-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#F3B443]/20 flex items-center justify-center shadow-[0px_2px_4px_rgba(137,82,43,0.2)]">
                  <Bot className="h-5 w-5 text-[#F3B443]" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-5 py-3 rounded-2xl bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.06)] border border-[#260900]/5">
                    <p className="text-[#260900] text-sm sm:text-base whitespace-pre-wrap">{typingContent}<span className="animate-pulse">|</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Pronoun quick buttons */}
            {step === "pronouns" && !isTyping && chatHistory[chatHistory.length - 1]?.role === "assistant" && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {[
                  { label: "She/her", icon: UserIcon },
                  { label: "He/him", icon: UserIcon },
                  { label: "They/them", icon: Users },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleQuickButton(option.label, "breed", "pronouns")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F3B443] border-2 border-[#F3B443]/30 hover:border-[#F3B443] text-[#260900] hover:text-white transition-all duration-300 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] text-sm"
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Species quick buttons */}
            {step === "species" && !isTyping && chatHistory[chatHistory.length - 1]?.role === "assistant" && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {[
                  { label: "Dog", icon: Dog },
                  { label: "Cat", icon: Cat },
                  { label: "Other", icon: Heart },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleQuickButton(option.label, "pronouns", "species")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F3B443] border-2 border-[#F3B443]/30 hover:border-[#F3B443] text-[#260900] hover:text-white transition-all duration-300 shadow-[0px_2px_4px_rgba(0,0,0,0.04)] text-sm"
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input area - only show for text input steps */}
        {step !== "welcome" && step !== "path-choice" && !isQuickPath && (
          <div className="border-t border-[#260900]/10 p-4 sm:p-6 bg-[#FFF9ED]">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-end">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  step === "name"
                    ? "Enter your dog's name..."
                    : step === "breed"
                    ? "e.g., Golden Retriever, Mixed..."
                    : step === "age"
                    ? "e.g., 3 years, 6 months..."
                    : step === "health" || step === "dietary"
                    ? "Type details or 'none'..."
                    : "Type here..."
                }
                className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-white border-2 border-[#80A626]/30 focus:border-[#F3B443] focus:outline-none focus:ring-2 focus:ring-[#F3B443]/20 text-base placeholder:text-[#4A5563] text-[#260900] shadow-[0px_2px_4px_rgba(0,0,0,0.04)]"
                autoFocus
              />
              <button
                type="submit"
                disabled={!userInput.trim()}
                className="shrink-0 px-6 h-12 rounded-full bg-[#F3B443] hover:bg-[#d99d2f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all duration-300 shadow-[0px_4px_8px_rgba(137,82,43,0.5),inset_0px_-4px_8px_rgba(137,82,43,0.3)] text-sm sm:text-base"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
