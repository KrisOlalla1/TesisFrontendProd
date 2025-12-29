import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import RegistrarPaciente from '../components/pacientes/RegistrarPaciente';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const [doctores, setDoctores] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [doctoresFiltrados, setDoctoresFiltrados] = useState([]);
  const [adminsFiltrados, setAdminsFiltrados] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [pacientesDelDoctor, setPacientesDelDoctor] = useState([]);
  const [vista, setVista] = useState('home'); // home, admins, registrar, registrarAdmin, registrarPaciente
  const [busqueda, setBusqueda] = useState('');
  const [doctorAEditar, setDoctorAEditar] = useState(null);
  const [adminAEditar, setAdminAEditar] = useState(null);
  const [doctorPermisos, setDoctorPermisos] = useState(null);
  const [pacienteAEditar, setPacienteAEditar] = useState(null);

  const [nuevoDoctor, setNuevoDoctor] = useState({
    cedula: '',
    nombre_completo: '',
    correo: '',
    contrasena: ''
  });

  const [nuevoAdmin, setNuevoAdmin] = useState({
    cedula: '',
    nombre_completo: '',
    correo: '',
    contrasena: ''
  });

  const admin = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    cargarDoctores();
  }, []);

  useEffect(() => {
    if (vista === 'admins') {
      cargarAdmins();
    }
  }, [vista]);

  useEffect(() => {
    if (vista === 'home') {
      if (busqueda.trim() === '') {
        setDoctoresFiltrados(doctores);
      } else {
        const filtrados = doctores.filter(d =>
          d.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
          d.cedula.includes(busqueda) ||
          d.correo.toLowerCase().includes(busqueda.toLowerCase())
        );
        setDoctoresFiltrados(filtrados);
      }
    } else if (vista === 'admins') {
      if (busqueda.trim() === '') {
        setAdminsFiltrados(admins);
      } else {
        const filtrados = admins.filter(a =>
          a.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
          a.cedula.includes(busqueda) ||
          a.correo.toLowerCase().includes(busqueda.toLowerCase())
        );
        setAdminsFiltrados(filtrados);
      }
    }
  }, [busqueda, doctores, admins, vista]);

  const cargarDoctores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctores(response.data.data || []);
      setDoctoresFiltrados(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      alert('Error al cargar la lista de doctores');
    }
  };

  const cargarAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://tesis-backend-170896327116.us-central1.run.app/api/admin/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data.data || []);
      setAdminsFiltrados(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
      alert('Error al cargar la lista de administradores');
    }
  };

  const registrarDoctor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores', nuevoDoctor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Doctor registrado exitosamente');
      setVista('home');
      setNuevoDoctor({ cedula: '', nombre_completo: '', correo: '', contrasena: '' });
      cargarDoctores();
    } catch (error) {
      console.error('Error al registrar doctor:', error);
      alert(error.response?.data?.message || 'Error al registrar doctor');
    }
  };

  const registrarAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://tesis-backend-170896327116.us-central1.run.app/api/admin/admins', nuevoAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Administrador registrado exitosamente');
      setVista('admins');
      setNuevoAdmin({ cedula: '', nombre_completo: '', correo: '', contrasena: '' });
      cargarAdmins();
    } catch (error) {
      console.error('Error al registrar administrador:', error);
      alert(error.response?.data?.message || 'Error al registrar administrador');
    }
  };

  const toggleEstadoDoctor = async (doctorId, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores/${doctorId}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarDoctores();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del doctor');
    }
  };

  const toggleEstadoAdmin = async (adminId, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://tesis-backend-170896327116.us-central1.run.app/api/admin/admins/${adminId}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarAdmins();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del administrador');
    }
  };

  const eliminarDoctor = async (doctorId) => {
    if (!window.confirm('¿Está seguro de eliminar este doctor? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Doctor eliminado exitosamente');
      cargarDoctores();
    } catch (error) {
      console.error('Error al eliminar doctor:', error);
      alert('Error al eliminar doctor');
    }
  };

  const eliminarAdmin = async (adminId) => {
    if (!window.confirm('¿Está seguro de eliminar este administrador? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://tesis-backend-170896327116.us-central1.run.app/api/admin/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Administrador eliminado exitosamente');
      cargarAdmins();
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      alert(error.response?.data?.message || 'Error al eliminar administrador');
    }
  };

  const actualizarDoctor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSend = { ...doctorAEditar };
      if (!dataToSend.contrasena) {
        delete dataToSend.contrasena;
      }
      await axios.put(
        `https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores/${doctorAEditar.id}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Doctor actualizado exitosamente');
      setDoctorAEditar(null);
      cargarDoctores();
    } catch (error) {
      console.error('Error al actualizar doctor:', error);
      alert('Error al actualizar doctor');
    }
  };

  const actualizarAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSend = { ...adminAEditar };
      if (!dataToSend.contrasena) {
        delete dataToSend.contrasena;
      }
      await axios.put(
        `https://tesis-backend-170896327116.us-central1.run.app/api/admin/admins/${adminAEditar.id}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Administrador actualizado exitosamente');
      setAdminAEditar(null);
      cargarAdmins();
    } catch (error) {
      console.error('Error al actualizar administrador:', error);
      alert('Error al actualizar administrador');
    }
  };

  const actualizarPaciente = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const dataToSend = { ...pacienteAEditar };
      if (!dataToSend.contrasena) {
        delete dataToSend.contrasena;
      }
      delete dataToSend._id;

      await axios.put(
        `https://tesis-backend-170896327116.us-central1.run.app/api/doctores/pacientes/${pacienteAEditar._id}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Paciente actualizado exitosamente');
      setPacienteAEditar(null);
      verPacientesDoctor(doctorSeleccionado);
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      alert(error.response?.data?.error || 'Error al actualizar paciente');
    }
  };

  const eliminarPaciente = async (pacienteId, nombrePaciente) => {
    if (!window.confirm(`¿Está seguro de eliminar al paciente ${nombrePaciente}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://tesis-backend-170896327116.us-central1.run.app/api/doctores/pacientes/${pacienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Paciente eliminado exitosamente');
      verPacientesDoctor(doctorSeleccionado);
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      alert(error.response?.data?.error || 'Error al eliminar paciente');
    }
  };

  const toggleEstadoPaciente = async (pacienteId, estadoActual) => {
    try {
      const nuevoEstado = (estadoActual === 'activo') ? 'inactivo' : 'activo';
      const token = localStorage.getItem('token');
      await axios.put(
        `https://tesis-backend-170896327116.us-central1.run.app/api/doctores/pacientes/${pacienteId}`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (doctorSeleccionado) {
        await verPacientesDoctor(doctorSeleccionado);
      }
    } catch (error) {
      console.error('Error al cambiar estado del paciente:', error);
      alert(error.response?.data?.error || 'Error al cambiar estado del paciente');
    }
  };

  const actualizarPermisos = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores/${doctorPermisos._id}/permisos`,
        {
          puede_editar_pacientes: doctorPermisos.permisos.puede_editar_pacientes,
          puede_eliminar_pacientes: doctorPermisos.permisos.puede_eliminar_pacientes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Permisos actualizados exitosamente');
      setDoctorPermisos(null);
      cargarDoctores();
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      alert('Error al actualizar permisos');
    }
  };

  const verPacientesDoctor = async (doctor) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://tesis-backend-170896327116.us-central1.run.app/api/admin/doctores/${doctor._id}/pacientes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPacientesDelDoctor(response.data.data || []);
      setDoctorSeleccionado(doctor);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      alert('Error al cargar pacientes del doctor');
    }
  };

  return (
    <Layout
      userName="Administrador IESS"
      onRegistrar={() => setVista('registrar')}
      onHome={() => {
        setVista('home');
        setDoctorSeleccionado(null);
        setBusqueda('');
      }}
      onAdmins={() => {
        setVista('admins');
        setDoctorSeleccionado(null);
        setBusqueda('');
      }}
      userRole="admin"
    >
      <div className="dashboard-container">

        {/* VISTA HOME: LISTA DE DOCTORES */}
        {vista === 'home' && !doctorSeleccionado && (
          <div className="pacientes-section">
            <div className="section-header">
              <h2>👨‍⚕️ Gestión de Doctores</h2>
              <div className="header-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Buscar doctor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="patients-table admin-table">
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
                  {doctoresFiltrados.map((doctor) => (
                    <React.Fragment key={doctor._id}>
                      <tr>
                        <td>{doctor.nombre_completo}</td>
                        <td>{doctor.cedula}</td>
                        <td>{doctor.correo}</td>
                        <td>
                          <div className="estado-toggle-container">
                            <button
                              className={`estado-toggle ${doctor.estado === 'activo' ? 'active' : 'inactive'}`}
                              onClick={() => toggleEstadoDoctor(doctor._id, doctor.estado)}
                            >
                              <span className="toggle-slider"></span>
                              <span className="toggle-label">
                                {doctor.estado === 'activo' ? '✓' : '✗'}
                              </span>
                            </button>
                            <span className="estado-text">
                              {doctor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="acciones-column">
                          <button
                            className="action-btn"
                            onClick={() => verPacientesDoctor(doctor)}
                            title="Ver pacientes del doctor"
                            style={{ backgroundColor: '#9b59b6', color: 'white' }}
                          >
                            👥 Pacientes
                          </button>

                          <button
                            className="action-btn"
                            onClick={() => {
                              setDoctorAEditar({
                                id: doctor._id,
                                cedula: doctor.cedula,
                                nombre_completo: doctor.nombre_completo,
                                correo: doctor.correo,
                                contrasena: ''
                              });
                            }}
                            title="Editar doctor"
                            style={{ backgroundColor: '#f0ad4e', color: 'black' }}
                          >
                            ✏️ Editar
                          </button>

                          <button
                            className="action-btn"
                            onClick={() => setDoctorPermisos(doctor)}
                            title="Gestionar permisos"
                            style={{ backgroundColor: '#3498db', color: 'white' }}
                          >
                            🔐 Permisos
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() => eliminarDoctor(doctor._id)}
                            title="Eliminar doctor"
                            style={{ backgroundColor: '#d9534f', color: 'white' }}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA ADMINS: LISTA DE ADMINISTRADORES */}
        {vista === 'admins' && (
          <div className="pacientes-section">
            <div className="section-header">
              <h2>🛡️ Gestión de Administradores</h2>
              <div className="header-actions">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Buscar administrador..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <button
                  className="btn-primary"
                  onClick={() => setVista('registrarAdmin')}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginLeft: '1rem'
                  }}
                >
                  ➕ Nuevo Admin
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="patients-table admin-table">
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
                  {adminsFiltrados.map((adminItem) => (
                    <React.Fragment key={adminItem._id}>
                      <tr>
                        <td>{adminItem.nombre_completo}</td>
                        <td>{adminItem.cedula}</td>
                        <td>{adminItem.correo}</td>
                        <td>
                          <div className="estado-toggle-container">
                            <button
                              className={`estado-toggle ${adminItem.estado === 'activo' ? 'active' : 'inactive'}`}
                              onClick={() => toggleEstadoAdmin(adminItem._id, adminItem.estado)}
                            >
                              <span className="toggle-slider"></span>
                              <span className="toggle-label">
                                {adminItem.estado === 'activo' ? '✓' : '✗'}
                              </span>
                            </button>
                            <span className="estado-text">
                              {adminItem.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="acciones-column">
                          <button
                            className="action-btn"
                            onClick={() => {
                              setAdminAEditar({
                                id: adminItem._id,
                                cedula: adminItem.cedula,
                                nombre_completo: adminItem.nombre_completo,
                                correo: adminItem.correo,
                                contrasena: ''
                              });
                            }}
                            title="Editar administrador"
                            style={{ backgroundColor: '#f0ad4e', color: 'black' }}
                          >
                            ✏️ Editar
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() => eliminarAdmin(adminItem._id)}
                            title="Eliminar administrador"
                            style={{ backgroundColor: '#d9534f', color: 'white' }}
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA REGISTRAR DOCTOR */}
        {vista === 'registrar' && (
          <div className="form-section">
            <div className="form-header">
              <h2>➕ Registrar Nuevo Doctor</h2>
              <button className="btn-back" onClick={() => setVista('home')}>
                ← Volver
              </button>
            </div>
            <form onSubmit={registrarDoctor} className="registro-form">
              <div className="form-group">
                <label>Cédula *</label>
                <input
                  type="text"
                  required
                  value={nuevoDoctor.cedula}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, cedula: e.target.value })}
                  placeholder="Ingrese la cédula"
                />
              </div>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nuevoDoctor.nombre_completo}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, nombre_completo: e.target.value })}
                  placeholder="Ingrese el nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={nuevoDoctor.correo}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  required
                  value={nuevoDoctor.contrasena}
                  onChange={(e) => setNuevoDoctor({ ...nuevoDoctor, contrasena: e.target.value })}
                  placeholder="Ingrese una contraseña segura"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">Registrar Doctor</button>
                <button type="button" className="btn-cancel" onClick={() => setVista('home')}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VISTA REGISTRAR ADMIN */}
        {vista === 'registrarAdmin' && (
          <div className="form-section">
            <div className="form-header">
              <h2>➕ Registrar Nuevo Administrador</h2>
              <button className="btn-back" onClick={() => setVista('admins')}>
                ← Volver
              </button>
            </div>
            <form onSubmit={registrarAdmin} className="registro-form">
              <div className="form-group">
                <label>Cédula *</label>
                <input
                  type="text"
                  required
                  value={nuevoAdmin.cedula}
                  onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, cedula: e.target.value })}
                  placeholder="Ingrese la cédula"
                />
              </div>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nuevoAdmin.nombre_completo}
                  onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, nombre_completo: e.target.value })}
                  placeholder="Ingrese el nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={nuevoAdmin.correo}
                  onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  required
                  value={nuevoAdmin.contrasena}
                  onChange={(e) => setNuevoAdmin({ ...nuevoAdmin, contrasena: e.target.value })}
                  placeholder="Ingrese una contraseña segura"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">Registrar Administrador</button>
                <button type="button" className="btn-cancel" onClick={() => setVista('admins')}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VISTA REGISTRAR PACIENTE (PARA DOCTOR SELECCIONADO) */}
        {vista === 'registrarPaciente' && doctorSeleccionado && (
          <div className="form-section">
            <div className="form-header">
              <h2>➕ Registrar Paciente para Dr. {doctorSeleccionado.nombre_completo}</h2>
              <button
                className="btn-back"
                onClick={() => {
                  setVista('home');
                  verPacientesDoctor(doctorSeleccionado);
                }}
              >
                ← Volver a Pacientes
              </button>
            </div>
            <RegistrarPaciente
              onClose={() => {
                setVista('home');
                verPacientesDoctor(doctorSeleccionado);
              }}
              doctorIdOverride={doctorSeleccionado._id}
            />
          </div>
        )}

        {/* VISTA PACIENTES DEL DOCTOR */}
        {doctorSeleccionado && (
          <div className="pacientes-section">
            <div className="section-header">
              <h2>👥 Pacientes de Dr. {doctorSeleccionado.nombre_completo}</h2>
              <div className="header-actions">
                <button
                  className="btn-primary"
                  onClick={() => setVista('registrarPaciente')}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginRight: '1rem',
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s'
                  }}
                >
                  ➕ Registrar Paciente
                </button>
                <button
                  className="btn-back"
                  onClick={() => {
                    setDoctorSeleccionado(null);
                    setPacientesDelDoctor([]);
                  }}
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '0.7rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                    transition: 'all 0.3s'
                  }}
                >
                  ← Volver a Doctores
                </button>
              </div>
            </div>

            {pacientesDelDoctor.length > 0 ? (
              <div className="table-wrapper">
                <table className="pacientes-table">
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
                    {pacientesDelDoctor.map((paciente) => (
                      <tr key={paciente._id}>
                        <td style={{ fontWeight: 'bold' }}>{paciente.nombre_completo}</td>
                        <td>{paciente.cedula}</td>
                        <td>{paciente.correo}</td>
                        <td>
                          <div className="estado-toggle-container">
                            <button
                              className={`estado-toggle ${(paciente.estado || 'activo') === 'activo' ? 'active' : 'inactive'}`}
                              onClick={() => toggleEstadoPaciente(paciente._id, paciente.estado || 'activo')}
                            >
                              <span className="toggle-slider"></span>
                              <span className="toggle-label">
                                {(paciente.estado || 'activo') === 'activo' ? '✓' : '✗'}
                              </span>
                            </button>
                            <span className="estado-text">
                              {(paciente.estado || 'activo') === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="acciones-column">
                          <button
                            className="action-btn btn-editar"
                            onClick={() => {
                              setPacienteAEditar({
                                _id: paciente._id,
                                cedula: paciente.cedula,
                                nombre_completo: paciente.nombre_completo,
                                correo: paciente.correo,
                                fecha_nacimiento: paciente.fecha_nacimiento?.split('T')[0] || '',
                                sexo: paciente.sexo,
                                contrasena: ''
                              });
                            }}
                            title="Editar información del paciente"
                          >
                            ✏️ Editar
                          </button>

                          <button
                            className="action-btn btn-eliminar"
                            onClick={() => eliminarPaciente(paciente._id, paciente.nombre_completo)}
                            title="Eliminar paciente"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginTop: '2rem'
              }}>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>
                  Este doctor no tiene pacientes registrados
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setVista('registrarPaciente')}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginTop: '1rem',
                    fontSize: '1rem'
                  }}
                >
                  ➕ Registrar Primer Paciente
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODAL EDITAR DOCTOR */}
        {doctorAEditar && (
          <div className="modal-overlay" onClick={() => setDoctorAEditar(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>✏️ Editar Doctor</h2>
              <form onSubmit={actualizarDoctor}>
                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    required
                    value={doctorAEditar.cedula}
                    onChange={(e) => setDoctorAEditar({ ...doctorAEditar, cedula: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={doctorAEditar.nombre_completo}
                    onChange={(e) => setDoctorAEditar({ ...doctorAEditar, nombre_completo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input
                    type="email"
                    required
                    value={doctorAEditar.correo}
                    onChange={(e) => setDoctorAEditar({ ...doctorAEditar, correo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
                  <input
                    type="password"
                    value={doctorAEditar.contrasena}
                    onChange={(e) => setDoctorAEditar({ ...doctorAEditar, contrasena: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit">Actualizar</button>
                  <button type="button" className="btn-cancel" onClick={() => setDoctorAEditar(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDITAR ADMIN */}
        {adminAEditar && (
          <div className="modal-overlay" onClick={() => setAdminAEditar(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>✏️ Editar Administrador</h2>
              <form onSubmit={actualizarAdmin}>
                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    required
                    value={adminAEditar.cedula}
                    onChange={(e) => setAdminAEditar({ ...adminAEditar, cedula: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={adminAEditar.nombre_completo}
                    onChange={(e) => setAdminAEditar({ ...adminAEditar, nombre_completo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input
                    type="email"
                    required
                    value={adminAEditar.correo}
                    onChange={(e) => setAdminAEditar({ ...adminAEditar, correo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
                  <input
                    type="password"
                    value={adminAEditar.contrasena}
                    onChange={(e) => setAdminAEditar({ ...adminAEditar, contrasena: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit">Actualizar</button>
                  <button type="button" className="btn-cancel" onClick={() => setAdminAEditar(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL PERMISOS */}
        {doctorPermisos && (
          <div className="modal-overlay" onClick={() => setDoctorPermisos(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>🔐 Gestionar Permisos de {doctorPermisos.nombre_completo}</h2>
              <form onSubmit={actualizarPermisos}>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={doctorPermisos.permisos?.puede_editar_pacientes || false}
                      onChange={(e) =>
                        setDoctorPermisos({
                          ...doctorPermisos,
                          permisos: {
                            ...doctorPermisos.permisos,
                            puede_editar_pacientes: e.target.checked
                          }
                        })
                      }
                    />
                    ✏️ Puede editar pacientes
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={doctorPermisos.permisos?.puede_eliminar_pacientes || false}
                      onChange={(e) =>
                        setDoctorPermisos({
                          ...doctorPermisos,
                          permisos: {
                            ...doctorPermisos.permisos,
                            puede_eliminar_pacientes: e.target.checked
                          }
                        })
                      }
                    />
                    🗑️ Puede eliminar pacientes
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit">Guardar Permisos</button>
                  <button type="button" className="btn-cancel" onClick={() => setDoctorPermisos(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDITAR PACIENTE */}
        {pacienteAEditar && (
          <div className="modal-overlay" onClick={() => setPacienteAEditar(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>✏️ Editar Paciente</h2>
              <form onSubmit={actualizarPaciente}>
                <div className="form-group">
                  <label>Cédula *</label>
                  <input
                    type="text"
                    required
                    value={pacienteAEditar.cedula}
                    onChange={(e) => setPacienteAEditar({ ...pacienteAEditar, cedula: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={pacienteAEditar.nombre_completo}
                    onChange={(e) => setPacienteAEditar({ ...pacienteAEditar, nombre_completo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Correo *</label>
                  <input
                    type="email"
                    required
                    value={pacienteAEditar.correo}
                    onChange={(e) => setPacienteAEditar({ ...pacienteAEditar, correo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={pacienteAEditar.fecha_nacimiento}
                    onChange={(e) => setPacienteAEditar({ ...pacienteAEditar, fecha_nacimiento: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Género *</label>
                  <select
                    required
                    value={pacienteAEditar.sexo}
                    onChange={(e) => setPacienteAEditar({ ...pacienteAEditar, sexo: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
                  <input
                    type="password"
                    value={pacienteAEditar.contrasena}
                    onChange={(e) => setPacienteAEditar({ ...pacienteAEditar, contrasena: e.target.value })}
                    placeholder="Dejar en blanco para mantener la actual"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit">Actualizar</button>
                  <button type="button" className="btn-cancel" onClick={() => setPacienteAEditar(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
