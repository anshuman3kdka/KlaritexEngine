import React, { useState, useRef, useEffect } from 'react';
import { streamChat } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello. I am the Klaritex Assistant. Ask me about scoring or specific rules.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      let fullResponse = "";
      const stream = streamChat(history, userMsg.text);

      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        if (chunk) {
          fullResponse += chunk;
          setMessages(prev => {
             const newMsgs = [...prev];
             newMsgs[newMsgs.length - 1].text = fullResponse;
             return newMsgs;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Could not connect to Klaritex Assistant." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col animate-fade-in-up transition-colors duration-300">
          <div className="bg-slate-900 dark:bg-slate-950 text-white p-3 flex justify-between items-center border-b border-slate-700">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Klaritex Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-xs font-sans rounded-sm border ${
                  msg.role === 'user' 
                    ? 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100' 
                    : 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs font-mono text-slate-400 ml-2">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 text-xs font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 focus:outline-none focus:border-slate-900 dark:focus:border-slate-500"
              />
              <button 
                type="submit" 
                className="ml-2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-1 text-xs font-bold uppercase hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                disabled={isTyping}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-700 text-white shadow-lg flex items-center justify-center hover:bg-slate-800 dark:hover:bg-slate-600 transition-all hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           {isOpen ? (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           ) : (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
           )}
        </svg>
      </button>
    </div>
  );
};

export default ChatWidget;