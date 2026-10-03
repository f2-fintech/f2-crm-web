"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, BrainCircuit, BarChart, Users, ChevronRight, RefreshCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface IMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `Hello ${user?.firstName || 'there'}! I am your F2 CRM AI Copilot. How can I assist you with your leads, applications, or analytics today?`,
      timestamp: new Date().toISOString(),
      suggestions: [
        "Summarize my leads for today",
        "Which applications are pending KYC?",
        "Generate a sales forecast report",
      ],
    },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateAiResponse = (userText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let aiResponseText = "I'm currently in demo mode, but I've processed your request. I can analyze CRM data and provide insights.";
      
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("lead") || lowerText.includes("summarize")) {
        aiResponseText = "Based on my analysis, you have 2 new leads today. Both are from organic web sources. Would you like me to draft a follow-up email for them?";
      } else if (lowerText.includes("kyc") || lowerText.includes("application")) {
        aiResponseText = "There are currently 2 applications in the pipeline. 'Amit Patel' is Under Review, and 'Neha Gupta' is Approved. You should prioritize Amit's application to reduce TAT (Turn Around Time).";
      } else if (lowerText.includes("forecast") || lowerText.includes("sales")) {
        aiResponseText = "Your projected conversion rate this week is 14% higher than last week. If the pending Home Loan applications close, you will exceed your monthly target by 8%.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: aiResponseText,
          timestamp: new Date().toISOString(),
          suggestions: ["Show me the data", "Draft an email", "Set a reminder"],
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: IMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    simulateAiResponse(text.trim());
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 p-6 overflow-hidden">
      
      {/* Left Sidebar - AI Features Overview */}
      <div className="hidden lg:flex w-80 flex-col gap-6 h-full">
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={100} />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md mb-4">
              <Sparkles size={24} className="text-brand-100" />
            </div>
            <h2 className="text-xl font-bold mb-2">F2 CRM Intelligence</h2>
            <p className="text-brand-100 text-sm mb-6">
              Your AI-powered assistant designed for Fintech CRMs. Ask questions in natural language.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-black/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                <Users size={16} className="text-brand-200" />
                <span className="text-sm font-medium text-brand-50">Lead Scoring</span>
              </div>
              <div className="flex items-center gap-3 bg-black/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                <BarChart size={16} className="text-brand-200" />
                <span className="text-sm font-medium text-brand-50">Predictive Analytics</span>
              </div>
              <div className="flex items-center gap-3 bg-black/10 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                <RefreshCcw size={16} className="text-brand-200" />
                <span className="text-sm font-medium text-brand-50">Workflow Automation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex-1">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-wider">Suggested Queries</h3>
          <div className="space-y-3">
            {[
              "What's my conversion rate today?",
              "Draft an email to Amit Patel",
              "Which leads are untouched for 3 days?",
              "Show me the highest value applications"
            ].map((query, i) => (
              <button 
                key={i}
                onClick={() => handleSend(query)}
                className="w-full text-left p-3 rounded-xl hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-brand-100 dark:hover:border-gray-700 flex items-center justify-between group"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400">{query}</span>
                <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        {/* Header */}
        <div className="h-20 border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between bg-white/50 dark:bg-gray-900/50 backdrop-blur-md z-10 relative">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-indigo-100 dark:from-brand-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                <Bot size={24} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Copilot
                <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase">AI</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Ready to assist</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gray-50/50 dark:bg-gray-900/30">
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div key={msg.id} className={`flex gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User size={16} className="text-gray-600 dark:text-gray-300" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                      <Bot size={16} className="text-brand-600 dark:text-brand-400" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3.5 rounded-2xl text-[15px] shadow-sm leading-relaxed ${
                    isUser 
                      ? 'bg-brand-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-2 font-medium px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                  
                  {/* Suggestions */}
                  {!isUser && msg.suggestions && index === messages.length - 1 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-full transition-all hover:shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                  <Bot size={16} className="text-brand-600 dark:text-brand-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1 shadow-sm">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="relative flex items-end gap-3 max-w-4xl mx-auto"
          >
            <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700 p-2 pl-4 focus-within:border-brand-500 focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot to analyze your CRM data..."
                className="w-full bg-transparent border-none outline-none text-[15px] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-brand-600 hover:bg-brand-700 text-white w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">
              AI Copilot can make mistakes. Consider verifying important metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
