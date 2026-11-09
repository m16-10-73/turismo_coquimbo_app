import React, { useState, useMemo } from 'react';
import puntosData from '../public/data/puntos.json';
import { Search, MapPin, MessageCircle, Navigation, Filter } from 'lucide-react';

export default function App() {
  const [query, setQuery] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');

  const comunasDisponibles = useMemo(() => {
    if (!selectedProvincia) return [];
    return [...new Set(puntosData.filter(p => p.provincia === selectedProvincia).map(p => p.comuna))];
  }, [selectedProvincia]);

  const filteredPuntos = useMemo(() => {
    return puntosData.filter(p => {
      if (selectedProvincia && p.provincia !== selectedProvincia) return false;
      if (selectedComuna && p.comuna !== selectedComuna) return false;

      if (query.trim() !== '') {
        const q = query.toLowerCase();
        const matchNombre = p.nombre.toLowerCase().includes(q);
        const matchLocalidad = p.localidad.toLowerCase().includes(q);
        const matchCategory = p.categoria.toLowerCase().includes(q);
        const matchTags = p.tags.some(t => t.toLowerCase().includes(q));
        return matchNombre || matchLocalidad || matchCategory || matchTags;
      }
      return true;
    });
  }, [query, selectedProvincia, selectedComuna]);

  const abrirMapa = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10">
      <header className="bg-indigo-700 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Coquimbo Explora</h1>
            <p className="text-xs text-indigo-200">Elqui · Limarí · Choapa</p>
          </div>
          <span className="bg-indigo-600 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-500">
            {filteredPuntos.length} lugares
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="¿Qué buscas? (Ej: Pisco Elqui, cabañas, playa)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
            <Filter className="h-4 w-4" />
            <span>FILTRAR POR UBICACIÓN</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedProvincia}
              onChange={(e) => {
                setSelectedProvincia(e.target.value);
                setSelectedComuna('');
              }}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Todas las Provincias</option>
              <option value="Elqui">Elqui</option>
              <option value="Limarí">Limarí</option>
              <option value="Choapa">Choapa</option>
            </select>

            <select
              value={selectedComuna}
              onChange={(e) => setSelectedComuna(e.target.value)}
              disabled={!selectedProvincia}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">Todas las Comunas</option>
              {comunasDisponibles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredPuntos.map((punto) => (
            <div key={punto.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
              <div>
                <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-md mb-1">
                  {punto.categoria}
                </span>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{punto.nombre}</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{punto.descripcion}</p>

              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{punto.localidad}, {punto.comuna} ({punto.provincia})</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => abrirMapa(punto.coordenadas.lat, punto.coordenadas.lng)}
                  className="flex-1 flex items-center justify-center space-x-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Cómo llegar</span>
                </button>

                {punto.contacto.whatsapp && (
                  <a
                    href={`https://wa.me/${punto.contacto.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center space-x-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
