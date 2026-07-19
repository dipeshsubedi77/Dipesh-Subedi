import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  BadgeAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { profileData, ProfileData } from "../data/profile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  feedback?: "liked" | "disliked" | null;
}

// Preset Prompts grouped by categories for a richer interactive exploration
const presetCategories = [
  {
    id: "all",
    label: "All Starters"
  },
  {
    id: "chef",
    label: "Croissants & Code 🥐"
  },
  {
    id: "tech",
    label: "Software & Stack 💻"
  },
  {
    id: "hobbies",
    label: "Keyboards & Hobbies ⌨️"
  }
];

const presetQuestions = [
  { 
    label: "Croissants & Code? 🥐", 
    query: "How did training as a pastry chef help your programming?",
    category: "chef" 
  },
  { 
    label: "Keyboard Setup ⌨️", 
    query: "What is your mechanical keyboard acoustic setup and workspace configuration?",
    category: "hobbies" 
  },
  { 
    label: "Latent Canvas 🎨", 
    query: "Can you tell me about your Latent Canvas project and the technology stack behind it?",
    category: "tech" 
  },
  { 
    label: "Core Expertise ⚡", 
    query: "What are your core engineering strengths, programming languages, and design patterns?",
    category: "tech" 
  },
  { 
    label: "Recent Experience 💼", 
    query: "Could you walk me through your career milestone highlights and team roles?",
    category: "tech" 
  },
  { 
    label: "Baking Philosophy 🎂", 
    query: "Does your precision baking philosophy apply to pixel-perfect visual design?",
    category: "chef" 
  }
];

// Reusable Copyable Code Block Component
const CodeBlock = ({ code, language }: { code: string; language: string; key?: any }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code block:", err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-neutral-800/80 bg-neutral-950 text-neutral-200 font-mono text-[11px] sm:text-xs shadow-md">
      <div className="flex justify-between items-center px-4 py-2 bg-neutral-900 text-neutral-400 border-b border-neutral-800/60 text-[10px]">
        <span className="uppercase tracking-wider font-semibold text-neutral-400 font-mono">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={11} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed font-mono text-neutral-100 bg-neutral-950/60 scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Robust custom inline and block parser for markdown formatting
const renderInlineCode = (txt: string) => {
  const codeParts = txt.split(/`([\s\S]*?)`/g);
  return codeParts.map((cPart, cIdx) => {
    if (cIdx % 2 === 1) {
      return (
        <code key={cIdx} className="px-1.5 py-0.5 bg-neutral-100/90 text-rose-600 dark:text-rose-500 border border-neutral-200/60 font-mono text-[10px] sm:text-xs rounded font-medium mx-0.5">
          {cPart}
        </code>
      );
    }
    return cPart;
  });
};

const renderInlineStyles = (txt: string) => {
  const boldParts = txt.split(/\*\*([\s\S]*?)\*\*/g);
  return boldParts.map((bPart, bIdx) => {
    if (bIdx % 2 === 1) {
      return (
        <strong key={bIdx} className="font-semibold text-neutral-950">
          {renderInlineCode(bPart)}
        </strong>
      );
    }
    return <React.Fragment key={bIdx}>{renderInlineCode(bPart)}</React.Fragment>;
  });
};

const MarkdownTextHelper = ({ text }: { text: string; key?: any }) => {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);
  
  return (
    <div className="space-y-2.5 text-[11px] sm:text-xs leading-relaxed text-neutral-700">
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        const lines = trimmed.split("\n");
        const isBulletList = lines.every(line => line.trim().startsWith("- ") || line.trim().startsWith("* "));
        const isNumList = lines.every(line => /^\d+\.\s/.test(line.trim()));

        if (isBulletList) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5 my-2 text-neutral-700">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="pl-0.5">
                  {renderInlineStyles(line.trim().substring(2))}
                </li>
              ))}
            </ul>
          );
        }

        if (isNumList) {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1.5 my-2 text-neutral-700">
              {lines.map((line, lIdx) => {
                const match = line.trim().match(/^\d+\.\s(.*)/);
                const content = match ? match[1] : line;
                return (
                  <li key={lIdx} className="pl-0.5">
                    {renderInlineStyles(content)}
                  </li>
                );
              })}
            </ol>
          );
        }

        return (
          <p key={idx} className="leading-relaxed text-neutral-700">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {renderInlineStyles(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};

const MarkdownText = ({ text }: { text: string }) => {
  const parts = text.split("```");
  if (parts.length > 1) {
    return (
      <div className="space-y-1">
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            const lines = part.split("\n");
            const firstLine = lines[0].trim();
            const language = ["javascript", "typescript", "js", "ts", "json", "css", "html", "python", "bash", "sh", "sql"].includes(firstLine.toLowerCase()) 
              ? firstLine 
              : "";
            const code = language ? lines.slice(1).join("\n").trim() : part.trim();
            return <CodeBlock key={i} code={code} language={language || "code"} />;
          } else {
            return <MarkdownTextHelper key={i} text={part} />;
          }
        })}
      </div>
    );
  }

  return <MarkdownTextHelper text={text} />;
};

