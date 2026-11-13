// Configuração de DESENVOLVIMENTO (npm start / ng serve no Codespace).
// "/api" passa pelo proxy do Angular (proxy.conf.json), que repassa para a API em http://localhost:8080.
export const environment = {
  apiUrl: '/api'
};
