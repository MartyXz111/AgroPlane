
import React, { useState, useRef, useEffect } from 'react';
import { getAgriculturalAdvice, analyzePlantImage } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Salutare! Sunt AgroAI, consultantul tău agricol digital. Cu ce te pot ajuta astăzi? Îmi poți pune întrebări despre culturi, sol, dăunători sau îmi poți trimite o poză cu o plantă pentru diagnosticare.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await getAgriculturalAdvice(input, history);
    
    setMessages(prev => [...prev, { role: 'model', content: response, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      
      setMessages(prev => [...prev, { role: 'user', content: '📸 [Imagine trimisă pentru analiză]', timestamp: new Date() }]);
      setIsLoading(true);
      
      const response = await analyzePlantImage(base64);
      setMessages(prev => [...prev, { role: 'model', content: response, timestamp: new Date() }]);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="advisor" className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden flex flex-col h-[600px] animate-fadeIn">
      <div className="bg-green-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-xl">🤖</div>
          <div>
            <h3 className="font-bold">AgroAI Consultant</h3>
            <p className="text-xs opacity-80">Online | Expert Agronom</p>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="text-xs bg-green-700 hover:bg-green-800 px-3 py-1 rounded-full transition-colors">
          Resetează Chat
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {m.content}
              </div>
              <div className={`text-[10px] mt-2 opacity-60 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-xs text-gray-500 font-medium">AgroAI gândește...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full hover:bg-gray-100 text-green-600 transition-colors"
            title="Trimite poză plantă"
          >
            📷
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Întreabă orice despre agricultura ta..."
            className="flex-grow bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 ring-green-500 outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            🚀
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIAdvisor;
