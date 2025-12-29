import React, { useState } from 'react';
import axios from 'axios';

const EditarSignoVital = ({ signo, onClose, onActualizado }) => {
  const [tipo, setTipo] = useState(signo.tipo);
  const [valor, setValor] = useState(signo.valor);
  const [cargando, setCargando] = useState(false);

  // Los mismos 8 tipos que están en RegistrarPaciente.js
  const tiposSignosVitales = [
    'presion_arterial',
    'peso', 
    'glucosa',
    'temperatura',
    'saturacion_oxigeno',
    'frecuencia_cardiaca',
    'frecuencia_respiratoria',
    'altura'
  ];

  // Mapear los valores técnicos a etiquetas legibles
  const etiquetasSignos = {
    'presion_arterial': 'Presión Arterial (PA)',
    'peso': 'Peso',
    'glucosa': 'Glucosa (Nivel de Azúcar en Sangre)',
    'temperatura': 'Temperatura corporal',
    'saturacion_oxigeno': 'Saturación de Oxígeno (SpO2)',
    'frecuencia_cardiaca': 'Pulso / Frecuencia Cardíaca (FC)',
    'frecuencia_respiratoria': 'Frecuencia Respiratoria (FR)',
    'altura': 'Altura / Estatura'
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!tipo || !valor) {
      alert('Por favor completa todos los campos');
      return;
    }

    setCargando(true);

    try {
      await axios.put(`https://tesis-backend-170896327116.us-central1.run.app/api/signos-vitales/${signo._id}`, {
        tipo,
        valor
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Signo vital actualizado exitosamente');
      onActualizado();
      onClose();
    } catch (err) {
      console.error('Error al actualizar signo vital:', err);
      alert('Error al actualizar el signo vital. Intenta nuevamente.');
    }

    setCargando(false);
  };

  const manejarEliminar = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este signo vital?')) {
      return;
    }

    setCargando(true);

    try {
      await axios.delete(`https://tesis-backend-170896327116.us-central1.run.app/api/signos-vitales/${signo._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Signo vital eliminado exitosamente');
      onActualizado();
      onClose();
    } catch (err) {
      console.error('Error al eliminar signo vital:', err);
      alert('Error al eliminar el signo vital. Intenta nuevamente.');
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
    zIndex: 1000
  };

  const formStyle = {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '90%'
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
    marginRight: '1rem',
    fontSize: '1rem',
    transition: 'background 0.2s'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: '#d32f2f'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#888'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '1.5rem' }}>
          📊 Editar Signo Vital
        </h2>

        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          background: '#f0f8ff', 
          borderRadius: '8px',
          border: '2px solid #2196f3'
        }}>
          <strong>Signo Vital Actual:</strong><br />
          <span style={{ color: '#666' }}>
            {etiquetasSignos[signo.tipo] || signo.tipo}: {signo.valor}
          </span><br />
          <span style={{ fontSize: '0.9rem', color: '#888' }}>
            Registrado: {new Date(signo.fecha_registro).toLocaleString('es-ES')}
          </span>
        </div>

        <form onSubmit={manejarSubmit}>
          {/* Tipo de signo vital */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Tipo de Signo Vital *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Selecciona un tipo</option>
              {tiposSignosVitales.map(tipoOption => (
                <option key={tipoOption} value={tipoOption}>
                  {etiquetasSignos[tipoOption]}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Valor *
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ej: 120/80, 36.5°C, 72 bpm..."
              style={inputStyle}
              required
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={cargando}
              style={{
                ...buttonStyle,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer'
              }}
            >
              {cargando ? 'Actualizando...' : '✅ Actualizar'}
            </button>
            <button
              type="button"
              onClick={manejarEliminar}
              disabled={cargando}
              style={{
                ...deleteButtonStyle,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer'
              }}
            >
              {cargando ? 'Eliminando...' : '🗑️ Eliminar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              style={cancelButtonStyle}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarSignoVital;
