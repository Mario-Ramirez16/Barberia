
function getToken() {
    return localStorage.getItem('token');
  }

  function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (!token) {
        console.error('No se encontró token');
        window.location.href = '/login.html';
        return Promise.reject('No se encontró token');
    }

    if (!options.headers) {
        options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${token}`;
    options.headers['Accept'] = 'application/json';

    // Solo establece Content-Type si no es una solicitud GET
    if (options.method && options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] = 'application/json';
    }

    // Elimina el cuerpo de la solicitud si es GET
    if (options.method && options.method.toUpperCase() === 'GET') {
        delete options.body;
    }

    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return Promise.reject('Sesión expirada');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Fetch error:', error);
            throw error;
        });
}
// Añade esta nueva función en utils.js
function isTokenExpired(token) {
    if (!token) return true;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const now = Date.now() / 1000;
    return payload.exp < now;
}