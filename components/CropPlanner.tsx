
import React, { useState, useEffect } from 'react';
import { UserCrop, SoilType, PlannedTask } from '../types';
import { generateCropSchedule } from '../services/geminiService';
import CropMap from './CropMap';

const CropPlanner: React.FC = () => {
  const [crops, setCrops] = useState<UserCrop[]>(() => {
    const saved = localStorage.getItem('agroplan_crops');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedCropId, setFocusedCropId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [soil, setSoil] = useState<SoilType>('Lutos');
  const [ph, setPh] = useState<string>('');
  const [texture, setTexture] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    localStorage.setItem('agroplan_crops', JSON.stringify(crops));
  }, [crops]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocația nu este suportată de browser-ul tău.");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsDetecting(false);
      },
      () => {
        alert("Nu am putut accesa locația.");
        setIsDetecting(false);
      }
    );
  };

  const handleAddCrop = async () => {
    if (!name) return;
    setLoading(true);
    
    const soilPhNum = ph ? parseFloat(ph) : undefined;
    
    try {
      const rawTasks = await generateCropSchedule(name, variety, date, soil, soilPhNum, texture);
      
      const plannedTasks: PlannedTask[] = rawTasks.map((t: any) => {
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + t.daysAfterPlanting);
        return {
          id: Math.random().toString(36).substr(2, 9),
          title: t.title,
          dueDate: dueDate.toISOString().split('T')[0],
          category: t.category,
          completed: false,
          notes: t.notes
        };
      });

      const newCrop: UserCrop = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        variety,
        plantedDate: date,
        soilType: soil,
        soilPH: soilPhNum,
        soilTexture: texture,
        area: 0,
        tasks: plannedTasks,
        status: 'active',
        lat: location?.lat,
        lng: location?.lng
      };

      setCrops([newCrop, ...crops]);
      setIsAdding(false);
      setName('');
      setVariety('');
      setPh('');
      setTexture('');
      setLocation(null);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding crop:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (cropId: string, taskId: string) => {
    setCrops(prev => prev.map(c => {
      if (c.id === cropId) {
        return {
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        };
      }
      return c;
    }));
  };

  const deleteCrop = (id: string) => {
    if (confirm('Ești sigur că vrei să elimini această cultură?')) {
      setCrops(crops.filter(c => c.id !== id));
    }
  };

  const handleFocusOnMap = (cropId: string) => {
    setFocusedCropId(cropId);
    setViewMode('map');
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
            <span>🌿</span> Planificatorul Meu
          </h2>
          {showSuccess && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full animate-popIn">
              Cultură adăugată! ✨
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button 
            onClick={() => { setViewMode('list'); setFocusedCropId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Listă
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Hartă
          </button>
          <div className="w-px h-4 bg-gray-100 mx-1"></div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isAdding 
              ? 'bg-gray-100 text-gray-600' 
              : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {isAdding ? 'Anulează' : '+ Nou'}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-green-100 animate-slideDown overflow-hidden">
          <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Planifică o nouă recoltă
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Specie</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                type="text" 
                placeholder="ex: Roșii Cherry"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-green-500 transition-all outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Soi</label>
              <input 
                value={variety} 
                onChange={e => setVariety(e.target.value)} 
                type="text" 
                placeholder="ex: Inimă de Bou"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-green-500 transition-all outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Data Plantării</label>
              <input 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                type="date" 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-green-500 transition-all outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Locație (🛰️ Recomandat)</label>
              <button 
                onClick={detectLocation}
                disabled={isDetecting}
                className={`w-full text-left bg-gray-50 border-none rounded-xl px-4 py-3 text-sm transition-all flex items-center justify-between ${location ? 'text-green-600 font-bold' : 'text-gray-400'}`}
              >
                <span>{isDetecting ? 'Se caută...' : location ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Detectează Locația Actuală'}</span>
                {!isDetecting && !location && <span className="text-xs">🗺️</span>}
              </button>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Tipul Solului</label>
              <select 
                value={soil} 
                onChange={e => setSoil(e.target.value as SoilType)} 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-green-500 transition-all outline-none cursor-pointer"
              >
                <option>Lutos</option>
                <option>Nisipos</option>
                <option>Argilos</option>
                <option>Calcaros</option>
                <option>Turbos</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">pH Sol</label>
                <input 
                  value={ph} 
                  onChange={e => setPh(e.target.value)} 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="ex: 6.5"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-green-500 transition-all outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1">Textură Sol</label>
                <input 
                  value={texture} 
                  onChange={e => setTexture(e.target.value)} 
                  type="text" 
                  placeholder="ex: Fină, Gropoasă"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-green-500 transition-all outline-none" 
                />
              </div>
            </div>
          </div>
          <button 
            disabled={loading || !name}
            onClick={handleAddCrop}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 disabled:opacity-50 transition-all flex justify-center items-center gap-3 shadow-lg shadow-green-200"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AgroAI generează planul...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Generează Plan Detaliat</span>
              </>
            )}
          </button>
        </div>
      )}

      {viewMode === 'map' ? (
        <CropMap crops={crops} initialFocusId={focusedCropId} />
      ) : (
        <>
          {crops.length === 0 && !isAdding && (
            <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center animate-fadeIn">
              <div className="text-5xl mb-4 opacity-20">🚜</div>
              <h3 className="text-gray-400 font-medium">Grădina ta este goală.</h3>
              <p className="text-gray-300 text-sm mt-1">Începe prin a planifica prima ta cultură pentru 2025.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop, index) => (
              <div 
                key={crop.id} 
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 relative group animate-popIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button 
                  onClick={() => deleteCrop(crop.id)} 
                  className="absolute top-6 right-6 text-gray-200 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-full z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                    {crop.name[0]}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between pr-8">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-800 transition-colors">
                        {crop.name}
                      </h3>
                      {crop.lat && (
                        <button 
                          onClick={() => handleFocusOnMap(crop.id)}
                          className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          📍 VEZI PE HARTĂ
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] bg-gray-50 text-gray-500 font-bold px-2 py-0.5 rounded-full border border-gray-100">
                        {crop.variety}
                      </span>
                      <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-100">
                        Sol {crop.soilType}
                      </span>
                      {crop.soilPH && (
                        <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full border border-purple-100">
                          pH {crop.soilPH}
                        </span>
                      )}
                      {crop.soilTexture && (
                        <span className="text-[10px] bg-slate-50 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-100">
                          {crop.soilTexture}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Planul de Lucrări</h4>
                    <span className="text-[10px] text-gray-400 font-medium">Plantat: {new Date(crop.plantedDate).toLocaleDateString('ro-RO')}</span>
                  </div>
                  {crop.tasks.slice(0, 4).map(task => (
                    <div key={task.id} className="flex items-center justify-between text-sm group/task">
                      <div className="flex items-center gap-3">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            checked={task.completed} 
                            onChange={() => toggleTask(crop.id, task.id)}
                            className="w-5 h-5 rounded-lg border-2 border-gray-200 text-green-600 focus:ring-green-500 transition-all cursor-pointer hover:border-green-300"
                          />
                          {task.completed && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white text-[10px] font-bold">✓</div>
                          )}
                        </div>
                        <span className={`transition-all duration-300 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 font-medium group-hover/task:text-green-700'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${task.completed ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 border border-gray-100'}`}>
                        {new Date(task.dueDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default CropPlanner;