export default function AIChatCompanion({ profile }: { profile?: ProfileData }) {
  const [isOpen, setIsOpen] = useState(false);
  const p = profile || profileData;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm **${p.name}'s** digital virtual assistant. 🥐\n\nI can share insights about my software engineering projects, pastry chef backgrounds, and high-fidelity mechanical keyboard setups! Feel free to pick a prompt below or type your questions directly.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showNotificationToast, setShowNotificationToast] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
      setShowNotificationToast(false);
    }
  }, [messages, isOpen]);

  // Handle Toast timeout on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotificationToast(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      setShowNotificationToast(false);
    }
  };

  // Reset conversation to initial welcome
  const handleClearChat = () => {
    if (window.confirm("Do you want to reset your conversation history?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I'm **${p.name}'s** digital virtual assistant. 🥐\n\nI can share insights about my software engineering projects, pastry chef backgrounds, and high-fidelity mechanical keyboard setups! Feel free to pick a prompt below or type your questions directly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Dynamic feedback handlers
  const handleFeedback = (id: string, type: "liked" | "disliked") => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return {
            ...msg,
            feedback: msg.feedback === type ? null : type
          };
        }
        return msg;
      })
    );
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from companion.");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I had trouble connecting. Could you try asking again? (Also ensure the backend server is running and the `GEMINI_API_KEY` is configured correctly inside Secrets!)",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter presets based on category selection
  const filteredPresets = activeCategory === "all" 
    ? presetQuestions 
    : presetQuestions.filter(q => q.category === activeCategory);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans" id="ai-chat-root">
      
      {/* Dynamic welcome invite toast (only shows when chat closed and initially loaded) */}
      <AnimatePresence>
        {showNotificationToast && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-xs text-xs"
            id="ai-toast-announcement"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
              <span className="text-sm">🥐</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-200">Hi! I am Alex's AI Avatar</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Ask me about pastry skills & tech codes!</p>
            </div>
            <button 
              onClick={() => setShowNotificationToast(false)}
              className="text-neutral-400 hover:text-white transition-colors ml-1 p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Panel Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isMaximized ? "640px" : "384px",
              height: isMaximized ? "600px" : "480px"
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col bg-white border border-neutral-200/90 shadow-2xl rounded-2xl overflow-hidden max-w-[92vw] select-none"
          >
            {/* Header with tools bar */}
            <div className="bg-neutral-50/90 backdrop-blur-md border-b border-neutral-200/60 px-4 py-3.5 flex justify-between items-center shrink-0" id="ai-chat-header">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center text-sm font-serif">
                    A
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-900 tracking-tight">{p.name}'s AI Avatar</span>
                    <span className="text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-full font-mono font-medium scale-90 uppercase">V2.0</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono">Grounded Companion Model</p>
                </div>
              </div>

              {/* Utility Tools on Header */}
              <div className="flex items-center gap-1.5" id="ai-header-controls">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "Minimize size" : "Maximize size"}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                >
                  {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close AI Assistant"
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Message log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/40 select-text scrollbar-thin" id="ai-chat-message-log">
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    id={`ai-message-item-${message.id}`}
                    className={`flex items-start gap-2.5 group ${!isAssistant ? "justify-end" : "justify-start"}`}
                  >
                    {isAssistant && (
                      <div className="w-7 h-7 bg-neutral-950 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm font-serif">
                        A
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1 max-w-[84%]">
                      {/* Message Bubble */}
                      <div
                        id={`ai-message-bubble-${message.id}`}
                        className={`p-3.5 rounded-2xl shadow-xs border transition-all ${
                          isAssistant
                            ? "bg-white text-neutral-800 border-neutral-200/80 rounded-tl-none leading-relaxed"
                            : "bg-neutral-900 text-white border-neutral-900 rounded-tr-none"
                        }`}
                      >
                        <MarkdownText text={message.content} />
                      </div>

                      {/* Meta feedback line (only for Assistant messages) */}
                      <div className="flex items-center justify-between px-1 text-[9px] text-neutral-400 font-mono">
                        <span>{message.timestamp || ""}</span>
                        {isAssistant && message.id !== "welcome" && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleFeedback(message.id, "liked")}
                              title="Helpful"
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                message.feedback === "liked" ? "text-emerald-600 bg-emerald-50" : "hover:text-neutral-950 hover:bg-neutral-100"
                              }`}
                            >
                              <ThumbsUp size={10} className={message.feedback === "liked" ? "fill-emerald-600" : ""} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(message.id, "disliked")}
                              title="Not helpful"
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                message.feedback === "disliked" ? "text-red-600 bg-red-50" : "hover:text-neutral-950 hover:bg-neutral-100"
                              }`}
                            >
                              <ThumbsDown size={10} className={message.feedback === "disliked" ? "fill-red-600" : ""} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                alert("Response copied to clipboard!");
                              }}
                              title="Copy response text"
                              className="p-1 hover:text-neutral-950 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {!isAssistant && (
                      <div className="w-7 h-7 bg-neutral-200 border border-neutral-300 text-neutral-700 rounded-full flex items-center justify-center text-xs shrink-0 mt-1 shadow-xs">
                        <User size={12} className="stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5 justify-start" id="ai-chat-loading-indicator">
                  <div className="w-7 h-7 bg-neutral-950 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-1 shadow-sm font-serif">
                    A
                  </div>
                  <div className="bg-white border border-neutral-200 p-3.5 rounded-2xl rounded-tl-none shadow-xs text-xs text-neutral-500 flex items-center gap-2 max-w-[80%]">
                    <Loader2 size={12} className="animate-spin text-neutral-400 shrink-0" />
                    <span className="font-mono text-[10px] tracking-tight uppercase animate-pulse">Formulating delicious answer...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Conversation Prompts & Category Starters Panel */}
            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200/50 shrink-0" id="ai-presets-block">
              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="preset-categories-tabs">
                {presetCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-[9px] px-2.5 py-1 rounded-full font-medium transition-all shrink-0 uppercase tracking-wider cursor-pointer border ${
                      activeCategory === cat.id 
                        ? "bg-neutral-950 text-white border-neutral-950 shadow-xs" 
                        : "bg-white text-neutral-500 border-neutral-200/80 hover:text-neutral-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Horizontal rolling question chips */}
              <div className="flex gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none" id="presets-question-row">
                {filteredPresets.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q.query)}
                    className="text-[10px] border border-neutral-200/80 rounded-xl px-3 py-2 bg-white hover:bg-neutral-50 hover:border-neutral-400 text-neutral-700 transition-all cursor-pointer shadow-2xs font-medium whitespace-nowrap shrink-0 hover:scale-[1.01]"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <form
              id="ai-chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-neutral-200/60 bg-white relative flex gap-2 shrink-0 items-center"
            >
              <input
                id="ai-chat-input"
                type="text"
                maxLength={500}
                placeholder="Ask me anything about Alex's code & pastries..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-xs bg-neutral-50 hover:bg-neutral-50/50 focus:bg-white border border-neutral-200/80 rounded-xl pl-4 pr-12 py-3 outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950/20 transition-all disabled:opacity-50 text-neutral-800"
              />
              <div className="absolute right-5 top-[18px]">
                <button
                  id="ai-chat-send-btn"
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100 cursor-pointer shadow-sm"
                  title="Send message"
                >
                  <Send size={11} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Floating Action Badge Button */}
      <motion.button
        id="ai-chat-toggle-btn"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-neutral-950 rounded-full flex items-center justify-center shadow-2xl transition-transform cursor-pointer border-none outline-none relative hover:bg-neutral-900 group"
      >
        {isOpen ? (
          <X size={18} className="text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare size={20} className="text-white group-hover:rotate-6 transition-transform" />
            <Sparkles size={11} className="text-amber-400 absolute -top-1.5 -right-1.5 animate-pulse" />
          </div>
        )}
        
        {/* Playful notification ping */}
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5" id="ai-chat-ping">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-500" />
          </span>
        )}
      </motion.button>

    </div>
  );
}
