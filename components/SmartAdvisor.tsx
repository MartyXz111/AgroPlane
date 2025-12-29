
import React, { useState, useRef, useEffect } from 'react';
import { getAgriculturalAdvice, analyzePlantImage, getSmartRecommendations } from '../services/geminiService';
import { ChatMessage, SoilType } from '../types';

const SmartAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: 'Pune o intrebare despre culturi sau trimite o poza cu o planta.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSmartForm, setShowSmartForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useState('București, România');
  const [soil, setSoil] = useState<SoilType>('Lutos');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: promptText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const response = await getAgriculturalAdvice(promptText, history);
    
    setMessages(prev => [...prev, { role: 'model', content: response || 'Fara raspuns.', timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleSmartRec = async () => {
    setIsLoading(true);
    setShowSmartForm(false);
    const month = new Date().toLocaleString('ro-RO', { month: 'long' });
    const userMsg: ChatMessage = { 
      role: 'user', 
      content: `Recomandari pentru ${location}, sol ${soil}, luna ${month}.`, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    
    const response = await getSmartRecommendations(location, soil, month);
    setMessages(prev => [...prev, { role: 'model', content: response || 'Eroare date.', timestamp: new Date() }]);
    setIsLoading(false);
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setMessages(prev => [...prev, { role: 'user', content: 'Analiza imagine', timestamp: new Date() }]);
      setIsLoading(true);
      const response = await analyzePlantImage(base64);
      setMessages(prev => [...prev, { role: 'model', content: response || 'Analiza esuata.', timestamp: new Date() }]);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="advisor" className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden flex flex-col h-[700px] animate-fadeIn">
      <div className="bg-green-600 p-4 text-white flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-xl shadow-inner">🤖</div>
          <div>
            <h3 className="font-bold">AgroAI Consultant</h3>
            <p className="text-xs opacity-80">Raspunsuri rapide</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setShowSmartForm(!showSmartForm)} 
            className="text-xs bg-white text-green-600 font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
          >
            Sfat Local
          </button>
          <button onClick={() => setMessages([messages[0]])} className="text-xs bg-green-700 hover:bg-green-800 p-2 rounded-lg transition-colors">
            🔄
          </button>
        </div>
      </div>

      {showSmartForm && (
        <div className="p-4 bg-green-50 border-b border-green-100 animate-slideDown">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                placeholder="Locație" 
                className="flex-grow text-xs p-2 rounded-lg border border-green-200 outline-none" 
              />
              <button onClick={detectLocation} className="text-xs bg-green-200 text-green-700 px-2 rounded-lg">📍</button>
            </div>
            <select 
              value={soil} 
              onChange={e => setSoil(e.target.value as SoilType)}
              className="w-full text-xs p-2 rounded-lg border border-green-200"
            >
              <option>Lutos</option>
              <option>Nisipos</option>
              <option>Argilos</option>
              <option>Calcaros</option>
              <option>Turbos</option>
            </select>
            <button onClick={handleSmartRec} className="w-full bg-green-600 text-white text-xs font-bold py-2 rounded-lg shadow-sm">
              Sfat personalizat
            </button>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl shadow-sm text-sm ${
              m.role === 'user' 
                ? 'bg-green-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              <div className="whitespace-pre-line leading-snug">
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-150"></div>
              </div>
              <span className="text-[10px] text-gray-400 italic">AgroAI raspunde...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-white shadow-inner">
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full hover:bg-green-50 text-green-600 flex-shrink-0"
            title="Analiză plantă"
          >
            📷
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Intrebare scurta..."
            className="flex-grow bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm outline-none"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-2xl transition-all shadow-md disabled:opacity-50"
          >
            🚀
          </button>
        </div>
      </div>
    </section>
  );
};

export default SmartAdvisor;
