
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SeasonSwitcher from './components/SeasonSwitcher';
import SmartAdvisor from './components/SmartAdvisor';
import CropPlanner from './components/CropPlanner';
import { Season } from './types';
import { fetchWeather, WeatherData, getWeatherEmoji, getWeatherDescription } from './services/weatherService';

const App: React.FC = () => {
  const [currentSeason, setCurrentSeason] = useState<Season>(Season.SPRING);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const loadWeather = async (lat: number, lon: number) => {
      try {
        const data = await fetchWeather(lat, lon);
        setWeather(data);
      } catch (err) {
        console.error("Failed to fetch weather", err);
      } finally {
        setLoadingWeather(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
        () => loadWeather(44.43, 26.10)
      );
    } else {
      loadWeather(44.43, 26.10);
    }
  }, []);

  return (
    <Layout>
      {/* Hero Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-blue-100 transition-colors group">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {loadingWeather ? '⏳' : getWeatherEmoji(weather?.current.weathercode || 0)}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Meteo Acum</p>
            <h4 className="text-lg font-extrabold text-gray-800">
              {loadingWeather ? 'Se încarcă...' : `${weather?.current.temp}°C • ${getWeatherDescription(weather?.current.weathercode || 0)}`}
            </h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-amber-100 transition-colors group">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💨</div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vânt</p>
            <h4 className="text-lg font-extrabold text-gray-800">
               {loadingWeather ? '--' : `${weather?.current.windspeed} km/h`}
            </h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:border-purple-100 transition-colors group">
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📊</div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stare Sol</p>
            <h4 className="text-lg font-extrabold text-gray-800">Optim pentru Lucrări</h4>
          </div>
        </div>
      </section>

      {/* 7-Day Forecast */}
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Prognoza pe 7 Zile</h2>
            <p className="text-sm text-gray-500">Planifică-ți lucrările în funcție de vreme</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {loadingWeather ? (
            Array(7).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-50 animate-pulse h-48 rounded-2xl"></div>
            ))
          ) : (
            weather?.daily.time.map((time, i) => {
              const date = new Date(time);
              const dayName = date.toLocaleDateString('ro-RO', { weekday: 'short' });
              const isToday = i === 0;

              return (
                <div 
                  key={time} 
                  className={`flex flex-col items-center p-4 rounded-3xl transition-all border ${
                    isToday ? 'bg-blue-50 border-blue-100 shadow-sm ring-2 ring-blue-500/10' : 'bg-gray-50/50 border-transparent hover:border-gray-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {isToday ? 'Azi' : dayName}
                  </span>
                  <div className="text-3xl my-4">
                    {getWeatherEmoji(weather.daily.weathercode[i])}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-gray-800 leading-none">{Math.round(weather.daily.tempMax[i])}°</span>
                    <span className="text-xs text-gray-400 mb-3">{Math.round(weather.daily.tempMin[i])}°</span>
                  </div>
                  <div className="w-full space-y-2 mt-auto">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-bold text-gray-400">💧</span>
                      <span className="text-[9px] font-bold text-blue-600">{weather.daily.precipitation[i]}mm</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-10">
          <CropPlanner />
          
          <SeasonSwitcher 
            currentSeason={currentSeason} 
            onSeasonChange={setCurrentSeason} 
          />

          {/* GHID UNIVERSAL AGROPLAN */}
          <section className="bg-white rounded-[3rem] shadow-xl border border-green-100 overflow-hidden">
            <div className="bg-agro-gradient p-10 text-white">
              <h2 className="text-4xl font-extrabold mb-4">📘 Ghidul Succesului în Agricultură</h2>
              <p className="text-green-50 text-lg max-w-2xl opacity-90">
                O resursă completă pentru fermierul modern. Învață cum să transformi o bucată de pământ într-o recoltă bogată și sănătoasă.
              </p>
            </div>
            
            <div className="p-8 md:p-12 space-y-12">
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <span>👤</span> Pentru cine este acest ghid?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Acest ghid este dedicat <strong>fermierilor români</strong> care vor să obțină rezultate mai bune, indiferent dacă lucrează o mică grădină în spatele casei sau zeci de hectare de câmp. Este pentru cei care prețuiesc tradiția, dar vor să folosească tehnologia <strong>AgroPlan</strong> pentru a munci mai inteligent, nu mai greu.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                  <span>🚀</span> 5 Pași esențiali pentru o recoltă reușită
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { nr: '1', titlu: 'Cunoaște-ți pământul', text: 'Înainte de a planta orice, află ce tip de sol ai (lutos, nisipos, argilos). Un sol sănătos este fundația recoltei tale.' },
                    { nr: '2', titlu: 'Alege semințele potrivite', text: 'Folosește soiuri adaptate climei din zona ta. Semințele de calitate garantează o creștere uniformă.' },
                    { nr: '3', titlu: 'Planifică cu AgroPlan', text: 'Folosește modulul nostru de planificare pentru a ști exact când să uzi, când să fertilizezi și când să stropești.' },
                    { nr: '4', titlu: 'Monitorizează vremea zilnic', text: 'Natura este impredictibilă. Verifică prognoza din aplicație pentru a evita pierderile cauzate de îngheț sau furtuni.' },
                    { nr: '5', titlu: 'Recoltează la momentul optim', text: 'Nu te grăbi, dar nici nu lăsa fructele să treacă de coacere. Gustul și rezistența depind de acest moment.' }
                  ].map(pas => (
                    <div key={pas.nr} className="flex gap-4 p-5 bg-green-50/50 rounded-2xl border border-green-100">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                        {pas.nr}
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900">{pas.titlu}</h4>
                        <p className="text-sm text-gray-600 mt-1">{pas.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                  <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span>💡</span> Sfaturi utile din practică
                  </h3>
                  <ul className="space-y-3 text-sm text-blue-900/80">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Udați plantele dimineața devreme sau seara târziu pentru a evita evaporarea rapidă a apei.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Practicați "rotația culturilor" – nu plantați aceeași legumă în același loc doi ani la rând.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      Păstrați unelte curate pentru a nu răspândi bolile de la o plantă la alta.
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                  <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                    <span>❌</span> Greșeli de evitat
                  </h3>
                  <ul className="space-y-3 text-sm text-red-900/80">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      Nu folosiți prea mult îngrășământ; surplusul poate "arde" rădăcinile plantelor.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      Nu ignorați primele semne de boală (pete pe frunze). Acționați imediat!
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      Evitați plantarea prea deasă; plantele au nevoie de aer și lumină pentru a crește.
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                  <span>📅</span> Recomandări Sezoniere
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { s: 'Primăvara', t: 'Curățenia și semănatul.' },
                    { s: 'Vara', t: 'Irigarea și protecția solară.' },
                    { s: 'Toamna', t: 'Recoltarea și arătura.' },
                    { s: 'Iarna', t: 'Planificarea și odihna solului.' }
                  ].map(item => (
                    <div key={item.s} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <h4 className="font-bold text-green-700">{item.s}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.t}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-900 text-white p-8 rounded-[2rem] text-center">
                <h3 className="text-xl font-bold mb-2">Concluzie</h3>
                <p className="text-green-100/80 text-sm max-w-lg mx-auto italic">
                  "Agricultura nu este doar o muncă, este o artă susținută de știință. Cu răbdare și uneltele potrivite precum AgroPlan, pământul tău îți va răsplăti întotdeauna efortul."
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 sticky top-24">
          <SmartAdvisor />
          
          <div className="mt-8 bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <h4 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
              <span>⚠️</span> Alertă Agricolă
            </h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              {weather && weather.daily.windMax[0] > 20 
                ? `Atenție! Vânt puternic prognozat de ${Math.round(weather.daily.windMax[0])} km/h azi. Protejează culturile sensibile.` 
                : 'Condiții meteo stabile prognozate. Continuă lucrările planificate conform calendarului.'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
