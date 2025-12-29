import React, { useState, useEffect } from 'react';
import axios from 'axios';

const parametrosDisponibles = [
  { label: "Presión Arterial (PA)", value: "presion_arterial" },
  { label: "Peso", value: "peso" },
  { label: "Glucosa (Nivel de Azúcar en Sangre)", value: "glucosa" },
  { label: "Temperatura corporal", value: "temperatura" },
  { label: "Saturación de Oxígeno (SpO2)", value: "saturacion_oxigeno" },
  { label: "Pulso / Frecuencia Cardíaca (FC)", value: "frecuencia_cardiaca" },
  { label: "Frecuencia Respiratoria (FR)", value: "frecuencia_respiratoria" },
  { label: "Altura / Estatura", value: "altura" }
];

const modalBackdrop = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 9999
};

const modalStyle = {
  background: '#fff',
  padding: '2rem',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  position: 'relative'
};

const closeBtnStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: '#888',
  border: 'none',
  borderRadius: '4px',
  color: '#fff',
  fontWeight: 'bold',
  padding: '0.3rem 0.7rem',
  cursor: 'pointer',
  fontSize: '1rem'
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

const sectionTitle = {
  marginTop: '1rem',
  marginBottom: '0.5rem',
  fontWeight: 'bold'
};

const validarEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
const validarFechaNacimiento = fecha => {
  if (!fecha) return false;
  const hoy = new Date();
  const fechaNac = new Date(fecha);
  if (fechaNac > hoy) return false;
  if (fechaNac.getFullYear() < 1900) return false;
  return true;
};
const validarSexo = sexo => sexo === 'M' || sexo === 'F';

const EditarPacienteModal = ({ paciente, onClose, onActualizado }) => {
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

  useEffect(() => {
    if (paciente) {
      setFormData({
        cedula: paciente.cedula || '',
        nombre_completo: paciente.nombre_completo || '',
        correo: paciente.correo || '',
        contrasena: '', // No mostrar contraseña
        fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.split('T')[0] : '',
        sexo: paciente.sexo || '',
        signos_habilitados: paciente.signos_habilitados || []
      });
    }
  }, [paciente]);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = parametro => {
    setFormData(prev => ({
      ...prev,
      signos_habilitados: prev.signos_habilitados.includes(parametro)
        ? prev.signos_habilitados.filter(p => p !== parametro)
        : [...prev.signos_habilitados, parametro]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validarCedula(formData.cedula)) {
      setError('La cédula debe tener 10 dígitos numéricos.');
      return;
    }
    if (formData.nombre_completo.length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }
    if (!validarEmail(formData.correo)) {
      setError('Correo electrónico inválido.');
      return;
    }
    if (formData.contrasena && formData.contrasena.length > 0 && formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres si la cambias.');
      return;
    }
    if (!validarFechaNacimiento(formData.fecha_nacimiento)) {
      setError('Fecha de nacimiento inválida.');
      return;
    }
    if (!validarSexo(formData.sexo)) {
      setError('Seleccione un sexo válido.');
      return;
    }
    if (formData.signos_habilitados.length === 0) {
      setError('Debe seleccionar al menos un parámetro a monitorear.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/pacientes/${paciente._id}`,
        {
          cedula: formData.cedula,
          nombre_completo: formData.nombre_completo,
          correo: formData.correo,
          contrasena: formData.contrasena,
          fecha_nacimiento: formData.fecha_nacimiento,
          sexo: formData.sexo,
          signos_habilitados: formData.signos_habilitados
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.message) {
        setSuccess('Paciente actualizado correctamente.');
        if (onActualizado) onActualizado();
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar paciente');
    }
  };

  return (
    React.createElement('div', { style: modalBackdrop },
      React.createElement('div', { style: modalStyle },
        React.createElement('button', { style: closeBtnStyle, onClick: onClose }, 'X'),
        React.createElement('h2', null, 'Editar Paciente'),

        error && React.createElement('div', { style: { color: 'red', marginBottom: '1rem' } }, error),
        success && React.createElement('div', { style: { color: 'green', marginBottom: '1rem' } }, success),

        React.createElement('form', { onSubmit: handleSubmit, noValidate: true },
          React.createElement('div', null,
            React.createElement('label', null, 'Cédula:'),
            React.createElement('input', {
              type: 'text',
              name: 'cedula',
              value: formData.cedula,
              onChange: handleChange,
              required: true,
              style: inputStyle,
              maxLength: 10,
              pattern: '\\d{10}',
              title: 'Debe contener exactamente 10 dígitos numéricos',
              autoComplete: 'off',
              disabled: true
            })
          ),

          React.createElement('div', null,
            React.createElement('label', null, 'Nombre completo:'),
            React.createElement('input', {
              type: 'text',
              name: 'nombre_completo',
              value: formData.nombre_completo,
              onChange: handleChange,
              required: true,
              style: inputStyle,
              minLength: 3,
              maxLength: 100,
              autoComplete: 'off'
            })
          ),

          React.createElement('div', null,
            React.createElement('label', null, 'Correo:'),
            React.createElement('input', {
              type: 'email',
              name: 'correo',
              value: formData.correo,
              onChange: handleChange,
              required: true,
              style: inputStyle,
              autoComplete: 'off'
            })
          ),

          React.createElement('div', null,
            React.createElement('label', null, 'Contraseña (dejar vacío para no cambiar):'),
            React.createElement('input', {
              type: 'password',
              name: 'contrasena',
              value: formData.contrasena,
              onChange: handleChange,
              style: inputStyle,
              minLength: 6
            })
          ),

          React.createElement('div', null,
            React.createElement('label', null, 'Fecha de nacimiento:'),
            React.createElement('input', {
              type: 'date',
              name: 'fecha_nacimiento',
              value: formData.fecha_nacimiento,
              onChange: handleChange,
              required: true,
              style: inputStyle,
              max: new Date().toISOString().split("T")[0]
            })
          ),

          React.createElement('div', null,
            React.createElement('label', null, 'Género:'),
            React.createElement('select', {
              name: 'sexo',
              value: formData.sexo,
              onChange: handleChange,
              required: true,
              style: inputStyle
            },
              React.createElement('option', { value: '' }, 'Seleccione'),
              React.createElement('option', { value: 'M' }, 'Masculino'),
              React.createElement('option', { value: 'F' }, 'Femenino'),
            )
          ),

          React.createElement('div', null,
            React.createElement('div', { style: sectionTitle }, 'Parámetros a monitorear:'),
            parametrosDisponibles.map(parametro =>
              React.createElement('div', { key: parametro.value, style: { marginBottom: '0.3rem' } },
                React.createElement('label', null,
                  React.createElement('input', {
                    type: 'checkbox',
                    checked: formData.signos_habilitados.includes(parametro.value),
                    onChange: () => handleCheckbox(parametro.value)
                  }),
                  ' ',
                  parametro.label
                )
              )
            )
          ),

          React.createElement('button', { type: 'submit', style: actionBtnStyle }, 'Actualizar')
        )
      )
    )
  );
};

export default EditarPacienteModal;
