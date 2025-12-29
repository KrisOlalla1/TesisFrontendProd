import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/system';
import RegisterForm from '../../components/auth/RegisterForm'; // Asegúrate de que la ruta es correcta

const RegisterContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f2f5',
});

const RegisterBox = styled(Box)({
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px',
  textAlign: 'center',
});

const Register = () => {
  return (
    <RegisterContainer maxWidth="xl">
      <RegisterBox>
        <Typography variant="h4" color="primary" gutterBottom>
          Registro de Doctores
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Completa tus datos para crear una cuenta
        </Typography>
        <RegisterForm />
      </RegisterBox>
    </RegisterContainer>
  );
};

export default Register;