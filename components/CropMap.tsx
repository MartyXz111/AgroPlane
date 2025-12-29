
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { UserCrop } from '../types';

interface CropMapProps {
  crops: UserCrop[];
  initialFocusId?: string | null;
}

const CropMap: React.FC<CropMapProps> = ({ crops, initialFocusId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: false // Custom placement for zoom
    }).setView([45.9432, 24.9668], 6); // Center of Romania

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(leafletMap.current);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

    markersLayer.current = L.layerGroup().addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!markersLayer.current || !leafletMap.current) return;

    markersLayer.current.clearLayers();

    const cropsWithLocation = crops.filter(c => c.lat !== undefined && c.lng !== undefined);

    if (cropsWithLocation.length > 0) {
      const bounds: L.LatLngTuple[] = [];

      cropsWithLocation.forEach(crop => {
        const marker = L.marker([crop.lat!, crop.lng!], {
          icon: L.divIcon({
            html: `<div class="bg-green-600 w-10 h-10 rounded-2xl border-2 border-white shadow-xl flex items-center justify-center text-xl transform rotate-45 transition-transform hover:scale-110"><div class="-rotate-45">🌱</div></div>`,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        });

        const tasksCount = crop.tasks.filter(t => !t.completed).length;

        marker.bindPopup(`
          <div class="p-4 min-w-[200px]">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">🌿</span>
              <div>
                <h4 class="font-extrabold text-green-800 text-sm m-0">${crop.name}</h4>
                <p class="text-[10px] text-gray-500 m-0">${crop.variety}</p>
              </div>
            </div>
            <div class="space-y-2 mt-3 pt-2 border-t border-gray-100">
              <div class="flex justify-between text-[10px]">
                <span class="text-gray-400 font-bold uppercase">Status</span>
                <span class="text-green-600 font-extrabold">ACTIVĂ</span>
              </div>
              <div class="flex justify-between text-[10px]">
                <span class="text-gray-400 font-bold uppercase">Sarcini Rămase</span>
                <span class="bg-amber-100 text-amber-700 px-1.5 rounded-full font-bold">${tasksCount}</span>
              </div>
            </div>
          </div>
        `, {
          className: 'agro-popup'
        });
        
        marker.addTo(markersLayer.current!);
        bounds.push([crop.lat!, crop.lng!]);

        // Auto open popup if focused
        if (initialFocusId === crop.id) {
          leafletMap.current?.setView([crop.lat!, crop.lng!], 14);
          setTimeout(() => marker.openPopup(), 400);
        }
      });

      // If no specific focus, fit all bounds
      if (!initialFocusId && bounds.length > 0) {
        leafletMap.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
      }
    }
  }, [crops, initialFocusId]);

  return (
    <div className="relative w-full h-[600px] rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl bg-white animate-fadeIn group">
      <div ref={mapRef} className="w-full h-full z-0" />
      
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 z-[10] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-gray-700">Explorare Teren Live</span>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-[10]">
        <div className="bg-green-900/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-green-800 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">Total Culturi</span>
            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {crops.filter(c => c.lat).length}
            </span>
          </div>
          <p className="text-[10px] text-green-200 opacity-80 uppercase tracking-widest font-bold">Monitorizate prin satelit</p>
        </div>
      </div>
    </div>
  );
};

export default CropMap;
