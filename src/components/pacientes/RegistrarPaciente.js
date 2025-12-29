import React, { useState } from 'react';
import axios from 'axios';

const parametrosDisponibles = [
  { label: "Presión Arterial (PA)", value: "presion_arterial" },
  { label: "Frecuencia Cardíaca (FC)", value: "frecuencia_cardiaca" },
  { label: "Frecuencia Respiratoria (FR)", value: "frecuencia_respiratoria" },
  { label: "Temperatura Corporal", value: "temperatura" },
  { label: "Saturación de Oxígeno (SpO2)", value: "saturacion_oxigeno" },
  { label: "Peso", value: "peso" },
  { label: "Glucosa (Nivel de Azúcar en Sangre)", value: "glucosa" }
];

const actionBtnStyle = {
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.8rem 1.5rem',
  cursor: 'pointer',
  fontWeight: '600',
  marginTop: '1.5rem',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontSize: '1rem'
};

const closeBtnStyle = {
  background: '#f5f5f5',
  color: '#666',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '0.8rem 1.5rem',
  cursor: 'pointer',
  fontWeight: '600',
  marginLeft: '1rem',
  marginTop: '1.5rem',
  transition: 'all 0.2s ease',
  fontSize: '1rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.8rem',
  margin: '0.5rem 0 1.2rem 0',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  fontSize: '1rem',
  transition: 'border-color 0.2s',
  backgroundColor: '#fff'
};

const sectionTitle = {
  marginTop: '1.5rem',
  marginBottom: '1rem',
  fontWeight: '600',
  fontSize: '1.1rem',
  color: '#333'
};

const formContainer = {
  maxWidth: '600px',
  margin: '2rem auto',
  padding: '2.5rem',
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
};

const parameterGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.5rem'
};

const parameterCardStyle = (isSelected) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  borderRadius: '20px',
  border: isSelected ? '1px solid #1976d2' : '1px solid #e0e0e0',
  backgroundColor: isSelected ? '#e3f2fd' : '#f5f5f5',
  color: isSelected ? '#1565c0' : '#555',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.9rem',
  fontWeight: isSelected ? '600' : '500',
  userSelect: 'none'
});

