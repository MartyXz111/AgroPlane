
import React from 'react';
import { Season, SeasonInfo } from '../types';
import { SEASONS_DATA } from '../constants';

interface SeasonSwitcherProps {
  currentSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const SeasonSwitcher: React.FC<SeasonSwitcherProps> = ({ currentSeason, onSeasonChange }) => {
  return (
    <section id="seasons" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <span>📅</span> Sezoane Agricole
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEASONS_DATA.map((info) => (
          <button
            key={info.name}
            onClick={() => onSeasonChange(info.name)}
            className={`p-6 rounded-2xl text-left transition-all duration-300 transform hover:-translate-y-1 ${
              currentSeason === info.name
                ? 'bg-green-600 text-white shadow-xl scale-105 z-10'
                : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="text-3xl mb-3">{info.icon}</div>
            <h3 className="text-xl font-bold mb-2">{info.name}</h3>
            <p className={`text-sm ${currentSeason === info.name ? 'text-green-50' : 'text-gray-500'}`}>
              {info.summary.substring(0, 60)}...
            </p>
          </button>
        ))}
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100 flex flex-col md:flex-row gap-8 animate-fadeIn">
        <div className="md:w-1/3">
          <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4">
            {SEASONS_DATA.find(s => s.name === currentSeason)?.icon}
          </div>
          <h3 className="text-3xl font-extrabold text-green-900 mb-2">{currentSeason}</h3>
          <p className="text-gray-600 leading-relaxed">
            {SEASONS_DATA.find(s => s.name === currentSeason)?.summary}
          </p>
        </div>
        <div className="md:w-2/3">
          <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
            Activități Cheie
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEASONS_DATA.find(s => s.name === currentSeason)?.keyActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-300 transition-colors">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-sm font-medium text-gray-700">{activity}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-4">
            <button className="bg-green-100 text-green-700 px-6 py-2 rounded-full text-sm font-bold hover:bg-green-200 transition-colors">
              Descarcă Calendar PDF
            </button>
            <button className="bg-orange-100 text-orange-700 px-6 py-2 rounded-full text-sm font-bold hover:bg-orange-200 transition-colors">
              Vezi Alertă Meteo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonSwitcher;
