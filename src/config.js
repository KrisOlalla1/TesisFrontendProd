// Configuración centralizada de la API
// En producción, se usa la variable de entorno REACT_APP_API_URL
// En desarrollo, se usa localhost:5000

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE_URL;
