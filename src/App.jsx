import React, { useState, useEffect } from 'react';

// Estructura jerárquica de la Región de Coquimbo
const ESTRUCTURA_TERRITORIAL = {
  Elqui: ['La Serena', 'Coquimbo', 'Vicuña', 'Paihuano', 'Andacollo', 'La Higuera'],
  Limarí: ['Ovalle', 'Monte Patria', 'Combarbalá', 'Punitaqui', 'Río Hurtado'],
  Choapa: ['Illapel', 'Los Vilos', 'Salamanca', 'Canela']
};

const CATEGORIAS_DISPONIBLES = [
  'Todas',
  'Hospedaje',
  'Parques y Naturaleza',
  'Patrimonio',
  'Deportes y Playas',
  'Infraestructura Hídrica'
];

export default function App() {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Selector de Vista: 'publico' | 'admin'
  const [vista, setVista] = useState('publico');

  // Filtros vista pública
  const [provinciaSel, setProvinciaSel] = useState('Todas');
  const [comunaSel, setComunaSel] = useState('Todas');
  const [categoriaSel, setCategoriaSel] = useState('Todas');

  // Estado del Formulario de Ingreso Manual
  const [nuevoPunto, setNuevoPunto] = useState({
    nombre: '',
    direccion: '',
    provincia: 'Elqui',
    comuna: 'La Serena',
    categoria: 'Hospedaje',
    descripcion: '',
    telefono: '',
    whatsapp: '',
    email: '',
    web: '',
    reservaUrl: '',
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
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      setPuntos((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleGuardarNuevo = (e) => {
    e.preventDefault();
    if (!nuevoPunto.nombre || !nuevoPunto.descripcion) {
      alert('Por favor completa al menos el nombre y la descripción.');
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
      categoria: 'Hospedaje',
      descripcion: '',
      telefono: '',
      whatsapp: '',
      email: '',
      web: '',
      reservaUrl: '',
      lat: '',
      lng: '',
      aprobado: true
    });

    alert('¡Prestador ingresado exitosamente!');
  };

  // Filtrado vista pública (Provincia + Comuna + Categoria + Visto Bueno)
  const puntosPublicos = puntos.filter((item) => {
    const esAprobado = item.aprobado === true;
    const coincideProvincia = provinciaSel === 'Todas' || item.provincia === provinciaSel;
    const coincideComuna = comunaSel === 'Todas' || item.comuna === comunaSel;
    const coincideCategoria = categoriaSel === 'Todas' || item.categoria === categoriaSel;
    return esAprobado && coincideProvincia && coincideComuna && coincideCategoria;
  });

  const comunasDisponibles = provinciaSel === 'Todas'
    ? Object.values(ESTRUCTURA_TERRITORIAL).flat()
    : ESTRUCTURA_TERRITORIAL[provinciaSel] || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 font-sans bg-slate-50 min-h-screen">
      {/* Encabezado */}
      <header className="mb-6 border-b pb-4 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Turismo Coquimbo</h1>
          <p className="text-slate-500 text-sm font-medium mt-0.5">
            Plataforma de servicios, vectores turísticos y gestión territorial
          </p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setVista('publico')}
            className={`px-4 py-2 rounded-lg transition-all ${
              vista === 'publico' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌐 Vista Pública ({puntosPublicos.length})
          </button>
          <button
            onClick={() => setVista('admin')}
            className={`px-4 py-2 rounded-lg transition-all ${
              vista === 'admin' ? 'bg-blue-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ Panel Control Admin ({puntos.length})
          </button>
        </div>
      </header>

      {/* VISTA PÚBLICA */}
      {vista === 'publico' && (
        <main>
          {/* Panel de Filtros Tripartito (Provincia > Comuna > Rubro) */}
          <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
            {/* Fila 1: Provincias */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Seleccionar Provincia:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Todas', 'Elqui', 'Limarí', 'Choapa'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => { setProvinciaSel(prov); setComunaSel('Todas'); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      provinciaSel === prov
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {prov === 'Todas' ? '🌐 Toda la Región' : prov}
                  </button>
                ))}
              </div>
            </div>

            {/* Fila 2: Comunas Dinámicas */}
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

            {/* Fila 3: Filtro por Rubro / Categoría */}
            <div className="border-t pt-3 border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                3. Filtrar por Rubro o Categoría:
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS_DISPONIBLES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaSel(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      categoriaSel === cat
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {cat === 'Todas' ? '🏷️ Todos los rubros' : cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Grid Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {puntosPublicos.map((item) => {
              let mapUrl = '';
              if (item.lat && item.lng) {
                mapUrl = `https://www.google.com/maps?q=${item.lat},${item.lng}`;
              } else {
                const busqueda = [item.nombre, item.direccion, item.comuna, 'Coquimbo, Chile']
                  .filter(Boolean)
                  .join(', ');
                mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busqueda)}`;
              }

              return (
                <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">{item.nombre}</h2>
                      <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-1 rounded-md border border-amber-200 shrink-0 ml-2">
                        {item.categoria}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-500 mb-3 space-y-0.5">
                      <p className="font-semibold text-slate-700">📍 {item.comuna} · <span className="text-slate-400">Provincia de {item.provincia}</span></p>
                      {item.direccion && (
                        <p className="text-slate-500 italic">🏠 {item.direccion}</p>
                      )}
                    </div>

                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.descripcion}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-semibold">
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                      📍 Cómo llegar
                    </a>
                    {item.whatsapp && (
                      <a href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100">
                        💬 WhatsApp
                      </a>
                    )}
                    {item.telefono && (
                      <a href={`tel:${item.telefono}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200">
                        📞 Llamar
                      </a>
                    )}
                    {item.web && (
                      <a href={item.web} target="_blank" rel="noopener noreferrer" className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200">
                        🌐 Web
                      </a>
                    )}
                    {item.reservaUrl && (
                      <a href={item.reservaUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 ml-auto">
                        📅 Reservar
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      )}

      {/* VISTA PANEL DE ADMINISTRACIÓN */}
      {vista === 'admin' && (
        <main className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-1">📝 Ingreso Manual de Prestador</h2>
            <p className="text-xs text-slate-500 mb-6">
              Registra prestadores sin presencia digital o recolectados en terreno.
            </p>

            <form onSubmit={handleGuardarNuevo} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700">
              <div className="md:col-span-2">
                <label className="block mb-1">Nombre del Prestador / Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Embalse Puclaro"
                  value={nuevoPunto.nombre}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, nombre: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Rubro / Categoría *</label>
                <select
                  value={nuevoPunto.categoria}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, categoria: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                >
                  {CATEGORIAS_DISPONIBLES.filter(c => c !== 'Todas').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block mb-1">Dirección / Calle y Número / Referencia Geográfica</label>
                <input
                  type="text"
                  placeholder="Ej: Ruta D-41 Km 50"
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
                    const primeraComuna = ESTRUCTURA_TERRITORIAL[prov][0];
                    setNuevoPunto({ ...nuevoPunto, provincia: prov, comuna: primeraComuna });
                  }}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                >
                  {Object.keys(ESTRUCTURA_TERRITORIAL).map((prov) => (
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
                  {ESTRUCTURA_TERRITORIAL[nuevoPunto.provincia].map((com) => (
                    <option key={com} value={com}>{com}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Teléfono Fijo / Móvil</label>
                <input
                  type="text"
                  placeholder="+569..."
                  value={nuevoPunto.telefono}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, telefono: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">WhatsApp (sin el signo +)</label>
                <input
                  type="text"
                  placeholder="56912345678"
                  value={nuevoPunto.whatsapp}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, whatsapp: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Sitio Web (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={nuevoPunto.web}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, web: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Link de Reserva (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={nuevoPunto.reservaUrl}
                  onChange={(e) => setNuevoPunto({ ...nuevoPunto, reservaUrl: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-slate-50 border-slate-300 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block mb-1">Descripción del Servicio *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Describe la oferta, productos o características principales del prestador..."
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
                  <span>Otorga Visto Bueno inmediato (Publicar directamente)</span>
                </label>

                <button
                  type="submit"
                  className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-sm"
                >
                  ➕ Registrar Prestador
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-1">🛡️ Control de Gobernanza y Visto Bueno</h2>
            <p className="text-xs text-slate-500 mb-4">
              Administra la visibilidad pública de cada ficha registrada en el portal regional.
            </p>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase">
                  <th className="p-3">Prestador / Dirección</th>
                  <th className="p-3">Ubicación</th>
                  <th className="p-3">Rubro</th>
                  <th className="p-3">Estado Gobernanza</th>
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
                        {item.aprobado ? '✓ Aprobado (Público)' : '⏳ Pendiente (Oculto)'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => toggleAprobado(item.id)}
                        className={`px-3 py-1 rounded font-semibold transition-colors ${
                          item.aprobado
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {item.aprolbado ? 'Revocar' : 'Dar Visto Bueno'}
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
