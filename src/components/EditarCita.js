import React, { useState } from 'react';
import axios from 'axios';

const EditarCita = ({ cita, onClose, onActualizado }) => {
  const [titulo, setTitulo] = useState(cita.titulo);
  const [mensaje, setMensaje] = useState(cita.mensaje || '');
  const [fechaCita, setFechaCita] = useState(
    new Date(cita.fecha_cita).toISOString().split('T')[0]
  );
  const [horaCita, setHoraCita] = useState(
    new Date(cita.fecha_cita).toTimeString().slice(0, 5)
  );
  const [estado, setEstado] = useState(cita.estado);
  const [cargando, setCargando] = useState(false);

  const estadosCita = [
    { value: 'pendiente', label: 'Pendiente', color: '#ff9800' },
    { value: 'confirmada', label: 'Confirmada', color: '#4caf50' },
    { value: 'cancelada', label: 'Cancelada', color: '#f44336' },
    { value: 'completada', label: 'Completada', color: '#2196f3' }
  ];

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!titulo || !fechaCita || !horaCita) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setCargando(true);

    try {
      const fechaHoraCompleta = new Date(`${fechaCita}T${horaCita}`);
      
      await axios.put(`https://tesis-backend-170896327116.us-central1.run.app/api/notificaciones/${cita._id}`, {
        titulo,
        mensaje,
        fecha_cita: fechaHoraCompleta.toISOString(),
        estado
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Cita actualizada exitosamente');
      onActualizado();
      onClose();
    } catch (err) {
      console.error('Error al actualizar cita:', err);
      alert('Error al actualizar la cita. Intenta nuevamente.');
    }

    setCargando(false);
  };

  const manejarEliminar = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      return;
    }

    setCargando(true);

    try {
      await axios.delete(`https://tesis-backend-170896327116.us-central1.run.app/api/notificaciones/${cita._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Cita eliminada exitosamente');
      onActualizado();
      onClose();
    } catch (err) {
      console.error('Error al eliminar cita:', err);
      alert('Error al eliminar la cita. Intenta nuevamente.');
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
    maxWidth: '600px',
    width: '90%',
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
          📅 Editar Cita
        </h2>

        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>Paciente:</strong> {cita.paciente_id?.nombre_completo || 'No disponible'}
          <br />
          <strong>Creada:</strong> {new Date(cita.fecha_creacion || cita.createdAt).toLocaleString('es-ES')}
        </div>

        <form onSubmit={manejarSubmit}>
          {/* Estado de la cita */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Estado de la Cita *
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              style={inputStyle}
              required
            >
              {estadosCita.map(est => (
                <option key={est.value} value={est.value}>
                  {est.label}
                </option>
              ))}
            </select>
          </div>

          {/* Título de la cita */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Título de la Cita *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Consulta de seguimiento, Revisión de resultados..."
              style={inputStyle}
              required
            />
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Fecha de la Cita *
            </label>
            <input
              type="date"
              value={fechaCita}
              onChange={(e) => setFechaCita(e.target.value)}
              style={inputStyle}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Hora */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Hora de la Cita *
            </label>
            <input
              type="time"
              value={horaCita}
              onChange={(e) => setHoraCita(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* Mensaje adicional */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Mensaje Adicional (Opcional)
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Instrucciones especiales, preparación para la cita, etc..."
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              rows={3}
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

export default EditarCita;
