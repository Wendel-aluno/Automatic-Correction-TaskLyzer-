// ============================================================
// CONFIGURAÇÃO DO AMBIENTE
// ============================================================
const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://seuservidor.com/api',
    APP_NAME: 'Automatic Correction',
    VERSION: '1.0.0'
};

// Nota mínima para aprovação
const NOTA_MINIMA_APROVACAO = 6.0;