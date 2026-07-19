import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { profileData, ProfileData } from "../data/profile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const presetQuestions = [
  { label: "Croissants & Code? 🥐", query: "How did training as a pastry chef help your programming?" },
  { label: "Keyboard Setup ⌨️", query: "What is your mechanical keyboard acoustic setup?" },
  { label: "Latent Canvas 🎨", query: "Can you tell me about your Latent Canvas project?" },
];

export default function AIChatCompanion({ profile }: { profile?: ProfileData }) {
  const [isOpen, setIsOpen] = useState(false);
  const p = profile || profileData;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm ${p.name}'s digital avatar. Feel free to ask me anything about my software engineering projects, pastry chef training, or acoustic keyboard obsessions!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true); // highlight badge initially
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
    }
  }, [messages, isOpen]);

  // Open the chat box
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Submit a message to /api/chat
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
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
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I had trouble connecting. Could you try asking again? (Also ensure the backend server is running correctly!)",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" id="ai-chat-root">
      
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai-chat-panel"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="card w-80 sm:w-96 h-[460px] shadow-2xl !p-0 overflow-hidden flex flex-col bg-white border border-neutral-200"
          >
            {/* Header */}
            <div className="bg-neutral-50 border-b border-neutral-150 p-3.5 flex justify-between items-center" id="ai-chat-header">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-neutral-900 tracking-tight">{p.name}'s AI Assistant</span>
              </div>
              <button
                id="ai-chat-close-btn"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-black transition-colors cursor-pointer text-[11px] font-bold"
              >
                —
              </button>
            </div>

            {/* Message Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white" id="ai-chat-message-log">
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    id={`ai-message-item-${message.id}`}
                    className={`flex items-start gap-2 ${!isAssistant ? "justify-end" : "justify-start"}`}
                  >
                    {isAssistant && (
                      <div className="w-6 h-6 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}
                    <div
                      id={`ai-message-bubble-${message.id}`}
                      className={`max-w-[82%] p-3 text-[11px] leading-relaxed font-sans ${
                        isAssistant
                          ? "bg-neutral-100 text-neutral-800 chat-bubble"
                          : "bg-neutral-900 text-white rounded-xl rounded-br-none"
                      }`}
                    >
                      <p className="whitespace-pre-line font-sans">{message.content}</p>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex items-start gap-2 justify-start" id="ai-chat-loading-indicator">
                  <div className="w-6 h-6 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    🤖
                  </div>
                  <div className="bg-neutral-100 p-3 chat-bubble text-[11px] text-neutral-500 flex items-center gap-1.5 leading-relaxed font-sans">
                    <Loader2 size={10} className="animate-spin text-neutral-400" />
                    <span>Alex is formulating...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion / Prompt Starter Chips */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/50" id="ai-chat-presets-container">
                <div className="flex flex-wrap gap-1.5" id="ai-chat-presets">
                  {presetQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      id={`preset-btn-${idx}`}
                      onClick={() => handleSendMessage(q.query)}
                      className="text-[10px] border border-neutral-200 rounded-full px-3 py-1 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              id="ai-chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-neutral-100 bg-neutral-50 relative"
            >
              <input
                id="ai-chat-input"
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="w-full text-[11px] bg-white border border-neutral-200 rounded-xl pl-4 pr-12 py-3 outline-none focus:border-neutral-400 transition-colors disabled:opacity-50 font-sans"
              />
              <div className="absolute right-5 top-[18px]">
                <button
                  id="ai-chat-send-btn"
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 cursor-pointer"
                >
                  <Send size={10} className="stroke-[2.5]" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        id="ai-chat-toggle-btn"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg transition-transform cursor-pointer border-none outline-none relative"
      >
        {isOpen ? <X size={20} className="text-white" /> : <span className="text-2xl" id="ai-chat-toggle-icon">💬</span>}
        
        {/* Playful notification ping */}
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5" id="ai-chat-ping">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500" />
          </span>
        )}
      </motion.button>

    </div>
  );
}
