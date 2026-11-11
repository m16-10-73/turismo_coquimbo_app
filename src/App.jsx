import React, { useState, useEffect } from 'react';

// Estructura territorial por Región -> Provincia -> Comunas y su Identificador Oficial
const REGIONES_CHILE = {
  'Región de Coquimbo': {
    codigo: 'IV',
    provincias: {
      Elqui: ['La Serena', 'Coquimbo', 'Vicuña', 'Paihuano', 'Andacollo', 'La Higuera'],
      Limarí: ['Ovalle', 'Monte Patria', 'Combarbalá', 'Punitaqui', 'Río Hurtado'],
      Choapa: ['Illapel', 'Los Vilos', 'Salamanca', 'Canela']
    }
  },
  'Región de Atacama': {
    codigo: 'III',
    provincias: {
      Copiapó: ['Copiapó', 'Caldera', 'Tierra Amarilla'],
      Chañaral: ['Chañaral', 'Diego de Almagro'],
      Huasco: ['Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco']
    }
  },
  'Región de Antofagasta': {
    codigo: 'II',
    provincias: {
      Antofagasta: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal'],
      'El Loa': ['Calama', 'Ollagüe', 'San Pedro de Atacama'],
      Tocopilla: ['Tocopilla', 'María Elena']
    }
  }
};

// Categorías oficiales ampliadas incluyendo los nuevos componentes geográficos y científicos
const CATEGORIAS_PATRIMONIALES = [
  'Todas',
  'Monumentos Históricos',
  'Plazas y Espacios Públicos',
  'Parques y reservas',
  'Humedales y Ecosistemas',
  'Ríos y Quebradas',
  'Cerros y Cumbres',
  'Astronomía y Ciencia',
  'Infraestructura Hídrica',
  'Playas y Borde Costero'
];

