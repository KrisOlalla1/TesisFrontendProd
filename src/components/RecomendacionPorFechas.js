import React, { useState, useEffect } from 'react';
import api from '../api/client';

const RecomendacionPorFechas = ({ paciente, onClose }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [recomendacion, setRecomendacion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [signosEncontrados, setSignosEncontrados] = useState([]);
  const [estadoLM, setEstadoLM] = useState(null);

  // Warm-up automático al montar el componente para "despertar" el modelo en el servidor
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/llm/estado');
        if (!mounted) return;
        setEstadoLM(res.data);
      } catch {
        // Silencioso: si falla, no bloquea la UI
      }
    })();
    return () => { mounted = false; };
  }, []);

  const verificarEstadoLM = async () => {
    try {
  const res = await api.get('/llm/estado');
      setEstadoLM(res.data);
      
      if (res.data.lm_studio_disponible) {
        alert(`✅ LM Studio conectado!\n🤖 Modelo cargado: ${res.data.modelo_cargado || 'Detectando...'}`);
      } else {
        alert(`❌ LM Studio no disponible\n${res.data.mensaje}`);
      }
    } catch (err) {
      console.error('Error al verificar LM Studio:', err);
      setEstadoLM({ lm_studio_disponible: false, mensaje: 'Error de conexión' });
      alert('❌ Error al conectar con LM Studio. Verifica que esté ejecutándose en puerto 1234.');
    }
  };

  const obtenerRecomendacionPorFechas = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(fechaFin) < new Date(fechaInicio)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setCargando(true);
    setRecomendacion('');

    try {
      // Obtener signos vitales del paciente
      const resSignos = await api.get(`/signos-vitales/${paciente._id}`);

      const todosLosSignos = resSignos.data.data;

      // Filtrar por fechas (incluir ambos extremos del rango)
      const signosFiltrados = todosLosSignos.filter(signo => {
        const fechaSigno = new Date(signo.fecha_registro);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        // Normalizar fechas para comparación (solo fecha, sin hora)
        const fechaSignoStr = fechaSigno.toISOString().split('T')[0];
        const inicioStr = inicio.toISOString().split('T')[0];
        const finStr = fin.toISOString().split('T')[0];
        
        console.log('Comparando:', { fechaSignoStr, inicioStr, finStr });
        
        return fechaSignoStr >= inicioStr && fechaSignoStr <= finStr;
      });

      console.log('Signos filtrados por fecha:', signosFiltrados);

      setSignosEncontrados(signosFiltrados);

      if (signosFiltrados.length === 0) {
        setRecomendacion('No se encontraron signos vitales en el período seleccionado.');
        setCargando(false);
        return;
      }

      // Agrupar por tipo y compactar: últimas lecturas + estadísticos básicos
      const signosPorTipo = signosFiltrados.reduce((acc, signo) => {
        if (!acc[signo.tipo]) acc[signo.tipo] = [];
        acc[signo.tipo].push({
          valor: signo.valor,
          fecha: new Date(signo.fecha_registro)
        });
        return acc;
      }, {});

      const compactarValor = (tipo, arr) => {
        // Ordenar por fecha ascendente
        const data = [...arr].sort((a, b) => a.fecha - b.fecha);
        const ult = data[data.length - 1];
        // Intentar números para estadísticos (ignorando presión arterial tipo 120/80)
        const nums = data
          .map(x => (Number.isFinite(parseFloat(x.valor)) && x.valor.toString().indexOf('/') === -1 ? parseFloat(x.valor) : null))
          .filter(v => v !== null);
        const n = data.length;
        const ultTxt = `${ult?.valor} (${ult?.fecha.toLocaleDateString('es-ES')})`;
        if (nums.length >= 2) {
          const min = Math.min(...nums);
          const max = Math.max(...nums);
          const prom = nums.reduce((s, v) => s + v, 0) / nums.length;
          return `${tipo}: n=${n}, últ=${ultTxt}, min=${min.toFixed(1)}, max=${max.toFixed(1)}, prom=${prom.toFixed(1)}`;
        }
        return `${tipo}: n=${n}, últ=${ultTxt}`;
      };

      const resumenCompacto = Object.entries(signosPorTipo)
        .map(([tipo, valores]) => compactarValor(tipo, valores))
        .join('\n');

    const prompt = `Paciente: ${paciente.nombre_completo}\nRango: ${fechaInicio} a ${fechaFin}\nTotal de mediciones: ${signosFiltrados.length}\n\nResumen por signo (compacto):\n${resumenCompacto}`;

    const debugFlag = (typeof window !== 'undefined' && window.localStorage && localStorage.getItem('DEBUG_LLM') === '1') ? '&debug=1' : '';
    const recomendacionRes = await api.post(`/llm/recomendacion?fast=1${debugFlag}`, { prompt });

  // Si viene depuración, mostrar al final para soporte (no visible para paciente)
  const debugInfo = recomendacionRes.data?._debug ? `\n\n---\n(debug) stats: ${JSON.stringify(recomendacionRes.data._debug.stats)}\n(debug) abns: ${JSON.stringify(recomendacionRes.data._debug.abns)}` : '';
  setRecomendacion(`${recomendacionRes.data.recomendacion}${debugInfo}`);
    } catch (err) {
      console.error('Error al obtener recomendación:', err);
      
      let mensajeError = 'Error al obtener la recomendación. Por favor intenta nuevamente.';
      
      if (err.response?.status === 503) {
        mensajeError = '🔌 LM Studio no está disponible. Verifica que esté ejecutándose y que tengas un modelo cargado.';
      } else if (err.response?.status === 404) {
        mensajeError = '🤖 No hay ningún modelo cargado en LM Studio. Por favor carga un modelo e intenta nuevamente.';
      } else if (err.response?.data?.mensaje) {
        mensajeError = `⚠️ ${err.response.data.mensaje}`;
      }
      
      setRecomendacion(mensajeError);
    }

    setCargando(false);
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const formStyle = {
    background: '#fff',
    padding: window.innerWidth <= 768 ? '1rem' : '2rem',
    borderRadius: window.innerWidth <= 768 ? '8px' : '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '1rem'
  };

  const buttonStyle = {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.8rem 1.5rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'background 0.2s'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#888'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '1.5rem' }}>
          📊 Recomendación por Período
        </h2>

        {/* Estado de LM Studio */}
        {estadoLM && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.8rem', 
            borderRadius: '6px',
            background: estadoLM.lm_studio_disponible ? '#e8f5e8' : '#ffe8e8',
            border: `1px solid ${estadoLM.lm_studio_disponible ? '#4caf50' : '#f44336'}`,
            fontSize: '0.9rem'
          }}>
            <strong>
              {estadoLM.lm_studio_disponible ? '✅' : '❌'} LM Studio: 
            </strong>
            {estadoLM.lm_studio_disponible ? (
              <span style={{ color: '#2e7d32' }}>
                Conectado {estadoLM.modelo_cargado ? `(${estadoLM.modelo_cargado})` : ''}
              </span>
            ) : (
              <span style={{ color: '#c62828' }}>
                {estadoLM.mensaje || 'No disponible'}
              </span>
            )}
          </div>
        )}

        <div style={{ 
          padding: '1rem', 
          background: '#e3f2fd', 
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #2196f3'
        }}>
          <strong>📋 Paciente:</strong> {paciente.nombre_completo}
          <br />
          <span style={{ color: '#666' }}>
            Cédula: {paciente.cedula} | Correo: {paciente.correo}
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Fecha de Inicio *
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={inputStyle}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Fecha de Fin *
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={inputStyle}
            max={new Date().toISOString().split('T')[0]}
            min={fechaInicio}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={obtenerRecomendacionPorFechas}
            disabled={cargando || !fechaInicio || !fechaFin}
            style={{
              ...buttonStyle,
              opacity: (cargando || !fechaInicio || !fechaFin) ? 0.7 : 1,
              cursor: (cargando || !fechaInicio || !fechaFin) ? 'not-allowed' : 'pointer'
            }}
          >
            {cargando ? 'Analizando...' : '🩺 Obtener Recomendación'}
          </button>

          <button
            onClick={onClose}
            disabled={cargando}
            style={cancelButtonStyle}
          >
            Cerrar
          </button>
        </div>

        {signosEncontrados.length > 0 && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>
              📊 Signos Vitales Encontrados ({signosEncontrados.length} mediciones)
            </h4>
            <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.9rem' }}>
              {signosEncontrados.map((signo, idx) => (
                <div key={idx} style={{ marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                  <strong>{signo.tipo}:</strong> {signo.valor} 
                  <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                    ({new Date(signo.fecha_registro).toLocaleDateString('es-ES')})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cargando && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            background: '#f0f8ff',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>⏳ Analizando signos vitales...</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Esto puede tomar unos momentos
            </div>
          </div>
        )}

        {recomendacion && (
          <div style={{ 
            marginTop: '1rem', 
            background: recomendacion.includes('❌') || recomendacion.includes('🔌') || recomendacion.includes('🤖') ? '#ffe8e8' : '#e8f5e8',
            padding: '1.5rem', 
            borderRadius: '8px',
            border: `2px solid ${recomendacion.includes('❌') || recomendacion.includes('🔌') || recomendacion.includes('🤖') ? '#f44336' : '#4caf50'}`
          }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              color: recomendacion.includes('❌') || recomendacion.includes('🔌') || recomendacion.includes('🤖') ? '#c62828' : '#2e7d32'
            }}>
              {recomendacion.includes('❌') || recomendacion.includes('🔌') || recomendacion.includes('🤖') ? '⚠️ Error' : '🩺 Recomendación Médica'}
            </h4>
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.6',
              fontSize: '0.95rem'
            }}>
              {recomendacion}
            </div>
          </div>
        )}

        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
          * Campos obligatorios
        </div>
      </div>
    </div>
  );
};

export default RecomendacionPorFechas;
