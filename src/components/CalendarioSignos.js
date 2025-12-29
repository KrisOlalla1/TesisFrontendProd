import React, { useEffect, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import '../styles/CalendarioSignos.css';

const CalendarioSignos = ({ paciente }) => {
  const [signosVitales, setSignosVitales] = useState([]);
  const [citasPaciente, setCitasPaciente] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [mostrarCitas, setMostrarCitas] = useState(false);
  const [mostrarSignos, setMostrarSignos] = useState(false);

  useEffect(() => {
    if (!paciente || !paciente._id) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const pacienteId = paciente._id;
        
        // Cargar signos vitales
        const signosRes = await axios.get(
          `https://tesis-backend-170896327116.us-central1.run.app/api/signos-vitales/${pacienteId}`,
          { headers }
        );
        setSignosVitales(signosRes.data.data || []);

        // Cargar citas
        const citasRes = await axios.get(
          `https://tesis-backend-170896327116.us-central1.run.app/api/notificaciones/paciente/${pacienteId}`,
          { headers }
        );
        
        const todasLasCitas = citasRes.data.data || [];
        const citasFiltradas = todasLasCitas.filter(n => n.tipo === 'cita');
        
        setCitasPaciente(citasFiltradas);
      } catch (err) {
        console.error('Error cargando datos', err);
      }
    };

    fetchData();
  }, [paciente]);

  const handleDeleteSigno = async (id) => {
    try {
      await axios.delete(`https://tesis-backend-170896327116.us-central1.run.app/api/signos-vitales/${id}`);
      setSignosVitales(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error eliminando signo', err);
    }
  };

  const handleDeleteCita = async (id) => {
    if (!window.confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://tesis-backend-170896327116.us-central1.run.app/api/notificaciones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCitasPaciente(prev => prev.filter(c => c._id !== id));
      alert('Cita eliminada correctamente');
    } catch (err) {
      console.error('Error eliminando cita', err);
      alert('Error al eliminar la cita');
    }
  };

  const handleCompletarCita = async (id) => {
    if (!window.confirm('¿Marcar esta cita como completada?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://tesis-backend-170896327116.us-central1.run.app/api/notificaciones/${id}`, 
        { estado: 'completada' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCitasPaciente(prev => prev.map(c => 
        c._id === id ? { ...c, estado: 'completada' } : c
      ));
      alert('Cita marcada como completada');
    } catch (err) {
      console.error('Error completando cita', err);
      alert('Error al completar la cita');
    }
  };

  const handleEdit = (item, tipo) => {
    console.log('Editar', tipo, item);
  };

  const startOfMonth = currentMonth.clone().startOf('month').startOf('week');
  const endOfMonth = currentMonth.clone().endOf('month').endOf('week');

  const fechasConSignos = new Set(signosVitales.map(s => moment(s.fecha_registro).format('YYYY-MM-DD')));
  const fechasConCitas = new Set(citasPaciente.map(c => moment(c.fecha_cita).format('YYYY-MM-DD')));

  const days = [];
  let day = startOfMonth.clone();
  while (day.isBefore(endOfMonth, 'day') || day.isSame(endOfMonth, 'day')) {
    const fecha = day.format('YYYY-MM-DD');
    const tieneSignos = fechasConSignos.has(fecha);
    const tieneCitas = fechasConCitas.has(fecha);
    const esHoy = day.isSame(moment(), 'day');
    const esMesActual = day.month() === currentMonth.month();

    days.push(
      <div
        key={fecha}
        className={`calendar-day 
          ${esHoy ? 'is-today' : ''} 
          ${!esMesActual ? 'other-month' : ''} 
          ${tieneSignos ? 'has-signs' : ''} 
          ${tieneCitas ? 'has-appointments' : ''}`}
        onClick={() => setSelectedDate(fecha)}
        title={`${tieneSignos ? 'Signos vitales registrados' : ''}${tieneSignos && tieneCitas ? ' | ' : ''}${tieneCitas ? 'Citas médicas' : ''}`}
      >
        <span className="day-number">{day.format('D')}</span>
      </div>
    );
    day.add(1, 'day');
  }

  const signosDelDia = signosVitales.filter(
    s => moment(s.fecha_registro).format('YYYY-MM-DD') === selectedDate
  );
  const citasDelDia = citasPaciente.filter(
    c => moment(c.fecha_cita).format('YYYY-MM-DD') === selectedDate
  );

  if (!paciente) return null;

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header-responsive">
        <h2>📆 Calendario de {paciente.nombre_completo}</h2>
      </div>

      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))}>
          ‹
        </button>
        <h3>{currentMonth.format('MMMM YYYY')}</h3>
        <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))}>
          ›
        </button>
      </div>

      <div className="calendar-content">
        {/* 📅 Calendario */}
        <div className="calendar-grid">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
          {days}
        </div>

        {/* 📋 Panel de Detalles */}
        <div className="details-section">
          <h3>Detalles {moment(selectedDate).format('DD/MM/YYYY')}</h3>

          <div className="toggle-buttons">
            <button
              className={`toggle-btn ${mostrarCitas ? 'active' : ''}`}
              onClick={() => setMostrarCitas(!mostrarCitas)}
            >
              📅 Ver Citas
            </button>
            <button
              className={`toggle-btn ${mostrarSignos ? 'active' : ''}`}
              onClick={() => setMostrarSignos(!mostrarSignos)}
            >
              🏥 Ver Signos Vitales
            </button>
          </div>

          {mostrarCitas && (
            <div className="details-box">
              {citasDelDia.length > 0 ? (
                <div className="scrollable-table">
                  <table className="signos-table">
                    <thead>
                      <tr><th>Hora</th><th>Título</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {citasDelDia.map(c => {
                        const estado = c.estado || 'programada';
                        return (
                          <tr key={c._id} style={{ 
                            background: estado === 'completada' ? '#e8f5e8' : 'white' 
                          }}>
                            <td>{moment(c.fecha_cita).format('HH:mm')}</td>
                            <td>{c.titulo}</td>
                            <td>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                background: estado === 'completada' ? '#28a745' : '#007bff',
                                color: 'white'
                              }}>
                                {estado === 'completada' ? '✅ Completada' : '📋 Programada'}
                              </span>
                            </td>
                            <td>
                              {estado !== 'completada' && (
                                <button 
                                  className="btn" 
                                  style={{ background: '#28a745', color: 'white', marginRight: '4px' }}
                                  onClick={() => handleCompletarCita(c._id)}
                                  title="Completar cita"
                                >
                                  ✅
                                </button>
                              )}
                              <button className="btn edit" onClick={() => handleEdit(c, 'cita')}>Editar</button>
                              <button className="btn delete" onClick={() => handleDeleteCita(c._id)}>Eliminar</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p>No hay citas</p>}
            </div>
          )}

          {mostrarSignos && (
            <div className="details-box">
              {signosDelDia.length > 0 ? (
                <div className="scrollable-table">
                  <table className="signos-table">
                    <thead>
                      <tr><th>Hora</th><th>Tipo</th><th>Valor</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      {signosDelDia.map(s => (
                        <tr key={s._id}>
                          <td>{moment(s.fecha_registro).format('HH:mm')}</td>
                          <td>{s.tipo}</td>
                          <td>{s.valor}</td>
                          <td>
                            <button className="btn edit" onClick={() => handleEdit(s, 'signo')}>Editar</button>
                            <button className="btn delete" onClick={() => handleDeleteSigno(s._id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No hay signos vitales</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioSignos;
