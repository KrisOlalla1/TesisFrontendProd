import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import RegistrarPaciente from '../components/pacientes/RegistrarPaciente';
import CalendarioSignos from '../components/CalendarioSignos';
import RecomendacionPorFechas from '../components/RecomendacionPorFechas';
import InsertarSignosVitales from '../components/pacientes/InsertarSignosVitales';
import AgendarCita from '../components/AgendarCita';
import AnalisisSignos from '../components/AnalisisSignos';
import EditarPacienteModal from '../components/EditarPacienteModal';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [vista, setVista] = useState('home');
  const [doctorName, setDoctorName] = useState('');
  const [permisos, setPermisos] = useState({ puede_editar_pacientes: true, puede_eliminar_pacientes: true });
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [pacienteCalendarioId, setPacienteCalendarioId] = useState(null);
  const [pacienteAnalisis, setPacienteAnalisis] = useState(null);
  const [pacienteEditar, setPacienteEditar] = useState(null);
  const [pacienteInsertarSignos, setPacienteInsertarSignos] = useState(null);
  const [pacienteAgendarCita, setPacienteAgendarCita] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && (user.nombre || user.nombre_completo)) {
      setDoctorName(user.nombre || user.nombre_completo);
      // Cargar permisos del usuario
      if (user.permisos) {
        setPermisos(user.permisos);
      }
    }
    fetchPacientes();
  }, []);

  useEffect(() => {
    // Filtrar pacientes cuando cambia la búsqueda
    if (busqueda.trim() === '') {
      setPacientesFiltrados(pacientes);
    } else {
      const filtrados = pacientes.filter(p =>
        p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.cedula.includes(busqueda) ||
        p.correo.toLowerCase().includes(busqueda.toLowerCase())
      );
      setPacientesFiltrados(filtrados);
    }
  }, [busqueda, pacientes]);

  const fetchPacientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/doctores/pacientes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPacientes(response.data.data);
      setPacientesFiltrados(response.data.data);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
      setPacientes([]);
      setPacientesFiltrados([]);
    }
  };

  const toggleEstadoPaciente = async (id, estadoActual) => {
    try {
      const token = localStorage.getItem('token');
      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';

      await axios.patch(
        `http://localhost:5000/api/pacientes/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar el estado local
      setPacientes(pacientes.map(p =>
        p._id === id ? { ...p, estado: nuevoEstado } : p
      ));
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al actualizar el estado del paciente');
    }
  };

  const eliminarPaciente = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este paciente? Esta acción no se puede deshacer.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/pacientes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPacientes(pacientes.filter(p => p._id !== id));
      if (pacienteSeleccionado?._id === id) setPacienteSeleccionado(null);
      if (pacienteCalendarioId === id) setPacienteCalendarioId(null);
      if (pacienteAnalisis?._id === id) setPacienteAnalisis(null);
      alert('Paciente eliminado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error eliminando paciente');
    }
  };

  return (
    <Layout
      userName={doctorName}
      onRegistrar={() => setVista('registrar')}
      onHome={() => setVista('home')}
      userRole="doctor"
    >
      {vista === 'registrar' && <RegistrarPaciente onClose={() => { fetchPacientes(); setVista('home'); }} />}

      {vista === 'home' && (
        <div className="dashboard-container">
          {/* Buscador */}
          <div style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, cédula o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                flex: 1,
                padding: '0.8rem 1.2rem',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1976d2'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {pacientesFiltrados.length} paciente{pacientesFiltrados.length !== 1 ? 's' : ''} encontrado{pacientesFiltrados.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Cédula</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map(p => (
                  <React.Fragment key={p._id}>
                    <tr>
                      <td>{p.nombre_completo}</td>
                      <td>{p.cedula}</td>
                      <td>{p.correo}</td>
                      <td>
                        <div
                          onClick={() => toggleEstadoPaciente(p._id, p.estado || 'activo')}
                          style={{
                            position: 'relative',
                            width: '60px',
                            height: '30px',
                            backgroundColor: (p.estado || 'activo') === 'activo' ? '#4caf50' : '#ccc',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            margin: '0 auto'
                          }}
                          title={(p.estado || 'activo') === 'activo' ? 'Activo - Click para desactivar' : 'Inactivo - Click para activar'}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: '3px',
                              left: (p.estado || 'activo') === 'activo' ? '32px' : '3px',
                              width: '24px',
                              height: '24px',
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              transition: 'left 0.3s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: (p.estado || 'activo') === 'activo' ? '8px' : 'auto',
                              right: (p.estado || 'activo') === 'activo' ? 'auto' : '8px',
                              transform: 'translateY(-50%)',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: 'white'
                            }}
                          >
                            {(p.estado || 'activo') === 'activo' ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td className="patient-actions-cell" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          className="action-btn"
                          onClick={() => setPacienteInsertarSignos(p)}
                          title="Insertar signos vitales"
                          style={{ backgroundColor: '#9c27b0', color: 'white' }}
                        >
                          📊 Signos
                        </button>

                        <button
                          className="action-btn"
                          onClick={() => setPacienteAgendarCita(p)}
                          title="Agendar cita médica"
                          style={{ backgroundColor: '#ff9800', color: 'white' }}
                        >
                          📅 Agendar
                        </button>

                        {permisos.puede_editar_pacientes && (
                          <button
                            className="action-btn"
                            onClick={() => setPacienteEditar(p)}
                            title="Editar paciente"
                            style={{ backgroundColor: '#f0ad4e', color: 'black' }}
                          >
                            ✏️ Editar
                          </button>
                        )}

                        <button
                          className="action-btn recommendation-btn"
                          onClick={() => {
                            setPacienteSeleccionado(p);
                            setPacienteCalendarioId(null);
                            setPacienteAnalisis(null);
                          }}
                          title="Obtener recomendación médica"
                          style={{ backgroundColor: '#0275d8', color: 'white' }}
                        >
                          💡 Recomendación
                        </button>

                        <button
                          className="action-btn"
                          onClick={() => {
                            setPacienteCalendarioId(pacienteCalendarioId === p._id ? null : p._id);
                            setPacienteSeleccionado(null);
                            setPacienteAnalisis(null);
                          }}
                          title="Ver calendario de signos vitales"
                          style={{ backgroundColor: '#00bcd4', color: 'white' }}
                        >
                          📆 Calendario
                        </button>

                        <button
                          className="action-btn"
                          onClick={() => {
                            setPacienteAnalisis(p);
                            setPacienteSeleccionado(null);
                            setPacienteCalendarioId(null);
                          }}
                          title="Análisis de signos vitales"
                          style={{ backgroundColor: '#5cb85c', color: 'white' }}
                        >
                          📈 Análisis
                        </button>

                        {permisos.puede_eliminar_pacientes && (
                          <button
                            className="action-btn delete-btn"
                            onClick={() => eliminarPaciente(p._id)}
                            title="Eliminar paciente"
                            style={{ backgroundColor: '#d9534f', color: 'white' }}
                          >
                            🗑️ Eliminar
                          </button>
                        )}
                      </td>
                    </tr>

                    {pacienteCalendarioId === p._id && (
                      <tr>
                        <td colSpan="6" style={{ padding: 0, position: 'relative' }}>
                          <div className="calendar-inline-container" style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <button
                              className="btn-close-calendar"
                              onClick={() => setPacienteCalendarioId(null)}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '10px',
                                padding: '6px 12px',
                                backgroundColor: '#d9534f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                zIndex: 1000,
                              }}
                            >
                              Cerrar
                            </button>

                            <CalendarioSignos
                              paciente={p}
                              onClose={() => setPacienteCalendarioId(null)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pacienteSeleccionado && !pacienteCalendarioId && (
        <div style={{ position: 'relative' }}>
          <button
            className="btn-close-calendar"
            onClick={() => setPacienteSeleccionado(null)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              padding: '6px 12px',
              backgroundColor: '#d9534f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              zIndex: 1000,
            }}
          >
            Cerrar
          </button>

          <RecomendacionPorFechas
            paciente={pacienteSeleccionado}
            onClose={() => setPacienteSeleccionado(null)}
          />
        </div>
      )}

      {/* Modal de Análisis */}
      {pacienteAnalisis && (
        <div style={{ position: 'relative' }}>
          <AnalisisSignos
            paciente={pacienteAnalisis}
            onClose={() => setPacienteAnalisis(null)}
          />
        </div>
      )}

      {/* Modal Editar Paciente */}
      {pacienteEditar && (
        <EditarPacienteModal
          paciente={pacienteEditar}
          onClose={() => setPacienteEditar(null)}
          onActualizado={() => {
            fetchPacientes();
            setPacienteEditar(null);
          }}
        />
      )}

      {/* Modal Insertar Signos Vitales */}
      {pacienteInsertarSignos && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setPacienteInsertarSignos(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#d9534f',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
            <h2 style={{ marginBottom: '1rem', color: '#1976d2' }}>
              Insertar Signos Vitales - {pacienteInsertarSignos.nombre_completo}
            </h2>
            <InsertarSignosVitales
              pacientePreseleccionado={pacienteInsertarSignos}
              onClose={() => setPacienteInsertarSignos(null)}
            />
          </div>
        </div>
      )}

      {/* Modal Agendar Cita */}
      {pacienteAgendarCita && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={() => setPacienteAgendarCita(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#d9534f',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
            <h2 style={{ marginBottom: '1rem', color: '#1976d2' }}>
              Agendar Cita - {pacienteAgendarCita.nombre_completo}
            </h2>
            <AgendarCita
              pacientePreseleccionado={pacienteAgendarCita}
              onClose={() => setPacienteAgendarCita(null)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
