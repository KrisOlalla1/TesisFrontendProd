import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { authService } from '../../api/auth';

const validationSchema = Yup.object({
  correo: Yup.string()
    .trim()
    .email('Ingrese un correo válido')
    .required('El correo es requerido'),
  contrasena: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida')
});

const LoginForm = () => {
  const navigate = useNavigate();
  const [authError, setAuthError] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      correo: '',
      contrasena: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setAuthError(null);
      try {
        const payload = {
          correo: values.correo.trim(),
          contrasena: values.contrasena
        };

        const result = await authService.login(payload);

        if (result.success && result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));

          authService.setAuthHeaders(result.token);

          navigate(result.redirectTo || '/dashboard');
        } else {
          setAuthError(result.error || 'Credenciales incorrectas');
        }
      } catch (error) {
        setAuthError(error.response?.data?.error || 'Error de conexión');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
      <TextField
        fullWidth
        id="correo"
        name="correo"
        label="Correo electrónico"
        margin="normal"
        variant="outlined"
        value={formik.values.correo}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.correo && Boolean(formik.errors.correo)}
        helperText={formik.touched.correo && formik.errors.correo}
        autoComplete="email"
      />

      <TextField
        fullWidth
        id="contrasena"
        name="contrasena"
        label="Contraseña"
        type="password"
        margin="normal"
        variant="outlined"
        value={formik.values.contrasena}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.contrasena && Boolean(formik.errors.contrasena)}
        helperText={formik.touched.contrasena && formik.errors.contrasena}
        autoComplete="current-password"
      />

      {authError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {authError}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2, mb: 2 }}
        disabled={formik.isSubmitting}
        startIcon={formik.isSubmitting ? <CircularProgress size={20} /> : null}
      >
        {formik.isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      {/* Registro removido - Solo administradores pueden crear cuentas de doctor */}
    </Box>
  );
};

export default LoginForm;
