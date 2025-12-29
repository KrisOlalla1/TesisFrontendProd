import React, { useState, useEffect } from 'react';
import { 
  Checkbox, 
  FormControlLabel, 
  Button, 
  Box, 
  Typography,
  Paper 
} from '@mui/material';
import { updatePatientSigns } from '../api/patients';

const availableSigns = [
  { id: 'presion_arterial', label: 'Presión Arterial' },
  { id: 'frecuencia_cardiaca', label: 'Frecuencia Cardíaca' },
  { id: 'temperatura', label: 'Temperatura' },
  { id: 'saturacion_oxigeno', label: 'Oxígeno en Sangre' },
  { id: 'glucosa', label: 'Glucosa' }
];

export default function PatientSignsControl({ patient }) {
  const [selectedSigns, setSelectedSigns] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Token handled by shared API client

  useEffect(() => {
    if (patient) {
      setSelectedSigns(patient.signos_habilitados || []);
    }
  }, [patient]);

  const handleSignToggle = (signId) => {
    setSelectedSigns(prev => 
      prev.includes(signId) 
        ? prev.filter(id => id !== signId) 
        : [...prev, signId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
  await updatePatientSigns(patient._id, selectedSigns);
      alert('Parámetros actualizados correctamente');
    } catch (error) {
      alert('Error al actualizar: ' + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Control de Parámetros
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {patient.nombre_completo}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {availableSigns.map(sign => (
          <FormControlLabel
            key={sign.id}
            control={
              <Checkbox
                checked={selectedSigns.includes(sign.id)}
                onChange={() => handleSignToggle(sign.id)}
              />
            }
            label={sign.label}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        Guardar Cambios
      </Button>
    </Paper>
  );
}