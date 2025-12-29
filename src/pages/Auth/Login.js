import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/system';
import LoginForm from '../../components/auth/LoginForm';

const LoginContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f2f5',
});

const LoginBox = styled(Box)({
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px',
  textAlign: 'center',
});

const Login = () => {
  return (
    <LoginContainer maxWidth="xl">
      <LoginBox>
        <Typography variant="h4" color="primary" gutterBottom>
          Monitoreo de Salud
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Inicia sesión como doctor
        </Typography>
        <LoginForm />
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;