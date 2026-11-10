import React, { useState, useEffect } from 'react';

export default function App() {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/puntos.json')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar puntos.json');
        return res.json();
      })
      .then((data) => {
        setPuntos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setCargando(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#1e3a8a' }}>Turismo Coquimbo</h1>
      {cargando && <p>Cargando puntos turísticos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!cargando && !error && puntos.map((item) => (
        <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{item.nombre}</h2>
          <p style={{ margin: '0 0 4px 0', color: '#475569', fontWeight: 'bold' }}>{item.comuna} · {item.categoria}</p>
          <p style={{ margin: '0', color: '#64748b' }}>{item.descripcion}</p>
        </div>
      ))}
    </div>
  );
}
