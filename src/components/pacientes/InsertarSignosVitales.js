import React, { useState, useEffect } from 'react';
import axios from 'axios';

const labels = {
  presion_arterial: "Presión Arterial (PA)",
  peso: "Peso (kg)",
  glucosa: "Glucosa (mg/dL)",
  temperatura: "Temperatura corporal (°C)",
  saturacion_oxigeno: "Saturación de Oxígeno (SpO2, %)",
  frecuencia_cardiaca: "Pulso / Frecuencia Cardíaca (FC, bpm)",
  frecuencia_respiratoria: "Frecuencia Respiratoria (FR, rpm)",
  altura: "Altura / Estatura (cm)"
};

const formContainer = {
  maxWidth: '500px',
  margin: '2rem auto',
  padding: '2rem',
  background: '#f9f9f9',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  margin: '0.3rem 0 1rem 0',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const actionBtnStyle = {
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.5rem 1.2rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginTop: '1rem',
  transition: 'background 0.2s, color 0.2s'
};

const closeBtnStyle = {
  background: '#888',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '0.5rem 1.2rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: '1rem',
  marginTop: '1rem',
  transition: 'background 0.2s, color 0.2s'
};

// ✅ Sanitiza entradas
const sanitizeInput = (input) => {
  if (!input) return '';
  return input.toString().replace(/[<>;'"]/g, '').trim();
};

// ✅ Validaciones específicas
const validarSigno = (campo, valor) => {
  if (!valor) return false;
  const v = sanitizeInput(valor);

  switch(campo) {
    case 'presion_arterial':
      if (!/^\d{2,3}\/\d{2,3}$/.test(v)) return false;
      const [sist, diast] = v.split('/').map(Number);
      return sist >= 90 && sist <= 200 && diast >= 60 && diast <= 130;

    case 'peso':
      const pesoNum = parseFloat(v);
      return !isNaN(pesoNum) && pesoNum >= 2 && pesoNum <= 600;

    case 'glucosa':
      const glucosaNum = parseFloat(v);
      return !isNaN(glucosaNum) && glucosaNum >= 40 && glucosaNum <= 600;

    case 'temperatura':
      const tempNum = parseFloat(v.replace(/[^0-9.]/g, ''));
      return !isNaN(tempNum) && tempNum >= 30 && tempNum <= 45;

    case 'saturacion_oxigeno':
      const satNum = parseInt(v.replace(/[^0-9]/g, ''), 10);
      return !isNaN(satNum) && satNum >= 50 && satNum <= 100;

    case 'frecuencia_cardiaca':
      const fcNum = parseInt(v, 10);
      return !isNaN(fcNum) && fcNum >= 30 && fcNum <= 220;

    case 'frecuencia_respiratoria':
      const frNum = parseInt(v, 10);
      return !isNaN(frNum) && frNum >= 5 && frNum <= 60;

    case 'altura':
      const alturaNum = parseFloat(v);
      return !isNaN(alturaNum) && alturaNum >= 30 && alturaNum <= 300;

    default:
      return v.length > 0 && v.length <= 100;
  }
};

const InsertarSignosVitales = ({ onClose, pacientePreseleccionado }) => {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteId, setPacienteId] = useState('');
  const [signos, setSignos] = useState({});
  const [campos, setCampos] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [pacienteFiltrado, setPacienteFiltrado] = useState(null);

  useEffect(() => {
    // Si viene un paciente preseleccionado, usarlo
    if (pacientePreseleccionado) {
      setPacienteId(pacientePreseleccionado._id);
      setPacienteFiltrado(pacientePreseleccionado);
      setCampos(pacientePreseleccionado.signos_habilitados || []); // ✅ Cargar signos habilitados
      setSignos({});
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
      setError('No se pudieron cargar los pacientes');
    }
  };

  const buscarPacientePorCedula = async () => {
    const cedula = busquedaCedula.trim();
    if (!cedula) {
      alert('Por favor ingresa una cédula');
      return;
    }
    if (!/^\d{10}$/.test(cedula)) {
      alert('La cédula debe contener exactamente 10 dígitos numéricos.');
      return;
    }

    try {
      const res = await axios.get(`https://tesis-backend-170896327116.us-central1.run.app/api/pacientes/cedula/${cedula}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.data.data) throw new Error('No encontrado');
      setPacienteFiltrado(res.data.data);
      setPacienteId(res.data.data._id);
      setCampos(res.data.data.signos_habilitados || []);
      setSignos({});
    } catch (err) {
      setPacienteFiltrado(null);
      setPacienteId('');
      setCampos([]);
      alert('Paciente no encontrado');
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaCedula('');
    setPacienteFiltrado(null);
    setPacienteId('');
    setCampos([]);
    setSignos({});
    setError('');
    setSuccess('');
  };

  const handleSelectPaciente = (e) => {
    const id = e.target.value;
    setPacienteId(id);

    if (!id) {
      setCampos([]);
      setPacienteFiltrado(null);
      return;
    }

    const seleccionado = pacientes.find(p => p._id === id);
    if (seleccionado) {
      setCampos(seleccionado.signos_habilitados || []);
      setPacienteFiltrado(seleccionado);
      setSignos({});
    }
  };

  const handleChange = (e) => {
    setSignos({ ...signos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pacienteId) {
      setError('Debe seleccionar un paciente');
      return;
    }

    if (campos.length === 0) {
      setError('Este paciente no tiene parámetros habilitados para signos vitales');
      return;
    }

    for (const campo of campos) {
      const valor = signos[campo];
      if (!valor || valor.trim() === '') {
        setError(`El campo "${labels[campo] || campo}" es obligatorio.`);
        return;
      }
      if (!validarSigno(campo, valor)) {
        setError(`El valor ingresado para "${labels[campo] || campo}" es inválido o fuera de rango.`);
        return;
      }
    }

    const signosSanitizados = {};
    campos.forEach(campo => {
      signosSanitizados[campo] = sanitizeInput(signos[campo]);
    });

    try {
      await axios.post('https://tesis-backend-170896327116.us-central1.run.app/api/signos-vitales', {
        paciente: pacienteId,
        signos: signosSanitizados
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSuccess('Signos vitales registrados correctamente');
      setSignos({});
      if (onClose) onClose();
    } catch (err) {
      setError('Error al registrar signos vitales');
    }
  };

  const getPlaceholder = (campo) => {
    const placeholders = {
      'presion_arterial': '120/80',
      'frecuencia_cardiaca': '72',
      'temperatura': '36.5',
      'saturacion_oxigeno': '98',
      'glucosa': '95',
      'peso': '70',
      'frecuencia_respiratoria': '16',
      'altura': '170'
    };
    return placeholders[campo] || 'Ingrese el valor';
  };

  return (
    <div style={formContainer}>
      {!pacientePreseleccionado && <h2>📊 Insertar Signos Vitales</h2>}
      {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
      {success && <div style={{color: 'green', marginBottom: '1rem'}}>{success}</div>}

      {/* Búsqueda por cédula - Solo si NO hay paciente preseleccionado */}
      {!pacientePreseleccionado && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f8ff', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>🔍 Buscar Paciente por Cédula</h4>
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
              style={{ ...actionBtnStyle, marginTop: 0, marginRight: 0 }}
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={limpiarBusqueda}
              style={{ ...closeBtnStyle, marginTop: 0, marginLeft: 0 }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {!pacientePreseleccionado && (
          <div>
            <label>Paciente *:</label>

            {pacienteFiltrado ? (
              <div style={{ 
                padding: '1rem', 
                background: '#e8f5e8', 
                borderRadius: '8px', 
                border: '2px solid #4caf50',
                marginBottom: '1rem'
              }}>
                <strong>{pacienteFiltrado.nombre_completo}</strong>
                <br />
                <span style={{ color: '#666' }}>
                  Cédula: {pacienteFiltrado.cedula} | Correo: {pacienteFiltrado.correo}
                </span>
                <br />
                <span style={{ color: '#2e7d32', fontSize: '0.9rem' }}>
                  Parámetros habilitados: {pacienteFiltrado.signos_habilitados.length} tipos
                </span>
              </div>
            ) : (
              <select
                value={pacienteId}
                onChange={handleSelectPaciente}
                required
                style={inputStyle}
              >
                <option value="">Seleccione un paciente</option>
                {pacientes.map(p => (
                  <option key={p._id} value={p._id}>{p.nombre_completo} - {p.cedula}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {campos.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>📈 Signos Vitales a Registrar</h4>
            {campos.map(campo => (
              <div key={campo} style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold', color: '#555' }}>
                  {labels[campo] || campo} *:
                </label>
                <input
                  type="text"
                  name={campo}
                  value={signos[campo] || ''}
                  onChange={handleChange}
                  placeholder={`Ej: ${getPlaceholder(campo)}`}
                  required
                  style={inputStyle}
                  autoComplete="off"
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        )}

        {campos.length === 0 && pacienteId && (
          <div style={{ 
            padding: '1rem', 
            background: '#fff3e0', 
            borderRadius: '8px',
            color: '#e65100',
            textAlign: 'center',
            marginTop: '1rem'
          }}>
            ⚠️ Este paciente no tiene parámetros de signos vitales habilitados
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <button 
            type="submit" 
            disabled={!pacienteId || campos.length === 0} 
            style={{
              ...actionBtnStyle,
              opacity: (!pacienteId || campos.length === 0) ? 0.6 : 1,
              cursor: (!pacienteId || campos.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            💾 Registrar Signos Vitales
          </button>
          {onClose && (
            <button type="button" onClick={onClose} style={closeBtnStyle}>
              ❌ Cerrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InsertarSignosVitales;