// Sanitiza cadenas para evitar inyección de caracteres peligrosos
const sanitizeInput = (input) => {
  if (!input) return '';
  return input.toString().replace(/[<>;'"]/g, '').trim();
};

// Validar correo con regex más estricto
const validarEmail = (email) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
};

// Validar contraseña (mín 6 caracteres)
const validarPassword = (pass) => {
  return pass.length >= 6;
};

// Validar cédula (Ecuador, 10 dígitos, algoritmo Modulo 10)
const validarCedula = (cedula) => {
  if (!cedula || cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
  const digits = cedula.split('').map(Number);
  const provinceCode = digits[0] * 10 + digits[1];
  const thirdDigit = digits[2];
  if (provinceCode < 1 || provinceCode > 24) return false;
  if (thirdDigit >= 6) return false;
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let i = 0; i < 9; i++) {
    let value = digits[i] * coefficients[i];
    if (value >= 10) value -= 9;
    total += value;
  }
  const verifier = total % 10 === 0 ? 0 : 10 - (total % 10);
  return verifier === digits[9];
};

// Validar fecha nacimiento - no futura y razonable (entre 1900 y hoy)
const validarFechaNacimiento = (fecha) => {
  if (!fecha) return false;
  const hoy = new Date();
  const fechaNac = new Date(fecha);
  if (fechaNac > hoy) return false;
  if (fechaNac.getFullYear() < 1900) return false;
  return true;
};

// Validar sexo (M o F)
const validarSexo = (sexo) => {
  return sexo === 'M' || sexo === 'F';
};

const RegistrarPaciente = ({ onClose, doctorIdOverride }) => {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_completo: '',
    correo: '',
    contrasena: '',
    fecha_nacimiento: '',
    sexo: '',
    signos_habilitados: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = value;

    // For cédula, only allow digits and cap length to 10
    if (name === 'cedula') {
      next = value.replace(/\D/g, '').slice(0, 10);
    }

    // Para nombre, no permitir números
    if (name === 'nombre_completo') {
      // Si el nuevo valor contiene números, no actualizamos (o lo limpiamos)
      if (/\d/.test(value)) {
        return; // Simplemente ignoramos la entrada si tiene números
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: next
    }));
  };

  const handleCheckbox = (parametro) => {
    setFormData((prev) => ({
      ...prev,
      signos_habilitados: prev.signos_habilitados.includes(parametro)
        ? prev.signos_habilitados.filter(p => p !== parametro)
        : [...prev.signos_habilitados, parametro]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Sanitizar inputs
    const cedula = sanitizeInput(formData.cedula);
    const nombre_completo = sanitizeInput(formData.nombre_completo);
    const correo = sanitizeInput(formData.correo);
    const contrasena = formData.contrasena; // la contraseña la dejamos sin sanitizar para respetar caracteres
    const fecha_nacimiento = formData.fecha_nacimiento;
    const sexo = formData.sexo;
    const signos_habilitados = formData.signos_habilitados;

    // Validaciones

    if (!validarCedula(cedula)) {
      setError('La cédula debe contener exactamente 10 dígitos numéricos.');
      return;
    }

    if (nombre_completo.length < 3 || nombre_completo.length > 100) {
      setError('El nombre completo debe tener entre 3 y 100 caracteres.');
      return;
    }

    // Validación extra de nombre (aunque el input lo previene, validamos por seguridad)
    if (/\d/.test(nombre_completo)) {
      setError('El nombre no puede contener números.');
      return;
    }

    if (!validarEmail(correo)) {
      setError('El correo electrónico no es válido.');
      return;
    }

    if (!validarPassword(contrasena)) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!validarFechaNacimiento(fecha_nacimiento)) {
      setError('La fecha de nacimiento es inválida o es una fecha futura.');
      return;
    }

    if (!validarSexo(sexo)) {
      setError('Seleccione un sexo válido.');
      return;
    }

    if (signos_habilitados.length === 0) {
      setError('Debe seleccionar al menos un parámetro a monitorear.');
      return;
    }

    // Todo correcto, enviar datos sanitizados
    try {
      const payload = {
        cedula,
        nombre_completo,
        correo,
        contrasena,
        fecha_nacimiento,
        sexo,
        signos_habilitados
      };

      // Si el admin está registrando para otro doctor, incluir el doctor_id
      if (doctorIdOverride) {
        payload.doctor_asignado = doctorIdOverride;
      }

      const response = await axios.post('https://tesis-backend-170896327116.us-central1.run.app/api/doctores/pacientes', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess('Paciente registrado correctamente');
        setFormData({
          cedula: '',
          nombre_completo: '',
          correo: '',
          contrasena: '',
          fecha_nacimiento: '',
          sexo: '',
          signos_habilitados: []
        });
        if (onClose) onClose();
      } else {
        setError(response.data.message || 'Error al registrar paciente');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        'Error al registrar. Verifica tus datos.'
      );
    }
  };

  return (
    <div style={formContainer}>
      <h2>Registrar Paciente</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label>Cédula:</label>
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
            style={inputStyle}
            maxLength={10}
            pattern="[0-9]{10}"
            title="Debe contener exactamente 10 dígitos numéricos"
            autoComplete="off"
            inputMode="numeric"
          />
        </div>
        <div>
          <label>Nombre completo:</label>
          <input
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
            style={inputStyle}
            minLength={3}
            maxLength={100}
            autoComplete="off"
          />
        </div>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
            style={inputStyle}
            autoComplete="off"
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required
            style={inputStyle}
            minLength={6}
          />
        </div>
        <div>
          <label>Fecha de nacimiento:</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
            style={inputStyle}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <label>Género:</label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Seleccione</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <div>
          <div style={sectionTitle}>Parámetros a monitorear:</div>
          <div style={parameterGridStyle}>
            {parametrosDisponibles.map(parametro => {
              const isSelected = formData.signos_habilitados.includes(parametro.value);
              return (
                <div
                  key={parametro.value}
                  style={parameterCardStyle(isSelected)}
                  onClick={() => handleCheckbox(parametro.value)}
                >
                  <span style={{ marginRight: '0.5rem', fontSize: '1rem' }}>
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span>{parametro.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button type="submit" style={actionBtnStyle}>Registrar</button>
          {onClose && (
            <button type="button" onClick={onClose} style={closeBtnStyle}>
              Cerrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrarPaciente;
