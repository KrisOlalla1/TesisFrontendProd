import api from './client';

// Update enabled vital signs for a patient (doctor action)
export const updatePatientSigns = async (patientId, signos_habilitados) => {
  const { data } = await api.put(`/pacientes/${patientId}`, { signos_habilitados });
  return data;
};

// Get patient by cedula (utility used elsewhere)
export const getPatientByCedula = async (cedula) => {
  const { data } = await api.get(`/pacientes/cedula/${cedula}`);
  return data;
};