export default function App() {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Selector de Vista: 'publico' | 'admin'
  const [vista, setVista] = useState('publico');

  // Filtros territoriales globales
  const [regionSel, setRegionSel] = useState('Región de Coquimbo');
  const [provinciaSel, setProvinciaSel] = useState('Todas');
  const [comunaSel, setComunaSel] = useState('Todas');
  const [categoriaSel, setCategoriaSel] = useState('Todas');

  // Estado del Formulario de Ingreso Manual
  const [nuevoPunto, setNuevoPunto] = useState({
    nombre: '',
    direccion: '',
    provincia: 'Elqui',
    comuna: 'La Serena',
    categoria: 'Monumentos Históricos',
    descripcion: '',
    web: '',
    lat: '',
    lng: '',
    aprobado: true
  });

  useEffect(() => {
    fetch('/data/puntos.json')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar la base de datos de puntos.json');
        return res.json();
      })
      .then((data) => {
        setPuntos(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  const toggleAprobado = (id) => {
    setPuntos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, aprobado: !item.aprobado } : item
      )
    );
  };

  const eliminarPunto = (id) => {
    if (confirm('¿Estás seguro de eliminar este registro público?')) {
      setPuntos((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (!nuevoPunto.nombre || !nuevoPunto.descripcion) {
      alert('Por favor completa al menos el nombre y la descripción del hito.');
      return;
    }

    const itemCreado = {
      ...nuevoPunto,
      id: Date.now(),
      lat: nuevoPunto.lat ? parseFloat(nuevoPunto.lat) : null,
      lng: nuevoPunto.lng ? parseFloat(nuevoPunto.lng) : null
    };

    setPuntos([itemCreado, ...puntos]);
    
    setNuevoPunto({
      nombre: '',
      direccion: '',
      provincia: 'Elqui',
      comuna: 'La Serena',
      categoria: 'Monumentos Históricos',
      descripcion: '',
      web: '',
      lat: '',
      lng: '',
      aprobado: true
    });

    alert('¡Hito patrimonial registrado exitosamente!');
  };

  // Obtener datos territoriales de la región seleccionada
  const regionData = REGIONES_CHILE[regionSel] || { codigo: 'CL', provincias: {} };
  const estructuraProvincias = regionData.provincias;
  const provinciasDisponibles = Object.keys(estructuraProvincias);

  // Obtener comunas dinámicas según provincia elegida
  const comunasDisponibles = provinciaSel === 'Todas'
    ? Object.values(estructuraProvincias).flat()
    : estructuraProvincias[provinciaSel] || [];

  // Filtrado base territorial (Región, Provincia, Comuna) para calcular contadores dinámicos por botón
  const puntosBaseTerritorial = puntos.filter((item) => {
    const esAprobado = item.aprobado === true;
    
    const comunaPerteneceARegion = Object.values(estructuraProvincias).some((comunasArray) =>
      comunasArray.includes(item.comuna)
    );

    const coincideProvincia = provinciaSel === 'Todas' || item.provincia === provinciaSel;
    const coincideComuna = comunaSel === 'Todas' || item.comuna === comunaSel;

    return esAprobado && comunaPerteneceARegion && coincideProvincia && coincideComuna;
  });

  // Filtrado final vista pública con categoría
  const puntosPublicos = puntosBaseTerritorial.filter((item) => {
    return categoriaSel === 'Todas' || item.categoria === categoriaSel;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-sans bg-slate-50 min-h-screen">
      {/* BANNER INSTITUCIONAL DE ALTO IMPACTO (REGIÓN DESTACADA) */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl shadow-md p-6 mb-6 text-white border border-blue-900">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-900/80 border border-blue-700/60 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-blue-200 uppercase">
              <span>🇨🇱 Sistema Territorial de Chile</span>
            </div>

            {/* SELECTOR DE REGIÓN PROTAGONISTA */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-amber-400 text-slate-950 font-black text-sm px-3 py-1 rounded-lg shadow-sm">
                [{regionData.codigo}ª REGIÓN]
              </span>
              
              <div className="relative inline-block">
                <select
                  value={regionSel}
                  onChange={(e) => {
                    setRegionSel(e.target.value);
                    setProvinciaSel('Todas');
                    setComunaSel('Todas');
                  }}
                  className="appearance-none bg-white/10 hover:bg-white/15 text-white font-extrabold text-2xl md:text-3xl px-4 py-1.5 pr-10 rounded-xl border border-white/20 outline-none cursor-pointer transition-all shadow-inner"
                >
                  {Object.keys(REGIONES_CHILE).map((reg) => (
                    <option key={reg} value={reg} className="bg-slate-900 font-bold text-white">
                      {reg}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-400 font-bold">
                  ▼
                </div>
              </div>
            </div>

            <p className="text-blue-200 text-sm font-medium max-w-2xl">
              Portal institucional de bienes públicos, monumentos históricos, parques, humedales, ríos, cumbres y astronomía.
            </p>
          </div>

          <div className="flex bg-blue-900/60 p-1.5 rounded-xl border border-blue-800/80 text-xs font-bold shrink-0">
            <button
              onClick={() => setVista('publico')}
              className={`px-4 py-2.5 rounded-lg transition-all ${
                vista === 'publico' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-blue-200 hover:text-white'
              }`}
            >
              🏛️ Catastro Público ({puntosPublicos.length})
            </button>
            <button
              onClick={() => setVista('admin')}
              className={`px-4 py-2.5 rounded-lg transition-all ${
                vista === 'admin' ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'text-blue-200 hover:text-white'
              }`}
            >
              ⚙️ Gobernanza ({puntos.length})
            </button>
          </div>

        </div>
      </div>

      {/* VISTA PÚBLICA */}
      {vista === 'publico' && (
        <main>
          {/* Panel de Filtros Tripartito */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Seleccionar Provincia ({regionSel}):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setProvinciaSel('Todas'); setComunaSel('Todas'); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    provinciaSel === 'Todas'
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌐 Toda la Región
                </button>
                {provinciasDisponibles.map((prov) => (
                  <button
                    key={prov}
                    onClick={() => { setProvinciaSel(prov); setComunaSel('Todas'); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      provinciaSel === prov
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-3 border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                2. Filtrar por Comuna {provinciaSel !== 'Todas' && `(${provinciaSel})`}:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                <button
                  onClick={() => setComunaSel('Todas')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    comunaSel === 'Todas'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Todas las comunas
                </button>
                {comunasDisponibles.map((com) => (
                  <button
                    key={com}
                    onClick={() => setComunaSel(com)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      comunaSel === com
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {com}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. FILTRAR POR CATEGORÍA PATRIMONIAL / OBRA PÚBLICA (Con contador dinámico integrado) */}
            <div className="border-t pt-3 border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                3. Filtrar por Categoría Patrimonial / Obra Pública:
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_PATRIMONIALES.map((cat) => {
                  const count = cat === 'Todas'
                    ? puntosBaseTerritorial.length
                    : puntosBaseTerritorial.filter((item) => item.categoria === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoriaSel(cat)}
                      className={`w-36 h-12 px-2 py-1 rounded-lg text-xs font-semibold text-center flex flex-col items-center justify-center leading-tight transition-all ${
                        categoriaSel === cat
                          ? 'bg-blue-800 text-white shadow-sm font-bold ring-2 ring-amber-400'
                          : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{cat === 'Todas' ? '🏛️ Todos' : cat.split(' ')[0]}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          categoriaSel === cat ? 'bg-amber-400 text-slate-950' : 'bg-blue-200 text-blue-950'
                        }`}>
                          {count}
                        </span>
                      </div>
                      <span className="truncate w-full text-[10px] opacity-90">{cat === 'Todas' ? 'los hitos' : cat.split(' ').slice(1).join(' ') || cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Grid de Hitos */}
          {puntosPublicos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
              <p className="text-lg font-semibold mb-1">No hay hitos catastrados para esta selección en la {regionSel}.</p>
              <p className="text-xs text-slate-400">Puedes ingresar nuevos registros públicos desde el Panel de Gobernanza.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {puntosPublicos.map((item) => {
                let mapUrl = '';
                if (item.lat && item.lng) {
                  mapUrl = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
                } else {
                  const busqueda = [item.nombre, item.direccion, item.comuna, `${regionSel}, Chile`]
                    .filter(Boolean)
                    .join(', ');
                  mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busqueda)}`;
                }

                return (
                  <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{item.nombre}</h2>
                        <span className="text-[11px] bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-md border border-slate-200 shrink-0 ml-2">
                          {item.categoria}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-500 mb-3 space-y-0.5">
                        <p className="font-semibold text-slate-700">📍 {item.comuna} · <span className="text-slate-400">Provincia de {item.provincia}</span></p>
                        {item.direccion && (
                          <p className="text-slate-500 italic">🏛️ {item.direccion}</p>
                        )}
                      </div>

                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.descripcion}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-semibold">
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                        🗺️ Ver Mapa / Georreferencia
                      </a>
                      {item.web && (
                        <a href={item.web} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200">
                          🌐 Ficha Oficial
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* PANEL ADMIN */}
      {vista === 'admin' && (
        <main className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-1">📝 Ingreso de Hito Patrimonial / Obra Pública</h2>
            <p className="text-xs text-slate-500 mb-6">
              Catastra monumentos, iglesias, parques, humedales, ríos, cumbres y astronomía.
            </p>

            <form onSubmit={handleGuardarNuevo} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div className="md:col-span-2">
                <label className="block mb-1">Nombre del Hito o Bien Público *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Observatorio Cerro Tololo"
                  value={nuevoPunto.nombre}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, nombre: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Categoría Patrimonial *</label>
                <select
                  value={nuevoPunto.categoria}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, categoria: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                >
                  {CATEGORIAS_PATRIMONIALES.filter(c => c !== 'Todas').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block mb-1">Ubicación / Dirección / Referencia Geográfica</label>
                <input
                  type="text"
                  placeholder="Ej: Valle de Elqui, Ruta 41"
                  value={nuevoPunto.direccion}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, direccion: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Provincia *</label>
                <select
                  value={nuevoPunto.provincia}
                  onChange={(e) => {
                    const prov = e.target.value;
                    const primeraComuna = estructuraProvincias[prov] ? estructuraProvincias[prov][0] : '';
                    setNuevoPunto({ ...nuevoPunto, provincia: prov, comuna: primeraComuna });
                  }}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                >
                  {provinciasDisponibles.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Comuna *</label>
                <select
                  value={nuevoPunto.comuna}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, comuna: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                >
                  {(estructuraProvincias[nuevoPunto.provincia] || []).map((com) => (
                    <option key={com} value={com}>{com}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Enlace a Ficha Oficial / Decreto (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://monumentos.gob.cl/..."
                  value={nuevoPunto.web}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, web: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block mb-1">Reseña Histórica / Valor Patrimonial *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe la relevancia histórica, científica o técnica de la obra..."
                  value={nuevoPunto.descripcion}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, descripcion: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                ></textarea>
              </div>

              <div className="md:col-span-3 flex items-center justify-between border-t pt-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevoPunto.aprobado}
                    onChange={(e) => setNuevoPunto({ ...nuevoPunto, aprobado: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Visto Bueno Institucional (Publicar directamente)</span>
                </label>

                <button
                  type="submit"
                  className="bg-blue-950 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-900 transition-colors shadow-sm"
                >
                  ➕ Registrar Hito Público
                </button>
              </div>
            </form>
          </section>

          {/* Tabla Gobernanza */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-1">🛡️ Control de Gobernanza Patrimonial</h2>
            <p className="text-xs text-slate-500 mb-4">
              Validación y visto bueno oficial para la inclusión en el portal nacional.
            </p>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="p-3">Hito / Obra Pública</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Estado Visto Bueno</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {puntos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{item.nombre}</p>
                      {item.direccion && <p className="text-[11px] text-slate-400">{item.direccion}</p>}
                    </td>
                    <td className="p-3 text-slate-600">{item.comuna} ({item.provincia})</td>
                    <td className="p-3 text-slate-600">{item.categoria}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        item.aprobado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.aprobado ? '✓ Publicado' : '⏳ En Revisión'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => toggleAprobado(item.id)}
                        className="bg-slate-100 text-slate-700 px-3 py-1 rounded font-semibold hover:bg-slate-200"
                      >
                        {item.aprobado ? 'Revocar' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => eliminarPunto(item.id)}
                        className="bg-red-50 text-red-700 px-2.5 py-1 rounded hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      )}
    </div>
  );
}
