import React, { useState, useRef, useEffect } from 'react';
import { runChat } from '../../utils/gemini'; // Adjust path if needed
import { Bot, Send, X, Sparkles, User } from 'lucide-react';

const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ text: "Hello! How can I help with your health inventory today?", sender: "bot" }]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const newMsg = { text: input, sender: "user" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await runChat(input);
      setMessages(prev => [...prev, { text: response, sender: "bot" }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Sorry, I encountered an error. Please try again.", sender: "bot", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center space-x-3 text-white">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Gemini AI</h3>
                <p className="text-blue-100 text-xs">Medical Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-slate-50/50 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                  m.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white text-blue-500 border border-slate-100'
                }`}>
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : m.isError
                      ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-in fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-blue-500 border border-slate-100 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-sm shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form 
              onSubmit={handleSend}
              className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all"
            >
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask about your medicine..." 
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in"
        >
          <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
          <span className="font-semibold text-sm">Ask Gemini AI</span>
        </button>
      )}
    </div>
  );
};

export default GeminiChat;