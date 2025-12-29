// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Alert,
  Typography,
  Link,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/auth';

const validarCedulaEcuatoriana = (cedula) => {
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

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre_completo: '',
    correo: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Elimina caracteres peligrosos pero permite espacios
    const sanitizedValue = value.replace(/[<>{}]/g, '');
    setFormData({ ...formData, [name]: sanitizedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones frontend
    const cedulaRegex = /^[0-9]{10}$/;  // Exactamente 10 dígitos numéricos
    const nombreRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]+$/; // Letras y espacios
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email básico

    if (!validarCedulaEcuatoriana(formData.cedula)) {
      return setError('La cédula ingresada no es válida (Ecuador).');
    }
    if (!nombreRegex.test(formData.nombre_completo)) {
      return setError('El nombre solo puede contener letras y espacios.');
    }
    if (!correoRegex.test(formData.correo)) {
      return setError('El correo electrónico no es válido.');
    }
    if (formData.contrasena.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    try {
      const result = await authService.registerDoctor(formData);

      if (result.success) {
        navigate(result.redirectTo || '/login', {
          state: { success: 'Registro exitoso. Ya puedes iniciar sesión.' }
        });
      } else {
        setError(result.error || 'Error en el registro.');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Cédula"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 10 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nombre Completo"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required
            inputProps={{ minLength: 6 }}
          />
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Registrarse
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" align="center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" underline="hover">
              Inicia Sesión
            </Link>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterForm;
