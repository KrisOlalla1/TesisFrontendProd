import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Sanitización simple para texto, evita scripts e inyecciones básicas
const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')      // elimina < y >
    .replace(/['"`]/g, '')     // elimina comillas simples, dobles y backticks
    .trim();
};

// Validar cédula ecuatoriana básica (10 dígitos numéricos)
const validarCedula = (cedula) => {
  const re = /^\d{10}$/;
  return re.test(cedula);
};

// Validar formato hora HH:mm (24h)
const validarHora = (hora) => {
  const re = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return re.test(hora);
};

// Validar fecha no pasada
const validarFechaNoPasada = (fecha) => {
  if (!fecha) return false;
  const hoy = new Date();
  const fechaInput = new Date(fecha + 'T00:00');
  // Comparamos solo fechas sin tiempo
  return fechaInput >= new Date(hoy.toISOString().split('T')[0] + 'T00:00');
};

const AgendarCita = ({ onClose, pacientePreseleccionado }) => {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('');
  const [cargando, setCargando] = useState(false);
  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [pacienteFiltrado, setPacienteFiltrado] = useState(null);

  useEffect(() => {
    // Si viene un paciente preseleccionado, usarlo
    if (pacientePreseleccionado) {
      setPacienteSeleccionado(pacientePreseleccionado._id);
      setPacienteFiltrado(pacientePreseleccionado);
    } else {
      fetchPacientes();
    }
  }, [pacientePreseleccionado]);

  const fetchPacientes = async () => {
    try {
      const res = await axios.get('https://tesis-backend-170896327116.us-central1.run.app/api/doctores/pacientes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPacientes(res.data.data);
    } catch (err) {
      console.error('Error al cargar pacientes:', err);
      setPacientes([]);
    }
  };

  const buscarPacientePorCedula = async () => {
    const cedulaLimpiada = busquedaCedula.trim();

    if (!cedulaLimpiada) {
      alert('Por favor ingresa una cédula');
      return;
    }

    if (!validarCedula(cedulaLimpiada)) {
      alert('La cédula debe contener 10 dígitos numéricos válidos');
      return;
    }

    try {
      const res = await axios.get(`https://tesis-backend-170896327116.us-central1.run.app/api/pacientes/cedula/${cedulaLimpiada}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.data) {
        setPacienteFiltrado(res.data.data);
        setPacienteSeleccionado(res.data.data._id);
      } else {
        throw new Error('Paciente no encontrado');
      }
    } catch (err) {
      setPacienteFiltrado(null);
      setPacienteSeleccionado('');
      alert('Paciente no encontrado');
    }
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    // Sanitizar entradas
    const tituloSanitizado = sanitizeInput(titulo);
    const mensajeSanitizado = sanitizeInput(mensaje);

    // Validaciones
    if (!pacienteSeleccionado) {
      alert('Por favor selecciona un paciente');
      return;
    }
    if (!tituloSanitizado) {
      alert('El título de la cita es obligatorio y no debe contener caracteres inválidos.');
      return;
    }
    if (tituloSanitizado.length > 100) {
      alert('El título no puede tener más de 100 caracteres.');
      return;
    }
    if (!validarFechaNoPasada(fechaCita)) {
      alert('La fecha de la cita debe ser hoy o una fecha futura.');
      return;
    }
    if (!validarHora(horaCita)) {
      alert('La hora debe tener un formato válido HH:mm en formato 24 horas.');
      return;
    }
    if (mensajeSanitizado.length > 300) {
      alert('El mensaje adicional no puede tener más de 300 caracteres.');
      return;
    }

    setCargando(true);

    try {
      const fechaHoraCompleta = new Date(`${fechaCita}T${horaCita}`);

      const datosNuevaCita = {
        paciente_id: pacienteSeleccionado,
        titulo: tituloSanitizado,
        mensaje: mensajeSanitizado || `Cita médica programada para ${tituloSanitizado}`,
        fecha_cita: fechaHoraCompleta.toISOString(),
        tipo: 'cita'
      };

      await axios.post('https://tesis-backend-170896327116.us-central1.run.app/api/notificaciones', datosNuevaCita, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Cita agendada exitosamente');
      onClose();
    } catch (err) {
      console.error('Error al agendar cita:', err);
      alert('Error al agendar la cita. Intenta nuevamente.');
    }

    setCargando(false);
  };

  const limpiarBusqueda = () => {
    setBusquedaCedula('');
    setPacienteFiltrado(null);
    setPacienteSeleccionado('');
  };

  // Estilos (no cambiados, mantienen diseño limpio)
  const containerStyle = {
    maxWidth: '700px',
    margin: '2rem auto',
    padding: '2rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '1rem'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
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

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#888'
  };

  return (
    <div style={containerStyle}>
      {!pacientePreseleccionado && (
        <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '1.5rem' }}>
          📅 Agendar Nueva Cita
        </h2>
      )}

      {!pacientePreseleccionado && onClose && (
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#d9534f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            float: 'right',
            fontWeight: 'bold',
          }}
        >
          Cerrar
        </button>
      )}

      {/* Búsqueda por cédula - Solo si NO hay paciente preseleccionado */}
      {!pacientePreseleccionado && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', clear: 'both' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Buscar Paciente por Cédula</h4>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Ingresa número de cédula"
              value={busquedaCedula}
              onChange={(e) => setBusquedaCedula(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            />
            <button
              type="button"
              onClick={buscarPacientePorCedula}
              style={{ ...buttonStyle, marginRight: 0, marginBottom: 0 }}
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={limpiarBusqueda}
              style={{ ...cancelButtonStyle, marginRight: 0, marginBottom: 0 }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={manejarSubmit} noValidate>
        {/* Selección de paciente - Solo si NO hay paciente preseleccionado */}
        {!pacientePreseleccionado && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Paciente *
            </label>

            {pacienteFiltrado ? (
              <div style={{
                padding: '1rem',
              background: '#e3f2fd',
              borderRadius: '8px',
              border: '2px solid #2196f3',
              marginBottom: '1rem'
            }}>
              <strong>{pacienteFiltrado.nombre_completo}</strong>
              <br />
              <span style={{ color: '#666' }}>
                Cédula: {pacienteFiltrado.cedula} | Correo: {pacienteFiltrado.correo}
              </span>
            </div>
          ) : (
              <select
                value={pacienteSeleccionado}
                onChange={(e) => setPacienteSeleccionado(e.target.value)}
                style={selectStyle}
                required
                aria-label="Seleccionar paciente"
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map(paciente => (
                  <option key={paciente._id} value={paciente._id}>
                    {paciente.nombre_completo} - {paciente.cedula}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Título de la cita */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="titulo" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Título de la Cita *
          </label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Consulta de seguimiento, Revisión de resultados..."
            style={inputStyle}
            maxLength={100}
            required
          />
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="fechaCita" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Fecha de la Cita *
          </label>
          <input
            type="date"
            id="fechaCita"
            value={fechaCita}
            onChange={(e) => setFechaCita(e.target.value)}
            style={inputStyle}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Hora */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="horaCita" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Hora de la Cita *
          </label>
          <input
            type="time"
            id="horaCita"
            value={horaCita}
            onChange={(e) => setHoraCita(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        {/* Mensaje adicional */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="mensaje" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Mensaje Adicional (Opcional)
          </label>
          <textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Instrucciones especiales, preparación para la cita, etc..."
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            rows={3}
            maxLength={300}
          />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            type="submit"
            disabled={cargando}
            style={{
              ...buttonStyle,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer'
            }}
          >
            {cargando ? 'Agendando...' : '📅 Agendar Cita'}
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

        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
          * Campos obligatorios
        </div>
      </form>
    </div>
  );
};

export default AgendarCita;
