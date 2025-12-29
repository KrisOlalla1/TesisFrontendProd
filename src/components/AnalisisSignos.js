import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import moment from 'moment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalisisSignos = ({ paciente, onClose }) => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signosVitales, setSignosVitales] = useState([]);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const graficosRef = useRef(null);

  useEffect(() => {
    const fetchSignos = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`https://tesis-backend-170896327116.us-central1.run.app/api/signos-vitales/${paciente._id}`, { headers });
        setSignosVitales(res.data.data || []);
      } catch (err) {
        console.error('Error cargando signos vitales', err);
        setSignosVitales([]);
      }
    };

    fetchSignos();
  }, [paciente._id]);

  const generarGrafico = () => {
    setError(null);
    if (!fechaInicio || !fechaFin) {
      setError('Selecciona ambas fechas');
      return;
    }
    if (fechaInicio > fechaFin) {
      setError('Fecha inicio debe ser menor o igual que fecha fin');
      return;
    }

    // Filtrar signos por rango
    const signosFiltrados = signosVitales.filter(s => {
      const fecha = moment(s.fecha_registro).format('YYYY-MM-DD');
      return fecha >= fechaInicio && fecha <= fechaFin;
    });

    if (!signosFiltrados.length) {
      setError('No hay signos en ese rango');
      setDatosGrafico(null);
      return;
    }

    // Agrupar datos por tipo
    const agrupados = {};
    signosFiltrados.forEach(({ tipo, valor, fecha_registro }) => {
      if (!agrupados[tipo]) agrupados[tipo] = [];
      agrupados[tipo].push({
        fecha: moment(fecha_registro).format('YYYY-MM-DD HH:mm'),
        valor: Number(valor),
      });
    });

    // Ordenar por fecha en cada tipo
    Object.keys(agrupados).forEach(tipo => {
      agrupados[tipo].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    });

    setDatosGrafico(agrupados);
  };

  const generarPDF = async () => {
    if (!datosGrafico) {
      alert('Primero genera el análisis antes de exportar a PDF');
      return;
    }

    setGenerandoPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxContentHeight = pageHeight - margin * 2;

      // Encabezado
      pdf.setFontSize(18);
      pdf.setTextColor(25, 118, 210);
      pdf.text('ANÁLISIS DE SIGNOS VITALES', pageWidth / 2, 20, { align: 'center' });

      // Información del paciente
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Paciente: ${paciente.nombre_completo}`, margin, 35);
      pdf.text(`Cédula: ${paciente.cedula}`, margin, 42);
      pdf.text(`Período: ${moment(fechaInicio).format('DD/MM/YYYY')} - ${moment(fechaFin).format('DD/MM/YYYY')}`, margin, 49);
      pdf.text(`Fecha de generación: ${moment().format('DD/MM/YYYY HH:mm')}`, margin, 56);

      // Línea separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, 60, pageWidth - margin, 60);

      let currentY = 70;

      // Capturar cada gráfico individualmente
      if (graficosRef.current) {
        const graficos = graficosRef.current.querySelectorAll('.grafico-item');
        
        for (let i = 0; i < graficos.length; i++) {
          const grafico = graficos[i];
          
          // Capturar el gráfico con mejor calidad
          const canvas = await html2canvas(grafico, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 800,
            height: grafico.offsetHeight
          });

          const imgData = canvas.toDataURL('image/png', 1.0);
          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 150); // Limitar altura máxima
          
          // Si el gráfico no cabe en la página actual, crear una nueva
          if (currentY + imgHeight > pageHeight - margin - 10) {
            pdf.addPage();
            currentY = margin;
          }

          // Agregar el gráfico
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15; // Espacio entre gráficos
        }
      }

      // Pie de página
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Página ${i} de ${totalPages} - Sistema de Monitoreo de Salud IESS`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const nombreArchivo = `Analisis_${paciente.nombre_completo.replace(/\s+/g, '_')}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
      pdf.save(nombreArchivo);

      alert('PDF generado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  // Estilos iguales a RecomendacionPorFechas para modal, inputs y botones
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const formStyle = {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    maxWidth: '900px',
    width: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '1rem',
  };

  const buttonStyle = {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.8rem 1.5rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    transition: 'background 0.2s',
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: '#888',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={formStyle} onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#d9534f',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '6px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 1000,
          }}
          aria-label="Cerrar modal"
          title="Cerrar"
        >
          Cerrar
        </button>

        <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '1.5rem' }}>
          📊 Análisis de Signos Vitales
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="fechaInicio"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}
          >
            Fecha de Inicio *
          </label>
          <input
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            style={inputStyle}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="fechaFin"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}
          >
            Fecha de Fin *
          </label>
          <input
            id="fechaFin"
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            style={inputStyle}
            max={new Date().toISOString().split('T')[0]}
            min={fechaInicio}
            required
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={generarGrafico}
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: 150,
            }}
          >
            {loading ? 'Generando...' : '📊 Generar análisis'}
          </button>

          {datosGrafico && (
            <button
              onClick={generarPDF}
              disabled={generandoPDF}
              style={{
                ...buttonStyle,
                background: '#4caf50',
                opacity: generandoPDF ? 0.7 : 1,
                cursor: generandoPDF ? 'not-allowed' : 'pointer',
                minWidth: 150,
              }}
              onMouseEnter={(e) => !generandoPDF && (e.currentTarget.style.background = '#45a049')}
              onMouseLeave={(e) => !generandoPDF && (e.currentTarget.style.background = '#4caf50')}
            >
              {generandoPDF ? '⏳ Generando PDF...' : '📄 Exportar a PDF'}
            </button>
          )}

          <button
            onClick={onClose}
            disabled={loading}
            style={{
              ...cancelButtonStyle,
              minWidth: 150,
            }}
          >
            ❌ Cerrar
          </button>
        </div>

        {datosGrafico && (
          <div ref={graficosRef} style={{ marginTop: 20, background: '#fff', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ margin: 0, color: '#1976d2' }}>Paciente: {paciente.nombre_completo}</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                Cédula: {paciente.cedula} | Período: {moment(fechaInicio).format('DD/MM/YYYY')} - {moment(fechaFin).format('DD/MM/YYYY')}
              </p>
            </div>

            {Object.keys(datosGrafico).map(tipo => {
              const dataset = datosGrafico[tipo];
              return (
                <div 
                  key={tipo} 
                  className="grafico-item"
                  style={{ 
                    marginBottom: '2rem', 
                    background: '#fff', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ 
                    textAlign: 'center', 
                    color: '#1976d2', 
                    marginBottom: '1rem',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {tipo.replace(/_/g, ' ')}
                  </h3>
                  <Line
                    data={{
                      labels: dataset.map(d => d.fecha),
                      datasets: [
                        {
                          label: `${tipo} (evolución)`,
                          data: dataset.map(d => d.valor),
                          borderColor: '#1976d2',
                          backgroundColor: 'rgba(25,118,210,0.3)',
                          fill: true,
                          tension: 0.3,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                        },
                      },
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalisisSignos;
