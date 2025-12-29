import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { authService } from '../api/auth';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService({ email, password });
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inicio de Sesión Doctor
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Correo Electrónico"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Iniciar Sesión
        </Button>
      </form>
    </Box>
  );
}