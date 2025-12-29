import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge } from '@mui/material';
import axios from 'axios';
import moment from 'moment';

const Navbar = ({ userName, onRegistrar, onHome, onAdmins, userRole = 'doctor' }) => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [citasHoy, setCitasHoy] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (userRole === 'doctor') {
      fetchCitasHoy();
    }
  }, [userRole]);

  const fetchCitasHoy = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('http://localhost:5000/api/notificaciones/hoy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCitasHoy(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleCompletarCita = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notificaciones/${id}`,
        { estado: 'completada' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      setCitasHoy(prev => prev.map(cita =>
        cita._id === id ? { ...cita, estado: 'completada' } : cita
      ));
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Error al completar la cita');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handleRegistrarClick = () => {
    setMenuAbierto(false);
    onRegistrar();
  };

  const handleAdminsClick = () => {
    setMenuAbierto(false);
    if (onAdmins) onAdmins();
  };

  // Determinar el texto del botón según el rol
  const registrarTexto = userRole === 'admin' ? 'Registrar Nuevo Doctor' : 'Registrar Nuevo Paciente';
  const registrarIcono = userRole === 'admin' ? '👨‍⚕️' : '📋';

  const pendientes = citasHoy.filter(c => c.estado !== 'completada').length;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
      padding: '0.8rem 2rem',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'relative'
    }}>
      {/* LADO IZQUIERDO: Casita, Menú, Logo IESS, Doctor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* 1. Botón Home (Casita) - PRIMERO A LA IZQUIERDA */}
        <button
          onClick={onHome}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '2rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.2s',
            padding: '0.3rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Ir a inicio"
        >
          <HomeIcon fontSize="large" />
        </button>

        {/* 2. Botón de menú hamburguesa - SEGUNDO */}
        <button
          onClick={toggleMenu}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          title="Abrir menú"
        >
          {menuAbierto ? <CloseIcon /> : <MenuIcon />}
          <span>Menú</span>
        </button>

        {/* 3. Logo IESS - TERCERO (estilo página oficial IESS) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          paddingLeft: '1rem',
          borderLeft: '2px solid rgba(255,255,255,0.3)'
        }}>
          <img
            src="/logo-iess.png"
            alt="IESS Logo"
            style={{
              height: '40px',
              width: 'auto',
              display: 'block'
            }}
          />
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            letterSpacing: '1px'
          }}>
            IESS
          </span>
        </div>

        {/* 4. Nombre del usuario */}
        <span style={{
          fontWeight: 'bold',
          fontSize: '1.1rem',
          marginLeft: '1rem'
        }}>
          {userRole === 'admin' ? userName : `Dr. ${userName}`}
        </span>
      </div>

      {/* LADO DERECHO: Notificaciones y Cerrar Sesión */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* Bell Icon for Doctors */}
        {userRole === 'doctor' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '5px'
              }}
              title="Citas de hoy"
            >
              <Badge badgeContent={pendientes} color="error">
                <NotificationsIcon fontSize="large" />
              </Badge>
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '15px',
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 1000,
                color: '#333',
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #ddd'
              }}>
                <div style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  fontWeight: 'bold',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>📅 Citas de Hoy</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>{moment().format('DD/MM/YYYY')}</span>
                </div>

                {citasHoy.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No hay citas programadas para hoy
                  </div>
                ) : (
                  citasHoy.map(cita => (
                    <div key={cita._id} style={{
                      padding: '12px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: cita.estado === 'completada' ? '#f9f9f9' : 'white',
                      opacity: cita.estado === 'completada' ? 0.7 : 1,
                      transition: 'background 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1.1rem' }}>
                          {moment(cita.fecha_cita).format('HH:mm')}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: cita.estado === 'completada' ? '#e8f5e8' : '#e3f2fd',
                          color: cita.estado === 'completada' ? '#2e7d32' : '#1565c0',
                          fontWeight: 'bold'
                        }}>
                          {cita.estado === 'completada' ? 'COMPLETADA' : 'PENDIENTE'}
                        </span>
                      </div>
                      <div style={{ fontWeight: '600', marginBottom: '3px', fontSize: '0.95rem' }}>
                        {cita.paciente_id?.nombre_completo || 'Paciente desconocido'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                        {cita.titulo}
                      </div>

                      {cita.estado !== 'completada' && (
                        <button
                          onClick={() => handleCompletarCita(cita._id)}
                          style={{
                            width: '100%',
                            padding: '6px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#43a047'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
                        >
                          ✅ Marcar como Completada
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <button
          style={{
            background: '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onClick={handleLogout}
          onMouseEnter={(e) => e.currentTarget.style.background = '#b71c1c'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#d32f2f'}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Menú desplegable vertical - COMPLETAMENTE A LA IZQUIERDA */}
      {menuAbierto && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '0',
          background: 'white',
          borderRadius: '0 0 8px 8px',
          boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
          minWidth: '280px',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideDown 0.3s ease-out',
          borderTop: '3px solid #1976d2'
        }}>
          {/* Encabezado del menú */}
          <div style={{
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            borderBottom: '2px solid rgba(255,255,255,0.2)'
          }}>
            ⚙️ Menú de Opciones
          </div>

          {/* Opción: Registrar Nuevo */}
          <button
            onClick={handleRegistrarClick}
            style={{
              width: '100%',
              background: 'white',
              color: '#333',
              border: 'none',
              borderBottom: '1px solid #e0e0e0',
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '1rem',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f0f7ff';
              e.currentTarget.style.paddingLeft = '2rem';
              e.currentTarget.style.color = '#1976d2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.paddingLeft = '1.5rem';
              e.currentTarget.style.color = '#333';
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{registrarIcono}</span>
            <span>{registrarTexto}</span>
          </button>

          {/* Opción: Administradores (Solo para admins) */}
          {userRole === 'admin' && (
            <button
              onClick={handleAdminsClick}
              style={{
                width: '100%',
                background: 'white',
                color: '#333',
                border: 'none',
                borderBottom: '1px solid #e0e0e0',
                padding: '1rem 1.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '1rem',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f7ff';
                e.currentTarget.style.paddingLeft = '2rem';
                e.currentTarget.style.color = '#1976d2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.paddingLeft = '1.5rem';
                e.currentTarget.style.color = '#333';
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>🛡️</span>
              <span>Administradores</span>
            </button>
          )}

          {/* Pie del menú */}
          <div style={{
            padding: '0.8rem 1.5rem',
            background: '#f5f5f5',
            color: '#666',
            fontSize: '0.85rem',
            textAlign: 'center',
            borderTop: '1px solid #e0e0e0'
          }}>
            Sistema IESS - v1.0
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú al hacer clic fuera */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;