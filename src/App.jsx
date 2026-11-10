import React, { useState, useEffect } from 'react';

// Estructura jerárquica de la Región de Coquimbo
const ESTRUCTURA_TERRITORIAL = {
  Elqui: ['La Serena', 'Coquimbo', 'Vicuña', 'Paihuano', 'Andacollo', 'La Higuera'],
  Limarí: ['Ovalle', 'Monte Patria', 'Combarbalá', 'Punitaqui', 'Río Hurtado'],
  Choapa: ['Illapel', 'Los Vilos', 'Salamanca', 'Canela']
};

export default function App() {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de los filtros
  const [provinciaSel, setProvinciaSel] = useState('Todas');
  const [comunaSel, setComunaSel] = useState('Todas');

  useEffect(() => {
    fetch('/data/puntos.json')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar la base de datos de puntos.json');
        return res.json();
      })
      .then((data) => {
        // Solo cargamos los registros que tengan Visto Bueno (aprobado === true)
        const aprobados = data.filter((item) => item.aprobado === true);
        setPuntos(aprobados);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  // Manejador de cambio de provincia
  const handleProvinciaChange = (provincia) => {
    setProvinciaSel(provincia);
    setComunaSel('Todas'); // Resetea la comuna al cambiar de provincia
  };

  // Filtrado dinámico de datos
  const puntosFiltrados = puntos.filter((item) => {
    const coincideProvincia = provinciaSel === 'Todas' || item.provincia === provinciaSel;
    const coincideComuna = comunaSel === 'Todas' || item.comuna === comunaSel;
    return coincideProvincia && coincideComuna;
  });

  // Lista de comunas disponibles según la provincia activa
  const comunasDisponibles = provinciaSel === 'Todas'
    ? Object.values(ESTRUCTURA_TERRITORIAL).flat()
    : ESTRUCTURA_TERRITORIAL[provinciaSel] || [];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 font-sans bg-slate-50 min-h-screen">
      {/* Encabezado */}
      <header className="mb-6 border-b pb-4 border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Turismo Coquimbo</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Plataforma de servicios, vectores turísticos y patrimonio regional
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            Región de Coquimbo
          </span>
        </div>
      </header>

      {/* Panel de Filtros con Píldoras Visuales */}
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
                onClick={() => handleProvinciaChange(prov)}
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
        <div>
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
      </section>

      {/* Estado de carga o error */}
      {cargando && <p className="text-slate-500 text-center py-8">Cargando la red de datos turísticos...</p>}
      {error && <p className="text-red-500 text-center py-8">Error: {error}</p>}

      {/* Contador de resultados */}
      {!cargando && !error && (
        <div className="mb-4 text-xs font-semibold text-slate-500 flex justify-between items-center">
          <span>Mostrando {puntosFiltrados.length} prestadores validados</span>
          {(provinciaSel !== 'Todas' || comunaSel !== 'Todas') && (
            <button
              onClick={() => { setProvinciaSel('Todas'); setComunaSel('Todas'); }}
              className="text-blue-600 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid de Tarjetas de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!cargando && !error && puntosFiltrados.map((item) => {
          const mapUrl = item.lat && item.lng 
            ? `https://www.google.com/maps?q=${item.lat},${item.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.nombre + ' ' + item.comuna)}`;

          return (
            <article key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{item.nombre}</h2>
                  <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md border border-blue-100">
                    {item.categoria}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  📍 {item.comuna} · <span className="text-slate-400">Provincia de {item.provincia}</span>
                </p>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.descripcion}</p>
              </div>

              {/* Botones de interacción comercial */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs font-semibold">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  📍 Cómo llegar
                </a>

                {item.whatsapp && (
                  <a
                    href={`https://wa.me/${item.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    💬 WhatsApp
                  </a>
                )}

                {item.telefono && (
                  <a
                    href={`tel:${item.telefono}`}
                    className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    📞 Llamar
                  </a>
                )}

                {item.web && (
                  <a
                    href={item.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    🌐 Web
                  </a>
                )}

                {item.reservaUrl && (
                  <a
                    href={item.reservaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
                  >
                    📅 Reservar
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
